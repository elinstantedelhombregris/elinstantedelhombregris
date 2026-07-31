import { Link } from 'wouter';

import { InstrumentoMaplibre } from './ElMapa/prototipo/InstrumentoMaplibre';

/**
 * PROTOTIPO, no producto. `/el-mapa/prototipo`.
 *
 * No está en la navegación ni linkeada desde ningún lado: existe para poder
 * mirar el instrumento sobre maplibre al lado del lienzo SVG y decidir con los
 * ojos, no con argumentos. Se borra cuando se decida — en cualquiera de los dos
 * sentidos.
 */
export function PrototipoMapa() {
  return (
    <main className="mx-auto max-w-[1440px] px-5 pb-[88px] pt-10 min-[961px]:px-10">
      <div className="border-sello mb-8 border-l-2 pl-4">
        <p className="font-space text-sello text-[11px] font-bold uppercase tracking-[0.16em]">
          Prototipo — no es la página
        </p>
        <h1 className="font-anton text-tinta mt-2 text-[clamp(28px,4vw,44px)] leading-[1.05]">
          El instrumento sobre teselas.
        </h1>
        <p className="text-tinta mt-3 max-w-[60ch] text-[16px] leading-relaxed">
          El mismo conteo honesto, el mismo panel del área y el mismo lazo que{' '}
          <Link href="/el-mapa#instrumento" className="text-violeta underline underline-offset-4">
            el instrumento de papel
          </Link>
          , dibujados por maplibre sobre un basemap de OpenStreetMap con estilo Papel y Tinta. Abrí
          los dos y compará: calles reales y zoom hasta la cuadra de un lado, identidad y
          funcionamiento sin red del otro.
        </p>
      </div>

      <InstrumentoMaplibre />

      <div className="border-tinta/20 mt-10 border-t pt-6">
        <h2 className="font-space text-tinta mb-3 text-[11px] font-bold uppercase tracking-[0.16em]">
          Qué mirar
        </h2>
        <ul className="text-tinta max-w-[70ch] space-y-2 text-[15px] leading-relaxed">
          <li>
            <strong>Si esto parece papel o parece un mapa ajeno con un filtro.</strong> Es la
            pregunta que no se contesta discutiendo.
          </li>
          <li>
            <strong>El halo.</strong> Acá está en metros reales de terreno, así que crece y se achica
            con el zoom como crecería la duda sobre el mapa. El lienzo SVG solo puede aproximarlo.
          </li>
          <li>
            <strong>Las calles.</strong> Vienen siempre y a cualquier zoom, sin el extracto de 1,2 GB
            que dejó bloqueadas las capas de departamentos, rutas y manchas urbanas.
          </li>
          <li>
            <strong>Lo que se pierde.</strong> Sin red no hay mapa, y el basemap depende de un
            proveedor de teselas.
          </li>
        </ul>
      </div>
    </main>
  );
}

export default PrototipoMapa;
