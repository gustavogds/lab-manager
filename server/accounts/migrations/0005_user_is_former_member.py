from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0004_user_position_user_researcher_order_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="is_former_member",
            field=models.BooleanField(default=False),
        ),
    ]
