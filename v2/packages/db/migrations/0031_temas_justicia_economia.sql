-- Los temas pasan de once a trece. El 9/10/2026 el dueño del producto decidió
-- sumar Justicia y Economía al catálogo cerrado que sembró la 0022: faltaban dos
-- asuntos que la gente trae seguido y que no cabían en ninguno de los once.
-- Sólo datos: la tabla no cambia. Los dos van al final, con el orden 12 y 13, y
-- los once anteriores conservan su clave y su lugar.
-- Sin objetivo en el ON CONFLICT: cubre tanto la clave repetida como el orden
-- repetido (`temas_orden_unique`), así que volver a correr esto no rompe nada.
INSERT INTO "temas" ("clave", "etiqueta", "orden") VALUES
  ('justicia', 'Justicia', 12),
  ('economía', 'Economía', 13)
ON CONFLICT DO NOTHING;
