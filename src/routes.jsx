import {
    HomeIcon,
    ServerStackIcon,
    VideoCameraIcon,
    PencilSquareIcon
} from "@heroicons/react/24/solid";
import Statistics from "./pages/dashboard/Statistics.jsx";
import AddMovie from "./pages/dashboard/AddMovie.jsx";
import EditMovie from "./pages/dashboard/EditMovie.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import Otp from "./pages/auth/otp.jsx";
import SignIn from "./pages/auth/Sign-in.jsx";

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
                element: <Statistics/>,
            },
            {
                icon: <VideoCameraIcon {...icon} />,
                name: "Add Movie",
                path: "/dashboard/add-movie",
                element: <AddMovie/>,
            },
            {
                icon: <PencilSquareIcon {...icon} />,
                name: "Edit Movie",
                path: "/dashboard/edit-movie/:id",
                element: <EditMovie/>,
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
