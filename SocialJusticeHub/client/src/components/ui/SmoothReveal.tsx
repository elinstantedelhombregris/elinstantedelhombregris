
import { motion } from "framer-motion";
import { ReactNode, useRef, useEffect, useState } from "react";

interface SmoothRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
}

const SmoothReveal = ({ 
  children, 
  delay = 0, 
  className = "",
  direction = "up"
}: SmoothRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(true);
  
  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);
  
  // Calculate initial position values safely
  const initialY = direction === "up" ? 40 : direction === "down" ? -40 : 0;
  const initialX = direction === "left" ? 40 : direction === "right" ? -40 : 0;
  
  const variants = {
    hidden: {
      opacity: 0,
      y: initialY,
      x: initialX,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1], // Custom ease for "surfing" feel
        delay: delay || 0
      }
    }
  };

  // Don't render if unmounted
  if (!isMounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      variants={variants}
      className={`${className} will-change-transform`}
    >
      {children}
    </motion.div>
  );
};

export default SmoothReveal;

