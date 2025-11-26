
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  intensity?: "low" | "medium" | "high";
}

const GlassCard = ({
  children,
  className,
  hoverEffect = true,
  intensity = "medium",
  ...props
}: GlassCardProps) => {
  const intensityStyles = {
    low: "bg-white/30 backdrop-blur-sm border-white/20",
    medium: "bg-white/60 backdrop-blur-md border-white/40",
    high: "bg-white/80 backdrop-blur-lg border-white/60",
  };

  return (
    <motion.div
      className={cn(
        "relative rounded-2xl border shadow-lg overflow-hidden transition-all duration-300",
        intensityStyles[intensity],
        className
      )}
      whileHover={
        hoverEffect
          ? {
              y: -5,
              scale: 1.02,
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            }
          : undefined
      }
      {...props}
    >
      {/* Subtle shine effect on hover */}
      {hoverEffect && (
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      )}
      {children}
    </motion.div>
  );
};

export default GlassCard;

