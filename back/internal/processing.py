from typing import IO

import detect_tesseract
from detect_tesseract import get_text
from ml.table_generation import generate_table_from_tesseract
from models.models import DataType, ProcessedData, ProcessedResponse
from models.tables import TesseractTable


async def process_pdf(contents: IO) -> ProcessedResponse:
    result = ProcessedResponse()
    return result


async def process_jpg(contents: IO) -> ProcessedResponse:
    return await process_png(contents)


async def process_png(contents: IO) -> ProcessedResponse:
    result = ProcessedResponse()
    model_result = detect_tesseract.get_text(contents)
    tesseract_table = TesseractTable(model_result)
    processed_table = generate_table_from_tesseract(tesseract_table)
    processed_data = ProcessedData()
    processed_data.data_type = DataType.table
    processed_data.data = processed_table.__str__
    return result
