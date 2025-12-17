# tasks.py (Celery)

from celery import shared_task
from .models import AIDocumentTask, TenderRequirement, GeneratedDocument
from PyPDF2 import PdfReader
import requests
import json
import os
from django.conf import settings

# LLM API (example: xAI Grok API)
def call_llm(prompt, model="grok-beta"):
    API_KEY = settings.XAI_API_KEY
    url = "https://api.x.ai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3
    }
    response = requests.post(url, json=payload, headers=headers)
    return response.json()["choices"][0]["message"]["content"]

@shared_task
def process_tender_ai_task(task_id):
    task = AIDocumentTask.objects.get(id=task_id)
    task.status = "processing"
    task.save()

    try:
        # Step 1: Read Tender PDF
        tender_pdf_path = task.document.file.path
        tender_text = extract_text_from_pdf(tender_pdf_path)

        # Step 2: Extract Requirements
        requirements = extract_tender_requirements(tender_text)
        for req in requirements:
            TenderRequirement.objects.create(
                task=task,
                category=req["category"],
                document_name=req["name"],
                description=req["desc"],
                mandatory=req.get("mandatory", True),
                extracted_text=req["text"]
            )

        # Step 3: Read User's Uploaded Docs (assume multiple in Company or Task)
        user_docs_text = ""
        for doc in task.company.documents.all():  # assuming Company has documents
            user_docs_text += extract_text_from_pdf(doc.file.path) + "\n\n"

        # Step 4: Compare & Generate Missing
        missing = find_missing_documents(requirements, user_docs_text)
        generated_files = []

        for miss in missing:
            gen_prompt = f"""
            Generate a professional {miss['name']} document for a government tender.
            Company: {task.company.name}
            GST: {task.company.gst_number}
            PAN: {task.company.pan_number}
            Use formal language. Return full document content.
            """
            content = call_llm(gen_prompt)

            # Save as .docx or .pdf
            file_path = save_generated_doc(content, miss['name'], task.id)
            GeneratedDocument.objects.create(
                task=task,
                doc_type=miss['name'],
                file=file_path,
                content_preview=content[:500]
            )
            generated_files.append(file_path)

        # Step 5: Final Compliance Check
        final_check = compliance_check(tender_text, user_docs_text + " ".join([open(f).read() for f in generated_files]))
        
        task.result_text = final_check["summary"]
        if final_check["compliant"]:
            task.status = "completed"
            # Optional: Auto-fill via Selenium (later)
        else:
            task.status = "failed"
            task.result_text += "\n\nREJECTION REASONS: " + "; ".join(final_check["issues"])

        task.save()

    except Exception as e:
        task.status = "failed"
        task.result_text = str(e)
        task.save()


# Helper Functions
def extract_text_from_pdf(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

def extract_tender_requirements(tender_text):
    prompt = f"""
    Extract all required documents from this tender. Return JSON:
    [
        {{
            "category": "Financial/Technical/Legal",
            "name": "Document Name",
            "desc": "Short description",
            "mandatory": true/false,
            "text": "exact extracted clause"
        }}
    ]
    Tender Text:
    {tender_text[:12000]}
    """
    response = call_llm(prompt)
    return json.loads(response)

def find_missing_documents(requirements, user_docs_text):
    prompt = f"""
    Compare required vs available docs.
    Required: {json.dumps([r.document_name for r in requirements])}
    Available text: {user_docs_text[:10000]}
    Return JSON of missing docs:
    [{{"name": "EMD Declaration", "reason": "not found"}}]
    """
    response = call_llm(prompt)
    return json.loads(response)

def compliance_check(tender_text, all_user_content):
    prompt = f"""
    Final check: Is bidder fully compliant?
    Tender: {tender_text[:8000]}
    Bidder docs: {all_user_content[:15000]}
    Return JSON:
    {{
        "compliant": true/false,
        "summary": "2-line summary",
        "issues": ["list of problems"]
    }}
    """
    response = call_llm(prompt)
    return json.loads(response)

def save_generated_doc(content, doc_name, task_id):
    import os
    from django.core.files import File
    folder = f"generated_docs/task_{task_id}/"
    os.makedirs(folder, exist_ok=True)
    path = f"{folder}{doc_name.replace(' ', '_')}.txt"
    with open(path, "w") as f:
        f.write(content)
    return path