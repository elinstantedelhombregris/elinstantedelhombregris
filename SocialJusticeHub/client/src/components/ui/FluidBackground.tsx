
import { useEffect, useRef } from "react";

const FluidBackground = ({ className = "" }: { className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create animated gradient using CSS and canvas for smooth performance
    if (!containerRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    containerRef.current.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    let time = 0;

    const animate = () => {
      time += 0.005;
      
      // Create gradient
      const gradient = ctx.createLinearGradient(
        0, 
        0, 
        canvas.width, 
        canvas.height
      );
      
      // Animated color stops for fluid effect
      const offset1 = (Math.sin(time) * 0.1 + 0.5);
      const offset2 = (Math.cos(time * 0.7) * 0.1 + 0.5);
      
      gradient.addColorStop(0, `rgba(224, 242, 254, ${0.3 + Math.sin(time) * 0.1})`);
      gradient.addColorStop(offset1, `rgba(255, 255, 255, ${0.4 + Math.cos(time * 0.5) * 0.1})`);
      gradient.addColorStop(offset2, `rgba(219, 234, 254, ${0.3 + Math.sin(time * 0.8) * 0.1})`);
      gradient.addColorStop(1, `rgba(255, 255, 255, ${0.5 + Math.cos(time * 0.6) * 0.1})`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && canvas.parentNode) {
        containerRef.current.removeChild(canvas);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 -z-10 w-full h-full pointer-events-none ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(224, 242, 254, 0.4) 0%, rgba(255, 255, 255, 0.6) 50%, rgba(219, 234, 254, 0.4) 100%)',
        opacity: 0.6
      }}
    />
  );
};

export default FluidBackground;
