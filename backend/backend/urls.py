from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from app.views import CustomTokenObtainPairView, change_password, me # ReadedCompanyDocumentsViewSet
from rest_framework_simplejwt.views import TokenRefreshView
# Correct way (most reliable)
from tender_analyzer.views import AnalyzePDFView,UploadBidPDFView

urlpatterns = [
    path("", RedirectView.as_view(url="/api/")),  
    path("admin/", admin.site.urls),
    path('', include('tender_analyzer.urls')),

    # 🔐 Auth
    path("api/auth/login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
   
    path("api/auth/change-password/", change_password, name="change_password"),
    path("api/auth/me/", me, name="me"),  # ✅ fix: ab ye bhi api/auth ke andar
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/analyze-pdf/", AnalyzePDFView.as_view(), name="analyze-pdf"),
    # backend/backend/urls.py या tender_analyzer/urls.py
    path('api/upload-bid-pdf/', UploadBidPDFView.as_view(), name='upload-bid-pdf'),


    # urls.py
    # path("readed-docs/process/", ReadedCompanyDocumentsViewSet.as_view({"post": "process_company"})),


    # 🌐 App routes
    path("api/", include("app.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
