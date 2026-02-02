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
];

export default routes;