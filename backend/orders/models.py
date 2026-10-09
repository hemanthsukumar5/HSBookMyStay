from django.db import models
from django.conf import settings
from rooms.models import Room

class Order(models.Model):
    STATUS_CHOICES = (
        ('placed', 'Placed'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )

    PAYMENT_METHOD_CHOICES = (
        ('COD', 'Pay at Hotel (COD)'),
        ('Pay Now', 'Pay Now'),
    )

    MEAL_PLAN_CHOICES = (
        ('Room Only', 'Room Only'),
        ('With Breakfast', 'With Breakfast'),
        ('All Meals', 'All Meals'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=50)
    street_address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=20)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES, default='COD')
    meal_plan = models.CharField(max_length=50, choices=MEAL_PLAN_CHOICES, default='Room Only')
    total_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='placed')
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} by {self.user.username} ({self.status})"

    def update_aggregate_status(self):
        items = list(self.items.all())
        if not items:
            return

        statuses = [item.status for item in items]

        if all(s == 'delivered' for s in statuses):
            self.status = 'delivered'
            if self.payment_method == 'COD':
                self.is_paid = True
        elif all(s == 'cancelled' for s in statuses):
            self.status = 'cancelled'
        elif any(s in ('shipped', 'delivered') for s in statuses):
            self.status = 'shipped'
        else:
            self.status = 'placed'

        self.save()


class OrderItem(models.Model):
    STATUS_CHOICES = (
        ('placed', 'Placed'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, related_name='order_items')
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sold_order_items')
    
    # Snapshot fields
    room_title = models.CharField(max_length=255)
    hotel = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    imageUrl = models.CharField(max_length=1000)
    price = models.DecimalField(max_digits=10, decimal_places=2) # price per night
    quantity = models.PositiveIntegerField(default=1) # number of nights
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='placed')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"OrderItem #{self.id}: {self.room_title} x {self.quantity} night(s)"
