from models.models import ProcessedResponse

# [{top: 100, left: 100, text: "hui"}]
# 1 2 3
# 4 5 6


async def process_pdf(contents: bytes) -> ProcessedResponse:
    result = ProcessedResponse()
    return result


async def process_jpg(contents: bytes) -> ProcessedResponse:
    result = ProcessedResponse()
    return result


async def process_png(contents: bytes) -> ProcessedResponse:
    result = ProcessedResponse()
    return result
