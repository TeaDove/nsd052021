from typing import IO

import detect_tesseract
from detect_tesseract import get_text
from ml.table_generation import generate_table_from_tesseract
from models.models import DataType, ProcessedData, ProcessedResponse
from models.tables import TesseractTable


def process_pdf(contents: IO) -> ProcessedResponse:
    result = ProcessedResponse()
    return result


def process_jpg(contents: IO) -> ProcessedResponse:
    return process_png(contents)


def process_png(contents: IO):
    result = ProcessedResponse()
    model_result = detect_tesseract.get_text(contents)
    tesseract_table = TesseractTable(model_result)
    processed_table = generate_table_from_tesseract(tesseract_table)
    processed_data = ProcessedData()
    processed_data.data_type = DataType.table
    processed_data.data = processed_table.__str__()
    result.content = [processed_data]
    result.name = "name"
    return result
