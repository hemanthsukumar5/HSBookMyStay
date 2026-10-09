from django.urls import path
from .views import OrderListCheckoutView, OrderDetailView, OrderCancelView

urlpatterns = [
    path('', OrderListCheckoutView.as_view(), name='order-list-checkout'),
    path('checkout/', OrderListCheckoutView.as_view(), name='order-checkout'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('<int:pk>/cancel/', OrderCancelView.as_view(), name='order-cancel'),
]
