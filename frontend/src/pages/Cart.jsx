import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';

export default function Cart() {
  const { cart, cartLoading, fetchCart, updateCartItem, removeCartItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  if (cartLoading) return <LoadingSpinner text="Loading your cart..." />;

  const items = cart?.items || [];

  return (
    <div className="cart-page" id="cart-page">
      <h1><FiShoppingCart style={{ marginRight: '8px' }} /> Shopping Cart</h1>

      {items.length === 0 ? (
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          message="Browse our rooms and add your favorites to get started."
          actionText="Browse Rooms"
          actionLink="/rooms"
        />
      ) : (
        <>
          {items.map(item => (
            <div key={item.id} className="cart-item" id={`cart-item-${item.id}`}>
              <div className="cart-item-image">
                <img src={item.imageUrl} alt={item.room_title} />
              </div>
              <div className="cart-item-details">
                <h3 className="cart-item-title">{item.room_title}</h3>
                <p className="cart-item-hotel">{item.hotel} • {item.city}</p>
                <p className="cart-item-price">₹{Number(item.price).toLocaleString('en-IN')} /night</p>
              </div>
              <div className="cart-item-actions">
                <div className="cart-item-quantity">
                  <button
                    onClick={() => updateCartItem(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    aria-label="Decrease nights"
                  >
                    <FiMinus />
                  </button>
                  <span>{item.quantity} night{item.quantity > 1 ? 's' : ''}</span>
                  <button
                    onClick={() => updateCartItem(item.id, item.quantity + 1)}
                    aria-label="Increase nights"
                  >
                    <FiPlus />
                  </button>
                </div>
                <p style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                  ₹{Number(item.subtotal).toLocaleString('en-IN')}
                </p>
                <button className="cart-remove-btn" onClick={() => removeCartItem(item.id)}>
                  <FiTrash2 /> Remove
                </button>
              </div>
            </div>
          ))}

          <div className="cart-summary">
            <div className="cart-summary-row">
              <span>Total Nights</span>
              <span>{cart.total_nights}</span>
            </div>
            <div className="cart-summary-row">
              <span>Items</span>
              <span>{items.length} room(s)</span>
            </div>
            <div className="cart-summary-row total">
              <span>Total Price</span>
              <span>₹{Number(cart.total_price).toLocaleString('en-IN')}</span>
            </div>
            <div className="cart-actions">
              <Link to="/rooms" className="btn btn-outline">Continue Browsing</Link>
              <button className="btn btn-accent btn-lg" onClick={() => navigate('/checkout')} id="proceed-to-checkout-btn">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
