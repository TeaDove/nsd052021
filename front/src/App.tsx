import React, { useState, useEffect } from "react";
import * as csv from "fast-csv";
import {
  Document as XDocument,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  Packer,
} from "docx";
import downloadFile from "js-file-download";
// Packer.
type ParagraphEl = {
  type: "text";
  data: string;
};
type TableEl = {
  type: "table";
  data: any[][];
};

type DocElement = ParagraphEl | TableEl;
type HDoc = DocElement[];

type DirtyDocElement = DocElement & {
  data: any;
};

function getParagraph(el: ParagraphEl): Paragraph {
  return new Paragraph(el.data);
}

function getTable(el: TableEl): Table {
  const table = new Table({
    rows: el.data.map(
      (row) =>
        new TableRow({
          children: row.map(
            (cell) => new TableCell({ children: [new Paragraph(cell)] })
          ),
        })
    ),
  });

  return table;
}

function createDoc(params: DocElement[]): XDocument {
  console.log("Creating DOCX");

  const doc = new XDocument({
    sections: [
      {
        children: params.map((p) =>
          p.type === "text" ? getParagraph(p) : getTable(p)
        ),
      },
    ],
  });

  console.log("Created DOCX", doc);

  return doc;
}

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
  const [response, setresponse] = useState(null);
  const [table, setrawTable] = useState<HDoc>([]);
  const [Doc, setDoc] = useState<XDocument | null>(null);

  useEffect(() => {
    fetch(window.location.protocol + "//" + window.location.hostname + ":8000/")
      .then((res) => res.json())
      .then((res) => {
        console.log("Got from server", res);
        setresponse(res);
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
        setDoc(createDoc(data));
      });
  }, []);

  const handleDownload = async () => {
    if (Doc === null) return;
    downloadFile(await Packer.toBlob(Doc), "doc.docx");
  };

  return (
    <div>
      <main>
        <h1>Здарова</h1>

        <div>
          {response === null ? <span>Загрузка</span> : JSON.stringify(response)}
        </div>

        <Preview table={table} />

        {Doc !== null && <button onClick={handleDownload}>Скачать docx</button>}
      </main>
    </div>
  );
}

export default App;
