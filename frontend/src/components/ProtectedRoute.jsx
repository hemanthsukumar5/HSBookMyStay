import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, requireHost = false }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner text="Checking authentication..." />;

  if (!user) return <Navigate to="/login" replace />;

  if (requireHost && user.user_type !== 'host') {
    return <Navigate to="/" replace />;
  }

  return children;
}
