import React, { useEffect, useState } from "react";
import * as csv from "fast-csv";
import { Document as XDocument, Packer } from "docx";
import downloadFile from "js-file-download";
import { createDoc } from "./exporting/word";
import { createExcel } from "./exporting/excel";
import { Preview } from "./components/Preview";

export type ParagraphEl = {
  type: "text";
  data: string;
};
export type TableEl = {
  type: "table";
  data: any[][];
};

export type DocElement = ParagraphEl | TableEl;
export type HDoc = DocElement[];

type DirtyDocElement = DocElement & {
  data: any;
};

function App() {
  const [pingStatus, setPing] =
    useState<"loading" | "error" | "success">("loading");
  const [hDoc, setHDoc] = useState<HDoc>([]);

  useEffect(() => {
    fetch(window.location.protocol + "//" + window.location.hostname + ":8000/")
      .then((res) => res.json())
      .then((res) => {
        console.log("Got from server", res);
        setPing("success");
      })
      .catch((err) => {
        console.error(err);
        setPing("error");
      });
  }, []);

  const handleDocxDownload = async () => {
    const doc = createDoc(hDoc);
    if (doc === null) return;
    downloadFile(await Packer.toBlob(doc), "doc.docx");
  };

  const handleExcelDownload = async () => {
    const doc = createExcel(hDoc);
    const buffer = await doc.xlsx.writeBuffer();
    // const test = new Blob();
    // if (doc === null) return;
    downloadFile(buffer, "table.xlsx");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const files = e.currentTarget.file.files as FileList;

    if (files.length === 0) {
      console.log("No file detected. Aborting");
      return;
    }
    // const file = (e.currentTarget.file.files as FileList).item(0);
    // console.log(file, typeof file);

    const formData = new FormData();
    // formData.append("files", file);
    // formData.append("files", file);

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    fetch(
      window.location.protocol +
        "//" +
        window.location.hostname +
        ":8000/api/upload-files",
      { method: "POST", body: formData }
    )
      .then((res) => res.json())
      .then(async (res: DirtyDocElement[]) => {
        console.log("Got from server", res);

        const data = await parseDirtyResponse(res);

        setHDoc(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <main className="slim">
      <h1>Здарова 👋</h1>

      <div>
        Статус сервера:{" "}
        <span className={"status " + pingStatus}>
          {pingStatus === "loading"
            ? "загрузка 🔵"
            : pingStatus === "success"
            ? "работает 🟢"
            : "не отвечает 🔴"}
        </span>
      </div>
      <br />
      <form onSubmit={handleSubmit}>
        <label htmlFor="file">Выберите файл для обработки</label>
        <br />
        <input
          type="file"
          name="file"
          id="file"
          accept=".jpg, .jpeg, .png, .webp, .pdf"
          required
          multiple
        />
        <br />
        <input type="submit" value="Отправить" />
      </form>

      {hDoc.length === 0 ? (
        <p>Пока здесь пусто 😶. Попробуйте загрузить файл ⬆️</p>
      ) : (
        <>
          <Preview table={hDoc} />

          {hDoc !== null && (
            <button onClick={handleDocxDownload}>Скачать docx 📄</button>
          )}
          {hDoc !== null && (
            <button onClick={handleExcelDownload}>Скачать excel </button>
          )}
        </>
      )}
    </main>
  );
}

export default App;

async function parseDirtyResponse(res: DirtyDocElement[]) {
  return await Promise.all(
    res.map((elem) => {
      if (elem.type === "text") return elem;
      // return { type: elem.type, table:  };
      return new Promise<DocElement>((res, rej) => {
        let data: any[] = [];
        csv
          .parseString(elem.data)
          .on("data", (row) => data.push(row))
          .on("end", (rowCount: number) => {
            console.log(`Parsed ${rowCount} rows`);
            res({
              type: elem.type,
              data: data,
            });
          })
          .on("error", (error) => {
            console.error(error);
            rej();
          });
      });
    })
  );
}
