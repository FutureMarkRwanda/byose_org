import React, { createContext, useContext, useEffect, useState } from "react";
import { decodeProductToken, handleLogout, returnToken } from "../utils/helper.js";
import LoadingPage from "../components/LoadingPage.jsx";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentProduct, setCurrentProduct] = useState(null);

  useEffect(() => {
    const init = async () => {
      // Check for product-specific tokens first
      const byoseTVToken = localStorage.getItem('byose_tv_token');
      const presenceEyeToken = localStorage.getItem('presence_eye_token');
      
      // Legacy token check for backward compatibility
      const legacyToken = localStorage.getItem('movie-rw');
      
      let tokenToUse = null;
      let productToUse = null;
      
      if (byoseTVToken) {
        tokenToUse = byoseTVToken;
        productToUse = 'byose_tv';
      } else if (presenceEyeToken) {
        tokenToUse = presenceEyeToken;
        productToUse = 'presence_eye';
      } else if (legacyToken) {
        tokenToUse = legacyToken;
        productToUse = 'byose_tv'; // Default legacy token to BYOSE TV
      }
      
      if (tokenToUse) {
        try {
          const decoded = decodeProductToken(productToUse);
          if (decoded?.exp * 1000 < Date.now()) {
            handleLogout(null, "/auth");
            setUserData(null);
            setCurrentProduct(null);
          } else {
            setUserData(decoded);
            setCurrentProduct(productToUse);
          }
        } catch (e) {
          handleLogout(null, "/auth");
        }
      }
      setLoading(false);
    };

    init();
  }, []);

  if (loading) {
    return <LoadingPage message="Synchronizing Identity" />;
  }

  return (
    <AuthContext.Provider value={{ userData, setUserData, loading, currentProduct, setCurrentProduct }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);