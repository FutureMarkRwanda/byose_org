import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const useUpdateTitle = (titleMap) => {
    const location = useLocation();

    useEffect(() => {
        const currentPath = location.pathname;

        // Try to get title from the map first
        let pageTitle = titleMap[currentPath];

        // If no match in the map and path contains "dashboard"
        if (!pageTitle && currentPath.toLowerCase().includes("dashboard")) {
            pageTitle = "BYOSE Tech Dashboard";
        }

        // Final fallback
        document.title = pageTitle || "BYOSE Tech";
    }, [location.pathname, titleMap]);
};

export default useUpdateTitle;