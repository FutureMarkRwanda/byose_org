// src/context/NotificationContext.jsx
import { createContext, useContext, useState, useCallback } from "react";

const NotificationContext = createContext();

// eslint-disable-next-line react/prop-types
export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000); // disappears after 3s
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <div className={`fixed top-5 right-5 px-4 py-2 rounded shadow-lg text-white z-50
          ${notification.type === "success" ? "bg-green-500" :
            notification.type === "error" ? "bg-red-500" :
            notification.type === "warning" ? "bg-yellow-500" : "bg-blue-500"}`}>
          {notification.message}
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
