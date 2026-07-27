import { Image, Platform, View, type StyleProp, type ViewStyle } from 'react-native';

const GRANO_SVG_RAW =
  "<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'>" +
  "<filter id='grano'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter>" +
  "<rect width='100%' height='100%' filter='url(#grano)'/></svg>";

const GRANO_DATA_URI = `data:image/svg+xml,${encodeURIComponent(GRANO_SVG_RAW)}`;

/**
 * GranoPapel — el grano de papel, overlay fijo, imperceptible de cerca
 * (spec §3.9 / README v2 §10.3). Se monta una vez por pantalla de
 * registro papel; z-index 100, siempre arriba, `pointerEvents:'none'`.
 *
 * Web: SVG feTurbulence como fondo CSS, mix-blend-mode:multiply.
 * Nativo: PNG de ruido 64×64 tileado — react-native-svg NO implementa
 * <feTurbulence> (ver node_modules/react-native-svg/.../filters/FeTurbulence.tsx,
 * que solo llama `warnUnimplementedFilter()` y no dibuja nada), así que acá
 * no hay un único camino SVG posible entre plataformas: el spec ya pide
 * el split papel/nativo explícitamente.
 */
export function GranoPapel() {
  if (Platform.OS === 'web') {
    const estiloWeb = {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      backgroundImage: `url("${GRANO_DATA_URI}")`,
      mixBlendMode: 'multiply',
      opacity: 0.04,
    } as unknown as StyleProp<ViewStyle>;

    return <View pointerEvents="none" style={estiloWeb} />;
  }

  return (
    // Image no acepta `pointerEvents` en su tipo de estilo (solo View) —
    // lo envolvemos para poder ignorar el toque igual.
    <View pointerEvents="none" className="absolute inset-0" style={{ zIndex: 100 }}>
      <Image
        // Ruta relativa (no el alias @/assets/*): Metro resuelve el asset
        // de forma estática a partir del literal del require, y el alias
        // es solo para módulos JS/TS normales.
        source={require('../../../assets/grano-64.png')}
        resizeMode="repeat"
        className="absolute inset-0"
        style={{ opacity: 0.04 }}
      />
    </View>
  );
}
