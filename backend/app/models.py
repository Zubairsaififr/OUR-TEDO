from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta

# ----------------------------
# User Model
# ----------------------------
ROLE_CHOICES = (("user", "User"), ("admin", "Admin"))


class User(AbstractUser):
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="user")
    is_approved = models.BooleanField(default=False)
    is_subscribed = models.BooleanField(default=False)

    def __str__(self):
        return self.username

    @property
    def has_active_subscription(self):
        return self.subscriptions.filter(
            status="active", end_date__gte=timezone.now()
        ).exists()

    @property
    def can_add_company(self):
        if not self.is_approved or not self.has_active_subscription:
            return False
        return self.companies.count() < 1


# ----------------------------
# Subscription Model
# ----------------------------
class Subscription(models.Model):
    PLAN_CHOICES = (("free", "Free"), ("pro", "Pro"), ("premium", "Premium"))
    STATUS = (
        ("active", "Active"),
        ("expired", "Expired"),
        ("cancelled", "Cancelled"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="subscriptions")
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default="free")
    status = models.CharField(max_length=20, choices=STATUS, default="active")
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField(blank=True, null=True)

    razorpay_order_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=255, blank=True, null=True)

    def activate_for_days(self, days=30):
        self.start_date = timezone.now()
        self.end_date = self.start_date + timedelta(days=days)
        self.status = "active"
        self.save()

    def is_active(self):
        return self.status == "active" and (
            self.end_date is None or self.end_date >= timezone.now()
        )

    def __str__(self):
        return f"{self.user.username} - {self.plan} ({self.status})"


# ----------------------------
# Document Model
# ----------------------------
class Document(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="documents")
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to="documents/")
    created_at = models.DateTimeField(auto_now_add=True)

    result_text = models.TextField(blank=True, null=True)
    result_file = models.FileField(upload_to="results/", blank=True, null=True)

    def __str__(self):
        return f"{self.title} - {self.user.username}"


# ----------------------------
# Company Model
# ----------------------------
COMPANY_TYPE_CHOICES = [
    ("PVT_LTD", "Pvt. Ltd."),
    ("LLP", "LLP"),
    ("PARTNERSHIP", "Partnership"),
    ("PROPRIETORSHIP", "Proprietorship"),
    ("ENTERPRISES", "Enterprises"),
    ("OTHER", "Other"),
]

MAJOR_ACTIVITY_CHOICES = [
    ("MANUFACTURE", "Manufacture"),
    ("SERVICES", "Services"),
    ("TRADER", "Trader"),
    ("RESELLER", "Reseller"),
    ("OTHER", "Other"),
]

ENTERPRISE_CHOICES = [
    ("MICRO", "Micro"),
    ("SMALL", "Small"),
    ("MEDIUM", "Medium"),
]

# ----------------------------
# Company Model (UPDATED with ALL REQUIRED DOCS)
# ----------------------------

class Company(models.Model):
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="companies", null=True, blank=True
    )
    company_name = models.CharField(max_length=255)
    company_type = models.CharField(max_length=30, choices=COMPANY_TYPE_CHOICES)
    major_activity = models.CharField(max_length=30, choices=MAJOR_ACTIVITY_CHOICES)
    nature_of_business = models.JSONField(default=dict, blank=True)

    company_address = models.TextField()
    gstin_no = models.CharField(max_length=15, blank=True, null=True)
    gst_certificate = models.FileField(upload_to="company_docs/gst/", blank=True, null=True)
    msme_no = models.CharField(max_length=50, blank=True, null=True)
    msme_certificate = models.FileField(upload_to="company_docs/msme/", blank=True, null=True)
    enterprise_type = models.CharField(max_length=10, choices=ENTERPRISE_CHOICES, blank=True, null=True)
    
    designation = models.CharField(max_length=100, blank=True, null=True)
    years_of_experience = models.CharField(max_length=50, blank=True, null=True)
    annual_turnover = models.CharField(max_length=50, blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)


    # Bank Details
    account_number = models.CharField(max_length=50, null=True, blank=True)
    ifsc_code = models.CharField(max_length=20, null=True, blank=True)
    account_holder_name = models.CharField(max_length=255, null=True, blank=True)
    bank_name = models.CharField(max_length=100, null=True, blank=True)
    bank_phone = models.CharField(max_length=20, blank=True, null=True)
    cancel_cheque = models.FileField(upload_to="company_docs/cheques/", blank=True, null=True)

    # ===============================
    # STEP 5: REQUIRED COMPANY DOCUMENTS
    # ===============================

    pan_card = models.FileField(upload_to="company_docs/pan/", blank=True, null=True)
    incorporation_certificate = models.FileField(upload_to="company_docs/incorp/", blank=True, null=True)
    eft_mandate = models.FileField(upload_to="company_docs/eft/", blank=True, null=True)
    oem_turnover_certificate = models.FileField(upload_to="company_docs/turnover/oem/", blank=True, null=True)
    bidder_turnover_certificate = models.FileField(upload_to="company_docs/turnover/bidder/", blank=True, null=True)
    networth_certificate = models.FileField(upload_to="company_docs/networth/", blank=True, null=True)
    audited_balance_sheet = models.FileField(upload_to="company_docs/balance_sheet/", blank=True, null=True)
    purchase_document = models.FileField(upload_to="company_docs/purchase/", blank=True, null=True)
    undertaking_blacklisting = models.FileField(upload_to="company_docs/undertaking/", blank=True, null=True)
    quality_certificate = models.FileField(upload_to="company_docs/quality/", blank=True, null=True)
    epf_registration = models.FileField(upload_to="company_docs/epf/", blank=True, null=True)
    esic_registration = models.FileField(upload_to="company_docs/esic/", blank=True, null=True)
    factory_license = models.FileField(upload_to="company_docs/factory/", blank=True, null=True)
    product_catalog = models.FileField(upload_to="company_docs/catalog/", blank=True, null=True)

    # ===============================
    # Timestamps
    # ===============================
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # ===============================
    # Save Override (Subscription + Approval Check)
    # ===============================
    def save(self, *args, **kwargs):
        if self.created_by and self.created_by.email == "ovinenterprises.login@gmail.com":
            super().save(*args, **kwargs)
            return

        if self.created_by and not self.created_by.can_add_company:
            raise ValueError("You cannot add a company without approval or an active subscription.")

        super().save(*args, **kwargs)

    def __str__(self):
        return self.company_name


# ----------------------------
# Related Models
# ----------------------------
class CompanyDirector(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="directors")
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)


class CompanyOwner(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="owners")
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)


class CompanyMember(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="members")
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)


class CompanyPartner(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="partners")
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)


# ----------------------------
# ✅ NEW: Required Documents Model
# ----------------------------
REQUIRED_DOC_TYPES = [
    ("PAN", "PAN Card"),
    ("INC_CERT", "Incorporation Certificate"),
    ("AADHAAR", "Aadhaar Card"),
    ("UDYAM", "Udyam Certificate"),
    ("GST_CERT", "GST Certificate"),
    ("BANK_PROOF", "Bank Proof"),
    ("OTHER", "Other"),
]


class RequiredDocument(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="required_docs")
    document_type = models.CharField(max_length=50, choices=REQUIRED_DOC_TYPES)
    document_name = models.CharField(max_length=255)
    file = models.FileField(upload_to="company_docs/required/", blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.company.company_name} - {self.document_name}"
    




# from django.db import models
# from django.conf import settings
# from django.utils import timezone


# class ReadedCompanyDocuments(models.Model):
#     STATUS_CHOICES = [
#         ("pending", "Pending"),
#         ("processing", "Processing"),
#         ("done", "Done"),
#         ("error", "Error"),
#     ]

#     created_by = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE,
#         related_name="read_documents",
#         null=True,
#         blank=True,
#     )
#     company = models.ForeignKey(
#         "Company",
#         on_delete=models.CASCADE,
#         related_name="read_documents",
#         null=True,
#         blank=True,
#     )

#     original_file = models.FileField(upload_to="read_docs/originals/")
#     filename = models.CharField(max_length=512, blank=True)
#     content_type = models.CharField(max_length=128, blank=True)

#     # AI extracted results
#     extracted_text_raw = models.TextField(blank=True, null=True)
#     extracted_text_clean = models.TextField(blank=True, null=True)

#     # Process tracking
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
#     error_message = models.TextField(blank=True, null=True)

#     # Meta info
#     model_used = models.CharField(max_length=256, blank=True, null=True)
#     processed_at = models.DateTimeField(blank=True, null=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     # === Helper Methods ===
#     def mark_processing(self):
#         self.status = "processing"
#         self.error_message = ""
#         self.save(update_fields=["status", "error_message", "updated_at"])

#     def mark_done(self, raw_text="", clean_text="", model_name=None):
#         self.status = "done"
#         self.extracted_text_raw = raw_text
#         self.extracted_text_clean = clean_text
#         self.model_used = model_name
#         self.processed_at = timezone.now()
#         self.save()

#     def mark_error(self, error_msg):
#         self.status = "error"
#         self.error_message = error_msg
#         self.save(update_fields=["status", "error_message", "updated_at"])

#     def __str__(self):
#         return f"{self.company.company_name if self.company else 'No Company'} - {self.filename or self.original_file.name} ({self.status})"






# from django.db import models
# from app.models import Company

# class ExtractedTextDocument(models.Model):
#     company = models.ForeignKey(Company, on_delete=models.CASCADE, null=True, blank=True)
#     original_file = models.FileField(upload_to="extracted_docs/")
#     extracted_text = models.TextField(blank=True)
#     status = models.CharField(max_length=20, default="pending")   # pending, done, error
#     error_message = models.TextField(blank=True)
    
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"Extracted Document #{self.id}"
