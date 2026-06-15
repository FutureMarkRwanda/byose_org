import React, {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {BrowserRouter as Router} from "react-router-dom";
import {ThemeProvider} from "@material-tailwind/react";
import {MaterialTailwindControllerProvider} from "./context/navContext.jsx";
import {NotificationProvider} from "./context/NotificationContext.jsx";
import {GoogleOAuthProvider} from '@react-oauth/google';
import { useNotification } from "./context/NotificationContext.jsx";
import { setGlobalErrorHandler } from "./utils/helper.js";

// Component to set up global error handler
const GlobalErrorHandlerSetup = () => {
    const { showNotification } = useNotification();
    
    React.useEffect(() => {
        setGlobalErrorHandler(showNotification);
    }, [showNotification]);
    
    return null;
};


createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Router>
            <ThemeProvider>
                <MaterialTailwindControllerProvider>
                    <NotificationProvider>
                        <GlobalErrorHandlerSetup />
                        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                            <App/>
                        </GoogleOAuthProvider>
                    </NotificationProvider>
                </MaterialTailwindControllerProvider>
            </ThemeProvider>
        </Router>
    </StrictMode>
    ,
)
