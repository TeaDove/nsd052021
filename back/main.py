from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://65.21.155.166",
    "http://65.21.155.166:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Hello world!")


@app.get("/")
async def root():
    return {"message": "Hello World"}


# Типы элемента : text , table
# данные в поле дата


@app.post("/get-table")
async def get_table(file: UploadFile = File(...)):
    # Дока по FastAPI File https://fastapi.tiangolo.com/tutorial/request-files/#uploadfile
    with open("DEV.csv") as f:
        table = f.read()
        return [
            {"type": "table", "data": table},
            {"type": "text", "data": file.filename + " " + file.content_type},
            {"type": "table", "data": table},
        ]
