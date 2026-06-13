import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import LoadingPage from "../../components/LoadingPage.jsx";
import { getProductFromRoute } from "../../utils/helper.js";

const ProtectedRoute = ({ children }) => {
  const { userData, loading, currentProduct } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingPage message="Authorizing Connection" />;
  }

  if (!userData) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // Check if user has the correct product token for the route
  const routeProduct = getProductFromRoute(location.pathname);
  if (routeProduct && routeProduct !== currentProduct) {
    // Redirect to sign-in with a hint to login for the correct product
    return <Navigate to="/auth/sign-in" replace state={{ requiredProduct: routeProduct }} />;
  }

  return children;
};

export default ProtectedRoute;