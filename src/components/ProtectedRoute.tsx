import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import type { RootState } from '../store';

// We use JSX.Element because the <Route> component expects a valid React element.
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  // Get the full authentication state from Redux
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // 1. Check if the user is logged in at all.
  // If not, they are immediately sent to the login page.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Check if the user is logged in BUT their email is NOT verified.
  // If so, they are sent to the "please-verify" page.
  // We make an exception for the page that lets them verify their phone.
  if (user && !user.isEmailVerified && location.pathname !== '/verify-phone') {
    return <Navigate to="/please-verify" replace />;
  }
  
  // 3. If all checks pass (user is logged in AND verified),
  // then we return the 'children', which is the page they were trying to access (e.g., <HomePage />).
  return children;
};

export default ProtectedRoute;