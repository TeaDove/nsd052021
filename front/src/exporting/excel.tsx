import ExcelJS from "exceljs";
import { HDoc } from "../App";

export function createExcel(table: HDoc) {
  const doc = new ExcelJS.Workbook();
  for (const elem of table) {
    if (elem.type === "table") {
      const sheet = doc.addWorksheet();
      sheet.addRows(elem.data);
    }
  }
  return doc;
}
