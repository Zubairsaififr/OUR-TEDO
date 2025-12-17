# app/models.py ya jahan Company hai wahan

from django.db import models
from app.models import Company  # agar alag app mein hai to adjust kar lena

class GeneratedDocument(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='generated_documents')
    title = models.CharField(max_length=300, default="Tender Document")
    pdf_file = models.FileField(upload_to='documentprepared/')
    docx_file = models.FileField(upload_to='documentprepared/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.company.company_name} - {self.created_at.strftime('%d %b %Y')}"