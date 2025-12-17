from rest_framework import serializers
from datetime import timezone
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from .models import Subscription, Document, Company, CompanyDirector, CompanyOwner, CompanyMember, CompanyPartner


User = get_user_model()


# --------- Auth ---------
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("username", "email", "password", "confirm_password")

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError("Passwords do not match.")
        return attrs
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
            is_approved=False,       # 👈 default admin approval pending
            is_subscribed=False 
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        if not self.user.is_approved:
            raise AuthenticationFailed("Your account is pending approval", code="authorization")

        return data


class UserSerializer(serializers.ModelSerializer):
    has_active_subscription = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "is_approved", "is_subscribed", "has_active_subscription")

    def get_has_active_subscription(self, obj):
        # ✅ check kare ki subscription active hai ya nahi
        return Subscription.objects.filter(
            user=obj,
            status="active",
            end_date__gte=timezone.now()
        ).exists()



# --------- Subscriptions ---------
class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = "__all__"
        read_only_fields = ("user", "start_date", "end_date")


# --------- Documents ---------
class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = "__all__"
        read_only_fields = ("uploaded_at",)  # ✅ match with model
        

# --------- Company + Related ---------
class DirectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyDirector
        fields = ("id", "name", "email", "phone")


class OwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyOwner
        fields = ("id", "name", "email", "phone")


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyMember
        fields = ("id", "name", "email", "phone")


class PartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyPartner
        fields = ("id", "name", "email", "phone")
class CompanySerializer(serializers.ModelSerializer):
    directors = DirectorSerializer(many=True, required=False)
    owners = OwnerSerializer(many=True, required=False)
    members = MemberSerializer(many=True, required=False)
    partners = PartnerSerializer(many=True, required=False)

    # ✅ Optional file fields (null allowed)
    gst = serializers.FileField(required=False, allow_null=True)
    udyam = serializers.FileField(required=False, allow_null=True)
    tan = serializers.FileField(required=False, allow_null=True)
    bank_statement = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = Company
        fields = "__all__"
        read_only_fields = ("created_by",)

    def validate(self, attrs):
        user = self.context["request"].user

        if not user.is_approved:
            raise serializers.ValidationError({"detail": "Your account is not approved by admin yet."})

        if not user.has_active_subscription:
            raise serializers.ValidationError({"detail": "You are not a subscribed member. Please purchase a plan first."})

        # ✅ Special bypass for this email (can create unlimited companies)
        if user.email.strip().lower() != "ovinenterprises.login@gmail.com":
            if user.companies.count() >= 1:
                raise serializers.ValidationError({
                    "detail": "You can only register one company with your subscription."
                })

        return attrs

    def create(self, validated_data):
        user = self.context["request"].user

        directors_data = validated_data.pop("directors", [])
        owners_data = validated_data.pop("owners", [])
        members_data = validated_data.pop("members", [])
        partners_data = validated_data.pop("partners", [])
        validated_data.pop("created_by", None)

        company = Company.objects.create(created_by=user, **validated_data)

        for d in directors_data:
            CompanyDirector.objects.create(company=company, **d)
        for o in owners_data:
            CompanyOwner.objects.create(company=company, **o)
        for m in members_data:
            CompanyMember.objects.create(company=company, **m)
        for p in partners_data:
            CompanyPartner.objects.create(company=company, **p)

        return company

    def update(self, instance, validated_data):
        directors_data = validated_data.pop("directors", None)
        owners_data = validated_data.pop("owners", None)
        members_data = validated_data.pop("members", None)
        partners_data = validated_data.pop("partners", None)

        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()

        if directors_data is not None:
            instance.directors.all().delete()
            for d in directors_data:
                CompanyDirector.objects.create(company=instance, **d)
        if owners_data is not None:
            instance.owners.all().delete()
            for o in owners_data:
                CompanyOwner.objects.create(company=instance, **o)
        if members_data is not None:
            instance.members.all().delete()
            for m in members_data:
                CompanyMember.objects.create(company=instance, **m)
        if partners_data is not None:
            instance.partners.all().delete()
            for p in partners_data:
                CompanyPartner.objects.create(company=instance, **p)

        return instance
    






# from rest_framework import serializers
# from .models import ReadedCompanyDocuments


# class ReadedCompanyDocumentsSerializer(serializers.ModelSerializer):
#     company_name = serializers.CharField(source="company.company_name", read_only=True)
#     uploaded_by = serializers.CharField(source="created_by.username", read_only=True)

#     class Meta:
#         model = ReadedCompanyDocuments
#         fields = [
#             "id",
#             "created_by",
#             "uploaded_by",
#             "company",
#             "company_name",
#             "original_file",
#             "filename",
#             "content_type",
#             "extracted_text_raw",
#             "extracted_text_clean",
#             "status",
#             "error_message",
#             "model_used",
#             "processed_at",
#             "created_at",
#             "updated_at",
#         ]
#         read_only_fields = [
#             "id",
#             "uploaded_by",
#             "company_name",
#             "extracted_text_raw",
#             "extracted_text_clean",
#             "status",
#             "error_message",
#             "model_used",
#             "processed_at",
#             "created_at",
#             "updated_at",
#         ]

#     def create(self, validated_data):
#         request = self.context.get("request")
#         if request and hasattr(request, "user"):
#             validated_data["created_by"] = request.user
#         instance = super().create(validated_data)

#         # ✅ Default: mark as pending when newly uploaded
#         instance.status = "pending"
#         instance.filename = instance.original_file.name
#         instance.content_type = (
#             instance.original_file.file.content_type
#             if hasattr(instance.original_file, "file")
#             else ""
#         )
#         instance.save(update_fields=["status", "filename", "content_type", "updated_at"])
#         return instance









# # from rest_framework import serializers
# # from .models import Document, ExtractedTextDocument


# # class ExtractedTextDocumentSerializer(serializers.ModelSerializer):
# #     class Meta:
# #         model = ExtractedTextDocument
# #         fields = "__all__"
