/**
 * Registro de cssInterop para componentes que NativeWind no conoce de fábrica.
 * Sin esto, className se ignora SILENCIOSAMENTE en ellos (sin warning).
 * Importar antes que cualquier pantalla (primera línea de _layout).
 */
import { cssInterop } from 'nativewind';
import Animated from 'react-native-reanimated';

cssInterop(Animated.View, { className: 'style' });
cssInterop(Animated.Text, { className: 'style' });
cssInterop(Animated.ScrollView, { className: 'style' });
