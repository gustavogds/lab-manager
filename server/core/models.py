from django.db import models


class LabSettings(models.Model):
    lab_name = models.CharField(max_length=255, default="Lab Management System")
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=255, blank=True, null=True)
    logo = models.ImageField(upload_to="lab_logos/", blank=True, null=True)
    mission = models.TextField(blank=True, null=True)
    areas = models.TextField(blank=True, null=True)
    highlights = models.TextField(blank=True, null=True)
    lead = models.CharField(max_length=255, blank=True, null=True)
    team = models.TextField(blank=True, null=True)
    partners = models.TextField(blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return self.lab_name

    def __repr__(self):
        return f"<User pk={self.pk} lab_name={self.lab_name}>"

    def export(self, include=None):
        about_images = [
            {"id": img.id, "image": img.image.url, "order": img.order}
            for img in self.about_images.all()
        ]

        data = {
            "id": self.id,
            "lab_name": self.lab_name,
            "address": self.address,
            "city": self.city,
            "logo": self.logo.url if self.logo else None,
            "mission": self.mission,
            "about_images": about_images,
            "areas": self.areas,
            "highlights": self.highlights,
            "lead": self.lead,
            "team": self.team,
            "partners": self.partners,
            "email": self.contact_email,
            "phone": self.contact_phone,
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


class AboutImage(models.Model):
    lab_settings = models.ForeignKey(
        LabSettings, on_delete=models.CASCADE, related_name="about_images"
    )
    image = models.ImageField(upload_to="about_images/")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ["order", "uploaded_at"]

    def __str__(self):
        return f"About Image {self.id} for {self.lab_settings.lab_name}"
