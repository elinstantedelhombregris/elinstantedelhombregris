import React from 'react';
import {
  ArrowRight,
  Compass,
  Heart,
  Share2,
  Target,
  Users
} from 'lucide-react';

type PowerVariant = 'primary' | 'secondary' | 'accent' | 'outline';
type PowerSize = 'sm' | 'md' | 'lg' | 'xl';

interface PowerCTAProps {
  text: string;
  onClick?: () => void;
  href?: string;
  variant?: PowerVariant;
  size?: PowerSize;
  icon?: React.ReactNode;
  animate?: boolean;
  className?: string;
  disabled?: boolean;
}

const VARIANT_STYLES: Record<PowerVariant, string> = {
  primary:
    'bg-primary text-primary-foreground border border-primary/70 shadow-[0_10px_30px_rgba(100,119,192,0.25)] hover:bg-primary/90',
  secondary:
    'bg-secondary text-secondary-foreground border border-secondary/60 shadow-[0_10px_30px_rgba(47,53,69,0.25)] hover:bg-secondary/85',
  accent:
    'bg-accent text-accent-foreground border border-accent/70 shadow-[0_12px_34px_rgba(125,91,222,0.28)] hover:bg-accent/90',
  outline:
    'bg-transparent text-foreground border border-border hover:bg-foreground/[0.04] shadow-none'
};

const SIZE_STYLES: Record<PowerSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-7 py-3.5 text-lg',
  xl: 'px-8 py-4 text-xl'
};

export default function PowerCTA({
  text,
  onClick,
  href,
  variant = 'primary',
  size = 'md',
  icon,
  animate = true,
  className = '',
  disabled = false
}: PowerCTAProps) {
  const baseStyles = [
    'group relative inline-flex items-center justify-center gap-2 rounded-2xl font-semibold tracking-tight',
    'transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    VARIANT_STYLES[variant],
    SIZE_STYLES[size],
    animate && !disabled ? 'hover:-translate-y-0.5 hover:shadow-lg' : '',
    disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
    className
  ]
    .filter(Boolean)
    .join(' ');

  const getDefaultIcon = () => {
    switch (variant) {
      case 'primary':
        return <Target className="h-5 w-5" />;
      case 'secondary':
        return <Users className="h-5 w-5" />;
      case 'accent':
        return <Heart className="h-5 w-5" />;
      case 'outline':
        return <Share2 className="h-5 w-5" />;
      default:
        return <ArrowRight className="h-5 w-5" />;
    }
  };

  const trailingIcon = animate && !disabled ? (
    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
  ) : null;

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const content = (
    <>
      {icon || getDefaultIcon()}
      <span>{text}</span>
      {trailingIcon}
    </>
  );

  if (href) {
    return (
      <a href={href} className={baseStyles} onClick={handleClick}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={handleClick} disabled={disabled} className={baseStyles}>
      {content}
    </button>
  );
}

export const PredefinedCTAs = {
  '¡BASTA!_NOW': {
    text: 'ACTUAR AHORA',
    variant: 'accent' as const,
    icon: <Compass className="h-5 w-5" />
  },
  DESPERTAR: {
    text: 'DESPERTAR COMO HOMBRE GRIS',
    variant: 'primary' as const,
    icon: <Target className="h-5 w-5" />
  },
  UNIRSE: {
    text: 'UNIRME AL MOVIMIENTO',
    variant: 'secondary' as const,
    icon: <Users className="h-5 w-5" />
  },
  COMPARTIR: {
    text: 'COMPARTIR AHORA',
    variant: 'outline' as const,
    icon: <Share2 className="h-5 w-5" />
  },
  COMPROMETERSE: {
    text: 'FIRMAR MI COMPROMISO',
    variant: 'accent' as const,
    icon: <Heart className="h-5 w-5" />
  },
  ACTUAR: {
    text: 'ACTUAR CON MI TRIBU',
    variant: 'accent' as const,
    icon: <Compass className="h-5 w-5" />
  },
  SEMBRAR_SEMILLA: {
    text: 'SEMBRAR MI SEMILLA',
    variant: 'accent' as const,
    icon: <Heart className="h-5 w-5" />
  },
  DESPERTAR_AHORA: {
    text: 'DESPERTAR AHORA',
    variant: 'primary' as const,
    icon: <Target className="h-5 w-5" />
  },
  CUIDAR_SEMILLA: {
    text: 'CUIDAR MI SEMILLA',
    variant: 'accent' as const,
    icon: <Heart className="h-5 w-5" />
  },
  VER_MAPA: {
    text: 'VER EL MAPA',
    variant: 'outline' as const,
    icon: <Compass className="h-5 w-5" />
  },
  UNIRSE_TRIBU: {
    text: 'UNIRME A LA TRIBU',
    variant: 'secondary' as const,
    icon: <Users className="h-5 w-5" />
  }
};
