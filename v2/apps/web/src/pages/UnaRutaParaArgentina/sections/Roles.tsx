const ROLES = [
  {
    name: 'Ciudadanos',
    verb: 'Diseñan',
    description:
      'Imaginan el país como si lo empezaran hoy. Aportan vivencia, experticia, intuición. No piden permiso.',
  },
  {
    name: 'Estado',
    verb: 'Administra',
    description:
      'Mide lo que importa, registra los acuerdos, protege la continuidad. No diseña políticas: las administra después de que el pueblo las diseñó.',
  },
  {
    name: 'Política',
    verb: 'Ejecuta',
    description:
      'Los representantes electos ejecutan lo que el diseño popular pidió. No al revés. Su éxito se mide por fidelidad al diseño, no por lealtad partidaria.',
  },
];

export function Roles() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-semibold">Tres roles, una división</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Recuperar la democracia es recordar quién hace qué. Esta es la división del trabajo que ¡BASTA!
          propone — no como dogma, como resultado de pensar bien.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {ROLES.map((role) => (
          <div key={role.name} className="glass rounded-2xl p-6">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{role.name}</p>
            <p className="mt-2 font-serif text-2xl font-semibold text-iris-violet">{role.verb}</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/85">{role.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
