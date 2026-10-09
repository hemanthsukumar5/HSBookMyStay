from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from django.db import transaction
from cart.models import Cart
from .models import Order, OrderItem
from .serializers import OrderSerializer, CheckoutSerializer

class OrderListCheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Handle Checkout
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            cart = Cart.objects.get(user=request.user)
            cart_items = list(cart.items.select_related('room', 'room__host').all())
        except Cart.DoesNotExist:
            cart_items = []

        if not cart_items:
            return Response({"detail": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        # Check availability of rooms
        for item in cart_items:
            if not item.room.availability:
                return Response(
                    {"detail": f"Room '{item.room.title}' is no longer available."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        data = serializer.validated_data
        payment_method = data['payment_method']
        is_paid = (payment_method == 'Pay Now')

        total_price = sum(item.subtotal for item in cart_items)

        with transaction.atomic():
            order = Order.objects.create(
                user=request.user,
                full_name=data['full_name'],
                phone_number=data['phone_number'],
                street_address=data['street_address'],
                city=data['city'],
                state=data['state'],
                pincode=data['pincode'],
                payment_method=payment_method,
                meal_plan=data['meal_plan'],
                total_price=total_price,
                status='placed',
                is_paid=is_paid
            )

            for cart_item in cart_items:
                OrderItem.objects.create(
                    order=order,
                    room=cart_item.room,
                    host=cart_item.room.host,
                    room_title=cart_item.room.title,
                    hotel=cart_item.room.hotel,
                    city=cart_item.room.city,
                    imageUrl=cart_item.room.imageUrl,
                    price=cart_item.room.price,
                    quantity=cart_item.quantity,
                    subtotal=cart_item.subtotal,
                    status='placed'
                )

            # Clear cart
            cart.items.all().delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class OrderCancelView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            raise NotFound("Order not found.")

        if order.status in ['delivered', 'cancelled']:
            return Response(
                {"detail": f"Cannot cancel an order that is already {order.status}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            order.status = 'cancelled'
            order.save()
            order.items.update(status='cancelled')

        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)
