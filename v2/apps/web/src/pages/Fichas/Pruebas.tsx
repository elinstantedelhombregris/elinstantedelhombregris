import { useRef, useState } from 'react';
import { Link } from 'wouter';

import { Campo } from './Campo';
import { TITULOS_DE_DISENO } from './presentacion';
import { TarjetaPrueba } from './TarjetaPrueba';

import type { DisenoFicha } from '@v2/shared';

import { BotonConMotivo } from '~/components/participacion/BotonConMotivo';
import { CAMPO } from '~/components/participacion/constantes';
import { ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { useAuth } from '~/lib/auth/use-auth';
import { useOperacionPersonal } from '~/lib/queries/participacion';

type Errores = Partial<Record<'a' | 'titulo' | 'alcance' | 'plazo', string>>;

export function Pruebas({ datos, hrefIngreso }: { datos: DisenoFicha; hrefIngreso: string }) {
  const auth = useAuth();
  const idLocal = useRef(crypto.randomUUID());
  const op = useOperacionPersonal();
  const formulario = useRef<HTMLFormElement>(null);
  const [a, setA] = useState('');
  const [titulo, setTitulo] = useState('');
  const [alcance, setAlcance] = useState('');
  const [plazo, setPlazo] = useState('');
  const [errores, setErrores] = useState<Errores>({});
  const [aviso, setAviso] = useState('');
  return (
    <section aria-labelledby="pruebas-titulo">
      <h3 id="pruebas-titulo" className="font-anton text-3xl">
        {TITULOS_DE_DISENO.pruebas}
      </h3>
      <p className="mt-4 leading-relaxed">
        Una prueba es un experimento acotado: tiene un lugar, personas a cargo y una fecha para
        revisar qué pasó. Lo que sale mal también queda como aprendizaje. Declarar que algo se hizo
        todavía necesita observar su resultado.
      </p>
      <p
        role="status"
        className={aviso ? 'border-violeta my-4 border-l-2 pl-4 text-sm' : 'sr-only'}
      >
        {aviso}
      </p>
      <div className="mt-6 space-y-6">
        {datos.pruebas.map((p) => (
          <TarjetaPrueba key={p.id} prueba={p} avisar={setAviso} />
        ))}
      </div>
      {!datos.pruebas.length ? (
        <Nota>
          Todavía no hay pruebas. Para proponer una, primero tiene que haber una alternativa.
        </Nota>
      ) : null}
      {auth.user && datos.alternativas.length ? (
        <form
          ref={formulario}
          noValidate
          className="border-tinta mt-7 border p-5"
          onSubmit={(e) => {
            e.preventDefault();
            const problemas: Errores = {
              ...(a ? {} : { a: 'Elegí la alternativa que se pondría a prueba.' }),
              ...(titulo.trim().length >= 5
                ? {}
                : { titulo: 'Poné un nombre de al menos 5 caracteres.' }),
              ...(alcance.trim().length >= 10
                ? {}
                : { alcance: 'Contá dónde, con quién y a qué escala, en al menos 10 caracteres.' }),
              ...(plazo ? {} : { plazo: 'Elegí la fecha en que vamos a revisar qué pasó.' }),
            };
            setErrores(problemas);
            if (Object.keys(problemas).length) {
              requestAnimationFrame(() => {
                formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
              });
              return;
            }
            op.mutate(
              {
                metodo: 'post',
                ruta: '/api/v1/fichas/pruebas',
                cuerpo: { idLocal: idLocal.current, alternativaId: a, titulo, alcance, plazo },
              },
              {
                onSuccess: () => {
                  setTitulo('');
                  idLocal.current = crypto.randomUUID();
                  setAlcance('');
                  setAviso('Registramos la propuesta de prueba.');
                },
              },
            );
          }}
        >
          <h4 className="font-anton text-2xl">Proponer una prueba</h4>
          <Campo etiqueta="Alternativa" className="mt-4" error={errores.a}>
            {(atributos) => (
              <select
                {...atributos}
                className={CAMPO}
                value={a}
                onChange={(e) => {
                  setA(e.target.value);
                }}
              >
                <option value="">Elegí la alternativa que se pondría a prueba</option>
                {datos.alternativas.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.titulo}
                  </option>
                ))}
              </select>
            )}
          </Campo>
          <Campo etiqueta="Nombre" className="mt-4" error={errores.titulo}>
            {(atributos) => (
              <input
                {...atributos}
                className={CAMPO}
                value={titulo}
                maxLength={160}
                onChange={(e) => {
                  setTitulo(e.target.value);
                }}
              />
            )}
          </Campo>
          <Campo
            etiqueta="Dónde, con quién y a qué escala"
            className="mt-4"
            error={errores.alcance}
          >
            {(atributos) => (
              <textarea
                {...atributos}
                className={CAMPO}
                rows={3}
                maxLength={2000}
                value={alcance}
                onChange={(e) => {
                  setAlcance(e.target.value);
                }}
              />
            )}
          </Campo>
          <Campo
            etiqueta="Fecha de revisión"
            className="mt-4"
            error={errores.plazo}
            ayuda="Cuando llegue esta fecha, revisamos qué aprendimos."
          >
            {(atributos) => (
              <input
                {...atributos}
                className={CAMPO}
                type="date"
                value={plazo}
                onChange={(e) => {
                  setPlazo(e.target.value);
                }}
              />
            )}
          </Campo>
          <Nota>
            Proponer no obliga a otras personas ni instituciones. La responsabilidad se acepta
            explícitamente antes de avanzar.
          </Nota>
          <ErrorOperacion mensaje={op.error?.message} />
          <div className="flex flex-wrap items-center gap-3">
            <BotonConMotivo type="submit" motivo={null} ocupado={op.isPending}>
              Registrar propuesta de prueba
            </BotonConMotivo>
          </div>
        </form>
      ) : null}
      {!auth.user ? (
        <p className="mt-5">
          <Link href={hrefIngreso} className="text-violeta underline">
            Ingresá para proponer una prueba
          </Link>
          .
        </p>
      ) : null}
    </section>
  );
}
