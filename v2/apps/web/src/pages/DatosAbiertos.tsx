import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';

import type { LugarMapa } from '~/pages/ElMapa/instrumento/BusquedaTerritorial';

import { DescargarDatos } from '~/components/participacion/DescargarDatos';
import { MarcoParticipacion, Nota, EnlaceAccion } from '~/components/participacion/Elementos';
import { api } from '~/lib/api';
import { filtrosPublicos } from '~/lib/participacion/exportar';
import { useCampanas } from '~/lib/queries/participacion';
import { ESTADO_EN_CASTELLANO, leerTipoSenal } from '~/lib/vocabulario';


function fechaLarga(iso: string): string | null {
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime())
    ? null
    : fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * El alcance del archivo en palabras. Las direcciones traen ids («territorio=14»,
 * «campana=<uuid>»): se buscan los nombres que el sitio ya conoce y, mientras no
 * llegan o si no existen, se dice «campaña elegida» o «lugar elegido» — nunca el id.
 */
function useAlcanceEnPalabras(consulta: Record<string, string>): string[] {
  const campanas = useCampanas();
  const lugar = useQuery({
    queryKey: ['geo', 'lugares', consulta.territorio],
    enabled: Boolean(consulta.territorio),
    queryFn: ({ signal }) =>
      api.get<LugarMapa>(`/api/v1/geo/lugares/${consulta.territorio ?? ''}`, { signal }),
  });
  const partes: string[] = [];
  if (consulta.campana) {
    const campana = campanas.data?.find((c) => c.id === consulta.campana);
    partes.push(`campaña ${campana?.contrato.titulo ?? 'elegida'}`);
  }
  if (consulta.edicion) partes.push(`edición ${consulta.edicion}`);
  if (consulta.territorio) partes.push(`lugar ${lugar.data?.name ?? 'elegido'}`);
  if (consulta.tema) partes.push(`tema ${consulta.tema}`);
  if (consulta.tipo) {
    const tipo = leerTipoSenal(consulta.tipo);
    partes.push(`tipo ${tipo.reconocido ? tipo.tipo : consulta.tipo}`);
  }
  if (consulta.estado) partes.push(`estado ${ESTADO_EN_CASTELLANO[consulta.estado] ?? consulta.estado}`);
  const desde = consulta.desde ? fechaLarga(consulta.desde) : null;
  if (desde) partes.push(`desde el ${desde}`);
  const hasta = consulta.hasta ? fechaLarga(consulta.hasta) : null;
  if (hasta) partes.push(`hasta el ${hasta}`);
  return partes;
}

export function DatosAbiertos() {
  const consulta = filtrosPublicos(Object.fromEntries(new URLSearchParams(window.location.search)));
  const filtrado = Object.keys(consulta).length > 0;
  const alcance = useAlcanceEnPalabras(consulta);
  return (
    <MarcoParticipacion
      titulo="Descargá los datos públicos"
      entrada="Acá te llevás los aportes públicos con su origen, sus límites y una guía para leerlos. No hace falta cuenta."
      kicker="Datos abiertos"
    >
      {filtrado ? (
        <Nota>
          Este archivo incluye solo lo que corresponde a: {alcance.join(' · ')}. Más abajo podés
          pedir el registro completo.
        </Nota>
      ) : null}
      <DescargarDatos consulta={consulta} />
      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="font-anton text-3xl">Qué viene en el paquete</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 leading-relaxed">
            <li>
              Los aportes públicos, con su texto solo cuando quien lo escribió dejó que cualquiera
              lo lea y lo comparta.
            </li>
            <li>Las campañas y fichas públicas, con enlaces a los aportes de donde salen.</li>
            <li>
              Un resumen del archivo: la fecha de los datos, los filtros usados, cuántos registros
              hay, qué se dejó afuera y bajo qué licencias.
            </li>
            <li>Una guía para leer el archivo sin confundir aportes, personas y acuerdos.</li>
          </ul>
        </div>
        <div>
          <h2 className="font-anton text-3xl">Qué permanece protegido</h2>
          <p className="mt-4 leading-relaxed">
            Quedan afuera los datos de las cuentas, los textos reservados y las ubicaciones
            sensibles. Las respuestas individuales tampoco se publican.
          </p>
          <p className="mt-4 leading-relaxed">
            Los vectores (la huella numérica de cada texto) no se publican: aun sin nombre podrían
            ligarse a una persona.
          </p>
          <p className="mt-4 leading-relaxed">
            Lo que alguien ya descargó no se puede recuperar. Cada archivo nuevo respeta las
            correcciones, los retiros y los permisos vigentes.
          </p>
        </div>
      </section>
      <Nota>
        No hace falta cuenta para llevarte los datos públicos. Para descargar tus propios datos,
        entrá a Mi espacio. Lo que protege la información es qué se publica y con qué permisos, sin
        importar cuántos registros haya.
      </Nota>
      <div className="flex flex-wrap gap-4">
        <EnlaceAccion secundario href="/la-radiografia">
          Leer los patrones
        </EnlaceAccion>
        <EnlaceAccion secundario href="/mi-espacio?pestana=cuenta">
          Descargar mis datos
        </EnlaceAccion>
        {filtrado ? (
          <EnlaceAccion secundario href="/datos-abiertos">
            Ver el registro completo
          </EnlaceAccion>
        ) : null}
      </div>
      <p className="mt-6 text-sm">
        El archivo y los textos que sus autores dejaron compartir se publican bajo licencia CC BY
        4.0.{' '}
        <Link href="/politica-privacidad" className="text-violeta underline">
          Cómo usamos la información.
        </Link>
      </p>
    </MarcoParticipacion>
  );
}
export default DatosAbiertos;
