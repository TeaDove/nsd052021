# NUST MISIS - NEKO SUSPICIOUS 
# Наше решение на хакатоне NSD Progress.Tech 14-06.05

# Workflow

Image Reading -> [Image Preprocessing](#image-preprocessing) -> [Image to OCR](#ocr) -> [Data from OCR to Word document](#word-document-conversion)

## Image Preprocessing

TBD

## OCR

Tesseract

## Word Document Conversion

TBD

# How to Run server
```
uvicorn main:app --reload --app-dir ../back --host 0.0.0.0 --port 8000
yarn --cwd front start
```
or
```
./utils/run_back.sh   # run bakcend
./utils/run_front.sh  # run frontend
```