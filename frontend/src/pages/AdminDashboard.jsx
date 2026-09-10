import { Navigate } from 'react-router-dom';

// Admin portal removed - redirecting any legacy routes to Devotee portal
export default function AdminDashboard() {
  return <Navigate to="/devotee" replace />;
}
