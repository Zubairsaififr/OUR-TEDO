from django.contrib import admin
from django.utils import timezone
from datetime import timedelta
from .models import User, Subscription, Document

@admin.action(description="Approve selected users & activate subscription")
def approve_and_subscribe(modeladmin, request, queryset):
    for user in queryset:
        # ✅ Approve the user
        if not user.is_approved:
            user.is_approved = True
            user.save(update_fields=["is_approved"])

        # ✅ subscription update/create
        Subscription.objects.update_or_create(
            user=user,
            defaults={
                "plan": "free",
                "status": "active",   # 👈 ensure active
                "start_date": timezone.now(),
                "end_date": timezone.now() + timedelta(days=30),
            },
        )

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        "id", "username", "email", "role",
        "is_approved", "subscription_status",
        "is_staff", "is_superuser"
    )
    search_fields = ("username", "email")
    list_filter = ("role", "is_approved", "is_staff")
    list_editable = ("is_approved",)
    actions = [approve_and_subscribe]

    def subscription_status(self, obj):
        return obj.has_active_subscription   # ✅ model property
    subscription_status.boolean = True
    subscription_status.short_description = "Subscribed?"

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "plan", "status", "start_date", "end_date")
    list_filter = ("plan", "status")

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "title", "created_at")
    search_fields = ("title", "user__username")




from django.contrib import admin
from django.utils import timezone
from datetime import timedelta
from .models import (
    User, Subscription, Document,
    Company, 
)


# # ---------- Admin Actions ----------
# @admin.action(description="✅ Approve selected users & activate free subscription")
# def approve_and_subscribe(modeladmin, request, queryset):
#     """
#     Admin shortcut: approves users + assigns free 30-day subscription.
#     """
#     for user in queryset:
#         if not user.is_approved:
#             user.is_approved = True
#             user.save(update_fields=["is_approved"])

#         Subscription.objects.update_or_create(
#             user=user,
#             defaults={
#                 "plan": "free",
#                 "status": "active",
#                 "start_date": timezone.now(),
#                 "end_date": timezone.now() + timedelta(days=30),
#             },
#         )


@admin.action(description="♻️ Reprocess selected documents with AI Agent")
def reprocess_selected_docs(modeladmin, request, queryset):
    """
    Marks documents for reprocessing (manual trigger from admin).
    Background worker or management command can pick these.
    """
    queryset.update(status="pending", error_message="", processed_at=None)
    modeladmin.message_user(request, f"{queryset.count()} document(s) marked for reprocessing.")



# # ---------- ReadedCompanyDocuments Admin ----------
# @admin.register(ReadedCompanyDocuments)
# class ReadedCompanyDocumentsAdmin(admin.ModelAdmin):
#     list_display = (
#         "id", "company", "filename", "status",
#         "model_used", "processed_at", "created_by"
#     )
#     search_fields = ("filename", "company__name", "created_by__username")
#     list_filter = ("status", "model_used", "processed_at")
#     readonly_fields = (
#         "created_by", "extracted_text_raw", "extracted_text_clean",
#         "error_message", "processed_at", "created_at", "updated_at"
#     )
#     actions = [reprocess_selected_docs]
#     ordering = ("-created_at",)
#     list_per_page = 25











from django.contrib import admin
# from .models import ExtractedTextDocument
from .utils.extract_text_util import extract_text_from_pdf

@admin.action(description="Convert PDF → Text")
def convert_pdf_text(modeladmin, request, queryset):
    for doc in queryset:
        try:
            text = extract_text_from_pdf(doc.original_file)

            if not text:
                doc.status = "error"
                doc.error_message = "Cannot extract text"
            else:
                doc.extracted_text = text
                doc.status = "done"

            doc.save()
        except Exception as e:
            doc.status = "error"
            doc.error_message = str(e)
            doc.save()

# @admin.register(ExtractedTextDocument)
# class ExtractedTextDocumentAdmin(admin.ModelAdmin):
#     list_display = ("id", "company", "status", "created_at")
#     actions = [convert_pdf_text]
