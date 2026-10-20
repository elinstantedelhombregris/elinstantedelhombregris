/** «Alguien de la Ciudad de Buenos Aires imagina»: el nombre de una provincia en una frase. */
const EN_FRASE: Readonly<Record<string, string>> = {
  'Ciudad Autónoma de Buenos Aires': 'la Ciudad de Buenos Aires',
  'Buenos Aires': 'la provincia de Buenos Aires',
};

export function deDonde(provincia: string | null | undefined): string {
  if (!provincia) return 'la Argentina';
  return EN_FRASE[provincia] ?? provincia;
}

/** El nombre corto para listas y selectores. */
export function nombreCorto(provincia: string): string {
  return provincia === 'Ciudad Autónoma de Buenos Aires' ? 'Ciudad de Buenos Aires' : provincia;
}

/** Una inclinación chica y fija por aporte, de −1,5° a 1,5°: la pila parece de papeles. */
export function giroDe(id: string): number {
  let h = 7;
  for (const ch of id) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
  return ((h % 31) - 15) / 10;
}
