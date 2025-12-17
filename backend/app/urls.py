from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

# from .views import ReadedCompanyDocumentsViewSet

from app.views import (
    RegisterAPIView,
    MeAPIView,        # class-based
    SubscriptionViewSet,
    DocumentViewSet,
    CompanyViewSet,
    home,
    profile_view,
    MeView,          # APIView (extra)
    me,
    # ExtractedTextDocumentViewSet
    
                              # function-based (if needed)
)

# Router for viewsets
router = DefaultRouter()
router.register(r"subscriptions", SubscriptionViewSet, basename="subscription")
router.register(r"documents", DocumentViewSet, basename="document")
router.register(r"companies", CompanyViewSet, basename="company")
# router.register(r"readed-docs", ReadedCompanyDocumentsViewSet, basename="readed-docs")

# router.register(r"extracted-docs", ExtractedTextDocumentViewSet, basename="extracted-docs")
    
urlpatterns = [
    # 🔑 Auth
    path("auth/register/", RegisterAPIView.as_view(), name="register"),
    path("auth/login/", MeAPIView.as_view(), name="login"), 
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # 🔑 Profile & Me
    path("auth/me/", MeView.as_view(), name="auth_me"),    
    path("profile/", profile_view, name="profile"),
    path("me/", me, name="me_summary"),                      

    # 🔑 Router endpoints
    path("", include(router.urls)),

    # 🔑 Home
    path("home/", home, name="home"),
]
