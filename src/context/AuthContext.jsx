// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import {decodeToken, handleLogout, returnToken} from "../utils/helper.js";

const AuthContext = createContext(null);

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true); // 👈 important

  useEffect(() => {
    const init = async () => {
      const token = returnToken();
      if (token) {
        try {
          const decoded = decodeToken(token);
          if (decoded?.exp * 1000 < Date.now()) {
            handleLogout("","/auth");
            setUserData(null);
          } else {
            setUserData(decoded);
          }
        } catch (e) {
          handleLogout("","/auth");
        }
      }
      setLoading(false); // 👈 only after all checks
    };

    init();
  }, []);

  return (
    <AuthContext.Provider value={{ userData, setUserData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
