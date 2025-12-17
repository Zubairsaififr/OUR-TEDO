import PyPDF2

def extract_text_from_pdf(file_obj):
    try:
        reader = PyPDF2.PdfReader(file_obj)
        text = ""

        for page in reader.pages:
            text += page.extract_text() + "\n"

        return text.strip()

    except Exception as e:
        return None, str(e)
