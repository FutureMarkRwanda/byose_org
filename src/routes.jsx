import {
    HomeIcon,
    ServerStackIcon,
    VideoCameraIcon,
    PencilSquareIcon
} from "@heroicons/react/24/solid";
import Statistics from "./pages/dashboard/Statistics.jsx";
import SignIn from "./pages/dashboard/SignIn.jsx";
import AddMovie from "./pages/dashboard/AddMovie.jsx";
import EditMovie from "./pages/dashboard/EditMovie.jsx";

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
                path: "/auth/sign-in",
                element: <SignIn/>,
            },
            // {
            //   icon: <RectangleStackIcon {...icon} />,
            //   name: "sign up",
            //   path: "/sign-up",
            //   element: <SignUp />,
            // },
        ],
    },
];

export default routes;
