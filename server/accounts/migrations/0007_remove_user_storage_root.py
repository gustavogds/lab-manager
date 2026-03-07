from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0006_user_bio"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="user",
            name="storage_root",
        ),
    ]
