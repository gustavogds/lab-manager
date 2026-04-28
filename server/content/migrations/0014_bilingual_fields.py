from django.db import migrations, models


def copy_to_pt(apps, schema_editor):
    ResearchArea = apps.get_model("content", "ResearchArea")
    Project = apps.get_model("content", "Project")

    for area in ResearchArea.objects.all():
        area.title_pt = area.title or ""
        area.description_pt = area.description or ""
        area.save(update_fields=["title_pt", "description_pt"])

    for project in Project.objects.all():
        project.title_pt = project.title or ""
        project.description_pt = project.description or ""
        project.save(update_fields=["title_pt", "description_pt"])


def reverse_copy(apps, schema_editor):
    ResearchArea = apps.get_model("content", "ResearchArea")
    Project = apps.get_model("content", "Project")

    for area in ResearchArea.objects.all():
        area.title = area.title_pt or area.title_en or ""
        area.description = area.description_pt or area.description_en or ""
        area.save(update_fields=["title", "description"])

    for project in Project.objects.all():
        project.title = project.title_pt or project.title_en or ""
        project.description = project.description_pt or project.description_en or ""
        project.save(update_fields=["title", "description"])


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0013_roomsection_equipment_section"),
    ]

    operations = [
        migrations.AddField(
            model_name="researcharea",
            name="title_pt",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AddField(
            model_name="researcharea",
            name="title_en",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AddField(
            model_name="researcharea",
            name="description_pt",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="researcharea",
            name="description_en",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="project",
            name="title_pt",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AddField(
            model_name="project",
            name="title_en",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AddField(
            model_name="project",
            name="description_pt",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="project",
            name="description_en",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.RunPython(copy_to_pt, reverse_copy),
        migrations.RemoveField(model_name="researcharea", name="title"),
        migrations.RemoveField(model_name="researcharea", name="description"),
        migrations.RemoveField(model_name="project", name="title"),
        migrations.RemoveField(model_name="project", name="description"),
        migrations.AlterModelOptions(
            name="researcharea",
            options={"ordering": ["order", "title_pt"]},
        ),
        migrations.AlterModelOptions(
            name="project",
            options={"ordering": ["order", "title_pt"]},
        ),
    ]
