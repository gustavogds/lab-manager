from django.db import migrations, models


def migrate_user_position_to_positions(apps, schema_editor):
    User = apps.get_model("accounts", "User")

    for user in User.objects.exclude(position__isnull=True).iterator():
        user.positions.add(user.position)


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0009_position_user_room"),
    ]

    operations = [
        migrations.AddField(
            model_name="position",
            name="is_visible",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="user",
            name="positions",
            field=models.ManyToManyField(blank=True, related_name="users_multi", to="accounts.position"),
        ),
        migrations.RunPython(migrate_user_position_to_positions, migrations.RunPython.noop),
    ]
