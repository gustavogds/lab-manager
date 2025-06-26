from django.db import models


class LabSettings(models.Model):
    lab_name = models.CharField(max_length=255, default="Lab Management System")
    address = models.TextField(blank=True, null=True)
    logo = models.ImageField(upload_to="lab_logos/", blank=True, null=True)
    mission = models.TextField(blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return self.lab_name

    def __repr__(self):
        return f"<User pk={self.pk} lab_name={self.lab_name}>"

    def export(self, include=None):
        data = {
            "id": self.id,
            "lab_name": self.lab_name,
            "address": self.address,
            "logo": self.logo.url if self.logo else None,
            "mission": self.mission,
            "contact_email": self.contact_email,
            "contact_phone": self.contact_phone,
        }

        if include is None:
            return data

        for key in include:
            if not hasattr(self, key):
                continue

            data[key] = getattr(self, key).export()

        return data


class UploadedFile(models.Model):
    file = models.FileField(upload_to="uploads/")
    uploaded_at = models.DateTimeField(auto_now_add=True)
