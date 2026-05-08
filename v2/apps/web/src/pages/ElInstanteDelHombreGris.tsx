export function ElInstanteDelHombreGris() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-20">
      <header className="mb-12">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">El nombre</p>
        <h1 className="font-serif text-4xl font-semibold leading-tight md:text-6xl">
          <span className="gradient-text">El Instante</span><br />
          <span className="gradient-text">del Hombre Gris.</span>
        </h1>
      </header>

      <article className="space-y-6 text-foreground/90">
        <p className="text-lg leading-relaxed">
          <strong>Gris</strong> no es ausencia de color. Es la mezcla de todos. Es plata: cicatrices que
          ya no avergüenzan, sino que enseñan. Es <em>argentum</em> — el metal que le dio nombre al país.
        </p>
        <p className="leading-relaxed">
          El <strong>Hombre Gris</strong> es el vecino, la madre, el trabajador, la estudiante que un día
          decide dejar de culpar y empezar a crear. Cualquiera de nosotros. No un personaje: un umbral. Una
          decisión que se puede tomar hoy.
        </p>
        <p className="leading-relaxed">
          El <strong>Instante</strong> es ese momento en que se cruza el umbral. No es una hora del calendario.
          Es la primera vez que decís <em>{'«no voy a delegar más mi conciencia»'}</em>. Lo demás —los PLANs,
          el manifiesto, la ruta— son consecuencia de ese instante repetido en miles de personas.
        </p>
        <p className="leading-relaxed">
          Por eso el nombre es así: largo, deliberado, casi un mantra. Te recuerda que el país posible empieza
          en un segundo cualquiera, en cualquiera de nosotros, cuando soltamos la queja y agarramos el plano.
        </p>
        <blockquote className="rounded-r-lg border-l-4 border-iris-violet bg-iris-violet/5 py-4 pl-6 italic text-foreground/85">
          {'«Eres un pozo tallado no en piedra, sino en tiempo. Y estás destinado a desbordarte.»'}
        </blockquote>
        <p className="leading-relaxed">
          El proyecto toma su nombre de las psicografías de Benjamín Solari Parravicini sobre Argentina y
          el {'«Hombre Gris»'}. Las leemos como diagnóstico, no como profecía: lo que vio entonces es lo que
          intentamos resolver ahora, con manos, con plano, con paciencia.
        </p>
      </article>
    </main>
  );
}

export default ElInstanteDelHombreGris;
