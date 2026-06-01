from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0007_bilingual_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="labsettings",
            name="favicon",
            field=models.ImageField(blank=True, null=True, upload_to="lab_favicons/"),
        ),
    ]
