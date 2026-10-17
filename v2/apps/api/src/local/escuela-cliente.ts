/** Cliente de preparación: usa login y cookies de la API real, sin firmar tokens propios. */
export async function clienteEscolar(usuario: string, password: string) {
  const base = 'http://127.0.0.1:4000';
  const r = await fetch(base + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: usuario, password }),
  });
  if (!r.ok) throw new Error(`No se pudo ingresar con la cuenta local ${usuario}: ${r.status}`);
  const cookies = r.headers
    .getSetCookie()
    .map((c) => c.split(';')[0])
    .join('; ');
  const login = (await r.json()) as { data: { csrfToken: string } };
  return async function pedir<T>(ruta: string, cuerpo?: object): Promise<T> {
    const res = await fetch(base + '/api' + ruta, {
      method: cuerpo ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies,
        'X-CSRF-Token': login.data.csrfToken,
      },
      ...(cuerpo ? { body: JSON.stringify(cuerpo) } : {}),
    });
    if (!res.ok) throw new Error(`${ruta}: ${res.status} ${await res.text()}`);
    return ((await res.json()) as { data: T }).data;
  };
}
