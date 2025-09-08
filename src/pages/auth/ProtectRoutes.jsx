import { Navigate } from "react-router-dom";
import {useAuth} from "../../context/AuthContext.jsx";

// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({ children }) => {
  const { userData, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // or a spinner
  }

  if (!userData) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
