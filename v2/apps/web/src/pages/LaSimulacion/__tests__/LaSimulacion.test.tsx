import { act, fireEvent, render, screen, within } from '@testing-library/react';
import {
  barrer,
  conVariables,
  correr,
  derivado,
  hipotesis,
  modoForma,
  MINIMO_MUESTRAS,
  type ClaveVariable,
  type Diseno,
  type Persona,
  type SelloDelModelo,
} from '@v2/civic-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LaSimulacion } from '../../LaSimulacion';
import { leerRelojDelHash } from '../diseno-url';
import { CifraPapel } from '../sections/CifraPapel';
import { ElElenco } from '../sections/ElElenco';
import { FichaDePersona } from '../sections/FichaDePersona';
import { Incertidumbre } from '../sections/Incertidumbre';
import { MesaDeVariables } from '../sections/MesaDeVariables';
import { Resultados } from '../sections/Resultados';
import { SelloSintetico } from '../sections/SelloSintetico';
import { TablaDeUmbrales } from '../sections/TablaDeUmbrales';
import { Tornado } from '../sections/Tornado';
import { NOMBRE_DE_VARIABLE } from '../simulacion-lectura';
import { construirPais, disenoPorDefecto } from '../simulacion-pais';

import type { ElencoCargado } from '../elenco-archivos';

/**
 * La Simulación — lo que la spec promete en pantalla
 * (`docs/specs/2026-08-13-el-modulo-de-simulacion.md`).
 *
 * Los fixtures NO son inventados: se corre el motor de verdad en el hilo del
 * test —24 provincias con base vacía son microsegundos por corrida— y se le da
 * a cada sección exactamente lo que le va a llegar en producción. Un fixture a
 * mano prueba que el componente sabe pintar un objeto que alguien escribió a
 * mano; esto prueba que sabe pintar lo que el motor devuelve.
 *
 * Las afirmaciones que se verifican son sobre el producto:
 *
 *  1. una variable que el motor no lee **no da una barra en cero**: da su razón;
 *  2. una hipótesis de modelo **no se lee como un derivado**, y nombra el modelo;
 *  3. el sello de sintético dice «Nadie dijo ninguna de estas cosas»;
 *  4. sin elenco, la pantalla **ofrece el comando** en vez de romperse;
 *  5. el barrido no corre en el hilo de la pantalla, avisa el progreso y se
 *     cancela terminando el worker de verdad.
 */

const AHORA = 1_800_000_000_000;
const pais = construirPais(AHORA);

const SELLO: SelloDelModelo = {
  modelo: 'llama3.1:8b-instruct-q4_K_M',
  digest: 'abc123def4567890',
  temperatura: 0,
  poblacionHuella: 'b208ee34',
  semilla: 7,
  generadaEn: AHORA,
};

/** Corre el motor de verdad. Es lo que le llega a la sección en producción. */
function correrDiseno(metodo: Diseno['metodo']) {
  const base = disenoPorDefecto(pais);
  return barrer({ ...base, metodo }, pais, modoForma, null);
}

describe('el tornado', () => {
  const resultado = correrDiseno({ tipo: 'unaPorVez', pasos: 5 });

  it('una variable que el motor no lee no da una barra en cero: da su razón', () => {
    if (resultado.estado !== 'listo' || resultado.salida.metodo !== 'unaPorVez') {
      throw new Error('el barrido tenía que estar listo');
    }
    render(
      <Tornado
        barras={resultado.salida.barras}
        objetivo="legitimidad"
        formato={(v) => String(v)}
        elegida={null}
        onElegir={() => undefined}
      />,
    );

    // `chispa` es del mecanismo y el modo forma no tiene interacción.
    const fila = screen.getByText('Chispa').closest('li');
    expect(fila).not.toBeNull();
    expect(within(fila as HTMLElement).getByText(/no conectada/i)).toBeInTheDocument();
    expect(within(fila as HTMLElement).queryByRole('button')).toBeNull();
    expect(fila?.querySelector('svg')).toBeNull();
    expect(fila?.textContent).toContain('el modo forma no tiene interacción');
  });

  it('la variable que sí mueve el resultado trae su recorrido en números', () => {
    if (resultado.estado !== 'listo' || resultado.salida.metodo !== 'unaPorVez') {
      throw new Error('el barrido tenía que estar listo');
    }
    render(
      <Tornado
        barras={resultado.salida.barras}
        objetivo="legitimidad"
        formato={(v) => v.toFixed(2)}
        elegida={null}
        onElegir={() => undefined}
      />,
    );
    const fila = screen.getByText('Cuánta gente habla').closest('li');
    expect(fila).not.toBeNull();
    expect(fila?.textContent).toMatch(/→/);
    expect(fila?.querySelector('svg')).not.toBeNull();
  });

  /**
   * El defecto que esto cierra: la lista ordenaba por `amplitud` —el recorrido
   * observado— y el rect se dibujaba de `bajo` a `alto` —los extremos del
   * rango—. Con `participacion = 180`, `constancia = 0,6` y `resistencia = 0`,
   * `horizonte` quedaba SEGUNDA con una barra de 0,600 y `participacion`
   * TERCERA con una de 0,625: el ojo leía lo contrario que la lista.
   */
  it('las barras bajan de largo hacia abajo, y cada una mide su propia amplitud', () => {
    const base = disenoPorDefecto(pais);
    const noMonotono = conVariables(
      base.base,
      new Map<ClaveVariable, number>([
        ['participacion', 180],
        ['constancia', 0.6],
        ['resistencia', 0],
      ]),
    );
    const resultadoNoMonotono = barrer(
      { ...base, base: noMonotono, metodo: { tipo: 'unaPorVez', pasos: 11 } },
      pais,
      modoForma,
      null,
    );
    if (resultadoNoMonotono.estado !== 'listo' || resultadoNoMonotono.salida.metodo !== 'unaPorVez') {
      throw new Error('el barrido tenía que estar listo');
    }
    const barras = resultadoNoMonotono.salida.barras;
    // Sin una barra no monótona el test sería vacuo: es el único caso donde las
    // dos definiciones de «cuánto mueve» dan números distintos.
    expect(barras.some((b) => b.estado === 'medida' && b.monotonia === 'noMonotona')).toBe(true);

    const { container } = render(
      <Tornado
        barras={barras}
        objetivo="legitimidad"
        formato={(v) => v.toFixed(3)}
        elegida={null}
        onElegir={() => undefined}
      />,
    );

    const filas = [...container.querySelectorAll('li')];
    const dibujadas = barras
      .filter((b) => b.estado === 'medida')
      .map((b) => {
        const li = screen.getByText(NOMBRE_DE_VARIABLE[b.clave]).closest('li');
        const rect = li?.querySelector('rect');
        return {
          clave: b.clave,
          posicion: li === null ? -1 : filas.indexOf(li),
          ancho: Number(rect?.getAttribute('width') ?? -1),
          amplitud: b.amplitud.valor,
        };
      })
      .sort((a, b) => a.posicion - b.posicion);

    expect(dibujadas.length).toBeGreaterThan(3);

    // 1. Ninguna fila dibuja una barra más larga que la de arriba: el orden de
    //    la lista y el largo del rect son el mismo hecho.
    for (let i = 1; i < dibujadas.length; i++) {
      const arriba = dibujadas[i - 1];
      const abajo = dibujadas[i];
      if (arriba === undefined || abajo === undefined) continue;
      expect(
        abajo.ancho,
        `«${abajo.clave}» dibuja más largo que «${arriba.clave}», que está arriba suyo`,
      ).toBeLessThanOrEqual(arriba.ancho + 1e-9);
    }

    // 2. Y el largo es proporcional a la amplitud, con la misma escala para
    //    todas: si no, dos barras iguales significarían cosas distintas.
    const conLargo = dibujadas.filter((d) => d.amplitud > 0);
    const escala = conLargo.map((d) => d.ancho / d.amplitud);
    const primera = escala[0];
    expect(primera).toBeDefined();
    for (const e of escala) expect(e).toBeCloseTo(primera ?? 0, 6);
  });
});

describe('la tabla de umbrales', () => {
  it('contesta la pregunta del titular, provincia por provincia', () => {
    const resultado = correrDiseno({
      tipo: 'umbral',
      territorios: ['Chaco', 'Ciudad Autónoma de Buenos Aires'],
    });
    if (resultado.estado !== 'listo' || resultado.salida.metodo !== 'umbral') {
      throw new Error('el barrido tenía que estar listo');
    }
    render(<TablaDeUmbrales salida={resultado.salida} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Chaco')).toBeInTheDocument();
    // Cada fila dice cómo se supo: nunca un número solo.
    expect(screen.getAllByText(/bisección|tope del dominio|mínimo del dominio/i).length).toBeGreaterThan(0);
  });

  /**
   * En el modo gente la participación no es entrada del motor, y la bisección
   * la mueve igual: los dos bordes dan lo mismo y el método concluye
   * `inalcanzable` para las veinticuatro provincias, con la razón «la
   * participación sola no le alcanza». Eso es una afirmación sobre una palanca
   * que nadie leyó, con la forma de un hallazgo — y en pantalla se lee como un
   * resultado del país, no como un límite del instrumento.
   */
  it('en el modo gente no publica veinticuatro veredictos: dice que la pregunta no va acá', () => {
    render(
      <TablaDeUmbrales
        salida={{
          estado: 'sinPalanca',
          razon: 'En el modo gente la forma es SALIDA, no entrada.',
        }}
      />,
    );

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText(/no se puede hacer en este modo/i)).toBeInTheDocument();
    // Y sobre todo: ni una sola afirmación sobre lo que la participación no alcanza.
    expect(screen.queryByText(/no le alcanza/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ni con/i)).not.toBeInTheDocument();
  });
});

describe('el techo', () => {
  it('arriba del techo el módulo se niega y muestra la cuenta, en vez de congelar la pestaña', () => {
    // 18 variables × 3.000 puntos × 24 territorios = 1.296.000 territorio-corridas.
    const resultado = correrDiseno({ tipo: 'unaPorVez', pasos: 3000 });
    expect(resultado.estado).toBe('seNiega');
    if (resultado.estado !== 'seNiega') throw new Error('tenía que negarse');

    render(
      <Resultados
        resultado={resultado}
        base={corridaDeMuestra()}
        objetivo="legitimidad"
        territorios={24}
        elegida={null}
        onElegir={() => undefined}
      />,
    );
    expect(screen.getByText(/El módulo se niega, y te muestra la cuenta/i)).toBeInTheDocument();
    // La cuenta entera, no un «demasiado grande»: cuántas corridas, por cuántos
    // territorios, contra qué techo.
    expect(screen.getByText(/1\.296\.000/)).toBeInTheDocument();
    expect(screen.getByText(/1\.200\.000/)).toBeInTheDocument();
  });
});

describe('la incertidumbre', () => {
  it('un motor determinista dice «exacta», nunca «±0»', () => {
    const resultado = correrDiseno({ tipo: 'hipercubo', muestras: 24 });
    if (resultado.estado !== 'listo' || resultado.salida.metodo !== 'hipercubo') {
      throw new Error('el barrido tenía que estar listo');
    }
    render(<Incertidumbre estimaciones={resultado.salida.estimaciones} territorios={24} />);
    expect(screen.getByText(/no es el intervalo de confianza de un pronóstico/i)).toBeInTheDocument();
  });

  it('con pocas muestras no publica percentiles y dice por qué', () => {
    render(
      <Incertidumbre
        estimaciones={{
          alcance: { tipo: 'sinDato', razon: '5 corridas no alcanzan para estimar dispersión.' },
          persistencia: { tipo: 'exacta', valor: derivado(0.5, 'fracción', 'f', []) },
          legitimidad: {
            tipo: 'sinDominio',
            clave: 'chispa',
            razon: 'Es del mecanismo: el modo forma no tiene interacción.',
          },
          cobertura: { tipo: 'sinDato', razon: 'No se corrió ninguna muestra.' },
          territoriosConMandato: { tipo: 'exacta', valor: derivado(3, 'territorios', 'f', []) },
        }}
        territorios={24}
      />,
    );
    expect(screen.getByText(/no alcanzan para estimar dispersión/i)).toBeInTheDocument();
    expect(screen.getByText(/el modo forma no tiene interacción/i)).toBeInTheDocument();
    expect(screen.getAllByText(/exacta, no «±0»/i).length).toBe(2);
  });
});

/**
 * Las dos secciones del hipercubo salen juntas y a dos centímetros una de otra.
 * Con cinco corridas, `Incertidumbre` decía «5 corridas no alcanzan para
 * estimar dispersión» e `Importancia` publicaba `ρ 0,71 · [0,73, 1,00] · 5
 * corridas` — con el estimador afuera de su propio intervalo. Quien mira no
 * tiene cómo saber cuál de los dos creer, y ése es el defecto: no que el número
 * fuera malo, sino que la pantalla se contradecía.
 */
describe('las dos lecturas del hipercubo miden con la misma vara', () => {
  const pintar = (muestras: number) => {
    const resultado = correrDiseno({ tipo: 'hipercubo', muestras });
    if (resultado.estado !== 'listo') throw new Error('el barrido tenía que estar listo');
    return render(
      <Resultados
        resultado={resultado}
        base={corridaDeMuestra()}
        objetivo="legitimidad"
        territorios={24}
        elegida={null}
        onElegir={() => undefined}
      />,
    );
  };

  it('debajo del piso, la pantalla NO publica un ρ mientras dice que no alcanza', () => {
    pintar(5);
    // Lo que no puede pasar: un ρ con su intervalo mientras la sección de
    // arriba dice que cinco corridas no alcanzan.
    expect(screen.queryByText(/^ρ\s/)).toBeNull();
    // Las dos secciones dicen lo mismo: la de dispersión y la de importancia.
    expect(screen.getAllByText(/no alcanzan/i).length).toBeGreaterThan(1);
    expect(screen.getAllByText(/sin muestras/i).length).toBeGreaterThan(0);
  });

  it('en el piso publica, así que la vara no es un candado', () => {
    pintar(MINIMO_MUESTRAS);
    expect(screen.getAllByText(/^ρ\s/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/no alcanzan/i)).toBeNull();
  });
});

describe('la marca de hipótesis', () => {
  it('una cifra de modelo nombra el modelo y no comparte tratamiento con un derivado', () => {
    const crudo = derivado(0.42, 'fracción', 'alcance × persistencia', ['alcance']);
    const { container } = render(
      <>
        <CifraPapel etiqueta="Medida" magnitud={crudo} formato={(v) => v.toFixed(2)} />
        <CifraPapel
          etiqueta="De modelo"
          magnitud={hipotesis(crudo, SELLO)}
          formato={(v) => v.toFixed(2)}
        />
      </>,
    );
    expect(screen.getByText(/Hipótesis · no medida/i)).toBeInTheDocument();
    expect(screen.getByText(/Hipótesis de llama3\.1/i)).toBeInTheDocument();
    // La fórmula sobrevive al sello: la cuarta procedencia envuelve, no reemplaza.
    expect(container.textContent).toContain('alcance × persistencia');
    // Y el tratamiento visual difiere: una sola de las dos lleva el borde punteado.
    expect(container.querySelectorAll('.border-dashed')).toHaveLength(1);
  });

  it('el sello de sintético dice la frase que no se negocia', () => {
    render(
      <SelloSintetico
        sello={SELLO}
        huella="b208ee34"
        personas={200}
        advertencia="Esta población la escribió un modelo leyendo el corpus del proyecto."
      />,
    );
    expect(screen.getByText('Nadie dijo ninguna de estas cosas.')).toBeInTheDocument();
    expect(screen.getByText(/llama3\.1:8b-instruct-q4_K_M/)).toBeInTheDocument();
  });

  it('un elenco fabricado por una regla no finge tener un modelo', () => {
    render(
      <SelloSintetico sello={null} huella="b208ee34" personas={200} advertencia="Fabricado." />,
    );
    expect(screen.getByText(/escrito por una regla determinista, sin modelo/i)).toBeInTheDocument();
  });
});

describe('el modo gente sin Ollama', () => {
  it('ofrece los comandos en vez de romperse o de prometer un botón que no existe', () => {
    render(
      <ElElenco
        elenco={null}
        error={null}
        onElegirArchivos={() => undefined}
        onAbrirPersona={() => undefined}
      />,
    );
    expect(screen.getByText('Esto corre en tu máquina')).toBeInTheDocument();
    expect(screen.getByText(/brew install ollama/)).toBeInTheDocument();
    expect(screen.getByText(/ollama pull llama3\.1/)).toBeInTheDocument();
    expect(screen.getByText(/pnpm simulacion:calibrar/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cargar un elenco ya generado/i)).toBeInTheDocument();
  });

  it('con elenco cargado, el sesgo va ANTES que cualquier resultado', () => {
    render(
      <ElElenco
        elenco={elencoDeMuestra()}
        error={null}
        onElegirArchivos={() => undefined}
        onAbrirPersona={() => undefined}
      />,
    );
    expect(screen.getByText(/Dónde esta población no se parece al país/i)).toBeInTheDocument();
    expect(screen.getByText(/Sin una sola persona:/i)).toBeInTheDocument();
  });
});

describe('la ficha de una persona sintética', () => {
  it('dice que nadie lo dijo, de dónde se sembró, y que el tipo lo puso la regla', () => {
    const persona = personaDeMuestra(0, 'Chaco');
    render(<FichaDePersona persona={persona} onCerrar={() => undefined} />);
    expect(screen.getByText(/Nadie dijo ninguna de estas cosas/)).toBeInTheDocument();
    expect(screen.getByText(/blog\/una-entrada\.mdx/)).toBeInTheDocument();
    expect(screen.getByText(/el tipo y la clase los puso la regla, no el modelo/i)).toBeInTheDocument();
  });
});

describe('la mesa de variables', () => {
  it('muestra las dieciocho, y las que este modo no lee salen con su razón y sin control', () => {
    const diseno = disenoPorDefecto(pais);
    render(
      <MesaDeVariables diseno={diseno} onAlternar={() => undefined} onFijar={() => undefined} />,
    );
    // Las dieciocho, también las que este modo no lee: una ausencia sin
    // explicación se lee como un olvido.
    expect(screen.getAllByRole('listitem')).toHaveLength(18);

    const fila = screen.getByText('Contagio').closest('li');
    expect(within(fila as HTMLElement).getByText('No conectada')).toBeInTheDocument();
    expect(within(fila as HTMLElement).queryByRole('spinbutton')).toBeNull();

    // Y una que sí: con su entrada numérica editable, no sólo un deslizador.
    const participacion = screen.getByText('Cuánta gente habla').closest('li');
    expect(within(participacion as HTMLElement).getByRole('spinbutton')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// La página, con un worker falso
// ---------------------------------------------------------------------------

/** Lo mínimo que el worker falso puede emitir: el hook lee `id` y `tipo`. */
interface MensajeIsh {
  readonly tipo: string;
  readonly id: number;
  readonly hechas?: number;
  readonly previstas?: number;
}

class WorkerFalso {
  static ultima: WorkerFalso | null = null;
  static creados = 0;

  readonly enviados: unknown[] = [];
  terminado = false;
  readonly oyentes = new Map<string, ((evento: unknown) => void)[]>();

  constructor() {
    WorkerFalso.ultima = this;
    WorkerFalso.creados += 1;
  }

  addEventListener(tipo: string, cb: (evento: unknown) => void): void {
    this.oyentes.set(tipo, [...(this.oyentes.get(tipo) ?? []), cb]);
  }

  postMessage(mensaje: unknown): void {
    this.enviados.push(mensaje);
  }

  terminate(): void {
    this.terminado = true;
  }

  emitir(data: MensajeIsh): void {
    for (const cb of this.oyentes.get('message') ?? []) cb({ data });
  }
}

describe('la página', () => {
  beforeEach(() => {
    WorkerFalso.ultima = null;
    WorkerFalso.creados = 0;
    vi.stubGlobal('Worker', WorkerFalso);
    window.location.hash = '';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('abre con la pregunta y NO levanta un hilo para leerla', () => {
    render(<LaSimulacion />);
    expect(
      screen.getByText(/A partir de cuántas voces cada 100\.000 habitantes gana mandato/i),
    ).toBeInTheDocument();
    expect(WorkerFalso.creados).toBe(0);
  });

  it('dice que el lado medido está en cero en vez de dibujar un silencio inventado', () => {
    render(<LaSimulacion />);
    expect(screen.getByText(/todavía no habló nadie/i)).toBeInTheDocument();
  });

  it('sin elenco, la PÁGINA ofrece los comandos y el cargador — no sólo el componente suelto', () => {
    // Regresión de un candado real: la sección del elenco se montaba sólo si
    // `modo === 'gente'` o ya había un elenco, pero el botón «Gente» está
    // deshabilitado justamente hasta que haya uno. Las instrucciones para
    // conseguir un elenco quedaban detrás de tener un elenco, y en la página
    // publicada eran inalcanzables.
    //
    // El test que ya existía monta <ElElenco elenco={null}> a mano, así que
    // pasaba con la página rota. Éste entra por la página, que es donde el
    // defecto vivía.
    render(<LaSimulacion />);

    expect(screen.getByRole('button', { name: /^gente$/i })).toBeDisabled();
    expect(screen.getByText('Esto corre en tu máquina')).toBeInTheDocument();
    expect(screen.getByText(/brew install ollama/)).toBeInTheDocument();
    expect(screen.getByText(/pnpm simulacion:elenco/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cargar un elenco ya generado/i)).toBeInTheDocument();
  });

  it('volver a «umbral» después del tornado recupera las veinticuatro provincias', () => {
    // Con la lista vacía el método corre, no falla, y devuelve una tabla vacía:
    // un resultado sin error, que es la peor clase de resultado.
    render(<LaSimulacion />);
    fireEvent.click(screen.getByRole('button', { name: /una variable por vez/i }));
    fireEvent.click(screen.getByRole('button', { name: /umbral por provincia/i }));
    fireEvent.click(screen.getByRole('button', { name: /correr el barrido/i }));

    const pedido = WorkerFalso.ultima?.enviados[0] as {
      diseno: { metodo: { tipo: string; territorios?: readonly string[] } };
    };
    expect(pedido.diseno.metodo.tipo).toBe('umbral');
    expect(pedido.diseno.metodo.territorios).toHaveLength(24);
  });

  it('el barrido va al worker, avisa el progreso y se cancela terminando el hilo', () => {
    render(<LaSimulacion />);

    fireEvent.click(screen.getByRole('button', { name: /correr el barrido/i }));
    expect(WorkerFalso.creados).toBe(1);
    const worker = WorkerFalso.ultima;
    expect(worker).not.toBeNull();
    expect(worker?.enviados).toHaveLength(1);
    expect((worker?.enviados[0] as { tipo: string }).tipo).toBe('barrer');

    act(() => {
      worker?.emitir({ tipo: 'progreso', id: 1, hechas: 75, previstas: 456 });
    });
    const barra = screen.getByRole('progressbar');
    expect(barra).toHaveAttribute('aria-valuenow', '75');
    expect(screen.getByText(/75 corridas de hasta/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(worker?.terminado).toBe(true);
    expect(screen.getByText(/Cancelado a las 75 corridas/i)).toBeInTheDocument();
  });

  it('sin Web Workers lo dice, en vez de colgar la pestaña calculando en el render', () => {
    vi.stubGlobal('Worker', undefined);
    render(<LaSimulacion />);
    fireEvent.click(screen.getByRole('button', { name: /correr el barrido/i }));
    expect(screen.getByRole('alert').textContent).toContain('no tiene Web Workers');
  });
});

// ---------------------------------------------------------------------------
// El link compartido, y el propio recargado
// ---------------------------------------------------------------------------

describe('recargar y compartir', () => {
  beforeEach(() => {
    WorkerFalso.ultima = null;
    WorkerFalso.creados = 0;
    vi.stubGlobal('Worker', WorkerFalso);
    window.location.hash = '';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function pedidoAlWorker(): { ahora: number; diseno: Diseno } {
    const pedido = WorkerFalso.ultima?.enviados[0] as { ahora: number; diseno: Diseno } | undefined;
    if (pedido === undefined) throw new Error('no se mandó ningún pedido al worker');
    return pedido;
  }

  /** Lo que el worker de verdad hace con el pedido, sin worker de por medio. */
  function correrElPedido(): void {
    const pedido = pedidoAlWorker();
    correr(pedido.diseno.base, construirPais(pedido.ahora), modoForma, null, null);
  }

  it('el diseño que sale por el hash reproduce SU país, y vuelve a correr un minuto después', () => {
    const reloj = vi.spyOn(Date, 'now');
    reloj.mockReturnValue(AHORA);

    const primera = render(<LaSimulacion />);
    const compartido = window.location.hash;
    expect(compartido).not.toBe('');
    primera.unmount();

    // La misma pestaña recargada, o el link abierto por otra persona: lo único
    // que cambió es el reloj de la máquina.
    reloj.mockReturnValue(AHORA + 60_000);
    window.location.hash = compartido;

    render(<LaSimulacion />);
    fireEvent.click(screen.getByRole('button', { name: /correr el barrido/i }));

    // El reloj sale del link y no de la máquina: sin esto el link abre otro
    // país, y un link que reproduce otro país no sirve para nada.
    expect(pedidoAlWorker().ahora).toBe(AHORA);
    expect(construirPais(pedidoAlWorker().ahora).huella).toBe(pais.huella);
    expect(pedidoAlWorker().diseno.base.paisHuella).toBe(pais.huella);
    // Y por eso no hay nada que avisar: es el mismo país, no uno parecido.
    expect(screen.queryByText(/otro país/i)).toBeNull();
    expect(correrElPedido).not.toThrow();
  });

  it('y el hash que deja después de recargar sigue sirviendo: no queda pegajoso', () => {
    const reloj = vi.spyOn(Date, 'now');
    reloj.mockReturnValue(AHORA);
    const primera = render(<LaSimulacion />);
    const compartido = window.location.hash;
    primera.unmount();

    reloj.mockReturnValue(AHORA + 60_000);
    window.location.hash = compartido;
    const segunda = render(<LaSimulacion />);
    const reescrito = window.location.hash;
    segunda.unmount();

    // El efecto de `useDiseno` reescribe el hash apenas monta. Ahí estaba el
    // lazo: reescribía el país de la carga anterior, así que el link quedaba
    // roto hasta que alguien borrara el `#` a mano.
    expect(leerRelojDelHash(reescrito)).toBe(AHORA);

    reloj.mockReturnValue(AHORA + 120_000);
    window.location.hash = reescrito;
    render(<LaSimulacion />);
    fireEvent.click(screen.getByRole('button', { name: /correr el barrido/i }));
    expect(pedidoAlWorker().ahora).toBe(AHORA);
    expect(correrElPedido).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Muestras
// ---------------------------------------------------------------------------

/** Una corrida de verdad del escenario base, para las secciones que la piden. */
function corridaDeMuestra() {
  return correr(disenoPorDefecto(pais).base, pais, modoForma, null, null).corrida;
}

function personaDeMuestra(id: number, territorioId: string): Persona {
  return {
    id,
    origen: { documento: 'blog/una-entrada.mdx', ancla: 'El primer párrafo', sha: 'abc123def456' },
    territorio: {
      territorioId,
      provinciaId: 22,
      departamentoId: null,
      localidadId: null,
      celdaId: `${territorioId}#0`,
    },
    conducta: {
      propension: 0.35,
      constanciaPersonal: 0.8,
      umbralAdhesion: 0.4,
      umbralCorroboracion: 0.7,
      radioAtencion: 'municipio',
      mezclaTipos: {
        basta: 1,
        necesidad: 1,
        recurso: 1,
        práctica: 1,
        saber: 1,
        sueño: 1,
        propuesta: 1,
        compromiso: 1,
        pregunta: 1,
      },
      vinculos: [1],
    },
    semblanza: {
      texto: 'Una semblanza fabricada por una regla, no por una persona.',
      oficio: 'Docente',
      tramoEdad: '40-55',
      arraigoAnios: 20,
      frases: [{ tipo: 'basta', clase: 'hecho', texto: 'La esquina está rota hace dos años.' }],
    },
  };
}

function elencoDeMuestra(): ElencoCargado {
  const personas = [personaDeMuestra(0, 'Chaco'), personaDeMuestra(1, 'Chaco')];
  return {
    manifiesto: {
      huella: 'b208ee34',
      personas: personas.length,
      padre: null,
      sello: SELLO,
      notas: { escritor: 'fabricado', semilla: 7, grado: 8 },
      sesgo: {
        corpus: [{ documento: 'blog/una-entrada.mdx', sha: 'abc123def456', personas: 2 }],
        porTerritorio: [
          {
            territorioId: 'Chaco',
            personas: 2,
            fraccionElenco: 1,
            fraccionPais: 0.025,
            desvio: 0.975,
          },
        ],
        territoriosSinPersona: ['Santa Cruz', 'San Juan'],
        advertencia: 'Esta población la escribió un modelo leyendo el corpus del proyecto.',
      },
    },
    personas,
    transferible: {
      huellaDeclarada: 'b208ee34',
      personas,
      padre: null,
      sello: SELLO,
      corpus: [{ documento: 'blog/una-entrada.mdx', sha: 'abc123def456', personas: 2 }],
    },
  };
}
