/**
 * Email body templates in rioplatense Spanish.
 *
 * Both HTML and plaintext versions are emitted; clients pick whichever
 * they prefer. The HTML uses inline styles only (no <style> blocks)
 * because Gmail / Outlook strip them.
 */

const FOOTER_HTML = `
  <p style="margin:24px 0 0;color:#666;font-size:12px;line-height:1.5">
    Si vos no pediste esto, podés ignorar este email tranquilo.<br/>
    Equipo de El Instante del Hombre Gris.
  </p>
`;

const FOOTER_TEXT = '\n\nSi vos no pediste esto, podés ignorar este email tranquilo.\nEquipo de El Instante del Hombre Gris.';

export function emailVerificationTemplate(opts: { name: string; verifyUrl: string }) {
  const subject = 'Verificá tu email — El Instante del Hombre Gris';
  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#222">
      <h1 style="margin:0 0 16px;font-size:24px">¡Hola, ${opts.name}!</h1>
      <p style="margin:0 0 16px;line-height:1.6">
        Te diste de alta en El Instante del Hombre Gris. Para activar tu cuenta, hacé click en el botón:
      </p>
      <p style="margin:24px 0">
        <a href="${opts.verifyUrl}"
           style="display:inline-block;padding:12px 24px;background:#7D5BDE;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">
          Verificar mi email
        </a>
      </p>
      <p style="margin:0 0 16px;color:#666;font-size:14px">
        O copiá este link en el navegador:<br/>
        <span style="word-break:break-all">${opts.verifyUrl}</span>
      </p>
      <p style="margin:0;color:#666;font-size:14px">El link vale por 24 horas.</p>
      ${FOOTER_HTML}
    </div>
  `;
  const text = `¡Hola, ${opts.name}!

Te diste de alta en El Instante del Hombre Gris. Para activar tu cuenta, abrí este link:

${opts.verifyUrl}

El link vale por 24 horas.${FOOTER_TEXT}`;
  return { subject, html, text };
}

export function passwordResetTemplate(opts: { name: string; resetUrl: string }) {
  const subject = 'Recuperá tu contraseña — El Instante del Hombre Gris';
  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#222">
      <h1 style="margin:0 0 16px;font-size:24px">¡Hola, ${opts.name}!</h1>
      <p style="margin:0 0 16px;line-height:1.6">
        Pediste recuperar tu contraseña. Hacé click en el botón para crear una nueva:
      </p>
      <p style="margin:24px 0">
        <a href="${opts.resetUrl}"
           style="display:inline-block;padding:12px 24px;background:#7D5BDE;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">
          Crear contraseña nueva
        </a>
      </p>
      <p style="margin:0 0 16px;color:#666;font-size:14px">
        O copiá este link en el navegador:<br/>
        <span style="word-break:break-all">${opts.resetUrl}</span>
      </p>
      <p style="margin:0;color:#666;font-size:14px">El link vale por 1 hora. Después tendrás que pedirlo de nuevo.</p>
      ${FOOTER_HTML}
    </div>
  `;
  const text = `¡Hola, ${opts.name}!

Pediste recuperar tu contraseña. Abrí este link para crear una nueva:

${opts.resetUrl}

El link vale por 1 hora. Después tendrás que pedirlo de nuevo.${FOOTER_TEXT}`;
  return { subject, html, text };
}
