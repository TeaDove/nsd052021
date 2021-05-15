from typing import IO

import detect_tesseract
from ml.table_generation import generate_table_from_tesseract
from models.tables import TesseractTable, Table


def process_pdf(contents: IO) -> Table:
    return Table()


def process_jpg(contents: IO) -> Table:
    return process_png(contents)


def process_png(contents: IO) -> Table:
    model_result = detect_tesseract.get_text(contents)
    tesseract_table = TesseractTable(model_result)

    processed_table = generate_table_from_tesseract(tesseract_table)

    return processed_table
