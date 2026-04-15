import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReveal } from '../engine/useReveal';
import { ChevronDown } from 'lucide-react';

interface ChapterTitleProps {
  number: number;
  title: string;
  subtitle: string;
  epigraph?: string;
}

const SPELLED_NUMBERS = ['UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO'];

export function ChapterTitle({ number, title, subtitle, epigraph }: ChapterTitleProps) {
  const { ref, isVisible } = useReveal({ threshold: 0.1 });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const parent = (ref.current as HTMLElement | null)?.closest('.cin-chapter');
      if (parent && parent.scrollTop > 50) {
        setScrolled(true);
      }
    };

    const parent = (ref.current as HTMLElement | null)?.closest('.cin-chapter');
    if (parent) {
      parent.addEventListener('scroll', handleScroll, { passive: true });
      return () => parent.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const spelled = SPELLED_NUMBERS[number - 1] || String(number);

  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="cin-title-screen"
      initial={{ opacity: 0 }}
      animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div className="cin-title-number">CAPÍTULO {spelled}</div>
      <h2 className="cin-title-heading">{title}</h2>
      <div className="cin-title-subtitle">{subtitle}</div>
      {epigraph && (
        <p className="cin-title-epigraph">—{epigraph}—</p>
      )}
      <div
        className={`cin-scroll-indicator ${scrolled ? 'cin-scroll-indicator--hidden' : ''}`}
      >
        <ChevronDown size={24} />
      </div>
    </motion.div>
  );
}
