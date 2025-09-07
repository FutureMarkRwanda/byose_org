import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {BrowserRouter as Router} from "react-router-dom";
import {ThemeProvider} from "@material-tailwind/react";
import {MaterialTailwindControllerProvider} from "./context/navContext.jsx";


createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Router>
            <ThemeProvider>
                <MaterialTailwindControllerProvider>
                    <App/>
                </MaterialTailwindControllerProvider>
            </ThemeProvider>
        </Router>
    </StrictMode>,
)
