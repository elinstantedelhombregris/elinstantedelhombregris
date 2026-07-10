import { View, type ViewProps } from 'react-native';

/**
 * Única card de vidrio de la app (espejo de GLASS_CARD del sitio).
 * Es un tinte, no un blur — barato en Android, idéntico a la web.
 */
export function GlassCard({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={`rounded-2xl bg-white/5 border border-white/10 ${className ?? ''}`}
      {...props}
    />
  );
}
