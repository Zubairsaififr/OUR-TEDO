from django.http import HttpResponse
from django.utils import timezone
from django.contrib.auth import get_user_model

from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    RegisterSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
    SubscriptionSerializer,
    DocumentSerializer,
    CompanySerializer,
)
from .models import Subscription, Document, Company
from .permissions import IsAdmin, IsSubscribed


User = get_user_model()


# -------- Home --------
def home(request):
    return HttpResponse("Welcome to TEDO Maker Backend API 🚀")


# -------- Auth --------
class RegisterAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class MeAPIView(generics.RetrieveAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


# -------- Password Change --------
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    """
    Allow authenticated users to change their password.
    """
    user = request.user
    current_password = request.data.get("current_password")
    new_password = request.data.get("new_password")

    if not current_password or not new_password:
        return Response({"error": "Both current and new password are required."},
                        status=status.HTTP_400_BAD_REQUEST)

    if not user.check_password(current_password):
        return Response({"error": "Current password is incorrect."},
                        status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()

    return Response({"success": "Password changed successfully."},
                    status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def me(request):
    """Extra endpoint for frontend subscription/company info"""
    user = request.user
    return Response({
        "username": user.username,
        "email": user.email,
        "is_subscribed": user.is_subscribed,
        "has_active_subscription": user.has_active_subscription,
    })


class MeAPIView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def profile_view(request):
    """Basic user profile"""
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_approved": user.is_approved,
        "is_subscribed": user.is_subscribed,
        "has_active_subscription": user.has_active_subscription,
    })


# -------- Subscriptions --------
class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return Subscription.objects.all()
        return Subscription.objects.filter(user=user)

    def perform_create(self, serializer):
        # ✅ Subscription sirf pending state me create hoga
        sub = serializer.save(user=self.request.user, status="pending")
        # ❌ Yaha user.is_subscribed update mat karo

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def approve(self, request, pk=None):
        sub = self.get_object()
        sub.activate_for_days(30)
        sub.status = "active"
        sub.user.is_subscribed = True
        sub.user.save()
        sub.save()
        return Response({"detail": "Subscription approved & activated."})

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def reject(self, request, pk=None):
        sub = self.get_object()
        sub.status = "cancelled"
        sub.user.is_subscribed = False
        sub.user.save()
        sub.save()
        return Response({"detail": "Subscription rejected/cancelled."})


# -------- Documents  --------
class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer

    def get_permissions(self):
        if self.action in ["create", "list", "retrieve", "process"]:
            return [permissions.IsAuthenticated(), IsSubscribed()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return Document.objects.all()
        return Document.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def process(self, request, pk=None):
        """Stub AI document processor"""
        doc = self.get_object()
        prompt = request.data.get("prompt", "")
        doc.result_text = f"AI response for '{doc.title}' with prompt: {prompt}"
        doc.save()
        return Response({"detail": "Processed", "result_text": doc.result_text}, status=status.HTTP_200_OK)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "has_active_subscription": user.has_active_subscription,  # 👈 property from model
        }
        return Response(data)










# import json
# from rest_framework import viewsets, permissions
# from rest_framework.exceptions import PermissionDenied
# from .models import Company, RequiredDocument
# from .serializers import CompanySerializer
# from rest_framework.exceptions import ValidationError




# class CompanyViewSet(viewsets.ModelViewSet):
#     queryset = Company.objects.all()
#     serializer_class = CompanySerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def get_queryset(self):
#         user = self.request.user
#         if user.is_staff:
#             return Company.objects.all()
#         return Company.objects.filter(created_by=user)

#     def perform_create(self, serializer):
#         user = self.request.user
#         print("Logged in user email:", user.email)

#         # SPECIAL USER (Bypass all checks)
#         if user.email.lower().strip() == "ovinenterprises.login@gmail.com":
#             company = serializer.save(created_by=user)
#             return company

#         # Approval + Subscription + Limit Check
#         if not user.is_approved:
#             raise PermissionDenied("Your account is not approved by admin yet.")
#         if not user.has_active_subscription:
#             raise PermissionDenied("Your subscription is not active.")
#         if user.companies.count() >= 1:
#             raise PermissionDenied("You can only register one company.")

#         # Save with user
#         company = serializer.save(created_by=user)
#         return company

#     def create(self, request, *args, **kwargs):
#         try:
#             serializer = self.get_serializer(data=request.data)
#             serializer.is_valid(raise_exception=True)
#             self.perform_create(serializer)
#             headers = self.get_success_headers(serializer.data)
#             return Response(
#                 {"success": True, "message": "Company created successfully", "data": serializer.data},
#                 status=status.HTTP_201_CREATED,
#                 headers=headers,
#             )
#         except PermissionDenied as e:
#             return Response({"success": False, "error": str(e)}, status=status.HTTP_403_FORBIDDEN)
#         except ValidationError as e:
#             return Response({"success": False, "error": e.detail}, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             import traceback
#             print("Exception:", str(e))
#             print(traceback.format_exc())
#             return Response({"success": False, "error": str(e)}, status=status.HTTP_400_BAD_REQUEST)









from django.http import HttpResponse
from django.utils import timezone
from django.contrib.auth import get_user_model

from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    RegisterSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
    SubscriptionSerializer,
    DocumentSerializer,
    CompanySerializer,
)
from .models import Subscription, Document, Company
from .permissions import IsAdmin, IsSubscribed


User = get_user_model()


# -------- Home --------
def home(request):
    return HttpResponse("Welcome to TEDO Maker Backend API 🚀")


# -------- Auth --------
class RegisterAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class MeAPIView(generics.RetrieveAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


# -------- Password Change --------
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    """
    Allow authenticated users to change their password.
    """
    user = request.user
    current_password = request.data.get("current_password")
    new_password = request.data.get("new_password")

    if not current_password or not new_password:
        return Response({"error": "Both current and new password are required."},
                        status=status.HTTP_400_BAD_REQUEST)

    if not user.check_password(current_password):
        return Response({"error": "Current password is incorrect."},
                        status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()

    return Response({"success": "Password changed successfully."},
                    status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def me(request):
    """Extra endpoint for frontend subscription/company info"""
    user = request.user
    return Response({
        "username": user.username,
        "email": user.email,
        "is_subscribed": user.is_subscribed,
        "has_active_subscription": user.has_active_subscription,
    })


class MeAPIView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def profile_view(request):
    """Basic user profile"""
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_approved": user.is_approved,
        "is_subscribed": user.is_subscribed,
        "has_active_subscription": user.has_active_subscription,
    })


# -------- Subscriptions --------
class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return Subscription.objects.all()
        return Subscription.objects.filter(user=user)

    def perform_create(self, serializer):
        # ✅ Subscription sirf pending state me create hoga
        sub = serializer.save(user=self.request.user, status="pending")
        # ❌ Yaha user.is_subscribed update mat karo

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def approve(self, request, pk=None):
        sub = self.get_object()
        sub.activate_for_days(30)
        sub.status = "active"
        sub.user.is_subscribed = True
        sub.user.save()
        sub.save()
        return Response({"detail": "Subscription approved & activated."})

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def reject(self, request, pk=None):
        sub = self.get_object()
        sub.status = "cancelled"
        sub.user.is_subscribed = False
        sub.user.save()
        sub.save()
        return Response({"detail": "Subscription rejected/cancelled."})


# -------- Documents  --------
class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer

    def get_permissions(self):
        if self.action in ["create", "list", "retrieve", "process"]:
            return [permissions.IsAuthenticated(), IsSubscribed()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return Document.objects.all()
        return Document.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def process(self, request, pk=None):
        """Stub AI document processor"""
        doc = self.get_object()
        prompt = request.data.get("prompt", "")
        doc.result_text = f"AI response for '{doc.title}' with prompt: {prompt}"
        doc.save()
        return Response({"detail": "Processed", "result_text": doc.result_text}, status=status.HTTP_200_OK)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "has_active_subscription": user.has_active_subscription,  # 👈 property from model
        }
        return Response(data)
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    

import json
import os
from django.utils import timezone
from django.conf import settings
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from .models import Company, RequiredDocument
from .serializers import CompanySerializer


class CompanyViewSet(viewsets.ModelViewSet):
    
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Company.objects.all()
        return Company.objects.filter(created_by=user)

    def perform_create(self, serializer):
        user = self.request.user
        print("Logged in user email:", user.email)

        # SPECIAL USER (Bypass all checks)
        if user.email.lower().strip() == "ovinenterprises.login@gmail.com":
            company = serializer.save(created_by=user)
            self._generate_company_json(company)  # JSON file banao
            return company

        # Approval + Subscription + Limit Check
        if not user.is_approved:
            raise PermissionDenied("Your account is not approved by admin yet.")
        if not user.has_active_subscription:
            raise PermissionDenied("Your subscription is not active.")
        if user.companies.count() >= 1:
            raise PermissionDenied("You can only register one company.")

        # Save with user
        company = serializer.save(created_by=user)
        self._generate_company_json(company)  # JSON file banao
        return company

    def _generate_company_json(self, company):
        """
        Company object se saara data collect karke JSON file banata hai
        company_name ke basis pe file name banega
        """
        # Serializer se clean data le lo (validated data)
        serializer = CompanySerializer(company)
        data = serializer.data

        # Extra clean kar lo for JSON (None ko empty string bana do optional)
        def clean_value(val):
            if val is None:
                return ""
            return val

        clean_data = {}
        for key, value in data.items():
            clean_data[key] = clean_value(value)

        # Documents ke actual file names daal do (agar uploaded hain)
        # Note: Company model mein FileField honge, unka .name ya .url use kar sakte hain
        documents = {}
        file_fields = [
            "gst_certificate", "msme_certificate", "cancel_cheque",
            "pan_card", "incorporation_certificate", "eft_mandate",
            "oem_turnover_certificate", "bidder_turnover_certificate",
            "networth_certificate", "audited_balance_sheet", "purchase_document",
            "undertaking_blacklisting", "quality_certificate",
            "epf_registration", "esic_registration", "factory_license", "product_catalog"
        ]

        for field in file_fields:
            file_obj = getattr(company, field)
            if file_obj:
                documents[field] = {
                    "filename": os.path.basename(file_obj.name),
                    "path": file_obj.name, 
                   
                }
            else:
                documents[field] = None

        # Final JSON structure
        final_json = {
            "company_id": company.id,
            "created_by": company.created_by.email if company.created_by else "",
            "created_at": company.created_at.isoformat() if company.created_at else "",
            "company_details": clean_data,
            "documents": documents
        }

        # Safe filename banao
        company_name = company.company_name or "unknown_company"
        safe_name = "".join(c if c.isalnum() or c in " _-" else "_" for c in company_name)
        safe_name = safe_name.strip().replace(" ", "_")
        timestamp = timezone.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{safe_name}_{timestamp}.json"
        
        # Folder path
        json_dir = os.path.join(settings.MEDIA_ROOT, "company_jsons")
        os.makedirs(json_dir, exist_ok=True)
        filepath = os.path.join(json_dir, filename)

        # JSON file write karo
        try:
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(final_json, f, indent=4, ensure_ascii=False)
            print(f"JSON file created: {filepath}")
        except Exception as e:
            print("JSON file create karne mein error:", str(e))

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(
                {
                    "success": True,
                    "message": "Company created successfully. JSON backup file generated!",
                    "data": serializer.data
                },
                status=status.HTTP_201_CREATED,
                headers=headers,
            )
        except PermissionDenied as e:
            return Response({"success": False, "error": str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValidationError as e:
            return Response({"success": False, "error": e.detail}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            print("Exception:", str(e))
            print(traceback.format_exc())
            return Response({"success": False, "error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    def update(self, request, *args, **kwargs):
        """
        Override update to handle:
        1. Normal company fields + fixed file fields (DRF handles automatically)
        2. Dynamic RequiredDocument file updates (custom logic needed)
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # Check permission (same as get_queryset logic)
        if not request.user.is_staff and instance.created_by != request.user:
            raise PermissionDenied("You can only edit your own company.")

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        # ========= CUSTOM LOGIC FOR DYNAMIC REQUIRED DOCUMENTS =========
        for key, file in request.FILES.items():
            if key.startswith("required_doc_"):
                try:
                    doc_id = int(key.split("_")[-1])  # required_doc_7 → 7
                    req_doc = RequiredDocument.objects.get(id=doc_id, company=instance)
                    
                    # Old file ko delete karne ka option (optional, Django automatically handles overwrite)
                    if req_doc.file:
                        req_doc.file.delete(save=False)  # old file remove from storage
                    
                    req_doc.file = file
                    req_doc.uploaded_at = timezone.now()
                    req_doc.save()
                    
                    print(f"Updated RequiredDocument ID {doc_id} with new file: {file.name}")
                    
                except RequiredDocument.DoesNotExist:
                    print(f"Warning: RequiredDocument ID not found or not belongs to this company: {key}")
                except ValueError:
                    print(f"Invalid key format for required doc: {key}")

        # ========= SAVE THE MAIN COMPANY INSTANCE =========
        self.perform_update(serializer)

        # Optional: Update JSON backup after changes
        self._generate_company_json(instance)

        return Response({
            "success": True,
            "message": "Company updated successfully!",
            "data": CompanySerializer(instance).data
        })
    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)














# import datetime
# from rest_framework import viewsets, permissions, status
# from rest_framework.response import Response
# from rest_framework.parsers import MultiPartParser, FormParser
# from rest_framework.exceptions import ValidationError

# from .models import ReadedCompanyDocuments
# from .serializers import ReadedCompanyDocumentsSerializer
# from .utils.document_processing import extract_text_from_file, hf_clean_text_prompt, call_huggingface_inference

# class ReadedCompanyDocumentsViewSet(viewsets.ModelViewSet):
#     queryset = ReadedCompanyDocuments.objects.all().order_by("-created_at")
#     serializer_class = ReadedCompanyDocumentsSerializer
#     permission_classes = [permissions.IsAuthenticated]
#     parser_classes = [MultiPartParser, FormParser]

#     def get_queryset(self):
#         user = self.request.user
#         # Admin -> all, else only own
#         if user.is_staff:
#             return self.queryset
#         return self.queryset.filter(created_by=user)

#     def perform_create(self, serializer):
#         # Save initial record with file and status pending
#         user = self.request.user
#         instance = serializer.save(created_by=user, status="processing", filename=(serializer.validated_data.get("original_file").name if serializer.validated_data.get("original_file") else ""))

#         # Process file synchronously (dev). Best to move to Celery for production.
#         try:
#             file_obj = instance.original_file
#             raw_text = extract_text_from_file(file_obj, content_type=instance.content_type, filename=instance.filename)
#             instance.extracted_text_raw = raw_text or ""
#             instance.save()

#             # Use prompt to clean/convert raw_text
#             prompt = hf_clean_text_prompt(raw_text or "")
#             cleaned = call_huggingface_inference(prompt)
#             instance.extracted_text_clean = cleaned or ""
#             instance.model_used = getattr(__import__("django.conf").conf.settings, "HUGGINGFACE_MODEL", None)
#             instance.processed_at = datetime.datetime.now()
#             instance.status = "done"
#             instance.save()

#         except Exception as e:
#             instance.status = "error"
#             instance.error_message = str(e)
#             instance.save()
#             raise ValidationError({"detail": f"Processing failed: {str(e)}"})

#     def create(self, request, *args, **kwargs):
#         # Accept multipart form with 'original_file' and optional 'company' (id)
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         try:
#             self.perform_create(serializer)
#             headers = self.get_success_headers(serializer.data)
#             return Response({"success": True, "message": "File processed", "data": ReadedCompanyDocumentsSerializer(serializer.instance).data}, status=status.HTTP_201_CREATED, headers=headers)
#         except ValidationError as e:
#             return Response({"success": False, "error": e.detail}, status=status.HTTP_400_BAD_REQUEST)
#         except Exception as e:
#             return Response({"success": False, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)











# from rest_framework import viewsets, permissions, status
# from rest_framework.response import Response
# from rest_framework.parsers import MultiPartParser, FormParser
# from .models import ExtractedTextDocument
# from .serializers import ExtractedTextDocumentSerializer

# from .utils.extract_text_util import extract_text_from_pdf

# class ExtractedTextDocumentViewSet(viewsets.ModelViewSet):
#     queryset = ExtractedTextDocument.objects.all().order_by("-created_at")
#     serializer_class = ExtractedTextDocumentSerializer
#     permission_classes = [permissions.IsAuthenticated]
#     parser_classes = [MultiPartParser, FormParser]

#     def perform_create(self, serializer):
#         instance = serializer.save(status="processing")

#         file_obj = instance.original_file

#         try:
#             text = extract_text_from_pdf(file_obj)

#             if not text:
#                 instance.status = "error"
#                 instance.error_message = "Failed to extract text from PDF"
#             else:
#                 instance.extracted_text = text
#                 instance.status = "done"

#         except Exception as e:
#             instance.status = "error"
#             instance.error_message = str(e)

#         instance.save()

#     def create(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
        
#         self.perform_create(serializer)

#         return Response(
#             {"success": True, "message": "PDF processed", "data": serializer.data},
#             status=status.HTTP_201_CREATED
#         )
