import requests
from django.conf import settings
from PyPDF2 import PdfReader
import docx
import os

def extract_text_from_file(file_path):
    """Extract plain text from PDF, DOCX, or TXT."""
    ext = os.path.splitext(file_path)[1].lower()
    text = ""

    try:
        if ext == ".pdf":
            reader = PdfReader(file_path)
            text = "\n".join([page.extract_text() or "" for page in reader.pages])

        elif ext == ".docx":
            doc = docx.Document(file_path)
            text = "\n".join([para.text for para in doc.paragraphs])

        elif ext in [".txt", ".csv"]:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()

    except Exception as e:
        text = f"[Error reading file: {str(e)}]"

    return text


def summarize_text_with_ai(text):
    """Send text to Hugging Face model to summarize or clean up."""
    API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"
    headers = {"Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}"}

    try:
        response = requests.post(API_URL, headers=headers, json={"inputs": text[:4000]})
        data = response.json()

        if isinstance(data, list) and "summary_text" in data[0]:
            return data[0]["summary_text"]
        else:
            return text[:1000]  # fallback to raw text if summarization fails

    except Exception as e:
        return f"[AI summarization failed: {e}]"
