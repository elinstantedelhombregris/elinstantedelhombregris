import { lazy } from 'react';

export const VisionCompartida = lazy(() =>
  import('~/pages/VisionCompartida').then((m) => ({ default: m.VisionCompartida })),
);

export const Capacidades = lazy(() =>
  import('~/pages/Capacidades').then((m) => ({ default: m.Capacidades })),
);

export const InicioIniciativas = lazy(async () => ({
  default: (await import('~/pages/Iniciativas/Inicio')).InicioIniciativas,
}));
export const EscuchaTerritorial = lazy(async () => ({
  default: (await import('~/pages/EscuchaTerritorial')).EscuchaTerritorial,
}));

export const EjemploIniciativa = lazy(() =>
  import('~/pages/Iniciativas/Ejemplo').then((m) => ({ default: m.EjemploIniciativa })),
);

export const EjemplosFichas = lazy(async () => {
  const m = await import('~/pages/Fichas/ejemplos/Ejemplos');
  return { default: m.EjemplosFichas };
});

export const Campo = lazy(async () => ({ default: (await import('~/pages/Campo')).Campo }));

export const Fuentes = lazy(async () => ({ default: (await import('~/pages/Fuentes')).Fuentes }));

export const ConciliacionTerritorial = lazy(async () => ({
  default: (await import('~/pages/ConciliacionTerritorial')).ConciliacionTerritorial,
}));
export const SintesisNacional = lazy(async () => ({
  default: (await import('~/pages/SintesisNacional')).SintesisNacional,
}));
export const EjemploSintesisNacional = lazy(async () => ({
  default: (await import('~/pages/SintesisNacional/Ejemplo')).EjemploSintesisNacional,
}));
