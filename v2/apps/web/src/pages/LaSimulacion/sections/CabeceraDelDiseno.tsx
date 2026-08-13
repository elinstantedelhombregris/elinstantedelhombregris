import type { EstadoDelBarrido } from '../useBarrido';
import type { Diseno, Pais } from '@v2/civic-core';

/**
 * § La cabecera del diseño — regla 5, y no se puede cerrar.
 *
 * El equivalente de la cabecera de procedencia de La Radiografía, para un
 * instrumento que además tiene que decir **contra qué país** corrió y **con qué
 * motor**, porque dos resultados calculados contra países distintos o por
 * motores distintos no son comparables y la diferencia se descubre discutiendo
 * en vez de leyendo.
 *
 * La cuarta celda es la que más importa y la que un panel de perillas nunca
 * tiene: **esto no pronostica**. Ni el modo forma ni el modo gente dicen qué va
 * a pasar; dicen qué pasaría *si* valieran los supuestos declarados. Va arriba,
 * con el mismo peso que los números, y no en un pie.
 */

export interface CabeceraDelDisenoProps {
  readonly diseno: Diseno;
  readonly pais: Pais;
  readonly estado: EstadoDelBarrido;
  readonly avisos: readonly string[];
}

export function CabeceraDelDiseno({ diseno, pais, estado, avisos }: CabeceraDelDisenoProps) {
  const vocesMedidas = pais.base.voces.length;

  return (
    <section aria-label="El diseño de esta corrida" className="border-tinta mb-10 border-y-2 py-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Celda rotulo="La pregunta">
          {diseno.base.pregunta}
          <Sub>
            {diseno.modo === 'forma'
              ? 'Modo forma: declarás la forma del país que hablaría y el motor la construye.'
              : 'Modo gente: declarás quiénes son y la forma sale de lo que hacen.'}
          </Sub>
        </Celda>

        <Celda rotulo="El país">
          {pais.territorios.length} provincias
          <Sub>
            {vocesMedidas === 0
              ? 'El lado medido está en cero: todavía no habló nadie. No es un supuesto, es el estado de la base.'
              : `${vocesMedidas.toLocaleString('es-AR')} voces cargadas`}
            {' · huella '}
            {pais.huella}
          </Sub>
        </Celda>

        <Celda rotulo="Con qué se calculó">
          semilla {diseno.base.semilla}
          <Sub>
            {diseno.base.motor}
            {estado.fase === 'listo'
              ? ` · ${estado.resultado.estado === 'listo' ? `${estado.resultado.corridasHechas.valor.toLocaleString('es-AR')} corridas` : 'sin correr'} en ${String(estado.ms)} ms`
              : ''}
          </Sub>
        </Celda>

        <Celda rotulo="Qué NO es esto">
          No es un pronóstico.
          <Sub>
            No dice qué va a pasar: dice qué pasaría si valieran los supuestos declarados. Y no
            contesta qué pasaría si hablaran los que hoy no hablan y no se parecen a los que hablan
            — eso necesita una población, y aun así sólo vale bajo el sesgo de su corpus.
          </Sub>
        </Celda>
      </div>

      {avisos.length > 0 ? (
        <ul className="text-tinta-75 mt-5 list-disc space-y-1 pl-5 text-[13px] leading-[1.5]">
          {avisos.map((aviso) => (
            <li key={aviso}>{aviso}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function Celda({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-space text-tinta-50 mb-2 text-[11px] font-bold uppercase tracking-[0.14em]">
        {rotulo}
      </div>
      <div className="font-archivo text-tinta text-[17px] leading-[1.35]">{children}</div>
    </div>
  );
}

const Sub = ({ children }: { children: React.ReactNode }) => (
  <span className="font-space text-tinta-50 mt-1 block text-[12px] normal-case leading-[1.45]">
    {children}
  </span>
);
