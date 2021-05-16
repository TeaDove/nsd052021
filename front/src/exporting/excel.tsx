import ExcelJS from "exceljs";
import { HDoc } from "../App";

export function createExcel(real: HDoc) {
  const table: HDoc = real;
  console.log({ table });

  const doc = new ExcelJS.Workbook();
  const sheet = doc.addWorksheet();

  const clean = table.content.map((row) => row.map((c) => c.data || ""));
  console.log({ clean });

  sheet.addRows(clean); // sheet.addRows(table.content);
  table.content.forEach((row, rowIndex) => {
    // row.forEach((cell) => {
    console.log({ row });

    // });
    const cleanRow = row.map((c) => c.data);
    sheet.addRow(cleanRow);
    // row.forEach((c, cellIndex) => {
    //   // if (c.span[0] !== 0 && c.span[1] !== 0)
    //   if (c.span[0] === 0 && c.span[1] === 0 && c.data === null) {
    //     return;
    //   }

    //   const bb = [
    //     rowIndex,
    //     cellIndex,
    //     rowIndex + c.span[0], // (c.span[1] || 1)
    //     cellIndex + c.span[1], // (c.span[0] || 1),
    //   ];
    //   console.log(bb);
    //   try {
    //     //@ts-ignore
    //     sheet.mergeCells(...bb);
    //   } catch (err) {
    //     // console.error(bb, c.data);
    //     // throw err;
    //   }
    // });
  });
  // sheet.mergeCells("A4:B5");

  // for (const elem of table.content) {
  // }
  return doc;
}
