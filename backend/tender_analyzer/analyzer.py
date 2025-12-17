
# import base64
# import io
# import os
# import json
# from PIL import Image
# import pdf2image
# import openai
# from dotenv import load_dotenv
# import fitz  # PyMuPDF – for attachment URL extraction

# load_dotenv()
# openai.api_key = os.getenv("OPENAI_API_KEY")


# class TenderBidAnalyzer:
#     def __init__(self):
#         self.model = "gpt-4o"
        

#     def _pdf_to_text(self, pdf_path):
#         doc = fitz.open(pdf_path)
#         text = ""
#         for page in doc:
#             text += page.get_text("text")
#         return text

#     def _extract_documents(self, pdf_path):
#         doc = fitz.open(pdf_path)
#         urls = set()

#         for page in doc:
#             links = page.get_links()
#             for link in links:
#                 if link.get("uri"):
#                     urls.add(link.get("uri"))

#         cleaned = list(urls)
#         print("Extracted URLs:", cleaned)
#         return cleaned

#     def _analyze_text(self, text):
#         try:
#             response = openai.chat.completions.create(
#                 model=self.model,
#                 messages=[
#                     {"role": "system", "content": "Return only valid JSON."},
#                     {"role": "user", "content": f"""
#                     You are an expert in GeM tenders.
#                     Analyze the text content of the bid document and extract:

#                     - Items / Category
#                     - Total quantity
#                     - Eligibility criteria
#                     - Document submission requirements
#                     - Tender dates
#                     - Bid No
#                     - EMD or fee
#                     - Important terms

#                     Return JSON strictly.
#                     """.strip()}
#                 ],
#                 response_format={"type": "json_object"},
#                 max_tokens=2000
#             )

#             content = response.choices[0].message.content
#             return json.loads(content)

#         except Exception as e:
#             print("OpenAI Analysis Error:", e)
#             return {"analysis": "Failed to analyze PDF text", "error": str(e)}

#     def analyze_and_save(self, pdf_path, output_dir="media/analyzed"):

#         os.makedirs(output_dir, exist_ok=True)

#         print("Extracting links...")
#         extracted_docs = self._extract_documents(pdf_path)

#         print("Reading text...")
#         text = self._pdf_to_text(pdf_path)

#         print("Calling AI for analysis...")
#         ai_result = self._analyze_text(text)

#         # Final combined result
#         result = {
#             **ai_result,
#             "attached_documents": extracted_docs,
#         }

#         # Save json
#         base_name = os.path.splitext(os.path.basename(pdf_path))[0]
#         json_path = os.path.join(output_dir, f"{base_name}_analysis.json")

#         with open(json_path, "w", encoding="utf-8") as f:
#             json.dump(result, f, indent=2, ensure_ascii=False)

#         print("SUCCESS →", json_path)
#         return result
    
    
    
#     def extract_links_from_pdf(self, pdf_path):
#         try:
#             doc = fitz.open(pdf_path)
#             extracted = []

#             for page_number in range(len(doc)):
#                 page = doc[page_number]
#                 links = page.get_links()

#                 for link in links:
#                     uri = link.get("uri")
#                     if not uri:
#                         continue

#                     # Extract extension
#                     ext = uri.split(".")[-1].lower()
#                     raw = uri.split("/")[-1]

#                     extracted.append({
#                         "url": uri,
#                         "ext": ext,
#                         "rawName": raw
#                     })

#             doc.close()

#             # Remove duplicates
#             unique = {item["url"]: item for item in extracted}
#             return list(unique.values())

#         except Exception as e:
#             print("PDF Extract Error:", e)
#             return []






















# import base64
# import io
# import os
# import json
# import requests  # Added for downloading attachments
# from PIL import Image
# import pdf2image
# import openai
# from dotenv import load_dotenv
# import fitz  # PyMuPDF – for attachment URL extraction
# import pdfplumber  # Added for better table extraction and structured text

# load_dotenv()
# openai.api_key = os.getenv("OPENAI_API_KEY")


# class TenderBidAnalyzer:
#     def __init__(self):
#         self.model = "gpt-4o"  # You can upgrade to newer models if available

#     def _pdf_to_text_and_tables(self, pdf_path):
#         """
#         Extract full text and tables from PDF for deeper analysis.
#         """
#         full_text = ""
#         tables = []
#         with pdfplumber.open(pdf_path) as pdf:
#             for page in pdf.pages:
#                 full_text += page.extract_text() + "\n" if page.extract_text() else ""
#                 page_tables = page.extract_tables()
#                 if page_tables:
#                     tables.extend(page_tables)
        
#         # Clean and format tables as JSON-friendly list of dicts (if needed)
#         formatted_tables = []
#         for table in tables:
#             if table and table[0]:  # Assuming first row is headers
#                 headers = [h.lower().replace(" ", "_") if h else f"col_{i}" for i, h in enumerate(table[0])]
#                 for row in table[1:]:
#                     row_dict = {headers[i]: row[i] for i in range(min(len(headers), len(row)))}
#                     formatted_tables.append(row_dict)
        
#         return full_text, formatted_tables

#     def _extract_documents(self, pdf_path):
#         doc = fitz.open(pdf_path)
#         urls = set()

#         for page in doc:
#             links = page.get_links()
#             for link in links:
#                 if link.get("uri"):
#                     urls.add(link.get("uri"))

#         cleaned = list(urls)
#         print("Extracted URLs:", cleaned)
#         return cleaned

#     def _download_and_analyze_attachment(self, url, temp_dir="temp_attachments"):
#         """
#         Download attachment if PDF and analyze recursively.
#         Only PDFs for now; skip others.
#         """
#         try:
#             os.makedirs(temp_dir, exist_ok=True)
#             filename = url.split("/")[-1]
#             ext = filename.split(".")[-1].lower()
#             if ext != "pdf":
#                 print(f"Skipping non-PDF: {url}")
#                 return {"url": url, "analysis": "Non-PDF attachment", "ext": ext}
            
#             local_path = os.path.join(temp_dir, filename)
#             response = requests.get(url)
#             if response.status_code == 200:
#                 with open(local_path, "wb") as f:
#                     f.write(response.content)
#                 print(f"Downloaded: {local_path}")
                
#                 # Recursively analyze
#                 sub_result = self.analyze_and_save(local_path, output_dir=temp_dir)
#                 os.remove(local_path)  # Clean up
#                 return {"url": url, "analysis": sub_result, "ext": ext}
#             else:
#                 print(f"Download failed: {url}")
#                 return {"url": url, "analysis": "Download failed", "ext": ext}
#         except Exception as e:
#             print(f"Attachment Error: {url} - {e}")
#             return {"url": url, "analysis": "Error processing attachment", "error": str(e)}

#     def _analyze_text(self, text, tables):
#         """
#         Use AI to deeply extract all possible details in structured JSON.
#         Ensure nothing is missed by comprehensive prompt.
#         """
#         try:
#             # Convert tables to string for prompt
#             tables_str = json.dumps(tables, indent=2) if tables else "No tables found."

#             response = openai.chat.completions.create(
#                 model=self.model,
#                 messages=[
#                     {"role": "system", "content": "You are an expert in GeM tenders and bid analysis. Extract EVERY detail without missing anything. Return only valid JSON with the exact structure provided."},
#                     {"role": "user", "content": f"""
#                     Analyze the full text content and tables from the bid document. Do not miss any point, paragraph, condition, or requirement. Be exhaustive.

#                     Extract into this strict JSON structure:

#                     {{
#                       "bid_no": "string or null",
#                       "start_date": "YYYY-MM-DD or null",
#                       "end_date": "YYYY-MM-DD or null",
#                       "bid_type": "one_packet or two_packet or other or null",
#                       "items": [  // List of items/services
#                         {{
#                           "name": "string",
#                           "type_of_work": "string (e.g., Civil, Supply)",
#                           "quantity": "string or number",
#                           "specs": "detailed specifications string or null"  // All specs if product
#                         }}
#                       ],
#                       "total_quantity": "string or number or null",  // Overall if mentioned
#                       "turnover_req": {{
#                         "last_3_years": "amount or null",
#                         "ITR": "required or not or details",
#                         "other": "any additional financial req"
#                       }},
#                       "experience_req": {{
#                         "amount": "years or projects or null",
#                         "basis": "quantity_based or estimated_based or both or null",
#                         "details": "full paragraph or points on experience criteria"
#                       }},
#                       "major_docs": ["list of required company documents, e.g., PAN, GST"],
#                       "undertakings": ["list of declarations/undertakings required"],
#                       "exemptions": ["list of exemptions, e.g., MSME waiver"],
#                       "buyer_terms": ["list of buyer-specific terms and conditions"],
#                       "eligibility_criteria": "full detailed string or list of points",
#                       "document_submission_req": "full details on how/what to submit",
#                       "tender_dates": {{  // All dates
#                         "pre_bid_meeting": "YYYY-MM-DD or null",
#                         "clarification_end": "YYYY-MM-DD or null",
#                         "other": "any other dates"
#                       }},
#                       "emd_or_fee": {{
#                         "emd_amount": "amount or null",
#                         "tender_fee": "amount or null",
#                         "exemptions": "details"
#                       }},
#                       "important_terms": ["list of all important terms, clauses, penalties, etc."],
#                       "full_text_summary": "concise summary of entire bid to catch anything missed"
#                     }}

#                     Text: {text}

#                     Tables: {tables_str}

#                     Ensure EVERY paragraph, point, requirement is covered in the relevant fields. If something doesn't fit, add to important_terms or full_text_summary.
#                     """.strip()}
#                 ],
#                 response_format={"type": "json_object"},
#                 max_tokens=4000  # Increased for deeper analysis
#             )

#             content = response.choices[0].message.content
#             return json.loads(content)

#         except Exception as e:
#             print("OpenAI Analysis Error:", e)
#             return {"analysis": "Failed to analyze PDF text", "error": str(e)}

#     def analyze_and_save(self, pdf_path, output_dir="media/analyzed"):

#         os.makedirs(output_dir, exist_ok=True)

#         print("Extracting links...")
#         extracted_docs = self._extract_documents(pdf_path)

#         # Download and analyze attachments (deeply if PDFs)
#         analyzed_attachments = []
#         for url in extracted_docs:
#             attach_result = self._download_and_analyze_attachment(url)
#             analyzed_attachments.append(attach_result)

#         print("Extracting text and tables...")
#         text, tables = self._pdf_to_text_and_tables(pdf_path)

#         print("Calling AI for analysis...")
#         ai_result = self._analyze_text(text, tables)

#         # Final combined result
#         result = {
#             **ai_result,
#             "attached_documents": analyzed_attachments,  # Now with sub-analysis
#         }

#         # Save json
#         base_name = os.path.splitext(os.path.basename(pdf_path))[0]
#         json_path = os.path.join(output_dir, f"{base_name}_analysis.json")

#         with open(json_path, "w", encoding="utf-8") as f:
#             json.dump(result, f, indent=2, ensure_ascii=False)

#         print("SUCCESS →", json_path)
#         return result
    
    
#     def extract_links_from_pdf(self, pdf_path):
#         try:
#             doc = fitz.open(pdf_path)
#             extracted = []

#             for page_number in range(len(doc)):
#                 page = doc[page_number]
#                 links = page.get_links()

#                 for link in links:
#                     uri = link.get("uri")
#                     if not uri:
#                         continue

#                     # Extract extension
#                     ext = uri.split(".")[-1].lower()
#                     raw = uri.split("/")[-1]

#                     extracted.append({
#                         "url": uri,
#                         "ext": ext,
#                         "rawName": raw
#                     })

#             doc.close()

#             # Remove duplicates
#             unique = {item["url"]: item for item in extracted}
#             return list(unique.values())

#         except Exception as e:
#             print("PDF Extract Error:", e)
#             return []   



































# import base64
# import io
# import os
# import re
# import json
# import requests  # For downloading attachments
# from PIL import Image
# import pdf2image
# import openai
# from dotenv import load_dotenv
# import fitz  # PyMuPDF – for attachment URL extraction
# import pdfplumber  # For text & table extraction from PDFs
# from urllib.parse import unquote, urlparse

# load_dotenv()
# openai.api_key = os.getenv("OPENAI_API_KEY")


# class TenderBidAnalyzer:
#     def __init__(self):
#         # keep your chosen model; you can change externally if needed
#         self.model = "gpt-4o"

#     def _pdf_to_text_and_tables(self, pdf_path):
#         """
#         Extract full text and tables from PDF using pdfplumber.
#         If not enough text (likely scanned), use OCR via OpenAI Vision approach on pages.
#         Returns: (full_text, formatted_tables)
#         """
#         full_text = ""
#         tables = []
#         has_text = False

#         try:
#             with pdfplumber.open(pdf_path) as pdf:
#                 for page_no, page in enumerate(pdf.pages, start=1):
#                     try:
#                         page_text = page.extract_text() or ""
#                         if page_text.strip():
#                             full_text += f"\n\n--- PAGE {page_no} ---\n" + page_text + "\n"
#                             has_text = True
#                         page_tables = page.extract_tables() or []
#                         for t in page_tables:
#                             tables.append(t)
#                     except Exception as p_err:
#                         print(f"pdfplumber page {page_no} error: {p_err}")
#         except Exception as e:
#             print(f"Error opening {pdf_path} with pdfplumber: {e}")

#         # If little or no text extracted (scanned PDF) -> OCR on pages
#         if len(full_text.strip()) < 200 or not has_text:
#             print(f"Low text detected in {pdf_path} (len={len(full_text)}). Attempting OCR on pages.")
#             try:
#                 images = pdf2image.convert_from_path(pdf_path)
#                 for idx, img in enumerate(images, 1):
#                     print(f"OCR: converting page {idx}/{len(images)} to base64 image")
#                     buffered = io.BytesIO()
#                     img.convert("RGB").save(buffered, format="JPEG")
#                     base64_image = base64.b64encode(buffered.getvalue()).decode("utf-8")

#                     # Build a safer prompt (include page number marker)
#                     user_content = (
#                         f"Page {idx}: Extract all visible text and tables from this image. "
#                         "Return plain text. Preserve line breaks and table formatting as markdown if present.\n\n"
#                         f"Image (base64): data:image/jpeg;base64,{base64_image}"
#                     )

#                     try:
#                         # Use Chat Completions to request OCR-like extraction (keep token limits in mind)
#                         response = openai.ChatCompletion.create(
#                             model=self.model,
#                             messages=[
#                                 {"role": "system", "content": "You are an expert OCR extractor. Extract ALL text exactly."},
#                                 {"role": "user", "content": user_content}
#                             ],
#                             max_tokens=4000,
#                             temperature=0
#                         )
#                         ocr_text = response.choices[0].message["content"]
#                         full_text += f"\n\n--- OCR PAGE {idx} ---\n" + ocr_text + "\n"
#                     except Exception as ai_err:
#                         print(f"OCR AI call failed on page {idx}: {ai_err}")
#                         # continue; we still might have other pages or previous text
#                 print(f"OCR finished for {pdf_path}. total text length: {len(full_text)}")
#             except Exception as conv_err:
#                 print(f"pdf2image / OCR preparation failed for {pdf_path}: {conv_err}")
#                 # fallback: keep whatever text we had

#         # Format tables (pdfplumber) into list of dicts
#         formatted_tables = []
#         for table in tables:
#             if not table:
#                 continue
#             # If first row appears to be headers:
#             headers = []
#             first_row = table[0]
#             if any(cell and isinstance(cell, str) and cell.strip() for cell in first_row):
#                 headers = [
#                     (h.strip().lower().replace(" ", "_") if isinstance(h, str) and h else f"col_{i}")
#                     for i, h in enumerate(first_row)
#                 ]
#                 data_rows = table[1:]
#             else:
#                 # No headers - generate generic headers
#                 max_cols = max(len(r) for r in table)
#                 headers = [f"col_{i}" for i in range(max_cols)]
#                 data_rows = table

#             for row in data_rows:
#                 row_dict = {}
#                 for i, h in enumerate(headers):
#                     row_dict[h] = row[i] if i < len(row) else None
#                 formatted_tables.append(row_dict)

#         return full_text.strip(), formatted_tables

#     def _extract_documents(self, pdf_path):
#         """
#         Extract linked URLs, printed URLs (regex), and attempt to find embedded files.
#         Returns a list of unique URLs (strings).
#         """
#         urls = set()
#         try:
#             doc = fitz.open(pdf_path)

#             # 1) Extract explicit link annotations (URIs)
#             for page_no in range(len(doc)):
#                 page = doc[page_no]
#                 try:
#                     links = page.get_links() or []
#                     for l in links:
#                         uri = l.get("uri") or l.get("xref") or None
#                         if uri:
#                             urls.add(uri)
#                 except Exception as p_err:
#                     print(f"get_links error on page {page_no}: {p_err}")

#                 # 2) Extract any visible text that looks like a URL using regex
#                 try:
#                     text = page.get_text("text") or ""
#                     found = re.findall(r"https?://[^\s'\"<>]+", text)
#                     for f in found:
#                         urls.add(f)
#                 except Exception as tx_err:
#                     print(f"text regex on page {page_no} failed: {tx_err}")

#                 # 3) Check for annotations that may contain URIs
#                 try:
#                     ann = page.annots()
#                     if ann:
#                         for a in ann:
#                             info = a.info
#                             uri = info.get("uri") if isinstance(info, dict) else None
#                             if uri:
#                                 urls.add(uri)
#                 except Exception:
#                     # annots() might be None or raise if no annots
#                     pass

#             # 4) Attempt to list embedded attachments (if PyMuPDF supports it in this environment)
#             # Methods differ across fitz versions; use safe getattr checks.
#             try:
#                 if hasattr(doc, "embeddedFileNames"):
#                     try:
#                         emb_names = doc.embeddedFileNames() or []
#                         for name in emb_names:
#                             # Attempt to extract file bytes
#                             try:
#                                 filedict = doc.embfile_get(name)  # newer fitz API may be present
#                                 if filedict and isinstance(filedict, (bytes, bytearray)):
#                                     # Save as temp file and return path-like "embedded://name"
#                                     # We'll not directly add this to URLs but will save via a special dict later if needed.
#                                     # Instead add a pseudo-url scheme we can handle in downloader
#                                     urls.add(f"embedded://{name}")
#                                 else:
#                                     # fallback: embed name as reference
#                                     urls.add(f"embedded://{name}")
#                             except Exception as e_emb:
#                                 # If embfile_get not available, still add name so caller can handle
#                                 urls.add(f"embedded://{name}")
#                     except Exception as efn:
#                         print(f"embeddedFileNames handling error: {efn}")
#             except Exception:
#                 pass

#             doc.close()

#         except Exception as e:
#             print(f"Error extracting URLs from {pdf_path}: {e}")

#         cleaned = list(urls)
#         print(f"Extracted {len(cleaned)} candidate document references from {pdf_path}")
#         return cleaned

#     def _download_attachment(self, url, temp_dir="temp_attachments"):
#         """
#         Download an attachment and return a local path.
#         Supports:
#          - normal http(s) URLs
#          - pseudo 'embedded://filename' references (will try to read from PDF if possible)
#         """
#         os.makedirs(temp_dir, exist_ok=True)

#         # Handle embedded pseudo-scheme
#         if url.startswith("embedded://"):
#             name = url.split("embedded://", 1)[1]
#             # We cannot extract embedded bytes here because we would need the original doc object.
#             # Keep a placeholder file (empty) to note we found an embedded attachment.
#             local_path = os.path.join(temp_dir, f"embedded_{sanitize_filename(name)}")
#             try:
#                 with open(local_path, "wb") as f:
#                     f.write(b"")  # placeholder — caller may want to re-run with access to doc
#                 print(f"Created placeholder for embedded attachment: {local_path}")
#                 return local_path
#             except Exception as e:
#                 print(f"Failed to create embedded placeholder {local_path}: {e}")
#                 return None

#         # For normal URLs, attempt HTTP GET with retries and headers
#         try:
#             print(f"Attempting download from: {url}")
#             headers = {
#                 "User-Agent": "TenderBidAnalyzer/1.0 (+https://example.com)",
#                 "Accept": "*/*",
#             }
#             with requests.get(url, headers=headers, stream=True, timeout=30, allow_redirects=True) as r:
#                 if r.status_code != 200:
#                     print(f"Download failed: {url} status={r.status_code}")
#                     return None

#                 # Try to get filename from content-disposition
#                 cd = r.headers.get("content-disposition", "")
#                 filename = None
#                 if cd:
#                     m = re.search(r'filename\*?=(?:UTF-8\'\')?["\']?([^"\';]+)', cd)
#                     if m:
#                         filename = m.group(1).strip()

#                 if not filename:
#                     # Fallback to URL path
#                     path = urlparse(url).path
#                     filename = os.path.basename(path) or f"attachment_{abs(hash(url))}"

#                 filename = sanitize_filename(unquote(filename))
#                 local_path = os.path.join(temp_dir, filename)
#                 with open(local_path, "wb") as f:
#                     for chunk in r.iter_content(chunk_size=8192):
#                         if chunk:
#                             f.write(chunk)

#                 size = os.path.getsize(local_path)
#                 print(f"Downloaded {local_path} (size={size} bytes)")
#                 return local_path
#         except Exception as e:
#             print(f"Download exception for {url}: {e}")
#             return None

#     def _analyze_text(self, text, tables, is_sub_doc=False, file_type="pdf"):
#         """
#         Send the extracted text + tables to the model and request a strict JSON output.
#         Uses safer ChatCompletion call and attempts to recover JSON if AI returns extra text.
#         """
#         if not text or not text.strip():
#             print("No text provided to _analyze_text. Skipping AI call.")
#             return {"analysis": "No extractable text found in document"}

#         try:
#             tables_str = json.dumps(tables, indent=2, ensure_ascii=False) if tables else "No tables found."
#             print(f"Preparing AI analysis. Text length={len(text)}; tables_count={len(tables) if tables else 0}")

#             prompt_content = (
#                 "You are analyzing a bid/sub-document. Return ONLY valid JSON exactly in the structure described. "
#                 "Do not prefix or suffix with any explanation. If you cannot find a particular field, set it to null or empty list.\n\n"
#                 "Desired strict schema (fill with actual extracted values):\n"
#                 "{\n"
#                 '  "bid_no": null,\n'
#                 '  "start_date": null,\n'
#                 '  "end_date": null,\n'
#                 '  "bid_type": null,\n'
#                 '  "items": [],\n'
#                 '  "total_quantity": null,\n'
#                 '  "turnover_req": {},\n'
#                 '  "experience_req": {},\n'
#                 '  "major_docs": [],\n'
#                 '  "undertakings": [],\n'
#                 '  "exemptions": [],\n'
#                 '  "buyer_terms": [],\n'
#                 '  "eligibility_criteria": null,\n'
#                 '  "document_submission_req": null,\n'
#                 '  "tender_dates": {},\n'
#                 '  "emd_or_fee": {},\n'
#                 '  "important_terms": [],\n'
#                 '  "full_text_summary": null\n'
#                 "}\n\n"
#                 "Now extract data from the following TEXT and TABLES. Be literal: do not paraphrase important clauses; for long paragraphs include the full paragraph strings. "
#                 f"Text:\n'''{text[:40000]}'''\n\n"  # Truncate extremely long text for prompt safety but include large portion
#                 f"Tables:\n'''{tables_str}'''\n\n"
#                 "Return only JSON that matches the schema above."
#             )

#             resp = openai.ChatCompletion.create(
#                 model=self.model,
#                 messages=[
#                     {"role": "system", "content": "You are an exacting data extractor. Return only the requested JSON."},
#                     {"role": "user", "content": prompt_content}
#                 ],
#                 max_tokens=8000,
#                 temperature=0
#             )

#             raw = resp.choices[0].message["content"]
#             # The model might sometimes return extra text; try to extract JSON object from the response.
#             try:
#                 parsed = json.loads(raw)
#             except Exception:
#                 # Try to find the first JSON object in the string
#                 m = re.search(r"(\{(?:.|\n)*\})", raw)
#                 if m:
#                     try:
#                         parsed = json.loads(m.group(1))
#                     except Exception as je:
#                         print(f"Failed to parse JSON from AI content: {je}")
#                         parsed = {"analysis": "AI returned invalid JSON", "raw_response": raw}
#                 else:
#                     parsed = {"analysis": "AI returned no JSON", "raw_response": raw}

#             if isinstance(parsed, dict):
#                 print(f"AI returned parsed JSON with keys: {list(parsed.keys())}")
#             else:
#                 print("AI returned JSON that is not a dict. Wrapping in 'result'.")
#                 parsed = {"result": parsed}

#             return parsed

#         except Exception as e:
#             print(f"OpenAI Analysis Error: {e}")
#             return {"analysis": "Failed to analyze text", "error": str(e)}

#     def _analyze_image(self, image_path):
#         """
#         If image, base64 + send for text extraction then reuse _analyze_text.
#         """
#         try:
#             with open(image_path, "rb") as f:
#                 b64 = base64.b64encode(f.read()).decode("utf-8")

#             prompt_content = (
#                 "Extract every single piece of visible text from this image. Preserve line breaks. "
#                 f"Image (base64): data:image/jpeg;base64,{b64}"
#             )

#             resp = openai.ChatCompletion.create(
#                 model=self.model,
#                 messages=[
#                     {"role": "system", "content": "You are an OCR and extractor. Return plain text."},
#                     {"role": "user", "content": prompt_content}
#                 ],
#                 max_tokens=4000,
#                 temperature=0
#             )

#             extracted_text = resp.choices[0].message["content"]
#             print(f"Image analysis returned text length: {len(extracted_text)}")
#             return self._analyze_text(extracted_text, [], is_sub_doc=True, file_type="image")
#         except Exception as e:
#             print(f"Image Analysis Error: {e}")
#             return {"analysis": "Failed to analyze image", "error": str(e)}

#     def _analyze_file(self, file_path, is_sub_doc=False):
#         """
#         Analyze based on file extension. Supports pdf, image types, and plain text fallbacks.
#         """
#         ext = os.path.splitext(file_path)[1].lower().lstrip(".")
#         if ext == "pdf":
#             text, tables = self._pdf_to_text_and_tables(file_path)
#             return self._analyze_text(text, tables, is_sub_doc=is_sub_doc, file_type="pdf")
#         elif ext in ["jpg", "jpeg", "png", "gif", "bmp", "tiff"]:
#             return self._analyze_image(file_path)
#         else:
#             # Try to open as text (for .txt, .csv, maybe .json). If fails, mark unsupported.
#             try:
#                 with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
#                     text = f.read()
#                 return self._analyze_text(text, [], is_sub_doc=is_sub_doc, file_type=ext)
#             except Exception as e:
#                 print(f"Unsupported or unreadable file type {ext}: {e}")
#                 return {"analysis": "Unsupported file type", "error": str(e), "file_type": ext}

#     def analyze_and_save(self, pdf_path, output_dir="media/analyzed"):
#         """
#         Analyze main pdf and each found sub-document. Save JSON outputs to a unique folder.
#         """
#         os.makedirs(output_dir, exist_ok=True)

#         base_name = os.path.splitext(os.path.basename(pdf_path))[0]
#         # sanitize folder name
#         safe_base = sanitize_filename(base_name)
#         parent_folder = os.path.join(output_dir, f"{safe_base}_analysis")
#         os.makedirs(parent_folder, exist_ok=True)
#         print(f"Saving analysis outputs in: {parent_folder}")

#         print(f"Starting main analysis for file: {pdf_path}")
#         main_result = self._analyze_file(pdf_path, is_sub_doc=False)

#         # Save main result
#         main_json_path = os.path.join(parent_folder, "main_analysis.json")
#         with open(main_json_path, "w", encoding="utf-8") as f:
#             json.dump(main_result, f, indent=2, ensure_ascii=False)
#         print(f"Main analysis saved: {main_json_path}")

#         # Find sub-doc URLs or embedded refs
#         sub_urls = self._extract_documents(pdf_path)
#         print(f"Found {len(sub_urls)} candidate sub-doc references.")

#         for i, url in enumerate(sub_urls, start=1):
#             print(f"Processing sub-doc {i}/{len(sub_urls)} => {url}")
#             local_path = None
#             try:
#                 local_path = self._download_attachment(url)
#             except Exception as e:
#                 print(f"Download step failed for {url}: {e}")

#             if local_path:
#                 try:
#                     sub_result = self._analyze_file(local_path, is_sub_doc=True)
#                 except Exception as ae:
#                     print(f"Sub-file analysis error for {local_path}: {ae}")
#                     sub_result = {"analysis": "sub-file analysis failed", "error": str(ae)}

#                 sub_json_path = os.path.join(parent_folder, f"doc{i}.json")
#                 with open(sub_json_path, "w", encoding="utf-8") as f:
#                     json.dump(sub_result, f, indent=2, ensure_ascii=False)
#                 print(f"Saved sub-doc analysis: {sub_json_path}")

#                 # Remove the downloaded file (but keep placeholders if embedded)
#                 try:
#                     # don't remove embedded placeholders that start with 'embedded_'
#                     if os.path.exists(local_path) and not os.path.basename(local_path).startswith("embedded_"):
#                         os.remove(local_path)
#                 except Exception as rm_err:
#                     print(f"Could not remove temp file {local_path}: {rm_err}")

#             else:
#                 # Save failure record
#                 sub_json_path = os.path.join(parent_folder, f"doc{i}.json")
#                 with open(sub_json_path, "w", encoding="utf-8") as f:
#                     json.dump({"analysis": "Download failed or file not retrievable", "url": url}, f, indent=2, ensure_ascii=False)
#                 print(f"Saved sub-doc failure stub: {sub_json_path}")

#         return main_result

#     def extract_links_from_pdf(self, pdf_path):
#         """
#         Returns structured list of {url, ext, rawName} found in the pdf by scanning links & text.
#         """
#         try:
#             doc = fitz.open(pdf_path)
#             extracted = []

#             for page_number in range(len(doc)):
#                 page = doc[page_number]
#                 links = page.get_links() or []
#                 for link in links:
#                     uri = link.get("uri")
#                     if not uri:
#                         continue
#                     parsed = urlparse(uri)
#                     raw = os.path.basename(parsed.path) or parsed.netloc or uri
#                     ext = raw.split(".")[-1].lower() if "." in raw else ""
#                     extracted.append({"url": uri, "ext": ext, "rawName": raw})

#                 # regex scan page text
#                 try:
#                     text = page.get_text("text") or ""
#                     for found in re.findall(r"https?://[^\s'\"<>]+", text):
#                         p = urlparse(found)
#                         raw = os.path.basename(p.path) or p.netloc or found
#                         ext = raw.split(".")[-1].lower() if "." in raw else ""
#                         extracted.append({"url": found, "ext": ext, "rawName": raw})
#                 except Exception:
#                     pass

#             doc.close()
#             # de-duplicate by URL
#             unique = {}
#             for item in extracted:
#                 unique[item["url"]] = item
#             return list(unique.values())
#         except Exception as e:
#             print("PDF Extract Error:", e)
#             return []


# # ----------------- Helper functions -----------------
# def sanitize_filename(name: str):
#     """Make filename safe for filesystem usage."""
#     name = re.sub(r"[\\/:*?\"<>|]", "_", name)
#     name = name.strip()
#     if len(name) > 200:
#         name = name[:200]
#     return name or "file"


# # End of file

        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        

# """
# TenderBidAnalyzer (Smart Option A)
# - Robust extraction for main bid + sub-documents
# - Uses OpenAI Responses API (v2.x)
# - Keep class name TenderBidAnalyzer (no import break)
# """

# import os
# import io
# import re
# import json
# import time
# import base64
# import math
# import requests
# from urllib.parse import urlparse, unquote
# from collections import defaultdict

# from PIL import Image
# import pdf2image
# import fitz
# import pdfplumber
# from dotenv import load_dotenv
# import openai

# load_dotenv()
# openai.api_key = os.getenv("OPENAI_API_KEY")

# # ---------------- Config ----------------
# DEFAULT_MODEL = "gpt-4.1"   # change to gpt-4o if you have large token needs
# CHUNK_CHAR = 22000         # safe char chunk size (adjust if needed)
# OCR_MAX_CHARS = 15000
# OUTPUT_DIR = "media/analyzed"
# TEMP_DIR = "temp_attachments"
# RETRY_SLEEP = 1.2


# # ---------------- Helpers ----------------
# def sanitize_filename(name: str):
#     name = re.sub(r"[\\/:*?\"<>|]", "_", name).strip()
#     return name[:200] if len(name) > 200 else name or "file"


# def safe_json_load(s: str):
#     """Try to parse JSON, else try to find the first {...} substring."""
#     if not s:
#         return None
#     try:
#         return json.loads(s)
#     except Exception:
#         m = re.search(r"(\{(?:.|\n)*\})", s)
#         if m:
#             try:
#                 return json.loads(m.group(1))
#             except Exception:
#                 return None
#     return None


# def merge_partial_results(results):
#     """
#     Merge partial JSON results conservatively (strings: longest, lists: union, dicts: merge recursively).
#     """
#     if not results:
#         return {}

#     merged = {}

#     def merge_value(key, vals):
#         non_nulls = [v for v in vals if v not in (None, [], {}, "")]
#         if not non_nulls:
#             return None

#         # If list-like across results -> union preserve order
#         if all((isinstance(v, list) or v is None) for v in vals):
#             out = []
#             seen = set()
#             for arr in vals:
#                 if not arr:
#                     continue
#                 for item in arr:
#                     key_s = json.dumps(item, sort_keys=True) if isinstance(item, (dict, list)) else str(item)
#                     if key_s not in seen:
#                         out.append(item)
#                         seen.add(key_s)
#             return out

#         # If dict-like -> merge recursively
#         if all((isinstance(v, dict) or v is None) for v in vals):
#             keys = set()
#             for d in vals:
#                 if isinstance(d, dict):
#                     keys.update(d.keys())
#             out = {}
#             for k in keys:
#                 out[k] = merge_value(k, [d.get(k) if isinstance(d, dict) else None for d in vals])
#             return out

#         # Fallback: pick longest string representation
#         strings = [str(v) for v in non_nulls]
#         longest = max(strings, key=len)
#         return longest

#     all_keys = set()
#     for r in results:
#         if isinstance(r, dict):
#             all_keys.update(r.keys())

#     for k in all_keys:
#         merged[k] = merge_value(k, [r.get(k) if isinstance(r, dict) else None for r in results])

#     return merged


# # ---------------- Main Class (kept name) ----------------
# class TenderBidAnalyzer:
#     def __init__(self, model=DEFAULT_MODEL):
#         self.model = model
#         os.makedirs(TEMP_DIR, exist_ok=True)

#     # ---------------- Responses API helper ----------------
#     def _resp_text_from_response(self, resp):
#         """Concatenate text from ResponseOutputMessage objects (openai v2.x)."""
#         out = ""
#         if getattr(resp, "output", None):
#             for msg in resp.output:
#                 # message container
#                 if getattr(msg, "type", None) == "message":
#                     for c in getattr(msg, "content", []):
#                         if getattr(c, "type", None) == "output_text":
#                             out += getattr(c, "text", "")
#                 elif getattr(msg, "type", None) == "output_text":
#                     out += getattr(msg, "text", "")
#         # fallback property
#         if not out and getattr(resp, "output_text", None):
#             out = resp.output_text
#         return out

#     # ---------------- PDF -> pages & tables via pdfplumber ----------------
#     def _pdf_to_text_and_tables(self, pdf_path):
#         pages = []         # list of (page_no, text)
#         collected_tables = []  # list of dict {page, table}
#         try:
#             with pdfplumber.open(pdf_path) as pdf:
#                 for pno, page in enumerate(pdf.pages, start=1):
#                     try:
#                         page_text = page.extract_text() or ""
#                         pages.append((pno, page_text))
#                         page_tables = page.extract_tables() or []
#                         for tbl in page_tables:
#                             collected_tables.append({"page": pno, "table": tbl})
#                     except Exception as e:
#                         print(f"pdfplumber page {pno} error: {e}")
#         except Exception as e:
#             print("pdfplumber open error:", e)
#         return pages, collected_tables

#     # ---------------- OCR for pages using Responses API ----------------
#     def _ocr_pdf_pages(self, pdf_path, pages_to_ocr=None):
#         """Return dict page_no->text extracted via OCR (Responses API)."""
#         ocr_results = {}
#         try:
#             images = pdf2image.convert_from_path(pdf_path)
#         except Exception as e:
#             print("pdf2image error:", e)
#             return ocr_results

#         total = len(images)
#         for idx, img in enumerate(images, start=1):
#             if pages_to_ocr and idx not in pages_to_ocr:
#                 continue
#             try:
#                 buffered = io.BytesIO()
#                 img.convert("RGB").save(buffered, format="JPEG")
#                 b64 = base64.b64encode(buffered.getvalue()).decode()
#                 prompt = (
#                     f"Page {idx}/{total}: Extract every visible text and tables from this image. "
#                     "Preserve line breaks. If tables present, render as markdown tables. Return plain text only.\n\n"
#                     f"Image (base64): data:image/jpeg;base64,{b64}"
#                 )
#                 # attempt retries on rate limits
#                 last_err = None
#                 for attempt in range(3):
#                     try:
#                         resp = openai.responses.create(
#                             model=self.model,
#                             input=[{"role": "user", "content": prompt}],
#                             max_output_tokens=4000,
#                             temperature=0
#                         )
#                         text = self._resp_text_from_response(resp)
#                         ocr_results[idx] = text
#                         break
#                     except openai.error.RateLimitError as re:
#                         last_err = re
#                         time.sleep(RETRY_SLEEP * (attempt + 1))
#                     except Exception as e:
#                         last_err = e
#                         time.sleep(0.5)
#                 if attempt == 2 and not ocr_results.get(idx):
#                     print(f"OCR failed for page {idx}: {last_err}")
#             except Exception as e:
#                 print(f"OCR prep failed for page {idx}: {e}")
#         return ocr_results

#     # ---------------- Links & embedded refs extraction using fitz ----------------
#     def extract_links_from_pdf(self, pdf_path):
#         links = []
#         try:
#             doc = fitz.open(pdf_path)
#             for pno in range(len(doc)):
#                 page = doc[pno]
#                 for link in page.get_links() or []:
#                     uri = link.get("uri")
#                     if uri:
#                         raw = os.path.basename(urlparse(uri).path) or uri
#                         ext = raw.split(".")[-1].lower() if "." in raw else ""
#                         links.append({"page": pno + 1, "url": uri, "ext": ext, "raw": raw})
#                 # regex inside text
#                 try:
#                     text = page.get_text("text") or ""
#                     for found in re.findall(r"https?://[^\s'\"<>]+", text):
#                         raw = os.path.basename(urlparse(found).path) or found
#                         ext = raw.split(".")[-1].lower() if "." in raw else ""
#                         links.append({"page": pno + 1, "url": found, "ext": ext, "raw": raw})
#                 except Exception:
#                     pass
#             # embedded attachments (if available)
#             try:
#                 if hasattr(doc, "embeddedFileNames"):
#                     for name in doc.embeddedFileNames() or []:
#                         links.append({"page": None, "url": f"embedded://{name}", "ext": name.split(".")[-1].lower(), "raw": name})
#             except Exception:
#                 pass
#             doc.close()
#         except Exception as e:
#             print("fitz link extraction error:", e)
#         # dedupe preserve order
#         seen = set()
#         unique = []
#         for item in links:
#             if item["url"] not in seen:
#                 unique.append(item)
#                 seen.add(item["url"])
#         return unique

#     # ---------------- Attachment downloader ----------------
#     def _download_attachment(self, url):
#         os.makedirs(TEMP_DIR, exist_ok=True)
#         if url.startswith("embedded://"):
#             name = url.split("embedded://", 1)[1]
#             local = os.path.join(TEMP_DIR, f"embedded_{sanitize_filename(name)}")
#             # create placeholder (extracting actual embedded bytes would require reading from open doc)
#             try:
#                 with open(local, "wb") as f:
#                     f.write(b"")
#                 return local
#             except Exception:
#                 return None
#         try:
#             headers = {"User-Agent": "SmartTenderAnalyzer/1.0"}
#             r = requests.get(url, headers=headers, stream=True, timeout=30)
#             if r.status_code != 200:
#                 print(f"download status {r.status_code} for {url}")
#                 return None
#             cd = r.headers.get("content-disposition", "")
#             filename = None
#             if cd:
#                 m = re.search(r'filename\*?=(?:UTF-8\'\')?["\']?([^"\';]+)', cd)
#                 if m:
#                     filename = m.group(1).strip()
#             if not filename:
#                 path = urlparse(url).path
#                 filename = os.path.basename(path) or f"attachment_{abs(hash(url))}"
#             filename = sanitize_filename(unquote(filename))
#             local = os.path.join(TEMP_DIR, filename)
#             with open(local, "wb") as f:
#                 for chunk in r.iter_content(chunk_size=8192):
#                     if chunk:
#                         f.write(chunk)
#             return local
#         except Exception as e:
#             print("download exception:", e)
#             return None

#     # ---------------- Chunk -> partial JSON via model ----------------
#     def _analyze_chunk_to_json(self, text_chunk, tables_chunk):
#         """
#         Ask model to return a JSON object with any found keys (schema-less partial).
#         """
#         schema_hint = (
#             "Return a JSON object with any relevant keys you find. Possible keys: "
#             "bid_no, start_date, end_date, bid_type, items (list), total_quantity, turnover_req (dict), "
#             "experience_req (dict), major_docs (list), undertakings (list), exemptions (list), buyer_terms (list), "
#             "eligibility_criteria (string or list), document_submission_req, tender_dates (dict), emd_or_fee (dict), "
#             "important_terms (list), full_text_summary (string). If a key isn't present, omit it or set null."
#         )
#         prompt = (
#             f"{schema_hint}\n\n---- CHUNK TEXT ----\n'''{text_chunk}'''\n\n"
#             f"---- CHUNK TABLES ----\n'''{json.dumps(tables_chunk, ensure_ascii=False) if tables_chunk else 'No tables'}'''\n\n"
#             "Return ONLY the JSON object (no explanation)."
#         )

#         last_err = None
#         for attempt in range(3):
#             try:
#                 resp = openai.responses.create(
#                     model=self.model,
#                     input=[{"role": "user", "content": prompt}],
#                     max_output_tokens=4000,
#                     temperature=0
#                 )
#                 raw = self._resp_text_from_response(resp)
#                 parsed = safe_json_load(raw)
#                 if parsed is not None:
#                     return parsed
#                 # if model returned text but not valid JSON, keep raw to attempt salvage
#                 last_err = raw
#                 time.sleep(0.4)
#             except openai.error.RateLimitError as re:
#                 last_err = re
#                 time.sleep(RETRY_SLEEP * (attempt + 1))
#             except Exception as e:
#                 last_err = e
#                 time.sleep(0.4)
#         print("Chunk analyze failed:", last_err)
#         return None

#     # ---------------- Simple extraction for sub-docs + AI summarization ----------------
#     def _simple_extract_file(self, file_path):
#         """
#         For sub-documents, produce:
#         {
#           plain_text: "...",
#           tables: [ {page, table}, ... ],
#           images: [ {path, note}, ... ],
#           links: [ {page, url, ext, raw}, ... ],
#           ai_summary: {headings: [], bullets: [], summary: ""}
#         }
#         """
#         result = {"plain_text": "", "tables": [], "images": [], "links": [], "ai_summary": None}
#         ext = os.path.splitext(file_path)[1].lower().lstrip(".")

#         try:
#             if ext == "pdf":
#                 pages, tables = self._pdf_to_text_and_tables(file_path)
#                 full_text = "\n\n".join([f"--- PAGE {p} ---\n{t}" for p, t in pages if t])
#                 result["plain_text"] = full_text
#                 # attach tables (raw)
#                 for t in tables:
#                     result["tables"].append({"page": t.get("page"), "table": t.get("table")})
#                 # links
#                 links = self.extract_links_from_pdf(file_path)
#                 result["links"] = links
#             elif ext in ("jpg", "jpeg", "png", "bmp", "tiff", "gif"):
#                 with open(file_path, "rb") as f:
#                     b64 = base64.b64encode(f.read()).decode()
#                 prompt = f"Extract all visible text from this image. Preserve line breaks.\nImage (base64): data:image/jpeg;base64,{b64}"
#                 resp = openai.responses.create(model=self.model, input=[{"role": "user", "content": prompt}], max_output_tokens=2000)
#                 text = self._resp_text_from_response(resp)
#                 result["plain_text"] = text
#                 result["images"].append({"path": file_path})
#             else:
#                 with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
#                     result["plain_text"] = f.read()
#         except Exception as e:
#             result["error"] = str(e)

#         # AI summarize and extract headings/bullets for sub-doc plain_text (lightweight)
#         try:
#             summary_prompt = (
#                 "You will be given a document's text. Return a JSON with keys: headings (list of strings), bullets (list of key points), "
#                 "summary (short paragraph). Preserve original wording for bullets where possible. Return only JSON.\n\n"
#                 f"Text:\n'''{(result.get('plain_text') or '')[:20000]}'''"
#             )
#             resp = openai.responses.create(model=self.model, input=[{"role": "user", "content": summary_prompt}], max_output_tokens=1200, temperature=0)
#             raw = self._resp_text_from_response(resp)
#             parsed = safe_json_load(raw)
#             if parsed:
#                 result["ai_summary"] = parsed
#             else:
#                 # fallback: store raw text snippet as summary
#                 result["ai_summary"] = {"headings": [], "bullets": [], "summary": (result.get("plain_text") or "")[:1000]}
#         except Exception as e:
#             result["ai_summary"] = {"error": str(e), "summary": (result.get("plain_text") or "")[:1000]}

#         return result

#     # ---------------- Public analyze_and_save (main entry) ----------------
#     def analyze_and_save(self, pdf_path, output_dir=OUTPUT_DIR, chunk_char=CHUNK_CHAR, merge_chunks=True):
#         os.makedirs(output_dir, exist_ok=True)
#         base = sanitize_filename(os.path.splitext(os.path.basename(pdf_path))[0])
#         parent = os.path.join(output_dir, f"{base}_analysis")
#         os.makedirs(parent, exist_ok=True)

#         # 1) quick extract pages & tables
#         pages_text, tables = self._pdf_to_text_and_tables(pdf_path)  # pages_text: list of (page_no, text)
#         # 2) links & embedded refs
#         links = self.extract_links_from_pdf(pdf_path)

#         # 3) decide pages needing OCR (small or empty text)
#         pages_to_ocr = [p for p, t in pages_text if not t or len(t.strip()) < 120]
#         if not pages_text:
#             # determine page count by fitz fallback
#             try:
#                 doc = fitz.open(pdf_path)
#                 pages_to_ocr = list(range(1, len(doc) + 1))
#                 doc.close()
#             except Exception:
#                 pass

#         # 4) perform OCR where needed and merge
#         if pages_to_ocr:
#             ocr_texts = self._ocr_pdf_pages(pdf_path, pages_to_ocr)
#             page_dict = {p: t for p, t in pages_text}
#             for p, txt in ocr_texts.items():
#                 page_dict[p] = (page_dict.get(p) or "") + ("\n\n" + txt)
#             # rebuild page order
#             maxpage = max(page_dict.keys()) if page_dict else (max([p for p, _ in pages_text]) if pages_text else 0)
#             pages_text = [(p, page_dict.get(p, "")) for p in range(1, maxpage + 1)]

#         # 5) combine pages into a single text (with separators) and build structured tables list
#         page_texts_ordered = [t for _, t in pages_text]
#         combined_text = "\n\n".join([f"--- PAGE {i+1} ---\n{page_texts_ordered[i]}" for i in range(len(page_texts_ordered))])

#         structured_tables = []
#         for t in tables:
#             tbl = t.get("table")
#             if not tbl:
#                 continue
#             first_row = tbl[0] if tbl else []
#             headers = [h.strip() if h else f"col_{i}" for i, h in enumerate(first_row)]
#             rows = []
#             for row in tbl[1:]:
#                 row_dict = {}
#                 for i, h in enumerate(headers):
#                     row_dict[h] = row[i] if i < len(row) else None
#                 rows.append(row_dict)
#             structured_tables.append({"page": t.get("page"), "rows": rows})

#         # 6) chunk combined_text for model processing
#         partial_results = []
#         if combined_text.strip():
#             if len(combined_text) <= chunk_char:
#                 partial = self._analyze_chunk_to_json(combined_text, structured_tables)
#                 if partial:
#                     partial_results.append(partial)
#             else:
#                 # split by page boundaries to preserve structure
#                 pages_list = combined_text.split("\n\n--- PAGE ")
#                 pages_list = [pages_list[0]] + [("--- PAGE " + p) for p in pages_list[1:]]
#                 cur_text = ""
#                 cur_tables = []
#                 cur_pages = []
#                 for page_block in pages_list:
#                     addition = ("\n\n" if cur_text else "") + page_block
#                     # detect page number
#                     m = re.match(r"--- PAGE (\d+) ---", page_block)
#                     pnum = int(m.group(1)) if m else None
#                     # add tables for that page
#                     page_tables_for_block = []
#                     if pnum:
#                         for st in structured_tables:
#                             if st.get("page") == pnum:
#                                 page_tables_for_block.append(st)
#                     # if adding this page would exceed chunk limit -> finalize current chunk
#                     if cur_text and (len(cur_text) + len(addition) > chunk_char):
#                         # analyze current chunk
#                         partial = self._analyze_chunk_to_json(cur_text, cur_tables)
#                         if partial:
#                             partial_results.append(partial)
#                         else:
#                             partial_results.append({"full_text_summary": cur_text[:5000]})
#                         # reset
#                         cur_text = page_block
#                         cur_tables = page_tables_for_block.copy()
#                     else:
#                         cur_text += addition
#                         cur_tables.extend(page_tables_for_block)
#                 # final chunk
#                 if cur_text:
#                     partial = self._analyze_chunk_to_json(cur_text, cur_tables)
#                     if partial:
#                         partial_results.append(partial)
#                     else:
#                         partial_results.append({"full_text_summary": cur_text[:5000]})

#         # 7) merge partial results
#         final_main_json = merge_partial_results(partial_results) if partial_results else {}
#         # always include raw data
#         final_main_json.setdefault("raw_text_pages", [{"page": i + 1, "text": page_texts_ordered[i]} for i in range(len(page_texts_ordered))])
#         final_main_json.setdefault("raw_tables", structured_tables)
#         final_main_json.setdefault("links", links)

#         # 8) Save main JSON
#         main_out_path = os.path.join(parent, "main_analysis.json")
#         with open(main_out_path, "w", encoding="utf-8") as f:
#             json.dump(final_main_json, f, indent=2, ensure_ascii=False)
#         print("Saved main JSON:", main_out_path)

#         # 9) Process sub-documents (simple extract + AI summarize)
#         doc_count = 0
#         for item in links:
#             url = item.get("url")
#             if not url:
#                 continue
#             doc_count += 1
#             local = self._download_attachment(url)
#             out_path = os.path.join(parent, f"doc{doc_count}.json")
#             if local:
#                 simple = self._simple_extract_file(local)
#                 simple["source_url"] = url
#                 with open(out_path, "w", encoding="utf-8") as f:
#                     json.dump(simple, f, indent=2, ensure_ascii=False)
#                 print("Saved sub-doc JSON:", out_path)
#                 # cleanup
#                 if not os.path.basename(local).startswith("embedded_"):
#                     try:
#                         os.remove(local)
#                     except Exception:
#                         pass
#             else:
#                 with open(out_path, "w", encoding="utf-8") as f:
#                     json.dump({"analysis": "download_failed", "url": url}, f, indent=2, ensure_ascii=False)
#                 print("Saved sub-doc failure JSON:", out_path)

#         return final_main_json












"""
TenderBidAnalyzer (Smart Option A - Updated for OpenAI v1.x+)
- Uses modern chat.completions API (no more deprecated Responses API)
- Proper error handling with new exceptions
- Same class name & behavior preserved
- Works with gpt-4o, gpt-4-turbo, gpt-4o-mini etc.
"""

import os
import io
import re
import json
import time
import base64
import math
import requests
from urllib.parse import urlparse, unquote
from collections import defaultdict

from PIL import Image
import pdf2image
import fitz
import pdfplumber
from dotenv import load_dotenv
from openai import OpenAI
from openai import AuthenticationError, RateLimitError, APIError, APIConnectionError

load_dotenv()

# Initialize OpenAI client properly
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ---------------- Config ----------------
DEFAULT_MODEL = "gpt-4o"          # Recommended: gpt-4o ya gpt-4o-mini for speed/cost
CHUNK_CHAR = 22000
OCR_MAX_CHARS = 15000
OUTPUT_DIR = "media/analyzed"
TEMP_DIR = "temp_attachments"
RETRY_SLEEP = 1.2
MAX_RETRIES = 3


# ---------------- Helpers ----------------
def sanitize_filename(name: str):
    name = re.sub(r"[\\/:*?\"<>|]", "_", name).strip()
    return name[:200] if len(name) > 200 else name or "file"


def safe_json_load(s: str):
    if not s:
        return None
    try:
        return json.loads(s)
    except Exception:
        m = re.search(r"(\{(?:.|\n)*\})", s, re.DOTALL)
        if m:
            try:
                return json.loads(m.group(1))
            except Exception:
                return None
    return None


def merge_partial_results(results):
    if not results:
        return {}

    merged = {}

    def merge_value(key, vals):
        non_nulls = [v for v in vals if v not in (None, [], {}, "")]
        if not non_nulls:
            return None

        if all((isinstance(v, list) or v is None) for v in vals):
            out = []
            seen = set()
            for arr in vals:
                if not arr:
                    continue
                for item in arr:
                    key_s = json.dumps(item, sort_keys=True) if isinstance(item, (dict, list)) else str(item)
                    if key_s not in seen:
                        out.append(item)
                        seen.add(key_s)
            return out

        if all((isinstance(v, dict) or v is None) for v in vals):
            keys = set()
            for d in vals:
                if isinstance(d, dict):
                    keys.update(d.keys())
            out = {}
            for k in keys:
                out[k] = merge_value(k, [d.get(k) if isinstance(d, dict) else None for d in vals])
            return out

        strings = [str(v) for v in non_nulls]
        longest = max(strings, key=len)
        return longest

    all_keys = set()
    for r in results:
        if isinstance(r, dict):
            all_keys.update(r.keys())

    for k in all_keys:
        merged[k] = merge_value(k, [r.get(k) if isinstance(r, dict) else None for r in results])

    return merged


# ---------------- Main Class (kept name) ----------------
class TenderBidAnalyzer:
    def __init__(self, model=DEFAULT_MODEL):
        self.model = model
        self.client = client  # Use global client (best practice)
        os.makedirs(TEMP_DIR, exist_ok=True)

    # ---------------- Modern chat completion helper ----------------
    def _chat_completion(self, messages, max_tokens=4000, temperature=0):
        for attempt in range(MAX_RETRIES):
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    max_tokens=max_tokens,
                    temperature=temperature
                )
                return response.choices[0].message.content.strip()
            except RateLimitError as e:
                wait = RETRY_SLEEP * (2 ** attempt)
                print(f"Rate limit hit, waiting {wait}s...")
                time.sleep(wait)
            except AuthenticationError as e:
                print("Invalid API key! Check your OPENAI_API_KEY.")
                raise e
            except APIConnectionError as e:
                print("Connection error, retrying...")
                time.sleep(RETRY_SLEEP * (attempt + 1))
            except APIError as e:
                print(f"OpenAI API error: {e}")
                if attempt == MAX_RETRIES - 1:
                    raise
                time.sleep(RETRY_SLEEP)
            except Exception as e:
                print(f"Unexpected error in chat completion: {e}")
                if attempt == MAX_RETRIES - 1:
                    raise
                time.sleep(0.5)
        return None

    # ---------------- PDF -> pages & tables via pdfplumber ----------------
    def _pdf_to_text_and_tables(self, pdf_path):
        pages = []
        collected_tables = []
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for pno, page in enumerate(pdf.pages, start=1):
                    try:
                        page_text = page.extract_text() or ""
                        pages.append((pno, page_text))
                        page_tables = page.extract_tables() or []
                        for tbl in page_tables:
                            collected_tables.append({"page": pno, "table": tbl})
                    except Exception as e:
                        print(f"pdfplumber page {pno} error: {e}")
        except Exception as e:
            print("pdfplumber open error:", e)
        return pages, collected_tables

    # ---------------- OCR using vision (gpt-4o or gpt-4-turbo) ----------------
    def _ocr_pdf_pages(self, pdf_path, pages_to_ocr=None):
        ocr_results = {}
        try:
            images = pdf2image.convert_from_path(pdf_path, dpi=200)
        except Exception as e:
            print("pdf2image error:", e)
            return ocr_results

        total = len(images)
        for idx, img in enumerate(images, start=1):
            if pages_to_ocr and idx not in pages_to_ocr:
                continue
            try:
                buffered = io.BytesIO()
                img.convert("RGB").save(buffered, format="JPEG", quality=85)
                b64 = base64.b64encode(buffered.getvalue()).decode()

                messages = [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": f"Page {idx}/{total}: Extract every visible text and tables from this image accurately. "
                                        "Preserve formatting and line breaks. Render tables as markdown if present. Return plain text only."
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{b64}"
                                }
                            }
                        ]
                    }
                ]

                text = self._chat_completion(messages, max_tokens=4000)
                if text:
                    ocr_results[idx] = text
                else:
                    print(f"OCR failed for page {idx} (empty response)")
            except Exception as e:
                print(f"OCR prep failed for page {idx}: {e}")
        return ocr_results

    # ---------------- Links & embedded refs extraction using fitz ----------------
    def extract_links_from_pdf(self, pdf_path):
        links = []
        try:
            doc = fitz.open(pdf_path)
            for pno in range(len(doc)):
                page = doc[pno]
                for link in page.get_links() or []:
                    uri = link.get("uri")
                    if uri:
                        raw = os.path.basename(urlparse(uri).path) or uri
                        ext = raw.split(".")[-1].lower() if "." in raw else ""
                        links.append({"page": pno + 1, "url": uri, "ext": ext, "raw": raw})
                try:
                    text = page.get_text("text") or ""
                    for found in re.findall(r"https?://[^\s'\"<>]+", text):
                        raw = os.path.basename(urlparse(found).path) or found
                        ext = raw.split(".")[-1].lower() if "." in raw else ""
                        links.append({"page": pno + 1, "url": found, "ext": ext, "raw": raw})
                except Exception:
                    pass
            doc.close()
        except Exception as e:
            print("fitz link extraction error:", e)

        seen = set()
        unique = []
        for item in links:
            if item["url"] not in seen:
                unique.append(item)
                seen.add(item["url"])
        return unique

    # ---------------- Attachment downloader ----------------
    def _download_attachment(self, url):
        os.makedirs(TEMP_DIR, exist_ok=True)
        try:
            headers = {"User-Agent": "SmartTenderAnalyzer/2.0"}
            r = requests.get(url, headers=headers, stream=True, timeout=30)
            if r.status_code != 200:
                print(f"download status {r.status_code} for {url}")
                return None
            cd = r.headers.get("content-disposition", "")
            filename = None
            if cd:
                m = re.search(r'filename\*?=UTF-8\'\'(["\']?)([^"\';]+)\1', cd)
                if m:
                    filename = m.group(2)
            if not filename:
                path = urlparse(url).path
                filename = os.path.basename(unquote(path)) or f"attachment_{abs(hash(url))}"
            filename = sanitize_filename(filename)
            local = os.path.join(TEMP_DIR, filename)
            with open(local, "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
            return local
        except Exception as e:
            print("download exception:", e)
            return None

    # ---------------- Chunk -> partial JSON ----------------
    def _analyze_chunk_to_json(self, text_chunk, tables_chunk):
        schema_hint = (
            "Return a JSON object with any relevant tender/bid keys you find. Possible keys include: "
            "bid_no, start_date, end_date, bid_type, items (list), total_quantity, turnover_req (dict), "
            "experience_req (dict), major_docs (list), undertakings (list), exemptions (list), buyer_terms (list), "
            "eligibility_criteria, document_submission_req, tender_dates (dict), emd_or_fee (dict), "
            "important_terms (list), full_text_summary (string). Omit keys not found."
        )
        prompt = (
            f"{schema_hint}\n\n---- CHUNK TEXT ----\n'''{text_chunk}'''\n\n"
            f"---- CHUNK TABLES ----\n'''{json.dumps(tables_chunk, ensure_ascii=False) if tables_chunk else 'No tables'}'''\n\n"
            "Return ONLY valid JSON. No explanation."
        )

        messages = [{"role": "user", "content": prompt}]
        raw = self._chat_completion(messages, max_tokens=4000)
        if not raw:
            return None
        parsed = safe_json_load(raw)
        return parsed or {"raw_output": raw[:1000]}

    # ---------------- Simple extraction for sub-docs ----------------
    def _simple_extract_file(self, file_path):
        result = {"plain_text": "", "tables": [], "images": [], "links": [], "ai_summary": None}
        ext = os.path.splitext(file_path)[1].lower().lstrip(".")

        try:
            if ext == "pdf":
                pages, tables = self._pdf_to_text_and_tables(file_path)
                full_text = "\n\n".join([f"--- PAGE {p} ---\n{t}" for p, t in pages if t])
                result["plain_text"] = full_text
                for t in tables:
                    result["tables"].append({"page": t.get("page"), "table": t.get("table")})
                result["links"] = self.extract_links_from_pdf(file_path)
            elif ext in ("jpg", "jpeg", "png", "bmp", "tiff", "gif"):
                with open(file_path, "rb") as f:
                    b64 = base64.b64encode(f.read()).decode()
                messages = [
                    {"role": "user", "content": [
                        {"type": "text", "text": "Extract all visible text accurately."},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}}
                    ]}
                ]
                text = self._chat_completion(messages, max_tokens=2000)
                result["plain_text"] = text or ""
                result["images"].append({"path": file_path})
            else:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    result["plain_text"] = f.read()
        except Exception as e:
            result["error"] = str(e)

        # AI summary for sub-doc
        try:
            summary_prompt = (
                "Return JSON with: headings (list), bullets (list of key points), summary (short paragraph).\n\n"
                f"Text:\n'''{(result.get('plain_text') or '')[:20000]}'''"
            )
            messages = [{"role": "user", "content": summary_prompt}]
            raw = self._chat_completion(messages, max_tokens=1200)
            parsed = safe_json_load(raw)
            result["ai_summary"] = parsed or {"summary": (result.get("plain_text") or "")[:1000]}
        except Exception as e:
            result["ai_summary"] = {"error": str(e), "summary": (result.get("plain_text") or "")[:1000]}

        return result

    # ---------------- Main analyze_and_save ----------------
    def analyze_and_save(self, pdf_path, output_dir=OUTPUT_DIR, chunk_char=CHUNK_CHAR):
        os.makedirs(output_dir, exist_ok=True)
        base = sanitize_filename(os.path.splitext(os.path.basename(pdf_path))[0])
        parent = os.path.join(output_dir, f"{base}_analysis")
        os.makedirs(parent, exist_ok=True)

        pages_text, tables = self._pdf_to_text_and_tables(pdf_path)
        links = self.extract_links_from_pdf(pdf_path)

        pages_to_ocr = [p for p, t in pages_text if not t or len(t.strip()) < 120]
        if pages_to_ocr:
            ocr_texts = self._ocr_pdf_pages(pdf_path, pages_to_ocr)
            page_dict = {p: t for p, t in pages_text}
            for p, txt in ocr_texts.items():
                page_dict[p] = (page_dict.get(p) or "") + ("\n\n" + txt)
            maxpage = max(page_dict.keys()) if page_dict else 0
            pages_text = [(p, page_dict.get(p, "")) for p in range(1, maxpage + 1)]

        page_texts_ordered = [t for _, t in pages_text]
        combined_text = "\n\n".join([f"--- PAGE {i+1} ---\n{page_texts_ordered[i]}" for i in range(len(page_texts_ordered))])

        structured_tables = []
        for t in tables:
            tbl = t.get("table")
            if not tbl:
                continue
            headers = [h.strip() if h else f"col_{i}" for i, h in enumerate(tbl[0])]
            rows = []
            for row in tbl[1:]:
                row_dict = {h: row[i] if i < len(row) else None for i, h in enumerate(headers)}
                rows.append(row_dict)
            structured_tables.append({"page": t.get("page"), "rows": rows})

        partial_results = []
        if combined_text.strip():
            if len(combined_text) <= chunk_char:
                partial = self._analyze_chunk_to_json(combined_text, structured_tables)
                if partial:
                    partial_results.append(partial)
            else:
                pages_list = combined_text.split("\n\n--- PAGE ")
                pages_list = [pages_list[0]] + [("--- PAGE " + p) for p in pages_list[1:]]
                cur_text = ""
                cur_tables = []
                for page_block in pages_list:
                    addition = ("\n\n" if cur_text else "") + page_block
                    m = re.match(r"--- PAGE (\d+) ---", page_block)
                    pnum = int(m.group(1)) if m else None
                    page_tables_for_block = [st for st in structured_tables if st.get("page") == pnum] if pnum else []
                    if cur_text and (len(cur_text) + len(addition) > chunk_char):
                        partial = self._analyze_chunk_to_json(cur_text, cur_tables)
                        if partial:
                            partial_results.append(partial)
                        cur_text = page_block
                        cur_tables = page_tables_for_block.copy()
                    else:
                        cur_text += addition
                        cur_tables.extend(page_tables_for_block)
                if cur_text:
                    partial = self._analyze_chunk_to_json(cur_text, cur_tables)
                    if partial:
                        partial_results.append(partial)

        final_main_json = merge_partial_results(partial_results) if partial_results else {}
        final_main_json.setdefault("raw_text_pages", [{"page": i + 1, "text": page_texts_ordered[i]} for i in range(len(page_texts_ordered))])
        final_main_json.setdefault("raw_tables", structured_tables)
        final_main_json.setdefault("links", links)

        main_out_path = os.path.join(parent, "main_analysis.json")
        with open(main_out_path, "w", encoding="utf-8") as f:
            json.dump(final_main_json, f, indent=2, ensure_ascii=False)
        print("Saved main JSON:", main_out_path)

        doc_count = 0
        for item in links:
            url = item.get("url")
            if not url:
                continue
            doc_count += 1
            local = self._download_attachment(url)
            out_path = os.path.join(parent, f"doc{doc_count}.json")
            if local:
                simple = self._simple_extract_file(local)
                simple["source_url"] = url
                with open(out_path, "w", encoding="utf-8") as f:
                    json.dump(simple, f, indent=2, ensure_ascii=False)
                print("Saved sub-doc JSON:", out_path)
                try:
                    if os.path.exists(local) and not str(local).endswith("embedded_"):
                        os.remove(local)
                except Exception:
                    pass
            else:
                with open(out_path, "w", encoding="utf-8") as f:
                    json.dump({"analysis": "download_failed", "url": url}, f, indent=2)
                print("Download failed:", url)

        return final_main_json