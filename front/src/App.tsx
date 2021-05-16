import React, { useEffect, useState } from "react";
import * as csv from "fast-csv";
// import { Document as XDocument, Packer } from "docx";
import downloadFile from "js-file-download";
// import { createDoc } from "./exporting/word";
import { createExcel } from "./exporting/excel";
import { Preview } from "./components/Preview";
import JSZip from "jszip";
import { useDropzone } from "react-dropzone";

import DEV_DATA from "./data.json";

// export type ParagraphEl = {
//   data_type: "text";
//   content: string;
// };
// export type TableEl = {
//   // data_type: "table";
//   content: { data: string; span: [number, number] }[][];
// };
// { data: string; span: [number, number] }[][]
// export type DocElement =
//   // ParagraphEl |
//   TableEl;

type DirtyDocElement = HDoc & {
  /**
   * JSON in string
   */
  content: string;
};

type Cell = { data: string; span: [number, number] };
type Row = Cell[];
export type HTable = Row[];

export type HDoc = {
  name: string;
  content: HTable;
};
export type HDocMany = HDoc[];
type DirtyResponse = {
  name: string;
  content: HTable;
}[];

type Status = "loading" | "error" | "success" | "idle";

function App() {
  const [pingStatus, setPing] = useState<Status>("loading");
  const [processonigStatus, setprocessonigStatus] = useState<Status>("idle");
  const [timeWait, setTimeWait] = useState<number>(0);
  const [fileNum, setFileNum] = useState<number>(1);
  const [hDoc, setHDoc] = useState<HDocMany>([]);
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone();

  const FilesInForm = acceptedFiles.map((file) => (
    // @ts-ignore
    <li key={file.path}>
      {
        // @ts-ignore
        file.path
      }{" "}
      - {file.size} bytes
    </li>
  ));

  useEffect(() => {
    let timer: any;
    if (processonigStatus === "loading") {
      timer = setInterval(() => {
        setTimeWait((p) => p + 40 / fileNum / 1000 / (1000 / 33));
      }, 33);
    }

    return () => {
      clearInterval(timer);
    };
  }, [fileNum, processonigStatus]);

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

  // const handleDocxDownload = async () => {
  //   const archive = new JSZip();

  //   await Promise.all(
  //     hDoc.map(async (d, i) => {
  //       const doc = createDoc(d.content);
  //       if (doc === null) return;
  //       archive.file(`${d.name || `doc-${i}`}.docx`, Packer.toBlob(doc));
  //       // downloadFile(await Packer.toBlob(doc), `${d.name || `doc-${i}`}.docx`);
  //     })
  //   );

  //   archive.generateAsync({ type: "blob" }).then((content) => {
  //     downloadFile(content, `documents.zip`);
  //   });
  // };

  const handleExcelDownload = async () => {
    console.log(hDoc);

    const archive = new JSZip();

    await Promise.all(
      hDoc.map(async (d, i) => {
        console.log("inside loop", d);

        const doc = createExcel(JSON.parse(JSON.stringify(d)));
        const buffer = await doc.xlsx.writeBuffer();
        archive.file(`${d.name || `table-${i}`}.xlsx`, buffer);
      })
    );

    archive.generateAsync({ type: "blob" }).then((content) => {
      downloadFile(content, `tables.zip`);
    });
  };

  const handleSubmit = async () => {
    const files = acceptedFiles;

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
    setFileNum(files.length);
    setprocessonigStatus("loading");
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

        // const data = await parseAllResponce(res);
        const data = res;

        setHDoc(data);
        setprocessonigStatus("success");
        setTimeWait(0);
      })
      .catch((err) => {
        console.log(err);
        setprocessonigStatus("error");
        setTimeWait(0);
      });

    // DEVVVVV

    //@ts-ignore
    // setHDoc(await parseAllResponce(DEV_DATA));
    // setprocessonigStatus("success");
    // setTimeWait(0);
    // DEV_DATA
    // console.log(JSON.parse(DEV_DATA[0].data[0].data));
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
      {/* <form onSubmit={}> */}
      {/* <label htmlFor="file">Выберите файл для обработки</label> */}
      {/* <br /> */}
      {/* <input
          type="file"
          name="file"
          id="file"
          accept=".jpg, .jpeg, .png, .webp, .pdf"
          required
          multiple
        /> */}
      <section className="dropzone-container">
        <div {...getRootProps({ className: "dropzone" })}>
          <input
            {...getInputProps({
              name: "file",
              multiple: true,
              required: true,
              accept: ".jpg, .jpeg, .png, .webp, .pdf",
              // tabIndex: 0,
              autoFocus: true,
            })}
          />
          <p>
            {/* Drag 'n' drop some files here, or click to select files */}
            Перетащите файлы или кликните, чтобы выбрать
          </p>
        </div>

        <aside>
          <h4>{FilesInForm.length !== 0 ? "Файлы" : "Нет выбранных файлов"}</h4>
          <ul>{FilesInForm}</ul>
        </aside>
      </section>

      <input type="button" value="Отправить" onClick={handleSubmit} />
      {/* </form> */}

      {processonigStatus === "loading" && (
        <div className="progressbar">
          <div
            className="loading"
            style={{ width: timeWait * 100 + "%" }}
          ></div>
          {/* {timeWait} */}
        </div>
      )}

      {hDoc.length === 0 ? (
        <p>Пока здесь пусто. Попробуйте загрузить файл ⬆️</p>
      ) : (
        <>
          {hDoc.map((d, i) => (
            <div key={d.name}>
              <h2>{d.name || `Файл № ${i + 1}`}</h2>
              <Preview table={d.content} />
            </div>
          ))}
          {/* {hDoc !== null && (
            <button onClick={handleDocxDownload}>Скачать docx 📄</button>
          )} */}
          {hDoc !== null && (
            <button onClick={handleExcelDownload}>Скачать excel </button>
          )}
        </>
      )}
    </main>
  );
}

export default App;

// function parseAllResponce(params: DirtyResponse): Promise<HDocMany> {
//   return Promise.all(
//     params.map(async (file) => ({
//       name: file.name,
//       content: await parseDirtyResponse(file.content),
//     }))
//   );
// }

async function parseDirtyResponse(res: string): Promise<HTable> {
  // if (!res) {
  //   return [
  //     {
  //       data_type: "text",
  //       content: "Пусто",
  //     },
  //   ];
  // }

  return JSON.parse(res);

  // return await Promise.all(
  //   res.map((elem) => {
  //     if (elem.data_type === "text") return elem;

  //     return { data_type: elem.data_type, content: JSON.parse(elem.content) };
  //   })
  // );
}
// return new Promise<DocElement>((res, rej) => {
//   let data: any[] = [];
//   csv
//     .parseString(elem.data)
//     .on("data", (row) => data.push(row))
//     .on("end", (rowCount: number) => {
//       console.log(`Parsed ${rowCount} rows`);
//       res({
//         data_type: elem.data_type,
//         data: data,
//       });
//     })
//     .on("error", (error) => {
//       console.error(error);
//       rej();
//     });
