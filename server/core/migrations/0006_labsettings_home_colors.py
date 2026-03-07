from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_remove_labsettings_city_remove_labsettings_country_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='labsettings',
            name='home_use_gradient',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='labsettings',
            name='home_bg_color_start',
            field=models.CharField(blank=True, max_length=7, null=True),
        ),
        migrations.AddField(
            model_name='labsettings',
            name='home_bg_color_middle',
            field=models.CharField(blank=True, max_length=7, null=True),
        ),
        migrations.AddField(
            model_name='labsettings',
            name='home_bg_color_end',
            field=models.CharField(blank=True, max_length=7, null=True),
        ),
        migrations.AddField(
            model_name='labsettings',
            name='home_accent_color',
            field=models.CharField(blank=True, max_length=7, null=True),
        ),
        migrations.AddField(
            model_name='labsettings',
            name='home_border_hover_color',
            field=models.CharField(blank=True, max_length=7, null=True),
        ),
        migrations.AddField(
            model_name='labsettings',
            name='home_icon_color',
            field=models.CharField(blank=True, max_length=7, null=True),
        ),
        migrations.AddField(
            model_name='labsettings',
            name='home_text_color',
            field=models.CharField(blank=True, max_length=7, null=True),
        ),
    ]
