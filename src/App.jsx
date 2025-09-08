// eslint-disable-next-line no-unused-vars
import React from "react";
import About from "./pages/home/About.jsx";
import Home from "./pages/home/Home.jsx";
import WhoWeAre from "./pages/home/WhoWeAre.jsx";
import {Route, Routes} from 'react-router-dom';
import useUpdateTitle from "./hooks/useUpdateTitle.jsx";
import ContactUs from "./pages/home/ContactUs.jsx";
import NotFound from "./pages/home/NotFound.jsx";
import PresenceEye from "./pages/home/PresenceEye.jsx";
import PresenceEyePrivacyPolicy from "./components/presence_eye/PresenceEyePrivacyPolicy.jsx";
import PresenceEyePresentation from "./components/presence_eye/PresenceEyePresentation.jsx";
import PresenceEyeLatest from "./components/presence_eye/PresenceEyeLatest.jsx";
import OurStory from "./components/OurStory.jsx";
import Team from "./components/Team.jsx";
import OurValues from "./components/OurValues.jsx";
import Portfolio from "./pages/home/Portfolio.jsx";
import BBot from "./pages/home/BBot.jsx";
import routes from "./routes.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import Landing from "./pages/home/Landing.jsx";
import Auth from "./pages/auth/Auth.jsx";
import {AuthProvider} from "./context/AuthContext.jsx";
import ProtectedRoute from "./pages/auth/ProtectRoutes.jsx";

function DashboardLayout() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    </AuthProvider>
  );
}

function App() {
    const titleMap = {
        "/": "About | BYOSE",
        "/services": "Services at BYOSE",
        "/home": "Home | BYOSE ",
        "/contact": "Contact Us | BYOSE",
        "/news": "New & Blog | BYOSE",
        "/presence-eye": "PresenceEye | BYOSE",
        "/b-academy": "B-Academy | BYOSE ",
        "/b-store": "B-Store | BYOSE",
        "/b-tech-labs": "B-Tech Labs | BYOSE",
        "/we-are": "Who We Are | BYOSE",
        "/signup": "Create Account | BYOSE",
        "/login": "Login | BYOSE",
    };
    useUpdateTitle(titleMap);
    return (
        <div className={`bg-white text-gray-800`}>
            <Routes>
                <Route exact path="/" element={<Landing/>}>
                    <Route index element={<About/>}/>
                    <Route path="/home" element={<Home/>}/>
                    <Route path="/b-bot" element={<BBot/>}/>
                    <Route path="/we-are" element={<WhoWeAre/>}>
                        <Route index element={<><OurStory/><Team/><OurValues/></>}/>
                        <Route path={"/we-are/:name"} element={<Portfolio/>}/>
                    </Route>
                    <Route path="/contact" element={<ContactUs/>}/>
                    <Route path="/presence-eye" element={<PresenceEye/>}>
                        <Route index element={<PresenceEyeLatest/>}/>
                        <Route path="/presence-eye/terms-policy" element={<PresenceEyePrivacyPolicy/>}/>
                        <Route path="/presence-eye/presents" element={<PresenceEyePresentation/>}/>
                    </Route>
                    <Route path="*" element={<NotFound/>}/>
                </Route>

                {/* Admin DashBoard */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                    {routes.map(
                        ({layout, pages}) =>
                            layout === "dashboard" &&
                            pages.map(({path, element}) => (
                                // eslint-disable-next-line react/jsx-key
                                <Route exact path={path} element={element}/>
                            ))
                    )}
                </Route>

                <Route path="/auth" element={<Auth/>}>
                    {routes.map(
                        ({layout, pages}) =>
                            layout === "auth" &&
                            pages.map(({path, element}) => (
                                // eslint-disable-next-line react/jsx-key
                                <Route exact path={`${path}`} element={element}/>
                            ))
                    )}
                </Route>
            </Routes>
        </div>
    )
}

export default App
