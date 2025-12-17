# serializers.py (naya file bana ya existing mein add)

from rest_framework import serializers
from .models import GeneratedDocument

class GeneratedDocumentSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    pdf_url = serializers.SerializerMethodField()
    docx_url = serializers.SerializerMethodField()
    date = serializers.DateTimeField(source='created_at', format="%d %b %Y", read_only=True)

    class Meta:
        model = GeneratedDocument
        fields = ['id', 'title', 'company_name', 'pdf_url', 'docx_url', 'date']

    def get_pdf_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.pdf_file.url) if obj.pdf_file else None

    def get_docx_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.docx_file.url) if obj.docx_file else None