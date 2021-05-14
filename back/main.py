from fastapi import FastAPI
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


@app.get("/get-table")
async def root():
    with open('DEV.csv') as f:
        table = f.read()
        return [
            {
                "type": "table",
                "data": table
            }, {
                "type": "text",
                "data": "iewofjiow weifnowq qoweinfoiwq qwoeinfowiqen"
            }, {
                "type": "table",
                "data": table
            }]
