from django.urls import path
                       
# from .views import analyze_pdf
from tender_analyzer.views_extract import ExtractDocumentsView
from .views import (
    AutoDocGenerateAPI,list_prepared_documents
     
)

urlpatterns = [
    # path("analyze-pdf/", analyze_pdf),
    path("api/extract-documents/", ExtractDocumentsView.as_view()),
    path("api/generate-docs/", AutoDocGenerateAPI.as_view(), name="generate-docs"),
    path('my-documents/', list_prepared_documents),
    # optional direct download
   
  
   
]
