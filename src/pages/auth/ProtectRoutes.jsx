import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import LoadingPage from "../../components/LoadingPage.jsx";

const ProtectedRoute = ({ children }) => {
  const { userData, loading } = useAuth();

  if (loading) {
    return <LoadingPage message="Authorizing Connection" />;
  }

  if (!userData) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  return children;
};

export default ProtectedRoute;