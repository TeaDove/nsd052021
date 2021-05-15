import React, { useEffect, useState } from "react";
import * as csv from "fast-csv";
import { Document as XDocument, Packer } from "docx";
import downloadFile from "js-file-download";
import { createDoc } from "./exporting/word";
import { createExcel } from "./exporting/excel";
import { Preview } from "./components/Preview";
import JSZip from "jszip";

export type ParagraphEl = {
  data_type: "text";
  data: string;
};
export type TableEl = {
  data_type: "table";
  data: any[][];
};

export type DocElement = ParagraphEl | TableEl;

type DirtyDocElement = DocElement & {
  data: any;
};

export type HDoc = DocElement[];
export type HDocMany = { name: string; data: HDoc }[];
type DirtyResponse = {
  name: string;
  data: DirtyDocElement[];
}[];

function App() {
  const [pingStatus, setPing] =
    useState<"loading" | "error" | "success">("loading");
  const [hDoc, setHDoc] = useState<HDocMany>([]);

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
    const archive = new JSZip();

    await Promise.all(
      hDoc.map(async (d, i) => {
        const doc = createDoc(d.data);
        if (doc === null) return;
        archive.file(`${d.name || `doc-${i}`}.docx`, Packer.toBlob(doc));
        // downloadFile(await Packer.toBlob(doc), `${d.name || `doc-${i}`}.docx`);
      })
    );

    archive.generateAsync({ type: "blob" }).then((content) => {
      downloadFile(content, `documents.zip`);
    });
  };

  const handleExcelDownload = async () => {
    const archive = new JSZip();

    await Promise.all(
      hDoc.map(async (d, i) => {
        const doc = createExcel(d.data);
        const buffer = await doc.xlsx.writeBuffer();
        archive.file(`${d.name || `table-${i}`}.xlsx`, buffer);
      })
    );

    archive.generateAsync({ type: "blob" }).then((content) => {
      downloadFile(content, `tables.zip`);
    });
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
      .then(async (res: DirtyResponse) => {
        console.log("Got from server", res);

        const data = await parseAllResponce(res);

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
          {hDoc.map((d, i) => (
            <>
              <h2>{d.name || `Файл № ${i + 1}`}</h2>
              <Preview table={d.data} />
            </>
          ))}
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

function parseAllResponce(params: DirtyResponse): Promise<HDocMany> {
  return Promise.all(
    params.map(async (file) => ({
      name: file.name,
      data: await parseDirtyResponse(file.data),
    }))
  );
}

async function parseDirtyResponse(res: DirtyDocElement[]): Promise<HDoc> {
  if (!res) {
    return [
      {
        data_type: "text",
        data: "Пусто",
      },
    ];
  }

  return await Promise.all(
    res.map((elem) => {
      if (elem.data_type === "text") return elem;
      // return { type: elem.type, table:  };
      return new Promise<DocElement>((res, rej) => {
        let data: any[] = [];
        csv
          .parseString(elem.data)
          .on("data", (row) => data.push(row))
          .on("end", (rowCount: number) => {
            console.log(`Parsed ${rowCount} rows`);
            res({
              data_type: elem.data_type,
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
