from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("content", "0008_project_members_order"),
    ]

    operations = [
        migrations.CreateModel(
            name="Room",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("order", models.IntegerField(default=0)),
                ("created_at", models.DateTimeField(default=django.utils.timezone.now)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["order", "name"],
            },
        ),
        migrations.RemoveField(
            model_name="equipment",
            name="location",
        ),
        migrations.AddField(
            model_name="equipment",
            name="room",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="equipment",
                to="content.room",
            ),
        ),
        migrations.AddField(
            model_name="equipment",
            name="users",
            field=models.ManyToManyField(
                blank=True,
                related_name="used_equipment",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="equipment",
            name="users_order",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
