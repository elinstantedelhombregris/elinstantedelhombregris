import { describe, expect, it } from 'vitest';

import { podar } from '../entrenamientos-poda';

describe('podar', () => {
  it('aplana los encabezados por debajo de h3', () => {
    const { texto } = podar('#### Cuarto\n\n##### Quinto\n\n###### Sexto', { title: 'T' });
    expect(texto).toBe('### Cuarto\n\n### Quinto\n\n### Sexto');
  });

  it('borra el encabezado que repite el título', () => {
    const { texto } = podar('## Mi Título\n\nProsa.', { title: 'Mi Título' });
    expect(texto).toBe('Prosa.');
  });

  it('borra la primera línea si repite el summary', () => {
    const { texto } = podar('Resumen exacto.\n\nProsa.', { title: 'T', summary: 'Resumen exacto.' });
    expect(texto).toBe('Prosa.');
  });

  it('saca los emojis y deja el texto', () => {
    expect(podar('Mirá esto 🔥 acá', { title: 'T' }).texto).toBe('Mirá esto acá');
  });

  it('sube h1 a h2: la página ya pone su propio h1 con el título', () => {
    expect(podar('# Uno\n\nProsa.', { title: 'T' }).texto).toBe('## Uno\n\nProsa.');
  });

  it('no toca h2 ni h3', () => {
    const original = '## Dos\n\n### Tres';
    expect(podar(original, { title: 'T' }).texto).toBe(original);
  });

  it('el keycap se va y el dígito queda', () => {
    // `1⃣` es `1` + U+20E3. El dígito no es Extended_Pictographic, así que
    // sobrevive: la numeración del autor no se pierde. Las ~21 líneas así
    // quedan con punto (`### 1. Reconocer`) a mano, en esta misma tarea.
    expect(podar('#### 1⃣ Reconocer', { title: 'T' }).texto).toBe('### 1 Reconocer');
  });
});
