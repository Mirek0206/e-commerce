from django.contrib.auth.password_validation import validate_password
from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    GENDER_CHOICES = [
        ('M', 'Mężczyzna'),
        ('K', 'Kobieta'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, default='M')
    city = models.CharField(max_length=50, null=True, blank=True)
    street = models.CharField(max_length=255, null=True, blank=True)
    house_number = models.CharField(max_length=255, null=True, blank=True)
    postal_code = models.CharField(max_length=255, null=True, blank=True)
    phone_number = models.CharField(max_length=40, null=True, blank=True)
    profile_image = models.ImageField(upload_to='profiles', null=True, blank=True, default='profiles/user-default.png')

    def __str__(self) -> str:
        return str(self.user)

    @property
    def imageURL(self):
        try:
            url = self.profile_image.url
        except Exception:
            url = ''
        return url


