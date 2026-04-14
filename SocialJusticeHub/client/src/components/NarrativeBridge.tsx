import { motion } from 'framer-motion';
import { fadeUp } from '@/lib/motion-variants';
import { cn } from '@/lib/utils';

interface NarrativeBridgeProps {
  text: string;
  className?: string;
}

const NarrativeBridge = ({ text, className }: NarrativeBridgeProps) => {
  return (
    <section className={cn('py-16 md:py-24 relative overflow-hidden', className)}>
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-purple-600/[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.p
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}
          className="text-lg md:text-xl font-serif italic text-slate-300/80 leading-relaxed text-center max-w-2xl mx-auto"
        >
          {text}
        </motion.p>
      </div>
    </section>
  );
};

export default NarrativeBridge;
