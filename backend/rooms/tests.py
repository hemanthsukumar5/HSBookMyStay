from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from rooms.models import Room

User = get_user_model()

class RoomTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.host = User.objects.create_user(username='host1', password='password123', user_type='host')
        self.other_host = User.objects.create_user(username='host2', password='password123', user_type='host')
        self.guest = User.objects.create_user(username='guest1', password='password123', user_type='guest')

        self.normal_room = Room.objects.create(
            title='Normal Room', hotel='Grand Hotel', city='Goa',
            max_guests=2, category='Hotels', price=1000.00, imageUrl='http://img.png',
            host=self.host, is_suite=False
        )

        self.suite_room = Room.objects.create(
            title='Suite Room', hotel='Royal Palace', city='Udaipur',
            max_guests=4, category='Resorts', price=5000.00, imageUrl='http://img.png',
            host=self.host, is_suite=True
        )

    def test_unauthenticated_visitor_cannot_access_suites(self):
        # Suite query parameter
        url = '/api/rooms/?is_suite=true'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Suite detail view
        detail_url = f'/api/rooms/{self.suite_room.id}/'
        detail_res = self.client.get(detail_url)
        self.assertEqual(detail_res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_can_access_suites(self):
        self.client.force_authenticate(user=self.guest)
        url = '/api/rooms/?is_suite=true'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_host_cannot_edit_other_host_room(self):
        self.client.force_authenticate(user=self.other_host)
        url = f'/api/rooms/{self.normal_room.id}/'
        response = self.client.patch(url, {'title': 'Hacked Title'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
