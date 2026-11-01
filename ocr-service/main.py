from fastapi import FastAPI, UploadFile, File
import pytesseract
from pdf2image import convert_from_bytes
import pdfplumber
import io

app = FastAPI()

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    contents = await file.read()
    pages = convert_from_bytes(contents, dpi=300)
    full_text = ""
    for page in pages:
        full_text += pytesseract.image_to_string(page) + "\n"
    return {"filename": file.filename, "extracted_text": full_text}