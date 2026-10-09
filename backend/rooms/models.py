from django.db import models
from django.conf import settings

class Room(models.Model):
    CATEGORY_CHOICES = (
        ('Hotels', 'Hotels'),
        ('Resorts', 'Resorts'),
        ('Homestays', 'Homestays'),
        ('Villas', 'Villas'),
        ('Houseboats', 'Houseboats'),
    )

    title = models.CharField(max_length=255)
    hotel = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    max_guests = models.PositiveIntegerField(default=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    imageUrl = models.CharField(max_length=1000)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=4.50)
    total_reviews = models.PositiveIntegerField(default=10)
    availability = models.BooleanField(default=True)
    description = models.TextField(blank=True, default='')
    is_suite = models.BooleanField(default=False)
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='rooms')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.title} - {self.hotel} ({self.city})"
