# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import AllowAny
# from django.conf import settings
# import os
# from .analyzer import TenderBidAnalyzer

# class ExtractDocumentsiView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         if 'file' not in request.FILES:
#             return Response({"error": "No file uploaded"}, status=400)

#         uploaded_file = request.FILES['file']
#         temp_dir = os.path.join(settings.MEDIA_ROOT, "temp")
#         os.makedirs(temp_dir, exist_ok=True)

#         temp_path = os.path.join(temp_dir, uploaded_file.name)
#         with open(temp_path, "wb+") as f:
#             for chunk in uploaded_file.chunks():
#                 f.write(chunk)

#         analyzer = TenderBidAnalyzer()
#         urls = analyzer.extract_links_from_pdf(temp_path)

#         os.remove(temp_path)

#         return Response({"documents": urls}, status=200)







# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import AllowAny
# from django.conf import settings
# import os
# import requests
# from .analyzer import TenderBidAnalyzer


# class ExtractDocumentsiView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         if 'file' not in request.FILES:
#             return Response({"error": "No file uploaded"}, status=400)

#         uploaded_file = request.FILES['file']
#         temp_dir = os.path.join(settings.MEDIA_ROOT, "temp")
#         os.makedirs(temp_dir, exist_ok=True)

#         temp_path = os.path.join(temp_dir, uploaded_file.name)
#         with open(temp_path, "wb+") as f:
#             for chunk in uploaded_file.chunks():
#                 f.write(chunk)

#         analyzer = TenderBidAnalyzer()
#         urls = analyzer.extract_links_from_pdf(temp_path)

#         # REMOVE temp file
#         os.remove(temp_path)

#         # ============================
#         #   AUTO-DOWNLOAD SUB DOCS
#         # ============================
#         subdoc_dir = os.path.join(settings.MEDIA_ROOT, "subdocs")
#         os.makedirs(subdoc_dir, exist_ok=True)

#         saved_files = []

#         for url in urls:
#             try:
#                 file_name = url.split("/")[-1]

#                 # Some URLs don't have filename
#                 if not file_name or "." not in file_name:
#                     file_name = "subdoc_" + str(len(saved_files) + 1) + ".pdf"

#                 file_path = os.path.join(subdoc_dir, file_name)

#                 r = requests.get(url, timeout=15)

#                 if r.status_code == 200:
#                     with open(file_path, "wb") as f:
#                         f.write(r.content)

#                     saved_files.append({
#                         "url": url,
#                         "saved_as": f"/media/subdocs/{file_name}"
#                     })
#             except Exception as e:
#                 print("SUBDOC DOWNLOAD FAILED:", e)

#         return Response({
#             "documents": urls,
#             "downloaded_subdocs": saved_files
#         }, status=200)








import os
import uuid
import requests
from django.conf import settings
from django.utils.timezone import now
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .analyzer import TenderBidAnalyzer

# tender_analyzer/views_extract.py

class ExtractDocumentsView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        if 'file' not in request.FILES:
            return Response({"error": "No file uploaded"}, status=400)

        uploaded_file = request.FILES['file']
        temp_dir = os.path.join(settings.MEDIA_ROOT, "temp")
        os.makedirs(temp_dir, exist_ok=True)
        temp_path = os.path.join(temp_dir, uploaded_file.name)

        with open(temp_path, "wb+") as f:
            for chunk in uploaded_file.chunks():
                f.write(chunk)

        print(f"Temp file saved: {temp_path}")

        try:
            analyzer = TenderBidAnalyzer()
            urls = analyzer.extract_links_from_pdf(temp_path)
            print(f"AI returned: {urls}")
        except Exception as e:
            os.remove(temp_path)
            return Response({"error": f"AI Error: {e}"}, status=500)

        if not urls:
            urls = []

        if os.path.exists(temp_path):
            os.remove(temp_path)

        subdoc_dir = os.path.join(settings.MEDIA_ROOT, "subdocs")
        os.makedirs(subdoc_dir, exist_ok=True)
        # YE PURA LOOP REPLACE KAR DE (sirf ye part)

        saved_files = []
        seen_names = set()

        for item in urls:
            try:
                # AB YE CHECK KAR RAHE HAIN KI STRING HAI YA DICT
                if isinstance(item, dict):
                    url = item.get('url') or item.get('link') or item.get('href', '')
                    raw_name = item.get('rawName') or item.get('name') or ''
                else:
                    url = str(item)
                    raw_name = ''

                if not url or not url.startswith('http'):
                    print(f"Skipped invalid URL: {url}")
                    continue

                print(f"Downloading: {url}")

                # Filename banane ka logic
                if raw_name and '.' in raw_name:
                    original_name = raw_name
                else:
                    # URL se filename nikal lo
                    original_name = url.split("/")[-1].split("?")[0]
                    if not original_name or '.' not in original_name:
                        original_name = f"document_{len(saved_files)+1}.pdf"

                name, ext = os.path.splitext(original_name)
                if ext.lower() not in ['.pdf', '.doc', '.docx', '.xls', '.xlsx']:
                    ext = '.pdf'

                # Unique filename
                counter = 1
                base_name = name
                while f"{name}{ext}" in seen_names:
                    name = f"{base_name}_{counter}"
                    counter += 1
                seen_names.add(f"{name}{ext}")

                unique_filename = f"{uuid.uuid4().hex[:10]}_{name}{ext}"
                file_path = os.path.join(subdoc_dir, unique_filename)

                # Download with headers
                headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
                response = requests.get(url, headers=headers, timeout=20, stream=True)

                if response.status_code == 200:
                    with open(file_path, "wb") as f:
                        for chunk in response.iter_content(1024 * 1024):
                            f.write(chunk)

                    media_url = f"/media/subdocs/{unique_filename}"
                    saved_files.append({
                        "original_url": url,
                        "filename": f"{name}{ext}",
                        "saved_as": media_url
                    })
                    print(f"SAVED: {media_url}")
                else:
                    print(f"Failed {url} → Status: {response.status_code}")

            except Exception as e:
                print(f"Download failed {url}: {e}")
                continue  # Ek fail hua to baki try karega

        return Response({
            "message": "Extraction completed",
            "total_extracted": len(urls),
            "successfully_saved": len(saved_files),
            "documents": urls,
            "downloaded_subdocs": saved_files
        }, status=200)
        











