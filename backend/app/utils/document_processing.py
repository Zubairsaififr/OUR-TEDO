import io
import os
import requests
import tempfile
from django.conf import settings

# PDF
from PyPDF2 import PdfReader

# DOCX
import docx

# OCR
try:
    from PIL import Image
    import pytesseract
    OCR_AVAILABLE = True
except Exception:
    OCR_AVAILABLE = False

# Transformers fallback
LOCAL_TRANSFORMERS_AVAILABLE = False
try:
    from transformers import AutoModelForSeq2SeqLM, AutoTokenizer, pipeline
    LOCAL_TRANSFORMERS_AVAILABLE = True
except Exception:
    LOCAL_TRANSFORMERS_AVAILABLE = False


# -------------- TEXT EXTRACTION --------------
def extract_text_from_file(file_obj, content_type=None, filename=None, max_chars=20000):
    """
    Extracts raw text from PDF, DOCX, or image (via OCR).
    Returns best-effort text string.
    """
    try:
        file_obj.seek(0)
    except Exception:
        pass

    name = filename or getattr(file_obj, "name", "uploaded_file")
    ct = (content_type or "").lower()

    # PDF extraction
    if "pdf" in name.lower() or (ct and "pdf" in ct):
        try:
            reader = PdfReader(file_obj)
            text_pages = []
            for page in reader.pages:
                page_text = page.extract_text() or ""
                text_pages.append(page_text)
            text = "\n".join(text_pages)
            return text[:max_chars]
        except Exception as e:
            print(f"[WARN] PDF extraction failed: {e}")
            try:
                file_obj.seek(0)
                raw = file_obj.read()
                return raw.decode(errors="ignore")[:max_chars]
            except Exception:
                return ""

    # DOCX extraction
    if name.lower().endswith(".docx") or (ct and "word" in ct):
        try:
            file_obj.seek(0)
            doc = docx.Document(file_obj)
            full_text = [p.text for p in doc.paragraphs]
            return "\n".join(full_text)[:max_chars]
        except Exception as e:
            print(f"[WARN] DOCX extraction failed: {e}")
            try:
                file_obj.seek(0)
                return file_obj.read().decode(errors="ignore")[:max_chars]
            except Exception:
                return ""

    # Image OCR extraction
    if OCR_AVAILABLE and (name.lower().endswith((".png", ".jpg", ".jpeg", ".tiff")) or (ct and "image" in ct)):
        try:
            file_obj.seek(0)
            img = Image.open(file_obj)
            text = pytesseract.image_to_string(img)
            return text[:max_chars]
        except Exception as e:
            print(f"[WARN] OCR failed: {e}")
            return ""

    # Plain text fallback
    try:
        file_obj.seek(0)
        raw = file_obj.read()
        if isinstance(raw, bytes):
            raw = raw.decode(errors="ignore")
        return str(raw)[:max_chars]
    except Exception as e:
        print(f"[WARN] Plain text read failed: {e}")
        return ""


# -------------- PROMPT GENERATOR --------------
def hf_clean_text_prompt(raw_text):
    """
    Creates a structured prompt for the AI model to clean document text.
    """
    prompt = (
        "You are a text extraction and cleaning assistant.\n"
        "Task: Convert the following extracted content into a clean, structured, readable plain-text format.\n"
        "Preserve headings, bullet points, and section names like GST, PAN, Registration No, etc.\n"
        "Remove extra spaces, artifacts, and OCR noise.\n\n"
        "DOCUMENT START:\n"
        f"{raw_text[:8000]}\n\nDOCUMENT END.\n\n"
        "Output only the cleaned text below:\n"
    )
    return prompt


# -------------- HUGGING FACE INFERENCE --------------
def call_huggingface_inference(prompt, model_name=None, max_length=1024):
    """
    Cleans and structures document text using Hugging Face Inference API.
    Falls back to local transformers if API unavailable.
    """
    model = model_name or getattr(settings, "HUGGINGFACE_MODEL", "google/flan-t5-small")
    HF_TOKEN = getattr(settings, "HUGGINGFACE_API_TOKEN", None)

    if HF_TOKEN:
        try:
            url = f"https://api-inference.huggingface.co/models/{model}"
            headers = {"Authorization": f"Bearer {HF_TOKEN}"}
            payload = {"inputs": prompt, "parameters": {"max_new_tokens": max_length}}

            resp = requests.post(url, headers=headers, json=payload, timeout=120)
            resp.raise_for_status()

            data = resp.json()
            # Normalize response formats
            if isinstance(data, list):
                if "generated_text" in data[0]:
                    return data[0]["generated_text"].strip()
            elif isinstance(data, dict) and "generated_text" in data:
                return data["generated_text"].strip()
            elif isinstance(data, str):
                return data.strip()

            return str(data)[:max_length]

        except requests.exceptions.Timeout:
            raise RuntimeError("HuggingFace API timeout. Try again later.")
        except requests.exceptions.RequestException as e:
            raise RuntimeErr
