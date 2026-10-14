import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearch } from 'wouter';

import { EditorCampo } from './Editor';

import type { Cuaderno } from '~/lib/campo/modelo';

import { useAuth } from '~/lib/auth/use-auth';
import { leerCuadernos } from '~/lib/campo/archivo';
import { sincronizarCampo } from '~/lib/campo/sincronizar';

function ArchivoCampo({ uid }: { uid: number }) {
  const [items, setItems] = useState<Cuaderno[]>([]),
    [error, setError] = useState(''),
    [ocupado, setOcupado] = useState(false),
    [cargando, setCargando] = useState(true);
  const vivo = useRef(true);
  const elegido = new URLSearchParams(useSearch()).get('cuaderno');
  const refrescar = useCallback(async () => {
    const r = await leerCuadernos(uid);
    if (vivo.current) {
      setItems(r);
      setCargando(false);
    }
  }, [uid]);
  const sincronizar = useCallback(
    async (manual = false) => {
      const vigente = () => vivo.current;
      if (!vigente()) return;
      setOcupado(true);
      setError('');
      try {
        await sincronizarCampo(uid, vigente, manual);
        await refrescar();
      } catch (e) {
        if (vigente())
          setError(e instanceof Error ? e.message : 'No pudimos abrir el archivo local.');
      } finally {
        if (vigente()) {
          setOcupado(false);
          setCargando(false);
        }
      }
    },
    [uid, refrescar],
  );
  useEffect(() => {
    vivo.current = true;
    void refrescar().catch((e: unknown) => {
      setError(e instanceof Error ? e.message : 'No pudimos leer el archivo local.');
      setCargando(false);
    });
    const online = () => {
      void sincronizar();
    };
    const timer = setInterval(online, 15000);
    window.addEventListener('online', online);
    online();
    return () => {
      vivo.current = false;
      clearInterval(timer);
      window.removeEventListener('online', online);
    };
  }, [refrescar, sincronizar]);
  return (
    <div className="space-y-6">
      <button
        className="min-h-11 underline"
        disabled={ocupado}
        onClick={() => {
          void sincronizar(true);
        }}
      >
        {ocupado ? 'Comprobando envíos…' : 'Sincronizar resúmenes autorizados'}
      </button>
      <p className="text-sm">
        Hasta cinco intentos automáticos por resumen, con espera creciente. Después podés reintentar
        manualmente. Si la respuesta se pierde, conservamos el recibo original.
      </p>
      {error ? <p role="alert">{error}</p> : null}
      {cargando ? <p role="status">Abriendo cuaderno local…</p> : null}
      {!cargando && !error && !items.length ? (
        <p>
          No hay cuadernos para esta cuenta en este navegador. Abrí una tarea de escucha que tengas
          asignada para preparar uno.
        </p>
      ) : null}
      {elegido ? (
        <Link href="/campo" className="inline-flex underline">
          Ver todos mis cuadernos
        </Link>
      ) : null}
      {items
        .filter((c) => !elegido || c.id === elegido)
        .map((c) => (
          <EditorCampo key={c.id} inicial={c} cambiar={refrescar} />
        ))}
    </div>
  );
}
export function Campo() {
  const { user, isLoading } = useAuth();
  return (
    <main className="bg-papel text-tinta min-h-screen px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/iniciativas" className="underline">
          Volver a iniciativas
        </Link>
        <h1 className="font-anton text-4xl">Cuaderno de campo</h1>
        <p>
          Guardá notas privadas y prepará resultados de escucha. Solo los resúmenes autorizados se
          envían a la iniciativa.
        </p>
        <p className="text-sm">
          Antes de salir, ingresá y cargá la tarea con conexión. Podés seguir escribiendo en la
          pantalla abierta sin red. El guardado pertenece a este navegador y puede perderse si
          borrás sus datos; no se sincroniza con la app nativa. No guardes información sensible en
          un dispositivo compartido.
        </p>
        {isLoading ? (
          <p>Cargando sesión…</p>
        ) : user ? (
          <ArchivoCampo key={user.id} uid={user.id} />
        ) : (
          <Link href="/ingresar?volver=%2Fcampo" className="underline">
            Ingresá con la cuenta que preparó el cuaderno
          </Link>
        )}
      </div>
    </main>
  );
}
