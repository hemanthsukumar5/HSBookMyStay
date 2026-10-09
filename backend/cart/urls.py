from django.urls import path
from .views import CartDetailView, AddToCartView, CartItemDetailView

urlpatterns = [
    path('', CartDetailView.as_view(), name='cart-detail'),
    path('add/', AddToCartView.as_view(), name='cart-add'),
    path('items/<int:pk>/', CartItemDetailView.as_view(), name='cart-item-detail'),
]
