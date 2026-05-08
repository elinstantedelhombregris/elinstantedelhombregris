export function DetallesCalculoCostoHumano() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-20">
      <header className="mb-12">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">Metodología</p>
        <h1 className="font-serif text-4xl font-semibold leading-tight md:text-5xl">
          <span className="gradient-text">Detalles del cálculo</span><br />
          <span className="gradient-text">del costo humano.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Cada cifra que mostramos sobre el costo humano del statu quo argentino tiene fuente. Esto explica
          de dónde sale, cómo se calculó, y qué supuestos hace.
        </p>
      </header>

      <article className="space-y-8 text-foreground/90">
        <section className="glass rounded-2xl p-6">
          <h2 className="font-serif text-xl font-semibold">Qué medimos</h2>
          <p className="mt-3 leading-relaxed">
            El costo humano combina indicadores que el PBI no captura: horas de vida perdidas en burocracia,
            años de salud sustraídos por listas de espera, expectativa de vida diferencial por código postal,
            confianza institucional medida por encuesta longitudinal.
          </p>
        </section>

        <section className="glass rounded-2xl p-6">
          <h2 className="font-serif text-xl font-semibold">De dónde sale</h2>
          <p className="mt-3 leading-relaxed">
            Fuentes públicas (INDEC, Ministerio de Salud, encuestas de opinión publicadas), normalizadas a
            unidades comparables. Cada cifra publicada lleva un identificador y un link a la fuente; podés
            replicarla con la planilla abierta.
          </p>
        </section>

        <section className="glass rounded-2xl p-6">
          <h2 className="font-serif text-xl font-semibold">Qué no medimos (todavía)</h2>
          <p className="mt-3 leading-relaxed">
            Bienestar subjetivo, redes de apoyo informales, cuidado no remunerado, capital simbólico. Son
            cruciales pero metodológicamente costosos. Cuando tengamos la encuesta nacional propia (PLANINS),
            esos indicadores entran al tablero.
          </p>
        </section>

        <section className="glass rounded-2xl p-6">
          <h2 className="font-serif text-xl font-semibold">Cómo contribuir</h2>
          <p className="mt-3 leading-relaxed">
            Esta metodología es pública y revisable. Si encontrás un error o tenés una fuente mejor, podés
            sumarla por el formulario de feedback. Cada corrección queda en el registro público con tu nombre
            y la fecha — los datos también necesitan curadores.
          </p>
        </section>
      </article>
    </main>
  );
}

export default DetallesCalculoCostoHumano;
