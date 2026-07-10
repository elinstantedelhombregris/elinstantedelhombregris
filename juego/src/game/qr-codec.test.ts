import { describe, expect, it } from 'vitest';
import {
  PREFIJO_CHISPA,
  PREFIJO_EXPED,
  codificarChispa,
  codificarExpedicion,
  decodificarChispa,
  decodificarExpedicion,
  tipoDeQR,
  validarChispa,
} from './qr-codec';
import type { ChispaPayload, ExpedicionPayload } from './qr-codec';

const chispa: ChispaPayload = {
  nonce: 'a1b2c3d4e5f6',
  brasas: 5,
  de: 'Juan',
};

const exped: ExpedicionPayload = {
  plantillaId: 'luminarias',
  zona: 'Parque Patricios',
  meta: 40,
  titulo: 'Luces del barrio',
};

describe('roundtrip', () => {
  it('chispa: codificar → decodificar devuelve el payload idéntico', () => {
    const qr = codificarChispa(chispa);
    expect(qr.startsWith(PREFIJO_CHISPA)).toBe(true);
    expect(decodificarChispa(qr)).toEqual({ ok: true, payload: chispa });
  });

  it('chispa con unicode rioplatense y emojis en el nombre', () => {
    const conUnicode: ChispaPayload = {
      nonce: 'ñandú-12345',
      brasas: 5,
      de: 'Añá 🌟 Ñoño 💫 ¡BASTA!',
    };
    const r = decodificarChispa(codificarChispa(conUnicode));
    expect(r).toEqual({ ok: true, payload: conUnicode });
  });

  it('expedición: roundtrip con zona acentuada', () => {
    const conAcentos: ExpedicionPayload = {
      ...exped,
      zona: 'Villa María — sector güemes',
      titulo: '¿Qué falta acá?',
    };
    const r = decodificarExpedicion(codificarExpedicion(conAcentos));
    expect(r).toEqual({ ok: true, payload: conAcentos });
  });

  it('el QR generado es apto para QR: sin espacios ni caracteres raros', () => {
    const qr = codificarChispa(chispa);
    expect(qr).toMatch(/^basta\.chispa\.v1:[A-Za-z0-9\-_]+$/);
  });
});

describe('rechazos — prefijo y transporte', () => {
  it('prefijo adulterado', () => {
    const qr = codificarChispa(chispa).replace('basta.', 'fake.');
    expect(decodificarChispa(qr).ok).toBe(false);
  });

  it('versión desconocida', () => {
    const qr = codificarChispa(chispa).replace('.v1:', '.v9:');
    expect(decodificarChispa(qr).ok).toBe(false);
  });

  it('un QR de expedición no pasa por el decoder de chispa (y viceversa)', () => {
    expect(decodificarChispa(codificarExpedicion(exped)).ok).toBe(false);
    expect(decodificarExpedicion(codificarChispa(chispa)).ok).toBe(false);
  });

  it('base64 corrupto (caracteres fuera del alfabeto)', () => {
    const r = decodificarChispa(`${PREFIJO_CHISPA}???no-base64???`);
    expect(r).toEqual({ ok: false, error: 'El código está dañado' });
  });

  it('base64 válido pero JSON roto', () => {
    // "hola" en base64url no es JSON.
    const r = decodificarChispa(`${PREFIJO_CHISPA}aG9sYQ`);
    expect(r.ok).toBe(false);
  });

  it('payload truncado (largo imposible de base64)', () => {
    const qr = codificarChispa(chispa);
    // Cortamos a largo % 4 === 1, que ningún base64 real puede tener.
    const cuerpo = qr.slice(PREFIJO_CHISPA.length);
    const truncado = cuerpo.slice(0, 4 * Math.floor((cuerpo.length - 1) / 4) + 1);
    expect(truncado.length % 4).toBe(1);
    expect(decodificarChispa(PREFIJO_CHISPA + truncado).ok).toBe(false);
  });

  it('string vacío y basura total', () => {
    expect(decodificarChispa('').ok).toBe(false);
    expect(decodificarExpedicion('hola').ok).toBe(false);
  });
});

describe('rechazos — forma y cotas', () => {
  it('chispa con brasas ≠ 5 (nadie infla el regalo)', () => {
    const adulterada = { ...chispa, brasas: 500 };
    expect(validarChispa(adulterada)).toBe(false);
    expect(() => codificarChispa(adulterada as unknown as ChispaPayload)).toThrow();
  });

  it('nonce demasiado corto o ausente', () => {
    expect(validarChispa({ nonce: 'ab', brasas: 5, de: 'x' })).toBe(false);
    expect(validarChispa({ brasas: 5, de: 'x' })).toBe(false);
  });

  it('de puede ser vacío pero no faltar ni pasarse de 80', () => {
    expect(validarChispa({ ...chispa, de: '' })).toBe(true);
    expect(validarChispa({ ...chispa, de: 'x'.repeat(81) })).toBe(false);
    expect(validarChispa({ nonce: chispa.nonce, brasas: 5 })).toBe(false);
  });

  it('expedición con meta fuera de cota o no entera', () => {
    expect(() => codificarExpedicion({ ...exped, meta: 0 })).toThrow();
    expect(() => codificarExpedicion({ ...exped, meta: 10001 })).toThrow();
    expect(() => codificarExpedicion({ ...exped, meta: 2.5 })).toThrow();
  });

  it('expedición sin zona o con título vacío', () => {
    expect(() => codificarExpedicion({ ...exped, zona: '' })).toThrow();
    expect(() => codificarExpedicion({ ...exped, titulo: '' })).toThrow();
  });

  it('JSON con forma equivocada (array, número, null)', () => {
    // "[1,2]" / "42" / "null" codificados a mano en base64url:
    for (const cuerpo of ['WzEsMl0', 'NDI', 'bnVsbA']) {
      expect(decodificarChispa(PREFIJO_CHISPA + cuerpo).ok).toBe(false);
      expect(decodificarExpedicion(PREFIJO_EXPED + cuerpo).ok).toBe(false);
    }
  });
});

describe('tipoDeQR', () => {
  it('clasifica chispa, expedición y desconocido', () => {
    expect(tipoDeQR(codificarChispa(chispa))).toBe('chispa');
    expect(tipoDeQR(codificarExpedicion(exped))).toBe('expedicion');
    expect(tipoDeQR('https://basta.ar')).toBeNull();
  });
});
