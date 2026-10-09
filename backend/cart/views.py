from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, PermissionDenied
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer, AddToCartSerializer

class CartDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CartSerializer

    def get_object(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart


class AddToCartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        room = serializer.validated_data['room_obj']
        quantity = serializer.validated_data['quantity']

        cart, _ = Cart.objects.get_or_create(user=request.user)
        
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            room=room,
            defaults={'quantity': quantity}
        )

        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        cart_serializer = CartSerializer(cart)
        return Response(cart_serializer.data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)


class CartItemDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_item(self, request, pk):
        try:
            item = CartItem.objects.select_related('cart').get(pk=pk)
            if item.cart.user != request.user:
                raise PermissionDenied("You do not have access to this cart item.")
            return item
        except CartItem.DoesNotExist:
            raise NotFound("Cart item not found.")

    def patch(self, request, pk):
        item = self.get_item(request, pk)
        quantity = request.data.get('quantity')
        
        if quantity is None:
            return Response({"detail": "Quantity field is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            quantity = int(quantity)
        except ValueError:
            return Response({"detail": "Quantity must be an integer."}, status=status.HTTP_400_BAD_REQUEST)

        if quantity <= 0:
            item.delete()
        else:
            item.quantity = quantity
            item.save()

        cart = Cart.objects.get(user=request.user)
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        item = self.get_item(request, pk)
        item.delete()
        cart = Cart.objects.get(user=request.user)
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)
