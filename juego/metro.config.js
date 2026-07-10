const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Migraciones de drizzle: los .sql se importan como strings (ver babel.config.js).
config.resolver.sourceExts.push('sql');

// expo-sqlite en web (patrón documentado): el wa-sqlite.wasm entra como asset,
// y el dev server manda COOP/COEP para habilitar SharedArrayBuffer (API sync).
config.resolver.assetExts.push('wasm');

// Upstream bug de expo-sqlite web (57.0.0, sigue en canary): el canal sync
// trunca la longitud de toda respuesta >255 bytes y serializa errores como
// "{}". Redirigimos ese único módulo a una copia corregida y autocontenida
// (src/db/web/WorkerChannel.ts). Sacar cuando upstream lo arregle.
const path = require('path');
const workerChannelCorregido = path.resolve(__dirname, 'src/db/web/WorkerChannel.ts');
const resolveRequestAnterior = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolver = resolveRequestAnterior ?? context.resolveRequest;
  const resuelto = resolver(context, moduleName, platform);
  if (
    platform === 'web' &&
    resuelto?.type === 'sourceFile' &&
    /expo-sqlite[\\/]web[\\/]WorkerChannel\.ts$/.test(resuelto.filePath)
  ) {
    return { type: 'sourceFile', filePath: workerChannelCorregido };
  }
  return resuelto;
};
config.server = config.server ?? {};
const enhanceAnterior = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware, server) => {
  const base = enhanceAnterior ? enhanceAnterior(middleware, server) : middleware;
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    base(req, res, next);
  };
};

module.exports = withNativeWind(config, { input: './src/global.css' });
