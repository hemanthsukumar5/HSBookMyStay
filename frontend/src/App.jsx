import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Rooms from './pages/Rooms';
import RoomDetail from './pages/RoomDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import HostDashboard from './pages/HostDashboard';
import HostRooms from './pages/HostRooms';
import HostRoomForm from './pages/HostRoomForm';
import HostOrders from './pages/HostOrders';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/rooms/:id" element={<RoomDetail />} />

              {/* Authenticated Routes */}
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />

              {/* Host Routes */}
              <Route path="/host" element={<ProtectedRoute requireHost><HostDashboard /></ProtectedRoute>} />
              <Route path="/host/rooms" element={<ProtectedRoute requireHost><HostRooms /></ProtectedRoute>} />
              <Route path="/host/rooms/new" element={<ProtectedRoute requireHost><HostRoomForm /></ProtectedRoute>} />
              <Route path="/host/rooms/:id/edit" element={<ProtectedRoute requireHost><HostRoomForm /></ProtectedRoute>} />
              <Route path="/host/orders" element={<ProtectedRoute requireHost><HostOrders /></ProtectedRoute>} />

              {/* Catch All */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
