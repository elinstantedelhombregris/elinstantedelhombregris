# Credencial limitada para campo nativo

La web mantiene JWT en cookies httpOnly y protección CSRF. La app nativa existente
habla con otra API comunitaria; no es válido reutilizar esos tokens en v2.

Se agrega un secreto opaco de 256 bits emitido desde la sesión web con CSRF y
mostrado una sola vez. Se guarda en SecureStore, nunca en SQLite, AsyncStorage,
URLs o logs. El servidor conserva SHA-256, fecha de expiración y revocación.
La ruta exclusiva `/api/campo-nativo` acepta solamente ese Bearer; no acepta
cookies como autenticación, ni modifica la política de autenticación web. Se monta
antes de CSRF (no usa autoridad ambiental del navegador), después de los límites
de tasa. Los cuerpos incluyen la cuenta esperada. Caduca en 30 días y puede
revocarse en cualquier momento; una solicitud ya autorizada en curso puede terminar.
La versión web de Expo no admite guardar esta credencial.

Alcance: descargar tareas asignadas, publicar resúmenes propios autorizados y
retirar evidencia propia. No permite administrar, revisar, ver notas privadas,
reservar capacidades, ni autenticar otros endpoints. El secreto se copia
manualmente; un futuro enlace por código de un solo uso puede mejorar este paso.
