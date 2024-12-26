import { useEffect } from "react";

export const useAnimationObserver = (containerRef, options = { threshold: 0.1 }) => {
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("animate");
                } else {
                    entry.target.classList.remove("animate"); // Reset animation when out of viewport
                }
            });
        }, options);

        if (containerRef?.current) {
            const elements = containerRef.current.querySelectorAll(".fade-in");
            elements.forEach((el) => observer.observe(el));
        }

        return () => observer.disconnect();
    }, [containerRef, options]);
};
