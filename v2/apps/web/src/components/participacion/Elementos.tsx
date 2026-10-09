import { Link } from 'wouter';

import type { ReactNode, ButtonHTMLAttributes } from 'react';

export function MarcoParticipacion({
  titulo,
  entrada,
  children,
  kicker = 'La ciudadanía diseña',
}: {
  titulo: string;
  entrada: string;
  children: ReactNode;
  kicker?: string;
}) {
  return (
    <main className="mx-auto w-full max-w-[1100px] px-5 py-10 min-[961px]:px-10">
      <p className="font-space text-violeta text-[11px] uppercase tracking-[.14em]">{kicker}</p>
      <h1 className="font-anton mt-5 max-w-[900px] text-[clamp(38px,6vw,76px)] leading-[1.05]">
        {titulo}
      </h1>
      <p className="text-tinta-75 mt-5 max-w-[720px] text-lg leading-relaxed">{entrada}</p>
      <div className="mt-9">{children}</div>
    </main>
  );
}
export function BotonAccion({
  children,
  tono = 'violeta',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tono?: 'violeta' | 'papel' | 'sello' }) {
  const color =
    tono === 'violeta'
      ? 'bg-violeta text-papel'
      : tono === 'sello'
        ? 'bg-sello text-papel'
        : 'bg-papel text-tinta';
  return (
    <button
      {...props}
      className={`font-space border-tinta min-h-11 border px-5 py-3 text-xs uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-50 ${color} ${props.className ?? ''}`}
    >
      {children}
    </button>
  );
}
export function EnlaceAccion({
  href,
  children,
  secundario = false,
}: {
  href: string;
  children: ReactNode;
  secundario?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`font-space border-tinta inline-flex min-h-11 items-center border px-5 py-3 text-xs uppercase tracking-wide ${secundario ? 'text-tinta' : 'bg-violeta text-papel'}`}
    >
      {children}
    </Link>
  );
}
export function ErrorOperacion({ mensaje }: { mensaje: string | null | undefined }) {
  return mensaje ? (
    <p role="alert" className="text-sello my-4 border-l-2 pl-4 text-sm leading-relaxed">
      {mensaje}
    </p>
  ) : null;
}
export function Nota({ children }: { children: ReactNode }) {
  return (
    <div className="border-violeta bg-papel-crudo my-6 border-l-2 p-5 text-sm leading-relaxed">
      {children}
    </div>
  );
}
