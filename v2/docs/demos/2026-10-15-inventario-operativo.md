# Inventario operativo de v2 · 15/10/2026

Lectura de la base v2 autorizada al preparar el despliegue de 0039. Corte de consulta:
21:53:32 UTC. No se extrajeron textos personales, credenciales ni coordenadas de
participantes; el informe privado conserva conteos y códigos del catálogo.

## Corpus almacenado

`senales`, `dreams`, `fichas_futuro`, `ficha_argumentos`, `capacidades`,
`reservas_capacidad`, `iniciativas`, `iniciativa_tasks`, `mission_evidence` y
`sintesis_nacionales`: **cero filas en cada tabla en ese momento**. Es una lectura
fechada del almacenamiento, no una afirmación permanente sobre participación.
Los ejemplos de salud, transporte, agua y apoyo escolar son recorridos aislados;
no se cuentan como participación, evidencia, acuerdos ni resultados de un piloto.

## Catálogo y dibujo

| Nivel | Catálogo operativo | IGN con código | Coincidencias | Solo IGN | Solo catálogo |
| --- | ---: | ---: | ---: | ---: | ---: |
| Jurisdicción | 24 | 24 | 24 | 0 | 0 |
| Departamento | 529 | 528 | 528 | 0 | 1 |
| Municipio | 2.082 | 2.103 | 2.080 | 23 | 2 |

Además hay 4.027 localidades y 11.324 asentamientos en el catálogo operativo,
y diez geometrías municipales sin código. Estos recuentos no expresan población.

Solo catálogo: departamento 94028 (Antártida Argentina, fuera del recorte),
municipios 740073 (Nación Ranquel) y 822784 (El Rabón; conflicto documental del IGN
con Hardy ya registrado). No se inventó una equivalencia para resolverlos.

Solo IGN: 220473, 386164, 540199, 780007, 780014, 780021, 780028, 780035,
780042, 780049, 780056, 780063, 780070, 780074, 780077, 780084, 780091,
780098, 785007, 785014, 785021, 785035 y 785042.

El catálogo censal de 2022 tiene otro universo y otra edición: no se reinterpretan
sus 35 categorías residuales de gobierno local como municipios. La página de
conciliación recalcula el cruce contra el entorno donde se ejecute su API.

## Operación y límites

El esquema de producción incluye 0039. El repositorio tiene rutas y componentes
para los circuitos de fichas, capacidades, escucha, campo y síntesis; no se verificó
que esa revisión del código esté publicada en Vercel. Tampoco se certifican aquí
la ejecución efectiva de crons, una nueva distribución nativa o el circuito en
un teléfono físico. E0.1 conserva esas comprobaciones abiertas.

La auditoría de límites detectó 11 polígonos inválidos; ver D-131 e informe público.
No habilita agregados departamentales ni transferencia automática de cifras
censales. El siguiente paso de datos es preparar y contrastar una edición corregida.
El siguiente paso territorial es acordar localidades, interlocutores y sesiones
reales; disponer del software no constituye una visión representativa de país.
