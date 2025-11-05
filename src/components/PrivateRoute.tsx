import { Navigate, useLocation } from 'react-router-dom';
import { getToken } from '../utils/token';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const location = useLocation();
  
  // Check if user is authenticated (you might want to use your actual auth check)
  const isAuthenticated = getToken() !== null;

  if (!isAuthenticated) {
    // Redirect to login page while saving the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute; 