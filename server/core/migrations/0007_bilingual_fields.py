from django.db import migrations, models


def copy_to_pt(apps, schema_editor):
    LabSettings = apps.get_model("core", "LabSettings")
    for settings in LabSettings.objects.all():
        settings.mission_pt = settings.mission or ""
        settings.address_details_pt = settings.address_details or ""
        settings.save(update_fields=["mission_pt", "address_details_pt"])


def reverse_copy(apps, schema_editor):
    LabSettings = apps.get_model("core", "LabSettings")
    for settings in LabSettings.objects.all():
        settings.mission = settings.mission_pt or settings.mission_en or None
        settings.address_details = settings.address_details_pt or settings.address_details_en or None
        settings.save(update_fields=["mission", "address_details"])


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0006_labsettings_home_colors"),
    ]

    operations = [
        migrations.AddField(
            model_name="labsettings",
            name="mission_pt",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="labsettings",
            name="mission_en",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="labsettings",
            name="address_details_pt",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="labsettings",
            name="address_details_en",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.RunPython(copy_to_pt, reverse_copy),
        migrations.RemoveField(model_name="labsettings", name="mission"),
        migrations.RemoveField(model_name="labsettings", name="address_details"),
    ]
