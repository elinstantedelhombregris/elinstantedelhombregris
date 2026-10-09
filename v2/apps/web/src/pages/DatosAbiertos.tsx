import { Link } from 'wouter';

import { DescargarDatos } from '~/components/participacion/DescargarDatos';
import { MarcoParticipacion, Nota, EnlaceAccion } from '~/components/participacion/Elementos';
import { filtrosPublicos } from '~/lib/participacion/exportar';

export function DatosAbiertos() {
  const consulta = filtrosPublicos(Object.fromEntries(new URLSearchParams(window.location.search)));
  const filtrado = Object.keys(consulta).length > 0;
  return (
    <MarcoParticipacion
      titulo="Lo que sabemos debe poder revisarse."
      entrada="Un dato abierto lleva su origen, sus límites y una forma de usarlo. Acá podés llevarte el registro público y el método para leerlo."
      kicker="Datos abiertos"
    >
      {filtrado ? (
        <Nota>
          Descargás el alcance elegido:{' '}
          {Object.entries(consulta)
            .map(([k, v]) => `${k}: ${v}`)
            .join(' · ')}
          . Podés abrir también el registro completo.
        </Nota>
      ) : null}
      <DescargarDatos
        consulta={consulta}
        titulo={filtrado ? 'Descargar estos datos' : 'Descargar el registro público'}
      />
      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="font-anton text-3xl">Qué viene en el paquete</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 leading-relaxed">
            <li>
              Señales canónicas elegibles, con texto solo cuando su autoría cedió la licencia.
            </li>
            <li>Estructura pública de campañas y fichas, y vínculos a sus fuentes.</li>
            <li>Manifiesto con corte, filtros, conteos, omisiones y licencias.</li>
            <li>
              Una guía para interpretar el archivo y distinguir registros, participantes y acuerdos.
            </li>
          </ul>
        </div>
        <div>
          <h2 className="font-anton text-3xl">Qué permanece protegido</h2>
          <p className="mt-4 leading-relaxed">
            Datos de cuenta, claves de actor, relatos privados y ubicación sensible. Los vectores y
            las respuestas individuales no se publican por asumir que son anónimos.
          </p>
          <p className="mt-4 leading-relaxed">
            Una descarga previa no puede recuperarse. Una lectura vigente debe respetar
            correcciones, retiros y permisos.
          </p>
        </div>
      </section>
      <Nota>
        No pedimos cuenta para acceder a los datos públicos. Para descargar tus propios datos
        privados, ingresá en Mi espacio. La protección depende del conjunto y sus permisos; no de un
        número mágico de registros.
      </Nota>
      <div className="flex flex-wrap gap-4">
        <EnlaceAccion secundario href="/la-radiografia">
          Leer los patrones
        </EnlaceAccion>
        <EnlaceAccion secundario href="/mi-espacio">
          Descargar mis datos
        </EnlaceAccion>
        {filtrado ? (
          <EnlaceAccion secundario href="/datos-abiertos">
            Ver el registro completo
          </EnlaceAccion>
        ) : null}
      </div>
      <p className="mt-6 text-sm">
        La compilación y los textos cedidos se publican bajo CC BY 4.0 según sus contratos.{' '}
        <Link href="/politica-privacidad" className="text-violeta underline">
          Consultá el uso de la información.
        </Link>
      </p>
    </MarcoParticipacion>
  );
}
export default DatosAbiertos;
