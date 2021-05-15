import {Document as XDocument, Paragraph, Table, TableCell, TableRow,} from "docx";
import {DocElement, ParagraphEl, TableEl} from "../App";

function getParagraph(el: ParagraphEl): Paragraph {
    return new Paragraph(el.data);
}

function getTable(el: TableEl): Table {
    const table = new Table({
        rows: el.data.map(
            (row) =>
                new TableRow({
                    children: row.map(
                        (cell) => new TableCell({children: [new Paragraph(cell)]})
                    ),
                })
        ),
    });

    return table;
}

export function createDoc(params: DocElement[]): XDocument {
    console.log("Creating DOCX");

    const doc = new XDocument({
        sections: [
            {
                children: params.map((p) =>
                    p.data_type === "text" ? getParagraph(p) : getTable(p)
                ),
            },
        ],
    });

    console.log("Created DOCX", doc);

    return doc;
}
