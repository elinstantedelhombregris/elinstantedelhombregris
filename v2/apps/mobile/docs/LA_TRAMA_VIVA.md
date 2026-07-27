# La Trama Viva — arquitectura de movimiento

## Tesis

¡BASTA! no debe ser una app que extrae respuestas. Debe ser una infraestructura
de escucha, memoria, cuidado y acción donde cada dato conserve contexto,
consentimiento, incertidumbre y destino.

La unidad de éxito no es la captura. Es una transformación útil, confirmada por
las personas afectadas, sin exponerlas.

## El ciclo completo

`Pulso → Escuchar → Comprender → Cuidar → Tejer → Actuar → Confirmar → Aprender`

1. **Pulso:** el territorio muestra qué está vivo, qué falta saber y qué caducó.
2. **Escuchar:** una persona registra una necesidad, sueño, propuesta o capacidad.
3. **Comprender:** clasifica fuente, tema, horizonte, escala e importancia sin
   reducir el relato humano a esas categorías.
4. **Cuidar:** los hechos observables se corroboran; las aspiraciones se agrupan y
   deliberan. No se confunden.
5. **Tejer:** el motor sugiere afinidades entre necesidades y capacidades, pero
   nunca acuerda por las personas.
6. **Actuar:** un puente aceptado se vuelve una acción con responsables y estado.
7. **Confirmar:** quien recibe confirma el resultado; quien aporta no puede
   declararlo resuelto unilateralmente.
8. **Aprender:** la bitácora conserva qué cambió, qué no funcionó y qué haríamos
   distinto. Compartir un aprendizaje exige una derivación nueva y explícita.

## Ontología: cosas distintas, reglas distintas

| Tipo | Pregunta | Tratamiento |
| --- | --- | --- |
| Observación | ¿Qué está ocurriendo? | Evidencia, corroboración, corrección y vencimiento |
| Necesidad | ¿Qué resultado hace falta? | Titularidad, urgencia, cantidad, validez y cuidado |
| Capacidad | ¿Qué puede ponerse en movimiento? | Disponibilidad, límites, alcance y vencimiento |
| Sueño | ¿Qué futuro merece existir? | Eco, agrupación, disenso y deliberación; nunca “verificación” |
| Propuesta | ¿Qué cambio concreto se sugiere? | Hipótesis, debate, prueba y revisión |
| Acción | ¿Quién hará qué y cómo sabremos si sirvió? | Aceptación bilateral, hitos, resultado y seguimiento |
| Aprendizaje | ¿Qué entendimos después de actuar? | Privado primero; síntesis separada si se comparte |

## La Escucha Soberana

La pantalla `La Escucha` tiene cinco momentos:

1. elegir la naturaleza de la voz;
2. registrar el relato y su fuente;
3. reconocer tema, resultado deseado, fortalezas y primer paso;
4. situar horizonte, escala, importancia y deseo de apoyo;
5. decidir el destino con vista previa exacta.

El destino por defecto es **Sólo mi bitácora**. La contribución colectiva no
publica texto libre: deriva exclusivamente estas facetas controladas:

`kind · source · theme · horizon · scope · importance · supportWanted`

El relato, el resultado deseado, las fortalezas y el primer paso permanecen en
SQLite local. La ubicación es un permiso separado y se reduce a barrio antes de
salir. `escucha-v1` no entra al feed operativo de filas individuales ni a la
cola de corroboración; sólo puede aparecer en una proyección agregada con cinco
autores distintos como mínimo.

## Contrato de política pública

Una radiografía no es un mandato y una participación no representa por sí sola
a una población. Toda lectura pública debe declarar:

- período y versión del contrato;
- umbral de privacidad;
- cobertura conocida y territorios ausentes;
- método de recolección y corroboración;
- sesgos de canal y límites de interpretación;
- grupos suprimidos;
- discrepancias y disenso;
- fecha de actualización y caducidad.

La IA puede resumir una versión de datos ya protegida, señalar patrones o
proponer preguntas. No puede publicar automáticamente un mandato, resolver un
conflicto ni fabricar legitimidad democrática. Toda propuesta política necesita
deliberación, trazabilidad y adopción humana.

## Juego sin extracción

La belleza debe hacer visible el cambio de estado, no capturar atención:

- voz privada: punto de luz;
- faceta compartida: primer anillo;
- señal corroborada: segundo anillo estable;
- puente aceptado: filamento entre dos luces;
- acción en curso: brillo que recorre el filamento;
- resultado confirmado: amanecer lento sobre el territorio;
- dato vencido: luz que se atenúa sin castigo;
- cobertura faltante: espacio negativo visible.

No se premia volumen bruto, información sensible, urgencia artificial ni
competencia individual. La progresión territorial debe reconocer cobertura
difícil, corrección útil, corroboración independiente, coordinación y resultados
confirmados.

## Soberanía de datos

- Exportar produce una instantánea de las 22 tablas locales, incluidos datos
  cívicos, consentimientos y outbox; excluye contraseñas y credenciales.
- Borrar localmente elimina esas tablas, identidad cívica, token de dispositivo,
  feed y sesión comunitaria.
- La interfaz declara con honestidad que borrar el teléfono no borra copias ya
  compartidas con el servidor.
- El siguiente requisito de producción es revocación remota auditable con
  tombstones y retiro de todas las proyecciones.

## Condiciones antes de un piloto real

1. Feed operativo restringido por círculo, campaña, territorio o asignación.
2. Consentimiento inmutable por registro, propósito, audiencia y retención.
3. Revocación remota y exportación de cuenta completas.
4. Cifrado local de diarios sensibles, bloqueo de app y modo dispositivo compartido.
5. Protocolo de protección para niñez, violencia, salud, vivienda y emergencias.
6. Sincronización de misiones y celdas restringida por círculo, campaña y territorio.
7. Auditoría anti-Sybil, apelación y preservación del disenso.
8. Proyecciones nacionales materializadas y versionadas; no replay en memoria.

## Secuencia de construcción

### Ahora — fundamento

- La Escucha privada-primero.
- Bitácora longitudinal.
- Exportación y borrado local completos.
- Pulso de escucha sólo agregado y con taxonomías permitidas.
- Umbral contado por autores de registros, nunca por verificadores.
- Lazo → celdas conocidas/desconocidas → misión versionada → rutas offline.
- Pasaporte de datos por campaña: propósito, custodio, método, retención y cierre.
- Verificación con procedencia: visto ahora, conocimiento del lugar o fuente revisada.
- Sala de trama por puente: restricciones, agenda, relay seguro, tareas y seguimiento 7/30 días.

La operación territorial ya funciona localmente en el dispositivo. La misión
declara un denominador planificado y distingue celdas desconocidas, asignadas,
observadas, disputadas, corroboradas y vencidas. Una ruta corta reemplaza la
recompensa por volumen: avanzar significa reducir desconocimiento con método.
La celda sólo cambia a observada si la captura pertenece a la campaña correcta
y su ubicación cae dentro de la geometría planificada, con una tolerancia de
35 metros para error GPS. Si no hay permiso o la lectura tarda más de tres
segundos, la captura personal continúa pero no fabrica cobertura territorial.

El lazo conserva una alternativa equivalente por teclado y lector de pantalla:
convertir el área visible en territorio. La operación no depende de poder hacer
un gesto preciso sobre el mapa.

### Próximo — federación cuidada

- Compartir misiones y asignaciones sólo dentro de ámbitos autorizados.
- Relay de contacto cifrado y moderado para salas de trama.
- Revocación remota auditable de registros, consentimientos y proyecciones.
- Seguimientos programados de resultados a 7 y 30 días.
- Cifrado local, bloqueo de aplicación y modo de dispositivo compartido.

### Después — programa nacional federado

- registros de esquemas y límites territoriales;
- custodios comunitarios y federación de datos;
- lanzamientos estadísticos reproducibles;
- libro público de compromisos, responsables, plazos, evidencia y correcciones;
- deliberación plural que transforma evidencia en propuestas, nunca en obediencia algorítmica.

## Métricas que importan

- necesidades que llegan a resultado confirmado sin exposición;
- tiempo entre necesidad válida y primera respuesta útil;
- porcentaje de capacidades que encuentran un destino real;
- cobertura territorial y cobertura de grupos históricamente ausentes;
- correcciones, duplicados y datos vencidos resueltos;
- acciones con seguimiento a 7 y 30 días;
- consentimientos retirados efectivamente;
- personas que vuelven porque el sistema les sirvió, no porque una racha las castigó.
