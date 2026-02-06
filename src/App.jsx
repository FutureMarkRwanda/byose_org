// eslint-disable-next-line no-unused-vars
import Home from "./pages/home/Home.jsx";
import WhoWeAre from "./pages/home/WhoWeAre.jsx";
import { Route, Routes, Navigate } from "react-router-dom";
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
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./pages/auth/ProtectRoutes.jsx";
import Services from "./pages/home/About.jsx";
import Progress from "./components/presence_eye/PresenceEyeProgress.jsx";

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
    "/": "About | BYOSE Tech -Build Your Own Solutions Everywhere",
    "/services": "Services at BYOSE",
    "/home": "Home | BYOSE Tech -Build Your Own Solutions Everywhere",
    "/contact": "Contact Us | BYOSE Tech",
    "/news": "New & Blog | BYOSE Tech",
    "/presence-eye": "PresenceEye | BYOSE Tech",
    "/b-academy": "B-Academy | BYOSE Tech",
    "/b-store": "B-Store | BYOSE Tech",
    "/b-tech-labs": "B-Tech Labs | BYOSE Tech",
    "/we-are": "Who We Are | BYOSE Tech",
    "/signup": "Create Account | BYOSE Tech",
    "/login": "Login | BYOSE",
    "/dashboard": "DASHBOARD | BYOSE Tech",
  };
  useUpdateTitle(titleMap);
  return (
    <div className={`bg-white text-gray-800`}>
      <Routes>
        <Route exact path="/" element={<Landing />}>
          <Route index element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/b-bot" element={<BBot />} />
          <Route path="/we-are" element={<WhoWeAre />}>
            <Route
              index
              element={
                <>
                  <OurStory />
                  <Team />
                  <OurValues />
                </>
              }
            />
            <Route path={"/we-are/:name"} element={<Portfolio />} />
          </Route>
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/presence-eye" element={<PresenceEye />}>
            <Route index element={<PresenceEyeLatest />} />
            <Route
              path="/presence-eye/terms-policy"
              element={<PresenceEyePrivacyPolicy />}
            />
            <Route
              path="/presence-eye/presents"
              element={<PresenceEyePresentation />}
            />
            <Route path="/presence-eye/progress" element={<Progress />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin DashBoard */}
        {/* Admin DashBoard */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          {routes.map(
            ({ layout, pages }) =>
              layout === "dashboard" &&
              pages.map((page) => {
                // 1. If it's a normal page
                if (!page.isDropdown) {
                  return (
                    <Route
                      key={page.path}
                      index={page.path === ""} // Handle /dashboard as index
                      path={page.path !== "" ? page.path : undefined}
                      element={page.element}
                    />
                  );
                }

                // 2. If it's a dropdown, register all its subPages
                return page.subPages.map((sub) => (
                  <Route
                    key={sub.path}
                    path={sub.path} // This is now 'byose-tv/feedbacks', etc.
                    element={sub.element}
                  />
                ));
              }),
          )}
        </Route>

        <Route path="/auth" element={<Auth />}>
        <Route index element={<Navigate to="/auth/sign-in" replace />} />
          {routes.map(
            ({ layout, pages }) =>
              layout === "auth" &&
              pages.map(({ path, element }) => (
                // eslint-disable-next-line react/jsx-key
                <Route exact path={`${path}`} element={element} />
              )),
          )}
        </Route>
      </Routes>
    </div>
  );
}

export default App;
