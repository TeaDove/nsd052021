import React, { useState, useEffect } from "react";
import * as csv from "fast-csv";
import { Document } from "docx/build/file";

type DocElement =
  | {
      type: "text";
      data: string;
    }
  | {
      type: "table";
      data: any;
    };

// function createDoc(params: DocElement[]): Document {}

function App() {
  const [response, setresponse] = useState(null);
  const [rawTable, setrawTable] = useState<DocElement[]>([]);
  const [Doc, setDoc] = useState(null);

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
      .then(async (res: DocElement[]) => {
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

  return (
    <div>
      <main>
        <h1>Здарова</h1>

        <div>
          {response === null ? <span>Загрузка</span> : JSON.stringify(response)}
        </div>

        <div>
          {rawTable.map((el) => {
            if (el.type === "text") {
              return (
                <div>
                  <p>{el.data}</p>
                </div>
              );
            } else if (el.type === "table") {
              return (
                <table>
                  {el.data.map((row: any) => (
                    <tr>
                      {row.map((cell: any) => (
                        <td>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </table>
              );
            }
          })}
        </div>
      </main>
    </div>
  );
}

export default App;
