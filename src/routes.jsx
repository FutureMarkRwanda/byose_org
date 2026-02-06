import {
    Squares2X2Icon,
    TvIcon,
    CursorArrowRaysIcon,
} from "@heroicons/react/24/outline";
import AdminMovies from "./pages/dashboard/AdminMovies.jsx";
import PresenceEyeAdmin from "./pages/dashboard/PresenceEye.jsx";
import OnlineDevicesDashboard from "./pages/dashboard/OnlineDevicesDashboard.jsx";
import Feedbacks from "./pages/dashboard/Feedbacks.jsx";
import DashboardOverview from "./pages/dashboard/DashboardOverview.jsx";
import AddMovie from "./pages/dashboard/AddMovie.jsx";
import CreatePost from "./pages/dashboard/CreatePost.jsx";
import SignIn from "./pages/auth/Sign-in.jsx";
import Otp from "./pages/auth/otp.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";

const iconClass = "w-5 h-5";

export const routes = [
    {
        title: "Overview",
        layout: "dashboard",
        pages: [
            {
                icon: <Squares2X2Icon className={iconClass} />,
                name: "Dashboard",
                path: "", // Relative to /dashboard, so this is the index
                element: <DashboardOverview />,
            }
        ],
    },
    {
        title: "Projects",
        layout: "dashboard",
        pages: [
            {
                icon: <CursorArrowRaysIcon className={iconClass} />,
                name: "Presence Eye",
                isDropdown: true,
                subPages: [
                    { 
                        name: "Device Manager", 
                        path: "presence-eye-buttons/management", // Relative
                        element: <PresenceEyeAdmin /> 
                    },
                    { 
                        name: "Analytics", 
                        path: "presence-eye-buttons/analytics", // Relative
                        element: <OnlineDevicesDashboard /> 
                    },
                ]
            },
            {
                icon: <TvIcon className={iconClass} />,
                name: "Byose TV",
                isDropdown: true,
                subPages: [
                    { 
                        name: "Add Movies", 
                        path: "byose-tv/add-movie", // Relative
                        element: <AddMovie /> 
                    },
                    { 
                        name: "Manage movies", 
                        path: "byose-tv/manage-movies", // Relative
                        element: <AdminMovies /> 
                    },
                    { 
                        name: "Add Trends", 
                        path: "byose-tv/add-post", // Relative
                        element: <CreatePost /> 
                    },
                    { 
                        name: "FeedBacks", 
                        path: "byose-tv/feedbacks", // Relative
                        element: <Feedbacks /> 
                    },
                ]
            },
        ],
    },
        {
        title: "Auth Pages",
        layout: "auth", // This matches the check in App.jsx
        pages: [
            {
                name: "Sign In",
                path: "sign-in",
                element: <SignIn />,
            },
            {
                name: "OTP",
                path: "otp/:email",
                element: <Otp />,
            },
            {
                name: "Reset Password",
                path: "reset-password",
                element: <ResetPassword />,
            },
        ],
    },
];

export default routes;