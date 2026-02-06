import {
  Squares2X2Icon,
  TvIcon,
  CursorArrowRaysIcon,
  UserIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

// Dashboard Pages
import AdminMovies from "./pages/dashboard/AdminMovies.jsx";
import PresenceEyeAdmin from "./pages/dashboard/PresenceEye.jsx";
import OnlineDevicesDashboard from "./pages/dashboard/OnlineDevicesDashboard.jsx";
import Feedbacks from "./pages/dashboard/Feedbacks.jsx";
import DashboardOverview from "./pages/dashboard/DashboardOverview.jsx";
import AddMovie from "./pages/dashboard/AddMovie.jsx";
import CreatePost from "./pages/dashboard/CreatePost.jsx";
import UpdateLocation from "./pages/dashboard/UpdateLocation.jsx";
import PresenceEyePlans from "./pages/dashboard/PresenceEyePlans.jsx";
import PresenceEyeSubscriptions from "./pages/dashboard/PresenceEyeSubscriptions.jsx";

import { MdMap } from "react-icons/md";

// Auth Pages
import SignIn from "./pages/auth/Sign-in.jsx";
import Otp from "./pages/auth/otp.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";

const iconClass = "w-5 h-5";

export const routes = [
  {
    // This section is used by App.jsx to render routes,
    // but filtered out by Sidenav.jsx
    title: "Auth Pages",
    layout: "auth",
    pages: [
      {
        icon: <ArrowRightOnRectangleIcon className={iconClass} />,
        name: "Sign In",
        path: "sign-in",
        element: <SignIn />,
      },
      {
        icon: <KeyIcon className={iconClass} />,
        name: "OTP",
        path: "otp/:email",
        element: <Otp />,
      },
      {
        icon: <UserIcon className={iconClass} />,
        name: "Reset Password",
        path: "reset-password",
        element: <ResetPassword />,
      },
    ],
  },
  {
    title: "Overview",
    layout: "dashboard",
    pages: [
      {
        icon: <Squares2X2Icon className={iconClass} />,
        name: "Dashboard",
        path: "", // Relative to /dashboard, so this is the index
        element: <DashboardOverview />,
      },
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
            path: "presence-eye-buttons/management",
            element: <PresenceEyeAdmin />,
          },
          {
            name: "Analytics",
            path: "presence-eye-buttons/analytics",
            element: <OnlineDevicesDashboard />,
          },
          {
            name: "Update Location",
            path: "presence-eye-buttons/location",
            element: <UpdateLocation />,
          },
          {
            name: "Subscription Plans",
            path: "presence-eye-buttons/plans",
            element: <PresenceEyePlans />,
          },
          {
            name: "Active Subscriptions",
            path: "presence-eye-buttons/subscriptions",
            element: <PresenceEyeSubscriptions />,
          },
        ],
      },
      {
        icon: <TvIcon className={iconClass} />,
        name: "Byose TV",
        isDropdown: true,
        subPages: [
          {
            name: "Add Movies",
            path: "byose-tv/add-movie",
            element: <AddMovie />,
          },
          {
            name: "Manage Movies",
            path: "byose-tv/manage-movies",
            element: <AdminMovies />,
          },
          {
            name: "Add Trends",
            path: "byose-tv/add-post",
            element: <CreatePost />,
          },
          {
            name: "Feedbacks",
            path: "byose-tv/feedbacks",
            element: <Feedbacks />,
          },
        ],
      },
    ],
  },
];

export default routes;
