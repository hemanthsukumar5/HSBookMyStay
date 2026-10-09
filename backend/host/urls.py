from django.urls import path
from rooms.views import HostRoomListView
from .views import HostOrderItemsView, HostOrderItemStatusView, HostDashboardView

urlpatterns = [
    path('rooms/', HostRoomListView.as_view(), name='host-room-list'),
    path('orders/', HostOrderItemsView.as_view(), name='host-order-items'),
    path('order-items/<int:pk>/status/', HostOrderItemStatusView.as_view(), name='host-order-item-status'),
    path('dashboard/', HostDashboardView.as_view(), name='host-dashboard'),
]
