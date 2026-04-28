from django.db import migrations, models


def copy_to_pt(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    Position = apps.get_model("accounts", "Position")

    for user in User.objects.all():
        user.bio_pt = user.bio or ""
        user.save(update_fields=["bio_pt"])

    for position in Position.objects.all():
        position.name_pt = position.name or ""
        position.save(update_fields=["name_pt"])


def reverse_copy(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    Position = apps.get_model("accounts", "Position")

    for user in User.objects.all():
        user.bio = user.bio_pt or user.bio_en or None
        user.save(update_fields=["bio"])

    for position in Position.objects.all():
        position.name = position.name_pt or position.name_en or ""
        position.save(update_fields=["name"])


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0011_invitation"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="bio_pt",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="user",
            name="bio_en",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="position",
            name="name_pt",
            field=models.CharField(blank=True, default="", max_length=100),
        ),
        migrations.AddField(
            model_name="position",
            name="name_en",
            field=models.CharField(blank=True, default="", max_length=100),
        ),
        migrations.RunPython(copy_to_pt, reverse_copy),
        migrations.RemoveField(model_name="user", name="bio"),
        migrations.RemoveField(model_name="position", name="name"),
        migrations.AlterModelOptions(
            name="position",
            options={"ordering": ["order", "name_pt"]},
        ),
    ]
