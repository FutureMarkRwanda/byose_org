import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  // 1. Position of the mouse (Direct Motion Values)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 2. Physics-based Smooth Springs
  // Higher stiffness + lower damping = snappier
  // Lower stiffness + higher damping = more "ethereal/liquid"
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Update motion values directly (no re-renders)
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      // Enhanced Hover Detection
      const target = e.target;
      const isSelectable = 
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.closest('button') || 
        target.closest('a') ||
        target.getAttribute('role') === 'button';
      
      setIsHovering(isSelectable);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden hidden md:block">
      {/* Outer Ethereal Ring */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: isHovering ? 80 : 35,
          height: isHovering ? 80 : 35,
          backgroundColor: isHovering ? "rgba(25, 92, 81, 0.15)" : "rgba(25, 92, 81, 0.05)",
          borderColor: isHovering ? "rgba(25, 92, 81, 0.4)" : "rgba(25, 92, 81, 0.2)",
          scale: isClicking ? 0.9 : 1,
        }}
        className="fixed rounded-full border-[1.5px] border-[#195C51] transition-colors duration-300 backdrop-blur-[2px]"
      />

      {/* Inner Precision Dot */}
      <motion.div
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isHovering ? 0.5 : 1,
          opacity: isHovering ? 0.5 : 1,
          backgroundColor: "#195C51",
        }}
        className="fixed w-2 h-2 rounded-full"
      />
    </div>
  );
};

export default CustomCursor;