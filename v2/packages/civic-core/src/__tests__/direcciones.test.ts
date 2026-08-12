import { describe, expect, it } from 'vitest';

import {
  TIPOS_CON_TECHO_DE_DIRECCION,
  clasificarAltura,
  componerDireccion,
  direccionOlvidada,
  direccionPermitida,
  direccionSinAltura,
  etiquetaDeDireccion,
  normalizarNombreDeCalle,
  normalizarNombreDeLugar,
  permisoMasRestrictivo,
  rangoDeAltura,
  techoDeTipo,
  ubicacionPublicable,
} from '../direcciones.js';

import {
  ALBERDI,
  PERMISOS_CONOCIDOS,
  RANGO_COMPLETO,
  SENSIBILIDADES,
  SIN_RANGO,
  TIPOS,
  entrada,
  precisionReal,
} from './_direcciones.js';

import type {
  DireccionEstado,
  PermisoDireccion,
  RangoDeAltura,
  TipoConTechoDeDireccion,
} from '../direcciones.js';
import type { CivicSensitivity, LocationRole } from '../types.js';

describe('normalizarNombreDeLugar', () => {
  it('saca los diacríticos y deja el nombre en mayúsculas', () => {
    expect(normalizarNombreDeLugar('josé maría moreno')).toBe('JOSE MARIA MORENO');
    expect(normalizarNombreDeLugar('Ñuñorco')).toBe('NUNORCO');
    expect(normalizarNombreDeLugar('Río Cuarto')).toBe('RIO CUARTO');
  });

  it('elimina los metacaracteres antes de que toquen un LIKE', () => {
    expect(normalizarNombreDeLugar('%')).toBe('');
    expect(normalizarNombreDeLugar('jose_maria%')).toBe('JOSEMARIA');
    expect(normalizarNombreDeLugar('AV. SAN MARTIN')).toBe('AV SAN MARTIN');
  });

  it('colapsa los espacios y recorta los bordes', () => {
    expect(normalizarNombreDeLugar('  25   de\tmayo \n')).toBe('25 DE MAYO');
  });

  it('la ñ en NFD y en NFC dan lo mismo', () => {
    const nfc = 'Cañuelas'.normalize('NFC');
    const nfd = 'Cañuelas'.normalize('NFD');
    expect(nfc).not.toBe(nfd);
    expect(normalizarNombreDeLugar(nfd)).toBe(normalizarNombreDeLugar(nfc));
  });
});

describe('normalizarNombreDeCalle', () => {
  it('saca la categoría cuando es el primer token completo', () => {
    expect(normalizarNombreDeCalle('AV JOSE MARIA MORENO', ['AV'])).toBe('JOSE MARIA MORENO');
    expect(normalizarNombreDeCalle('CALLE S N', ['CALLE', 'AV'])).toBe('S N');
  });

  it('no toca el nombre cuando la categoría no está adelante', () => {
    expect(normalizarNombreDeCalle('FARADAY', ['CALLE'])).toBe('FARADAY');
    expect(normalizarNombreDeCalle('JOSE MARIA MORENO', ['AV'])).toBe('JOSE MARIA MORENO');
  });

  it('no deja la cadena vacía cuando el nombre entero es su categoría', () => {
    // `nombre_norm` es NOT NULL: una cadena vacía reventaría el INSERT.
    expect(normalizarNombreDeCalle('CALLE', ['CALLE'])).toBe('CALLE');
    expect(normalizarNombreDeCalle('av', ['AV'])).toBe('AV');
  });

  it('sin categorías se comporta como el normalizador de lugar', () => {
    expect(normalizarNombreDeCalle('Av. José María Moreno', [])).toBe('AV JOSE MARIA MORENO');
  });
});

describe('rangoDeAltura — el cero de georef es «no sé»', () => {
  it('los cuatro ceros de Córdoba dan ausente', () => {
    expect(rangoDeAltura({ inicio: [0, 0], fin: [0, 0] })).toEqual<RangoDeAltura>({
      tipo: 'ausente',
    });
  });

  it('sólo el fin conocido da parcialHasta, con el máximo de los dos lados', () => {
    expect(rangoDeAltura({ inicio: [0, 0], fin: [3199, 3200] })).toEqual<RangoDeAltura>({
      tipo: 'parcialHasta',
      hasta: 3200,
    });
  });

  it('sólo el inicio conocido da parcialDesde, con el mínimo de los dos lados', () => {
    expect(rangoDeAltura({ inicio: [802, 801], fin: [0, 0] })).toEqual<RangoDeAltura>({
      tipo: 'parcialDesde',
      desde: 801,
    });
  });

  it('los dos extremos conocidos dan el rango completo', () => {
    expect(rangoDeAltura({ inicio: [1301, 1302], fin: [1599, 1600] })).toEqual<RangoDeAltura>({
      tipo: 'completo',
      desde: 1301,
      hasta: 1600,
    });
  });

  it('un rango invertido no se acomoda: se descarta entero', () => {
    // Es una contradicción de la fuente y no se puede saber cuál de los dos
    // números está mal. Afirmar cualquiera de las dos lecturas sería inventar.
    expect(rangoDeAltura({ inicio: [5000], fin: [100] })).toEqual<RangoDeAltura>({
      tipo: 'ausente',
    });
  });

  it('los faltantes y los no finitos no entran como altura', () => {
    expect(rangoDeAltura({ inicio: [null, undefined], fin: [Number.NaN] })).toEqual<RangoDeAltura>({
      tipo: 'ausente',
    });
  });
});

describe('clasificarAltura — la tabla completa de A §4.5', () => {
  const casos: readonly [RangoDeAltura, number, DireccionEstado][] = [
    [RANGO_COMPLETO, 1450, 'altura_en_rango'],
    [RANGO_COMPLETO, 2000, 'altura_fuera_de_rango'],
    [ALBERDI, 4000, 'altura_fuera_de_rango'],
    [ALBERDI, 100, 'altura_sin_rango'],
    [{ tipo: 'parcialDesde', desde: 801 }, 400, 'altura_fuera_de_rango'],
    [{ tipo: 'parcialDesde', desde: 801 }, 5000, 'altura_sin_rango'],
    [SIN_RANGO, 1234, 'altura_sin_rango'],
  ];

  /**
   * `clasificarAltura` valida antes de clasificar y por eso devuelve una unión:
   * el estado se lee de la rama `clasificada` y no existe para un número que no
   * es altura. Esa mitad la cubre `direcciones-altura.test.ts`; acá se mira la
   * tabla del rango, que es sobre alturas que sí lo son.
   */
  const estadoDe = (rango: RangoDeAltura, altura: number): DireccionEstado | 'rechazada' => {
    const salida = clasificarAltura(rango, altura);
    return salida.tipo === 'clasificada' ? salida.estado : 'rechazada';
  };

  for (const [rango, altura, esperado] of casos) {
    const nombre =
      rango.tipo === 'completo' ? `completo ${rango.desde}-${rango.hasta}` : rango.tipo;
    it(`${nombre} con ${altura} da ${esperado}`, () => {
      expect(estadoDe(rango, altura)).toBe(esperado);
    });
  }

  it('los bordes del rango completo están adentro', () => {
    expect(estadoDe(RANGO_COMPLETO, 1301)).toBe('altura_en_rango');
    expect(estadoDe(RANGO_COMPLETO, 1600)).toBe('altura_en_rango');
    expect(estadoDe(RANGO_COMPLETO, 1300)).toBe('altura_fuera_de_rango');
    expect(estadoDe(RANGO_COMPLETO, 1601)).toBe('altura_fuera_de_rango');
  });
});

describe('direccionPermitida — el piso por rol y sensibilidad', () => {
  // El piso no tiene nombre público a propósito (una sola puerta de tres ejes),
  // así que se lo mira a través de `basta`, cuyo techo es `completa`: con el
  // techo arriba de todo, el mínimo ES el piso.
  const piso = (role: LocationRole, sensitivity: CivicSensitivity): PermisoDireccion =>
    direccionPermitida('basta', role, sensitivity);

  it('una cosa en un lugar lleva calle, altura y texto', () => {
    expect(piso('capture', 'high')).toBe('completa');
    expect(piso('meeting_point', 'high')).toBe('completa');
  });

  it('un ámbito no es una puerta: service_area lleva la calle y nada más', () => {
    for (const sensibilidad of SENSIBILIDADES) {
      expect(piso('service_area', sensibilidad)).toBe('solo_calle');
    }
  });

  it('el lugar de una persona con sensibilidad alta no lleva ninguna dirección', () => {
    expect(piso('subject', 'high')).toBe('ninguna');
  });

  it('«es mi casa» conserva la calle: la fila del medio existe de verdad', () => {
    // Con subject ⇒ high esta fila era código muerto, y un ¡BASTA! sobre tu
    // propio techo que se llueve perdía la dirección entera.
    expect(piso('subject', 'moderate')).toBe('solo_calle');
    expect(piso('subject', 'low')).toBe('solo_calle');
  });

  it('un rol o una sensibilidad que no están en el vocabulario no publican nada', () => {
    // Llegan del cuerpo de una request y los tipos se borran en runtime. La
    // versión vieja caía en la rama de `subject` y devolvía `solo_calle`.
    const rolRaro = 'observador' as unknown as LocationRole;
    const sensibilidadRara = 'media' as unknown as CivicSensitivity;
    expect(piso(rolRaro, 'low')).toBe('ninguna');
    expect(piso('subject', sensibilidadRara)).toBe('ninguna');
    expect(piso(rolRaro, sensibilidadRara)).toBe('ninguna');
  });

  it('el piso por rol no se exporta: la única puerta es la de tres ejes', async () => {
    // La forma del arreglo, afirmada. Mientras hubo dos funciones y el contrato
    // nombró a la de dos ejes, el error estaba desalentado y no impedido.
    const exportados = Object.keys(await import('../index.js'));
    expect(exportados).toContain('direccionPermitida');
    expect(exportados).not.toContain('direccionPermitidaParaTipo');
    expect(exportados).not.toContain('pisoPorRol');
    // Y la tabla cruda tampoco: `TECHO_POR_TIPO[tipo]` era el camino que
    // devolvía `undefined` sin que el compilador lo viera.
    expect(exportados).not.toContain('TECHO_POR_TIPO');
    expect(direccionPermitida).toHaveLength(3);
  });
});

describe('el techo por tipo', () => {
  it('los nueve tipos tienen fila', () => {
    expect([...TIPOS_CON_TECHO_DE_DIRECCION].sort()).toEqual([...TIPOS].sort());
  });

  it('las claves están en NFC', () => {
    // `'sueño'` en NFC y en NFD son dos strings distintos y JavaScript no los
    // iguala: en una clave de catálogo eso es un tipo que no matchea nunca.
    for (const clave of TIPOS_CON_TECHO_DE_DIRECCION) {
      expect(clave).toBe(clave.normalize('NFC'));
    }
  });

  it('lo que habla de una cosa lleva altura; lo que habla de alguien, no', () => {
    expect(techoDeTipo('basta')).toEqual({ reconocido: true, techo: 'completa' });
    expect(techoDeTipo('recurso')).toEqual({ reconocido: true, techo: 'completa' });
    expect(techoDeTipo('práctica')).toEqual({ reconocido: true, techo: 'completa' });
    expect(techoDeTipo('compromiso')).toEqual({ reconocido: true, techo: 'completa' });
    expect(techoDeTipo('necesidad')).toEqual({ reconocido: true, techo: 'solo_calle' });
    expect(techoDeTipo('saber')).toEqual({ reconocido: true, techo: 'solo_calle' });
    expect(techoDeTipo('sueño')).toEqual({ reconocido: true, techo: 'solo_calle' });
    expect(techoDeTipo('propuesta')).toEqual({ reconocido: true, techo: 'solo_calle' });
    expect(techoDeTipo('pregunta')).toEqual({ reconocido: true, techo: 'solo_calle' });
  });

  it('la misma palabra en NFD y en NFC resuelve al mismo techo', () => {
    // Un cliente iOS manda `'práctica'` sin querer: la misma palabra en
    // pantalla y otro string para JavaScript. Con la búsqueda cruda daba
    // `undefined` y el `undefined` terminaba abriendo el permiso, no cerrándolo.
    const nfd = 'práctica';
    const nfc = 'práctica';
    expect(nfd).not.toBe(nfc);
    expect(nfd.normalize('NFC')).toBe(nfc);
    expect(techoDeTipo(nfd)).toEqual(techoDeTipo(nfc));
    expect(techoDeTipo(nfd)).toEqual({ reconocido: true, techo: 'completa' });

    const suenoNfd = 'sueño';
    expect(suenoNfd).not.toBe('sueño');
    expect(techoDeTipo(suenoNfd)).toEqual({ reconocido: true, techo: 'solo_calle' });

    // Y la puerta de tres ejes hereda la normalización.
    const tipoNfd = nfd as unknown as TipoConTechoDeDireccion;
    expect(direccionPermitida(tipoNfd, 'capture', 'low')).toBe('completa');
  });

  it('un tipo que no está en la tabla se dice, no se adivina', () => {
    expect(techoDeTipo('chamuyo')).toEqual({ reconocido: false });
    expect(techoDeTipo('')).toEqual({ reconocido: false });
    // «no está en la tabla» y «está y no permite nada» son afirmaciones
    // distintas, y sólo una habilita rechazar en el borde en vez de degradar.
    expect(techoDeTipo('necesidad')).not.toEqual({ reconocido: false });
  });

  it('la clase de señal que da nombre a la métrica norte nunca lleva altura', () => {
    const salida = ubicacionPublicable(entrada({ tipo: 'necesidad' }));
    expect(salida.altura).toBeNull();
    expect(salida.estado).toBe('calle');
  });

  it('el permiso efectivo nunca amplía', () => {
    expect(permisoMasRestrictivo('completa', 'solo_calle')).toBe('solo_calle');
    expect(permisoMasRestrictivo('ninguna', 'completa')).toBe('ninguna');
    // Ningún tipo sube lo que el rol bajó...
    expect(direccionPermitida('basta', 'subject', 'high')).toBe('ninguna');
    // ...y ningún rol sube lo que el tipo no admite.
    expect(direccionPermitida('saber', 'capture', 'low')).toBe('solo_calle');
  });

  it('permisoMasRestrictivo ante lo que no reconoce devuelve el más restrictivo', () => {
    // `PERMISOS.indexOf(a)` daba `-1`, `-1 >= 0` es falso, y la función
    // devolvía `b`: el permiso MENOS restrictivo. Es el mismo pecado del `0`
    // de georef, en una función que decide cuánto se publica.
    const raro = 'lo_que_sea' as unknown as PermisoDireccion;
    for (const conocido of PERMISOS_CONOCIDOS) {
      expect(permisoMasRestrictivo(raro, conocido)).toBe('ninguna');
      expect(permisoMasRestrictivo(conocido, raro)).toBe('ninguna');
    }
    expect(permisoMasRestrictivo(raro, raro)).toBe('ninguna');
  });

  it('sobre la escala entera sigue siendo el mínimo, y es conmutativo', () => {
    for (const a of PERMISOS_CONOCIDOS) {
      for (const b of PERMISOS_CONOCIDOS) {
        expect(permisoMasRestrictivo(a, b)).toBe(permisoMasRestrictivo(b, a));
      }
    }
    expect(permisoMasRestrictivo('completa', 'completa')).toBe('completa');
    expect(permisoMasRestrictivo('solo_calle', 'ninguna')).toBe('ninguna');
    expect(permisoMasRestrictivo('solo_calle', 'solo_calle')).toBe('solo_calle');
  });

  it('un tipo desconocido no publica dirección, y el recibo no inventa el motivo', () => {
    const tipoRaro = 'chamuyo' as unknown as TipoConTechoDeDireccion;
    expect(direccionPermitida(tipoRaro, 'capture', 'low')).toBe('ninguna');

    const salida = ubicacionPublicable(entrada({ tipo: tipoRaro }));
    expect(salida.estado).toBe('sin_direccion');
    expect(salida.calleId).toBeNull();
    expect(salida.altura).toBeNull();
    expect(salida.retirado).toContain('no reconocemos el tipo');
    // Y no la frase del lugar de una persona, que sería una explicación
    // inventada de una decisión correcta.
    expect(salida.retirado).not.toContain('una persona');
  });

  it('un rol desconocido tampoco publica dirección, y el recibo tampoco lo inventa', () => {
    // El eje del rol había quedado sin la cortesía del eje del tipo: un ¡BASTA!
    // sobre un pozo, cargado con un rol que no existe, recibía «esta señal
    // habla del lugar donde vive o está una persona». La decisión de no
    // publicar es correcta; el motivo era inventado.
    const rolRaro = 'jefe' as unknown as LocationRole;
    expect(direccionPermitida('basta', rolRaro, 'low')).toBe('ninguna');

    const salida = ubicacionPublicable(entrada({ tipo: 'basta', role: rolRaro }));
    expect(salida.estado).toBe('sin_direccion');
    expect(salida.calleId).toBeNull();
    expect(salida.altura).toBeNull();
    expect(salida.retirado).toContain('no reconocemos qué es este lugar');
    expect(salida.retirado).not.toContain('una persona');
  });

  it('una sensibilidad desconocida cae por el mismo lado que el rol', () => {
    // El piso es una sola respuesta a los dos ejes juntos: con `subject` y una
    // sensibilidad que no está en la tabla no se sabe cuánto expone, y eso no
    // es lo mismo que saber que expone mucho.
    const sensibilidadRara = 'media' as unknown as CivicSensitivity;
    const salida = ubicacionPublicable(
      entrada({ tipo: 'basta', role: 'subject', sensitivity: sensibilidadRara }),
    );
    expect(salida.estado).toBe('sin_direccion');
    expect(salida.retirado).toContain('no reconocemos qué es este lugar');
    expect(salida.retirado).not.toContain('una persona');
  });

  it('con el tipo y el rol en el vocabulario el recibo sí habla de la persona', () => {
    // La tercera rama, que es la única que afirma algo sobre lo que la señal
    // dice. Si las tres dijeran esto, el arreglo no serviría de nada.
    const salida = ubicacionPublicable(
      entrada({ tipo: 'basta', role: 'subject', sensitivity: 'high' }),
    );
    expect(salida.estado).toBe('sin_direccion');
    expect(salida.retirado).toBe(
      'No publicamos la dirección: esta señal habla del lugar donde vive o está una persona.',
    );
  });
});

describe('ubicacionPublicable', () => {
  it('sin punto y con calle escrita a mano, la dirección vuelve entera', () => {
    // Córdoba, sin GPS: el caso emblemático de la spec, y el que un diseño
    // llaveado en `LocationPrecision` borraba en silencio.
    const salida = ubicacionPublicable(
      entrada({
        rango: SIN_RANGO,
        precision: precisionReal('province', 'capture', 'low'),
      }),
    );
    expect(salida).toEqual({
      calleId: 77,
      altura: 1450,
      estado: 'altura_sin_rango',
      cityId: 3040,
      departmentId: 512,
      retirado: null,
    });
  });

  it('con la protección corrida se retira la dirección y también la localidad', () => {
    const salida = ubicacionPublicable(
      entrada({
        tipo: 'necesidad',
        role: 'subject',
        sensitivity: 'high',
        hayPunto: true,
        precision: precisionReal('exact', 'subject', 'high'),
      }),
    );
    expect(salida.estado).toBe('sin_direccion');
    expect(salida.calleId).toBeNull();
    expect(salida.cityId).toBeNull();
    expect(salida.departmentId).toBe(512);
    expect(salida.retirado).toContain('lugar donde vive o está una persona');
  });

  it('un techo de solo calle guarda la calle y dice qué se retiró', () => {
    const salida = ubicacionPublicable(entrada({ tipo: 'saber', role: 'service_area' }));
    expect(salida.estado).toBe('calle');
    expect(salida.altura).toBeNull();
    expect(salida.retirado).toBe(
      'No publicamos la altura: esta señal habla del lugar de una persona.',
    );
  });

  it('sobre un ámbito el recibo no dice «de una persona»', () => {
    // Un comedor que atiende diez cuadras no es la casa de nadie: explicar mal
    // una decisión correcta también es un defecto.
    const salida = ubicacionPublicable(entrada({ tipo: 'recurso', role: 'service_area' }));
    expect(salida.estado).toBe('calle');
    expect(salida.retirado).toContain('un ámbito no es una puerta');
  });

  it('una altura sin calle del catálogo no se guarda sola', () => {
    const salida = ubicacionPublicable(
      entrada({ direccion: { calleId: null, altura: 1450, textoLibre: null } }),
    );
    expect(salida.estado).toBe('sin_direccion');
    expect(salida.altura).toBeNull();
    expect(salida.retirado).toContain('no elegiste una calle');
  });

  it('con punto engrosado la altura cae, aunque nadie esté protegido', () => {
    // El engrosado puede venir de que la persona pidió menos precisión. Una
    // altura al lado de un punto de 500 m lo vuelve a afinar.
    const salida = ubicacionPublicable(
      entrada({ hayPunto: true, precision: precisionReal('500m', 'capture', 'low') }),
    );
    expect(salida.estado).toBe('calle');
    expect(salida.altura).toBeNull();
    expect(salida.retirado).toContain('engrosado');
  });

  it('con punto exacto la altura sobrevive', () => {
    const salida = ubicacionPublicable(
      entrada({ hayPunto: true, precision: precisionReal('exact', 'capture', 'low') }),
    );
    expect(salida.estado).toBe('altura_en_rango');
    expect(salida.altura).toBe(1450);
  });

  it('el texto libre sobrevive sólo cuando el techo es completo', () => {
    const conTecho = ubicacionPublicable(
      entrada({
        direccion: { calleId: null, altura: null, textoLibre: 'Pasillo 3, casilla 14' },
        rango: SIN_RANGO,
      }),
    );
    expect(conTecho.estado).toBe('texto_libre');

    const sinTecho = ubicacionPublicable(
      entrada({
        tipo: 'necesidad',
        direccion: { calleId: null, altura: null, textoLibre: 'Pasillo 3, casilla 14' },
        rango: SIN_RANGO,
      }),
    );
    expect(sinTecho.estado).toBe('sin_direccion');
    expect(sinTecho.retirado).toContain('escrita a mano');
  });

  it('una señal sin dirección no genera recibo de retiro', () => {
    const salida = ubicacionPublicable(
      entrada({
        tipo: 'necesidad',
        role: 'subject',
        sensitivity: 'high',
        direccion: { calleId: null, altura: null, textoLibre: null },
      }),
    );
    expect(salida.estado).toBe('sin_direccion');
    expect(salida.retirado).toBeNull();
  });
});

describe('componerDireccion', () => {
  it('compone calle y altura cuando el estado las admite', () => {
    expect(
      componerDireccion({
        estado: 'altura_en_rango',
        nombreCalle: 'AV JOSE MARIA MORENO',
        altura: 1450,
        textoLibre: null,
      }),
    ).toBe('AV JOSE MARIA MORENO 1450');
  });

  it('con estado calle no compone la altura aunque se la pasen', () => {
    expect(
      componerDireccion({
        estado: 'calle',
        nombreCalle: 'AV JOSE MARIA MORENO',
        altura: 1450,
        textoLibre: null,
      }),
    ).toBe('AV JOSE MARIA MORENO');
  });

  it('con estado sin_direccion no compone nada', () => {
    expect(
      componerDireccion({
        estado: 'sin_direccion',
        nombreCalle: 'AV JOSE MARIA MORENO',
        altura: 1450,
        textoLibre: 'Pasillo 3',
      }),
    ).toBeNull();
  });

  /**
   * El tope se mide ANTES de pegar el número.
   *
   * `geo_calles.nombre` es `text` sin tope y el largo entra desde el catálogo
   * del Estado, no desde la persona: el que puede traer un nombre así es el
   * seed, no un usuario. Con nombres argentinos reales esto no se alcanza —y
   * por eso ningún test lo miraba.
   */
  describe('el número entra entero o no entra', () => {
    /** Un nombre de calle de `n` caracteres, sin un solo dígito adentro. */
    const calleDe = (n: number): string => `AVENIDA ${'A'.repeat(n - 8)}`;

    it('con el compuesto justo en el tope, la altura entra', () => {
      const calle = calleDe(115);
      expect(
        componerDireccion({
          estado: 'altura_en_rango',
          nombreCalle: calle,
          altura: 1450,
          textoLibre: null,
        }),
      ).toBe(`${calle} 1450`);
    });

    it('un caracter más y vuelve sólo la calle, no un número partido', () => {
      // Medido: con 116 caracteres de nombre y altura 1450, recortar a 120
      // DESPUÉS de pegar dejaba `…AA 145`. La fila afirmaba la puerta 145
      // mientras la columna `altura` decía 1450.
      const calle = calleDe(116);
      const texto = componerDireccion({
        estado: 'altura_en_rango',
        nombreCalle: calle,
        altura: 1450,
        textoLibre: null,
      });
      expect(texto).toBe(calle);
      expect(texto).not.toContain('145');
    });

    it('con el nombre más largo que el tope, tampoco se cuela un pedazo del número', () => {
      const texto = componerDireccion({
        estado: 'altura_sin_rango',
        nombreCalle: calleDe(200),
        altura: 1450,
        textoLibre: null,
      });
      expect(texto).toBe(calleDe(200).slice(0, 120));
      expect(texto).not.toMatch(/[0-9]/);
    });

    it('ninguna longitud deja un número a medias', () => {
      // El barrido, que es lo que un caso suelto no puede afirmar: o el texto
      // termina con la altura ENTERA, o no tiene un solo dígito.
      const partidos: string[] = [];
      for (let largo = 100; largo <= 130; largo += 1) {
        for (const altura of [1, 9, 1450, 99999]) {
          const texto =
            componerDireccion({
              estado: 'altura_fuera_de_rango',
              nombreCalle: calleDe(largo),
              altura,
              textoLibre: null,
            }) ?? '';
          const entera = texto.endsWith(` ${String(altura)}`);
          const sinDigitos = !/[0-9]/.test(texto);
          if (!entera && !sinDigitos)
            partidos.push(`${String(largo)}/${String(altura)} → ${texto}`);
          expect(texto.length).toBeLessThanOrEqual(120);
        }
      }
      expect(partidos).toEqual([]);
    });
  });

  it('el texto libre entra íntegro y recortado a 120', () => {
    expect(
      componerDireccion({
        estado: 'texto_libre',
        nombreCalle: null,
        altura: null,
        textoLibre: '  Barrio Nuevo, manzana 4  ',
      }),
    ).toBe('Barrio Nuevo, manzana 4');

    const largo = 'A'.repeat(200);
    expect(
      componerDireccion({
        estado: 'texto_libre',
        nombreCalle: null,
        altura: null,
        textoLibre: largo,
      })?.length,
    ).toBe(120);
  });
});

/**
 * §4.5, y la única invariante de §2.6 que la base no puede defender sola.
 *
 * **Este bloque no verifica una garantía: la reemplaza.** El comentario del
 * módulo decía que `componerDireccion` sólo acepta un `DireccionEstado` y que
 * el único que produce uno es `ubicacionPublicable` — y es falso:
 * `DireccionEstado` es una unión de literales de string y el compilador no
 * tiene cómo saber de dónde salió el que le pasan. Lo que sostiene el orden es
 * esto: la secuencia documentada, y un test que compone en los dos órdenes y
 * muestra qué sale de cada uno.
 */
describe('la secuencia de §4.5, que el compilador no impide', () => {
  const CARGADO = { calleId: 77, altura: 1450, textoLibre: null };

  const degradada = () =>
    ubicacionPublicable(
      entrada({
        tipo: 'necesidad',
        role: 'subject',
        sensitivity: 'moderate',
        direccion: CARGADO,
      }),
    );

  it('componer sobre lo que salió del paso 3 no deja la altura en el texto', () => {
    const salida = degradada();
    expect(salida.altura).toBeNull();
    const texto = componerDireccion({
      estado: salida.estado,
      nombreCalle: '25 DE MAYO',
      altura: salida.altura,
      textoLibre: null,
    });
    expect(texto).toBe('25 DE MAYO');
    expect(texto).not.toContain('1450');
  });

  it('componer sobre lo CARGADO sí la deja, y compila igual: por eso el orden va numerado', () => {
    // Invertir los pasos 3 y 4 deja una fila con `altura IS NULL` y con
    // «25 DE MAYO 1450» adentro de `direccion_texto`, que sale por la API
    // pública y por el volcado. Nada en el sistema de tipos lo impide.
    const invertido = componerDireccion({
      estado: 'altura_en_rango',
      nombreCalle: '25 DE MAYO',
      altura: CARGADO.altura,
      textoLibre: null,
    });
    expect(invertido).toBe('25 DE MAYO 1450');
    expect(degradada().altura).toBeNull();
  });

  it('el módulo no exporta ninguna forma de acuñar un estado: sólo el vocabulario', async () => {
    // Si algún día se marca el tipo de verdad, este test es el que hay que
    // cambiar — y el comentario del módulo, con él.
    const exportados = Object.keys(await import('../index.js'));
    expect(exportados).toContain('componerDireccion');
    expect(exportados).toContain('ubicacionPublicable');
    // `direccionOlvidada` produce un `DireccionEstado` sin pasar por el paso 3,
    // en este mismo módulo: el segundo productor que la frase vieja negaba.
    expect(direccionOlvidada().estado).toBe('sin_direccion');
  });
});

describe('direccionSinAltura', () => {
  it('recorta el número del final y no los del nombre', () => {
    expect(direccionSinAltura({ direccionTexto: '25 DE MAYO 1450', altura: 1450 })).toBe(
      '25 DE MAYO',
    );
    expect(direccionSinAltura({ direccionTexto: 'AV 9 DE JULIO 9', altura: 9 })).toBe(
      'AV 9 DE JULIO',
    );
  });

  it('sin altura devuelve el texto tal como está guardado', () => {
    expect(direccionSinAltura({ direccionTexto: 'PASILLO 3', altura: null })).toBe('PASILLO 3');
    expect(direccionSinAltura({ direccionTexto: null, altura: 1450 })).toBeNull();
  });

  it('con el texto y la altura desacoplados no devuelve el texto crudo', () => {
    // El defecto: `if (!texto.endsWith(sufijo)) return texto` devolvía el
    // número entero al volcado. Un desacople de UNA unidad —una fila editada a
    // mano, una altura corregida sin recomponer el texto— publicaba la altura.
    const desacoplada = direccionSinAltura({ direccionTexto: '25 DE MAYO 1451', altura: 1450 });
    expect(desacoplada).toBe('25 DE MAYO');
    expect(desacoplada).not.toContain('1451');
    expect(desacoplada).not.toContain('1450');

    // Y el corte de rescate sigue siendo por token completo y anclado al final.
    expect(direccionSinAltura({ direccionTexto: 'AV 9 DE JULIO 9', altura: 1450 })).toBe(
      'AV 9 DE JULIO',
    );
  });

  it('cuando no puede garantizar que sacó la altura no publica nada', () => {
    // El texto no tiene la forma `<calle> <número>` que esta función sabe
    // acortar. No hay dónde estar seguro de que la altura no está adentro, y
    // «nada» es un resultado; el texto crudo no lo es.
    expect(
      direccionSinAltura({ direccionTexto: 'PASILLO DEL FONDO CASILLA 14 BIS', altura: 1450 }),
    ).toBeNull();
    // Ni siquiera cuando la altura está textualmente adentro pero no al final.
    expect(direccionSinAltura({ direccionTexto: 'ATRAS DEL 1450 DEL PASAJE', altura: 1450 })).toBe(
      null,
    );
    // Un texto que es sólo el número no deja calle que rescatar.
    expect(direccionSinAltura({ direccionTexto: '1450', altura: 1450 })).toBeNull();
    // Espacio de sobra al final: el último token es vacío, no un número.
    expect(direccionSinAltura({ direccionTexto: '25 DE MAYO 1450 ', altura: 1450 })).toBeNull();
  });

  it('ninguna salida contiene la altura de la fila', () => {
    // La guarda entera de §7.3, sobre los desacoples que se nos ocurrieron y
    // sobre el camino feliz: la altura NO sale al volcado, nunca.
    const textos = [
      '25 DE MAYO 1450',
      '25 DE MAYO 1451',
      'AV JOSE MARIA MORENO 1450',
      '1450',
      '1450 25 DE MAYO',
      'PASILLO 1450 DEL FONDO',
      'PASILLO DEL FONDO',
      '25 DE MAYO 1450 ',
      ' 1450',
    ];
    const conLaAltura: string[] = [];
    for (const direccionTexto of textos) {
      for (const altura of [1450, 9, 1]) {
        const salida = direccionSinAltura({ direccionTexto, altura });
        if (salida?.endsWith(String(altura)) === true) {
          conLaAltura.push(`${direccionTexto} / ${altura} → ${salida}`);
        }
      }
    }
    expect(conLaAltura).toEqual([]);
  });
});

describe('etiquetaDeDireccion', () => {
  it('devuelve las cinco frases de A §6', () => {
    expect(etiquetaDeDireccion('altura_en_rango')).toBe(
      'la altura está dentro de la numeración que publica el callejero',
    );
    expect(etiquetaDeDireccion('altura_sin_rango')).toBe(
      'el Estado no publica la numeración de esta calle',
    );
    expect(etiquetaDeDireccion('altura_fuera_de_rango')).toBe(
      'la altura no coincide con la numeración del callejero',
    );
    expect(etiquetaDeDireccion('calle')).toBe('calle del callejero del Estado, sin altura');
    expect(etiquetaDeDireccion('texto_libre')).toBe(
      'escrito a mano: no está en el callejero del Estado',
    );
  });

  it('una fila sin dirección no tiene etiqueta', () => {
    expect(etiquetaDeDireccion('sin_direccion')).toBeNull();
  });

  it('la del caso mayoritario habla del Estado y no de quien escribió', () => {
    // El 24,2% de las calles tiene rango publicado: `altura_sin_rango` es lo
    // que va a ver la mayoría de la gente.
    const etiqueta = etiquetaDeDireccion('altura_sin_rango');
    expect(etiqueta).toContain('el Estado');
    expect(etiqueta).not.toMatch(/dudos|incorrect|mal escrit|no pudimos/i);
  });
});

describe('direccionOlvidada', () => {
  it('no deja residuo en ninguna columna, tampoco en el texto', () => {
    expect(direccionOlvidada()).toEqual({
      calleId: null,
      altura: null,
      estado: 'sin_direccion',
      direccionTexto: null,
    });
  });
});

describe('direccionSinAltura — el rescate se valida por la salida', () => {
  it('no publica un texto que conserva la altura más adentro', () => {
    // El falsificador de la revisión: cortar el último token deja `MITRE 340`,
    // que sigue nombrando la puerta 340.
    expect(direccionSinAltura({ direccionTexto: 'MITRE 340 PASILLO 12', altura: 340 })).toBeNull();
    expect(
      direccionSinAltura({ direccionTexto: 'SAN MARTIN 1450 PISO 3', altura: 1450 }),
    ).toBeNull();
  });

  it('el camino feliz conserva el número que es parte del nombre de la calle', () => {
    expect(direccionSinAltura({ direccionTexto: 'AV 9 DE JULIO 9', altura: 9 })).toBe(
      'AV 9 DE JULIO',
    );
  });

  it('rescata cuando el corte deja un texto sin la altura', () => {
    expect(direccionSinAltura({ direccionTexto: 'MITRE 1451', altura: 1450 })).toBe('MITRE');
  });
});
