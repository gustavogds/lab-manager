from django.db import models


class LabSettings(models.Model):
    lab_name = models.CharField(max_length=255, default="Lab Management System")
    logo = models.ImageField(upload_to="lab_logos/", blank=True, null=True)
    favicon = models.ImageField(upload_to="lab_favicons/", blank=True, null=True)
    mission_pt = models.TextField(blank=True, default="")
    mission_en = models.TextField(blank=True, default="")
    areas = models.TextField(blank=True, null=True)
    highlights = models.TextField(blank=True, null=True)
    lead = models.CharField(max_length=255, blank=True, null=True)
    team = models.TextField(blank=True, null=True)
    partners = models.TextField(blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    address_details_pt = models.TextField(blank=True, default="")
    address_details_en = models.TextField(blank=True, default="")
    maps_link = models.URLField(max_length=500, blank=True, null=True)

    home_use_gradient = models.BooleanField(default=True)
    home_bg_color_start = models.CharField(max_length=7, blank=True, null=True)
    home_bg_color_middle = models.CharField(max_length=7, blank=True, null=True)
    home_bg_color_end = models.CharField(max_length=7, blank=True, null=True)
    home_accent_color = models.CharField(max_length=7, blank=True, null=True)
    home_border_hover_color = models.CharField(max_length=7, blank=True, null=True)
    home_icon_color = models.CharField(max_length=7, blank=True, null=True)
    home_text_color = models.CharField(max_length=7, blank=True, null=True)

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
            "address_details_pt": self.address_details_pt,
            "address_details_en": self.address_details_en,
            "maps_link": self.maps_link,
            "logo": self.logo.url if self.logo else None,
            "favicon": self.favicon.url if self.favicon else None,
            "mission_pt": self.mission_pt,
            "mission_en": self.mission_en,
            "about_images": about_images,
            "areas": self.areas,
            "highlights": self.highlights,
            "lead": self.lead,
            "team": self.team,
            "partners": self.partners,
            "email": self.contact_email,
            "phone": self.contact_phone,
            "home_use_gradient": self.home_use_gradient,
            "home_bg_color_start": self.home_bg_color_start,
            "home_bg_color_middle": self.home_bg_color_middle,
            "home_bg_color_end": self.home_bg_color_end,
            "home_accent_color": self.home_accent_color,
            "home_border_hover_color": self.home_border_hover_color,
            "home_icon_color": self.home_icon_color,
            "home_text_color": self.home_text_color,
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
