import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Auth from './pages/Auth';
import DevoteeDashboard from './pages/DevoteeDashboard';
import ResetPassword from './pages/ResetPassword';
import { ThemeProvider } from './contexts/ThemeContext';

// Guard: redirect to /auth if no valid session in localStorage
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  if (!token || !user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/devotee/*"
            element={
              <ProtectedRoute>
                <DevoteeDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
