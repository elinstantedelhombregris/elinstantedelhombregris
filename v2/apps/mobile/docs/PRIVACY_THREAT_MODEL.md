# Privacidad y amenazas

## Activos sensibles

- ubicación exacta de personas, hogares y organizaciones;
- fotografías con rostros, patentes o metadatos EXIF;
- datos de contacto;
- necesidades relacionadas con salud, alimento, violencia o situación económica;
- patrones de desplazamiento;
- identidad o reputación de verificadores.

## Amenazas prioritarias

1. **Doxxing territorial:** inferir quién pidió ayuda desde un punto exacto.
2. **Datos envenenados:** spam coordinado para fabricar una crisis o esconderla.
3. **Captura política:** usar la app para puntuar lealtad, perseguir o seleccionar beneficiarios.
4. **Exposición fotográfica:** publicar caras o metadatos sin consentimiento.
5. **Reidentificación:** cruzar agregados pequeños con información pública.
6. **Contacto abusivo:** usar una oferta o necesidad para acosar.
7. **Pérdida offline:** borrar evidencia antes de sincronizar.
8. **Cuenta comprometida:** alterar verificaciones o acciones de terceros.
9. **Suplantación de dispositivo:** reutilizar un `actorKey` sin poseer su secreto.
10. **Cruce cuenta-dispositivo:** convertir una vinculación opcional en rastreo silencioso.
11. **Scraping operativo:** enrolar dispositivos anónimos para descargar señales o relaciones entre personas.

## Controles de diseño

- precisión pública configurable por campaña (`100m`, `500m`, barrio, ciudad); `exact` nunca cruza el límite del servidor;
- ubicación exacta local separada de la geometría pública;
- umbral mínimo antes de publicar agregados;
- consentimiento específico para foto, ubicación, publicación y contacto;
- borrado de EXIF y guía visible para evitar rostros;
- historial de estados append-only;
- separación entre autor, verificador y confirmador de resolución cuando el riesgo lo exige;
- límites de frecuencia y detección de duplicados;
- bloqueo, denuncia y revisión de seguridad;
- exportación, corrección, revocación y eliminación;
- ningún log técnico contiene texto cívico, contacto o coordenadas exactas.
- secreto de dispositivo aleatorio en Keychain/Keystore y sólo hash con pepper en servidor;
- JWT separado por audiencia para cuentas y dispositivos;
- vinculación y desvinculación exigen prueba simultánea de ambas identidades;
- mínimo de cinco contribuyentes y bandas de cardinalidad en todo agregado público;
- `eventId` e `idempotencyKey` se validan contra un hash canónico para detectar reuso conflictivo.
- el feed operativo exige una cuenta vinculada, omite claves de actor y sólo muestra conexiones a sus dos partes;
- dos dispositivos vinculados a una misma cuenta no pueden corroborarse ni conectarse entre sí;
- la doble aceptación, la entrega y la confirmación son claims persistidos y ordenados en servidor;
- al cerrar sesión se retira del teléfono la proyección recibida de la red y se conserva la autoría local.

## Regla de lanzamiento

Toda campaña nueva define antes de publicarse: finalidad, datos mínimos, evidencia, precisión, vigencia, quién puede verificar, riesgos, retención y condición de cierre.
