import type { CamposCampo } from '~/lib/campo/modelo';

export const CAMPOS: { clave: keyof CamposCampo; etiqueta: string; tipo?: string; max: number }[] =
  [
    { clave: 'titulo', etiqueta: 'Nombre del resultado', max: 160 },
    { clave: 'texto', etiqueta: 'Resumen público y método usado', tipo: 'textarea', max: 4000 },
    { clave: 'url', etiqueta: 'Fuente pública opcional (HTTP o HTTPS)', max: 1500 },
    { clave: 'desde', etiqueta: 'Inicio del período observado', tipo: 'date', max: 10 },
    { clave: 'hasta', etiqueta: 'Fin del período observado', tipo: 'date', max: 10 },
    {
      clave: 'observaciones',
      etiqueta: 'Número de encuentros u observaciones',
      tipo: 'number',
      max: 8,
    },
    { clave: 'ausencias', etiqueta: 'A quiénes faltó escuchar', tipo: 'textarea', max: 4000 },
    {
      clave: 'limites',
      etiqueta: 'Límites del método y de la invitación',
      tipo: 'textarea',
      max: 4000,
    },
    { clave: 'proximoPaso', etiqueta: 'Próximo paso de escucha', tipo: 'textarea', max: 4000 },
  ];
