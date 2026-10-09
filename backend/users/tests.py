from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

class UserAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_user_registration(self):
        url = '/api/users/register/'
        data = {
            'username': 'newguest',
            'email': 'guest@test.com',
            'password': 'password123',
            'user_type': 'guest'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newguest').exists())
        user = User.objects.get(username='newguest')
        self.assertEqual(user.user_type, 'guest')

    def test_jwt_login_and_logout(self):
        user = User.objects.create_user(username='testuser', password='password123')
        login_url = '/api/users/login/'
        response = self.client.post(login_url, {'username': 'testuser', 'password': 'password123'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

        access_token = response.data['access']
        refresh_token = response.data['refresh']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        logout_url = '/api/users/logout/'
        logout_res = self.client.post(logout_url, {'refresh': refresh_token}, format='json')
        self.assertEqual(logout_res.status_code, status.HTTP_200_OK)
