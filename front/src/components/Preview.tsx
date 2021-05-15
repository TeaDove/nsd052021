import React, { useMemo } from "react";
import { HDoc } from "../App";
import styles from "./Preview.module.css";

export function Preview({ table }: { table: HDoc }) {
  const reshaped = useMemo(
    () =>
      table.map((el) => {
        if (el.data_type === "text") return el;
        const newT = [];

        for (let index = 0; index < el.data[0].length; index++) {
          const row = [];
          for (let col = 0; col < el.data.length; col++) {
            const cell = el.data[col][index];
            row.push(cell);
          }
          newT.push(row);
        }

        return { data_type: "table", data: newT };
      }),
    [table]
  );

  return (
    <div className={styles.preview}>
      {reshaped.map((el, i) => {
        if (el.data_type === "text") {
          return (
            <div key={i}>
              <p>{el.data}</p>
            </div>
          );
        } else if (el.data_type === "table") {
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
                    {row.map((cell, cellIndex) => {
                      //   console.log(cell);

                      return (
                        cell.data !== null && (
                          <td
                            style={{ border: "1px solid black" }}
                            key={cellIndex}
                            // colSpan={cell.span[0] || 1}
                            // rowSpan={cell.span[1] || 1}
                          >
                            {cell.data}
                          </td>
                        )
                      );
                    })}
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
