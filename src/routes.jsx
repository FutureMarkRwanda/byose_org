import {
    HomeIcon,
    ServerStackIcon,
    VideoCameraIcon,
    SquaresPlusIcon,
    ChartBarSquareIcon
} from "@heroicons/react/24/solid";
import AddMovie from "./pages/dashboard/AddMovie.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import Otp from "./pages/auth/otp.jsx";
import SignIn from "./pages/auth/Sign-in.jsx";
import CreatePost from "./pages/dashboard/CreatePost.jsx";
import AdminMovies from "./pages/dashboard/AdminMovies.jsx";
import Feedbacks from "./pages/dashboard/Feedbacks.jsx";
import PresenceEyeAdmin from "./pages/dashboard/PresenceEye.jsx";
import { FaFilePowerpoint } from "react-icons/fa6";

const icon = {
    className: "w-5 h-5 text-inherit",
};

export const routes = [
    {
        layout: "dashboard",
        pages: [
            {
                icon: <HomeIcon {...icon} />,
                name: "dashboard",
                path: "/dashboard",
                element: <AdminMovies/>,
            },
            {
                icon: <FaFilePowerpoint{...icon} />,
                name: "Presence Eye",
                path: "/dashboard/presence-eye",
                element: <PresenceEyeAdmin/>,
            },
            {
                icon: <ChartBarSquareIcon {...icon} />,
                name: "FeedBacks",
                path: "/dashboard/feedbacks",
                element: <Feedbacks/>,
            },
            {
                icon: <VideoCameraIcon {...icon} />,
                name: "Add Movie",
                path: "/dashboard/add-movie",
                element: <AddMovie/>,
            },
            {
                icon: <SquaresPlusIcon{...icon} />,
                name: "Add Trends",
                path: "/dashboard/add-post",
                element: <CreatePost/>,
            },
        ],
    },
    {
        title: "auth pages",
        layout: "auth",
        pages: [
            {
                icon: <ServerStackIcon {...icon} />,
                name: "sign in",
                path: "/auth",
                element: <SignIn/>,
            },
            {
                icon: <ServerStackIcon {...icon} />,
                name: "OTP Page",
                path: "/auth/otp/:email",
                element: <Otp/>,
            },
            {
                icon: <ServerStackIcon {...icon} />,
                name: "Reset password",
                path: "/auth/reset-password",
                element: <ResetPassword/>,
            },
        ],
    },
];

export default routes;
