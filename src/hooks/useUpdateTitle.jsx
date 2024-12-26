import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const useUpdateTitle = (titleMap) => {
    const location = useLocation();

    useEffect(() => {
        const currentPath = location.pathname;
        const pageTitle = titleMap[currentPath] || "BYOSE"; // Fallback if no match
        document.title = pageTitle;
    }, [location.pathname, titleMap]);
};

export default useUpdateTitle;
