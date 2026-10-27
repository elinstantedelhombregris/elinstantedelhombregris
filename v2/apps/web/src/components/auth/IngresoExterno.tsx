/**
 * «Continuar con Google» y el separador «o con tu correo», arriba de los formularios de
 * ingresar y de crear la cuenta (ADR 0012). No aparece si el despliegue no ofrece Google.
 *
 * El botón es un enlace común: la API arma el estado y manda a la página de Google. No se
 * carga ningún script de Google. Sigue la guía de marca de Google para el botón claro —fondo
 * blanco, borde #747775, texto #1F1F1F y el logo «G» en sus cuatro colores—, y por eso usa
 * esos colores en lugar de los del sistema.
 */
import { hrefGoogle, useProveedores } from '~/lib/queries/ingreso-externo';
import { cn } from '~/lib/utils';

function LogoGoogle() {
  return (
    <svg aria-hidden viewBox="0 0 48 48" className="size-5 shrink-0">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export function BotonGoogle({
  volver,
  para,
  className,
  children = 'Continuar con Google',
}: {
  volver: string;
  para?: 'confirmar';
  className?: string;
  children?: string;
}) {
  return (
    <a
      href={hrefGoogle(volver, para)}
      className={cn(
        'focus-visible:outline-violeta flex min-h-11 w-full items-center justify-center gap-3 rounded-[4px] border border-[#747775] bg-white px-4 py-2.5 text-[15px] font-medium text-[#1F1F1F] transition-colors hover:bg-[#F2F2F2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        className,
      )}
    >
      <LogoGoogle />
      {children}
    </a>
  );
}

/** El botón y el separador; nada mientras no se sabe si hay Google, ni si no lo hay. */
export function IngresoExterno({ volver }: { volver: string }) {
  const proveedores = useProveedores();
  if (!proveedores.data?.google) return null;
  return (
    <div className="mb-6">
      <BotonGoogle volver={volver} />
      <p className="text-tinta-50 font-space mt-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.12em] before:h-px before:flex-1 before:bg-current after:h-px after:flex-1 after:bg-current">
        o con tu correo
      </p>
    </div>
  );
}
