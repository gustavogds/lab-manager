from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0010_remove_unused_models"),
    ]

    operations = [
        migrations.CreateModel(
            name="IdentificationCategory",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("order", models.IntegerField(default=0)),
                ("created_at", models.DateTimeField(default=django.utils.timezone.now)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name_plural": "Identification Categories",
                "ordering": ["order", "name"],
            },
        ),
        migrations.AlterField(
            model_name="equipment",
            name="room",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="room_equipment",
                to="content.room",
            ),
        ),
        migrations.AddField(
            model_name="equipment",
            name="identification_category",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="equipment",
                to="content.identificationcategory",
            ),
        ),
    ]
