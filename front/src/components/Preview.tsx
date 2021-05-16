import React, { useMemo } from "react";
import { HDoc, HTable } from "../App";
import styles from "./Preview.module.css";

export function Preview({ table }: { table: HTable }) {
  //   const reshaped = useMemo(() => {
  //     const newT = [];

  //     for (let index = 0; index < table[0].length; index++) {
  //       const row = [];
  //       for (let col = 0; col < table.length; col++) {
  //         const cell = table[col][index];
  //         row.push(cell);
  //       }
  //       newT.push(row);
  //     }
  //   }, [table]);

  return (
    <div className={styles.preview}>
      <table
        style={{
          borderCollapse: "collapse",
          // border: "1px solid black",
        }}
      >
        <tbody>
          {table.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => {
                //   console.log(cell);

                return (
                  cell.data !== null && (
                    <td
                      style={{ border: "1px solid black" }}
                      key={cellIndex}
                      colSpan={Math.max(cell.span[0] + 1, 1)}
                      rowSpan={Math.max(cell.span[1] + 1, 1)}
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
    </div>
  );
}
