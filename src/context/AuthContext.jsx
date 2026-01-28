import React, { createContext, useContext, useEffect, useState } from "react";
import { decodeToken, handleLogout, returnToken } from "../utils/helper.js";
import LoadingPage from "../components/LoadingPage.jsx"; // Import here

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = returnToken();
      if (token) {
        try {
          const decoded = decodeToken(token);
          if (decoded?.exp * 1000 < Date.now()) {
            handleLogout("", "/auth");
            setUserData(null);
          } else {
            setUserData(decoded);
          }
        } catch (e) {
          handleLogout("", "/auth");
        }
      }
      setLoading(false);
    };

    init();
  }, []);

  if (loading) {
    return <LoadingPage message="Synchronizing Identity" />; // Professional Loader
  }

  return (
    <AuthContext.Provider value={{ userData, setUserData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);