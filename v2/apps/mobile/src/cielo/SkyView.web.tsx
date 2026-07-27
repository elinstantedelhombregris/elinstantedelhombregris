/**
 * SkyView (web) — patrón documentado de Skia para Expo Web: el componente
 * que usa Skia se importa DIFERIDO detrás de LoadSkiaWeb (CanvasKit wasm),
 * vía WithSkiaWeb. El wasm vive en /public/canvaskit.wasm (copiado del
 * paquete canvaskit-wasm; re-copiar al actualizar Skia).
 */

import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import { View } from 'react-native';

import type { CieloProps } from './CieloCanvas';
import { asegurarPrecisionWebGLParaCanvasKit } from './webgl-compat';

// Debe ejecutarse antes de que WithSkiaWeb inicialice CanvasKit.
asegurarPrecisionWebGLParaCanvasKit();

export type { CieloProps, EstrellaCielo } from './CieloCanvas';

export function SkyView(props: CieloProps) {
  return (
    <WithSkiaWeb
      getComponent={() => import('./CieloCanvas')}
      componentProps={props}
      fallback={
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#0a0a0a',
          }}
        />
      }
      opts={{ locateFile: (archivo: string) => `/${archivo}` }}
    />
  );
}
