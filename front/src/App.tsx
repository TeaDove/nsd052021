import React, { useState, useEffect } from "react";
import * as csv from "fast-csv";
import { Document as XDocument, Packer } from "docx";
import downloadFile from "js-file-download";
import { createDoc } from "./exporting/word";
import ExcelJS from "exceljs";

export type ParagraphEl = {
  type: "text";
  data: string;
};
export type TableEl = {
  type: "table";
  data: any[][];
};

export type DocElement = ParagraphEl | TableEl;
type HDoc = DocElement[];

type DirtyDocElement = DocElement & {
  data: any;
};

function Preview({ table }: { table: HDoc }) {
  return (
    <div>
      {table.map((el, i) => {
        if (el.type === "text") {
          return (
            <div key={i}>
              <p>{el.data}</p>
            </div>
          );
        } else if (el.type === "table") {
          return (
            <table
              key={i}
              style={{
                borderCollapse: "collapse",
                // border: "1px solid black",
              }}
            >
              <tbody>
                {el.data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td style={{ border: "1px solid black" }} key={cellIndex}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          );
        }
        return null;
      })}
    </div>
  );
}

function App() {
  const [pingStatus, setPing] =
    useState<"loading" | "error" | "success">("loading");
  const [table, setrawTable] = useState<HDoc>([]);
  // const [Doc, setDoc] = useState<XDocument | null>(null);

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

    fetch(
      window.location.protocol +
        "//" +
        window.location.hostname +
        ":8000/get-table"
    )
      .then((res) => res.json())
      .then(async (res: DirtyDocElement[]) => {
        console.log("Got from server", res);

        const data = await Promise.all(
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

        setrawTable(data);
      });
  }, []);

  const handleDocxDownload = async () => {
    const doc = createDoc(table);
    if (doc === null) return;
    downloadFile(await Packer.toBlob(doc), "doc.docx");
  };

  const handleExcelDownload = async () => {
    const doc = new ExcelJS.Workbook();
    for (const elem of table) {
      if (elem.type === "table") {
        const sheet = doc.addWorksheet();
        sheet.addRows(elem.data);
      }
    }
    const buffer = await doc.xlsx.writeBuffer();
    // const test = new Blob();
    // if (doc === null) return;
    downloadFile(buffer, "table.xlsx");
  };

  return (
    <div>
      <main>
        <h1>Здарова</h1>

        <div>
          Статус сервера:{" "}
          <span className={"status " + pingStatus}>
            {pingStatus === "loading"
              ? "загрузка"
              : pingStatus === "success"
              ? "работает"
              : "не отвечает"}
          </span>
        </div>

        <Preview table={table} />

        {table !== null && (
          <button onClick={handleDocxDownload}>Скачать docx</button>
        )}
        {table !== null && (
          <button onClick={handleExcelDownload}>Скачать excel</button>
        )}
      </main>
    </div>
  );
}

export default App;
