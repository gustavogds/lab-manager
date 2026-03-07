from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0009_room_equipment_room_users"),
        ("accounts", "0007_remove_user_storage_root"),
    ]

    operations = [
        migrations.DeleteModel(
            name="Mount",
        ),
        migrations.DeleteModel(
            name="Content",
        ),
        migrations.DeleteModel(
            name="Blob",
        ),
        migrations.DeleteModel(
            name="Post",
        ),
    ]
