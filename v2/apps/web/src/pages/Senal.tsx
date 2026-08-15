import { Link, useRoute } from 'wouter';

import { BotonAdherir } from './Senal/BotonAdherir';
import { FichaDeConfirmaciones } from './Senal/FichaDeConfirmaciones';
import { PanelConfirmar } from './Senal/PanelConfirmar';

import { ChipTipo, Kicker } from '~/components/papel/primitives';
import { useSenal } from '~/lib/queries/senales';
import {
  CLASE_GLOSA,
  CLASE_ROTULO,
  ESTADO_EN_CASTELLANO,
  ESTADO_RUIDOSO,
  claseDe,
} from '~/lib/vocabulario';

/**
 * La página de una señal — lo que hace que algo pueda circular.
 *
 * Hasta que existió, la plataforma tomaba y no devolvía nada: cargabas una voz
 * y no había forma de verla, de mandársela a un vecino, ni de mirar la de otro.
 * Un link es lo mínimo que necesita una voz para salir del formulario donde
 * nació.
 *
 * ## Qué se muestra, y qué NO
 *
 * La firma sale **siempre** con «sin verificar» al lado, nunca sola: es el
 * nombre que alguien eligió poner, no una identidad que el sistema compruebe.
 *
 * La precisión del punto se dice con palabras. Alguien tiene derecho a saber
 * con qué grano se publicó lo que escribió, y a enterarse acá y no cuando lo
 * descubra en el volcado.
 *
 * Y **no se muestra quién confirmó**. Ni un seudónimo, ni un contador por
 * persona. La ficha dice qué se hizo y con qué método; quién lo hizo no es
 * información pública ni lo va a ser.
 */
const PRECISION_EN_PALABRAS: Readonly<Record<string, string>> = {
  exact: 'el punto exacto',
  '100m': 'aproximada a cien metros',
  '500m': 'aproximada a quinientos metros',
  neighborhood: 'el barrio',
  city: 'la localidad',
  province: 'la provincia',
};

export function Senal() {
  const [, params] = useRoute('/senal/:id');
  const id = params?.id;
  const { data, isLoading, isError } = useSenal(id);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-[760px] px-10 py-[72px] max-[560px]:px-5">
        <p className="font-space text-tinta-50 text-[13px]">Buscando…</p>
      </main>
    );
  }

  if (isError || data === undefined) {
    return (
      <main className="mx-auto max-w-[760px] px-10 py-[72px] max-[560px]:px-5">
        <h1 className="font-anton text-tinta text-[36px] leading-tight">No encontramos esa voz.</h1>
        <p className="text-tinta-75 mt-3 max-w-[60ch] text-[16px] leading-relaxed">
          Puede que el link esté mal, o que quien la escribió la haya retirado. Retirar deja la
          fila para que la cuenta del territorio no cambie, pero saca el texto de la vista.
        </p>
        <Link href="/el-mapa" className="font-space text-violeta mt-6 inline-block text-[13px] underline">
          Volver al mapa
        </Link>
      </main>
    );
  }

  const { senal, adhesiones, confirmaciones, umbral, seVerifica } = data;
  const clase = claseDe(senal.tipo);
  const ruidoso = ESTADO_RUIDOSO.has(senal.estado);
  const cuentan = confirmaciones.filter((c) => c.cuenta && c.veredicto === 'confirm').length;

  return (
    <main className="mx-auto max-w-[760px] px-10 py-[72px] max-[560px]:px-5">
      <Link href="/el-mapa" className="font-space text-tinta-50 hover:text-tinta text-[11px] uppercase tracking-[0.14em]">
        ← El mapa
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <ChipTipo tipo={senal.tipo} active />
        <span className="font-space text-tinta-50 text-[11px] uppercase tracking-[0.12em]">
          {CLASE_ROTULO[clase]}
        </span>
        <span
          className={`font-space text-[11px] uppercase tracking-[0.12em] ${ruidoso ? 'text-sello' : 'text-tinta-75'}`}
        >
          · {ESTADO_EN_CASTELLANO[senal.estado] ?? senal.estado}
        </span>
      </div>

      {senal.titulo === null ? null : (
        <h1 className="font-anton text-tinta mt-4 text-[clamp(28px,5vw,44px)] leading-[1.05]">
          {senal.titulo}
        </h1>
      )}

      <p className="text-tinta mt-4 max-w-[62ch] text-[19px] leading-[1.55]">{senal.texto}</p>

      {/* La firma NUNCA sale sola. Es el nombre que alguien eligió poner, no
          una identidad comprobada, y mostrarla pelada la haría pasar por lo
          segundo. */}
      {senal.firma === null ? null : (
        <p className="font-space text-tinta-50 mt-3 text-[12px]">
          firmado como <span className="text-tinta-75">{senal.firma}</span> · sin verificar
        </p>
      )}

      {senal.fuente === null ? null : (
        <p className="text-tinta-75 mt-4 max-w-[60ch] text-[14px] leading-relaxed">
          <span className="font-space text-tinta-50 text-[11px] uppercase tracking-[0.12em]">
            Cómo lo sabe:{' '}
          </span>
          {senal.fuente}
        </p>
      )}

      <p className="font-space text-tinta-50 mt-2 text-[11px]">{CLASE_GLOSA[clase]}</p>

      {/* ── Dónde y con qué grano ───────────────────────────────────────── */}
      <dl className="border-tinta mt-8 border-t-2">
        {senal.direccionTexto === null ? null : (
          <Fila rotulo="Dónde">{senal.direccionTexto}</Fila>
        )}
        <Fila rotulo="Se publicó con">
          {PRECISION_EN_PALABRAS[senal.precision] ?? senal.precision}
        </Fila>
        {senal.comprometidoPara === null ? null : (
          <Fila rotulo="Prometido para">
            {new Date(`${senal.comprometidoPara}T00:00:00`).toLocaleDateString('es-AR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Fila>
        )}
        {senal.periodicidad === null ? null : <Fila rotulo="Cada cuánto">{senal.periodicidad}</Fila>}
        <Fila rotulo="Cargada">
          {new Date(senal.creadaEn).toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Fila>
      </dl>

      <div className="mt-8">
        <BotonAdherir idPublico={senal.idPublico} total={adhesiones.total} mia={adhesiones.mia} />
      </div>

      {/* La corroboración sólo donde corre: los hechos y los actos. Un deseo se
          delibera y una pregunta se responde, y ofrecer «¿sigue así?» sobre un
          sueño sería confundir las dos máquinas — que es lo que la regla 11
          existe para prohibir. */}
      {seVerifica ? (
        <section className="mt-10">
          <Kicker className="mb-3">El segundo par de ojos</Kicker>
          <PanelConfirmar
            idPublico={senal.idPublico}
            hayPunto={senal.lat !== null}
            umbral={umbral}
            yaCuentan={cuentan}
          />
        </section>
      ) : null}

      {confirmaciones.length > 0 ? (
        <section className="mt-10">
          <Kicker className="mb-3">Quiénes la miraron</Kicker>
          <FichaDeConfirmaciones confirmaciones={confirmaciones} />
        </section>
      ) : null}
    </main>
  );
}

function Fila({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="border-papel-borde flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b py-3">
      <dt className="font-space text-tinta-50 w-[140px] shrink-0 text-[11px] uppercase tracking-[0.12em]">
        {rotulo}
      </dt>
      <dd className="text-tinta-75 text-[15px]">{children}</dd>
    </div>
  );
}

export default Senal;
