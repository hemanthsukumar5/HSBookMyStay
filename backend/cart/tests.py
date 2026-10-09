from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from rooms.models import Room
from cart.models import Cart, CartItem

User = get_user_model()

class CartTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.host = User.objects.create_user(username='host_cart', password='password123', user_type='host')
        self.guest = User.objects.create_user(username='guest_cart', password='password123', user_type='guest')
        self.room = Room.objects.create(
            title='Beach Villa', hotel='Sun Resort', city='Goa',
            max_guests=2, category='Villas', price=2000.00, imageUrl='http://img.png',
            host=self.host
        )

    def test_add_to_cart_and_server_side_calculation(self):
        self.client.force_authenticate(user=self.guest)
        url = '/api/cart/add/'
        res = self.client.post(url, {'room_id': self.room.id, 'quantity': 3}, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(float(res.data['total_price']), 6000.00)
        self.assertEqual(res.data['total_nights'], 3)
