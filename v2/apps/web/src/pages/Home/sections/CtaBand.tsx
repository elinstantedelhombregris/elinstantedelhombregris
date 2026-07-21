import { Link } from 'wouter';

export function CtaBand() {
  return (
    <section className="bg-violeta text-papel">
      <div className="mx-auto max-w-[1440px] px-5 py-20 text-center min-[961px]:px-10">
        <div className="font-space mb-[18px] text-[11px] uppercase tracking-[0.2em] opacity-75">
          El mandato se escribe con voces, no con votos en blanco
        </div>
        <h2 className="font-anton mb-8 text-[clamp(44px,6vw,88px)] leading-[0.98]">
          Tu voz pesa.
          <br />
          Soltala en el mapa.
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/el-mapa"
            className="bg-papel font-space text-tinta px-[30px] py-[18px] text-[13px] font-bold uppercase tracking-[0.08em] transition-transform duration-150 hover:-translate-y-0.5"
          >
            Ir al mapa
          </Link>
          <Link
            href="/la-semilla-de-basta"
            className="border-papel font-space text-papel hover:bg-papel hover:text-tinta border px-[30px] py-[18px] text-[13px] uppercase tracking-[0.08em] transition-colors duration-200"
          >
            Sembrar mi compromiso
          </Link>
        </div>
      </div>
    </section>
  );
}
