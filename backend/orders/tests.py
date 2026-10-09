from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from rooms.models import Room
from cart.models import Cart, CartItem
from orders.models import Order, OrderItem

User = get_user_model()

class OrderCheckoutTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.host = User.objects.create_user(username='host_ord', password='password123', user_type='host')
        self.guest = User.objects.create_user(username='guest_ord', password='password123', user_type='guest')
        self.room = Room.objects.create(
            title='Palace Room', hotel='Udaipur Palace', city='Udaipur',
            max_guests=2, category='Hotels', price=3000.00, imageUrl='http://img.png',
            host=self.host
        )

    def test_checkout_empty_cart_fails(self):
        self.client.force_authenticate(user=self.guest)
        url = '/api/orders/checkout/'
        data = {
            'full_name': 'Test Guest',
            'phone_number': '1234567890',
            'street_address': '123 St',
            'city': 'City',
            'state': 'State',
            'pincode': '123456',
            'payment_method': 'COD',
            'meal_plan': 'Room Only'
        }
        res = self.client.post(url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_successful_checkout_clears_cart(self):
        self.client.force_authenticate(user=self.guest)
        cart, _ = Cart.objects.get_or_create(user=self.guest)
        CartItem.objects.create(cart=cart, room=self.room, quantity=2)

        url = '/api/orders/checkout/'
        data = {
            'full_name': 'Test Guest',
            'phone_number': '1234567890',
            'street_address': '123 St',
            'city': 'City',
            'state': 'State',
            'pincode': '123456',
            'payment_method': 'COD',
            'meal_plan': 'With Breakfast'
        }
        res = self.client.post(url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(float(res.data['total_price']), 6000.00)
        self.assertEqual(cart.items.count(), 0)
