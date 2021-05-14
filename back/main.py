from fastapi import FastAPI

print("Hello world!")


app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}
