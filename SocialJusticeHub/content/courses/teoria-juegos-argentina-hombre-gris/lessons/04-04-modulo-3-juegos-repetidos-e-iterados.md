Módulo 3 · Juegos repetidos e iterados

# Cuando la reputación pesa: delta, memoria y cooperación sostenida para rediseñar Argentina

Las partidas argentinas rara vez son únicas. Los mismos actores se cruzan en múltiples mesas, elecciones, licitaciones y agendas territoriales. Este módulo te entrega las herramientas para modelar esa repetición: factores de descuento, estrategias como Tit for Tat, Grim Trigger o Pavlov, y métodos para medir reputación y memoria corta. Con estos conceptos podrás diseñar microacuerdos que se sostengan ronda tras ronda.

## 1. Factor de descuento (δ) y horizonte

El factor de descuento δ representa cuánto valoran los jugadores el futuro. Va de 0 (no me importa mañana) a 1 (valoro el futuro tanto como el presente). Cuando δ es alto, cooperar se vuelve atractivo porque las recompensas futuras pesan.

            **Visualización:** Si δ ≥ 0.5 en un juego tipo Prisionero, es posible sostener cooperación con estrategias condicionales. En Argentina, sectores con contrato a largo plazo (energía, agro, infraestructura) suelen tener δ alto; en cambio, programas asistenciales de corta duración tienen δ bajo, lo que incentiva el oportunismo.

**Ejemplo:** Un municipio ofrece un contrato de residuos por 5 años. Si el adjudicatario valora la renovación (δ≈0.8), preferirá cooperar para no perder reputación. Si el contrato dura 6 meses (δ≈0.2), la tentación de capturar todo al inicio es mayor. Diseñar acuerdos con horizonte mínimo y renovaciones condicionadas aumenta δ.

## 2. Estrategias clásicas en juegos iterados

### Tit for Tat (TFT)

- Coopera en la primera ronda.
- Replica la jugada anterior del otro.
- Perdona rápido si el otro vuelve a cooperar.

Funciona bien cuando hay poca información y se necesita construir confianza rápidamente.

### Grim Trigger

Coopera hasta que el otro defeque; luego castiga para siempre. Es efectivo si el castigo perpetuo es creíble, pero en Argentina suele disparar espirales de venganza. Lo usamos sólo en contratos donde la expulsión definitiva es factible (ej. licitaciones con cláusula anticorrupción).

### Generous TFT

Similar a TFT, pero perdona ocasionalmente fallas para absorber ruido (errores). Útil en contextos con burocracia pesada, donde no todo defecto es malicia.

### Pavlov (Win-Stay, Lose-Shift)

Mantiene la estrategia si el resultado fue bueno, cambia si fue malo. Excelente para laboratorios donde se experimenta con nuevas reglas y se mide rápidamente el impacto.

## 3. Folk Theorem y condiciones para cooperación

El **Folk Theorem** establece que, en juegos repetidos infinitos con suficiente paciencia (δ alto), casi cualquier resultado puede sostenerse como equilibrio con las estrategias correctas. Traducción para el Hombre Gris: si instalamos reputación pública y castigos proporcionales, podemos diseñar microacuerdos donde la cooperación sea racional.

- **Condición 1:** δ suficientemente alto (los actores esperan seguir interactuando).
- **Condición 2:** Existe monitoreo creíble (memoria pública).
- **Condición 3:** Castigos que duelen pero no destruyen (memoria corta).

**Aplicación:** redes de salud pública. Si hospitales y provincias esperan seguir colaborando, y se publican indicadores mensuales de derivaciones, es más racional compartir recursos que ocultarlos.

## 4. Resiliencia frente a ruido (errores)

En la práctica, muchos defectos son ruido: faltan datos, alguien olvidó enviar un reporte, la transferencia se atrasó. Las estrategias deben tolerar esos fallos para no caer en guerras inútiles.

            **Protocolo “Ruido controlado”:**

1. Clasifica defectos en *error* (sin intención) o *abuso*.
2. Define pruebas objetivas (capturas del sistema, actas firmadas).
3. Permite un margen de error (ej. 1 defecto cada 5 rondas) antes de castigar.
4. Comunica públicamente cuándo se activa el castigo para evitar sospechas.

## 5. Memoria pública y tableros

Sin registro, los juegos repetidos se degradan a juegos simultáneos (todos especulan). Necesitamos tableros que muestren quién coopera y quién defeca.

            ![Curvas de pago estratégico acumulado](/course-graphics/hombre-gris/evolucion-pago-estrategico.svg)

*El tablero debe mostrar la curva acumulada para cooperación vs defecto. Si la curva cooperativa no domina, rediseña los incentivos.*

Herramientas:

- **tableros públicos:** actualizados cada semana, con indicadores clave (cumplimiento, tiempo de respuesta, compromisos).
- **Bitácoras compartidas:** actas digitales firmadas después de cada ronda.
- **Semáforos reputacionales:** verde (cooperó), amarillo (ruido), rojo (defecto intencional).

## 6. Caso completo · Laboratorio de crédito cooperativo

Contexto: banco público y asociación de productores rurales en Santa Fe. Se repetían renegociaciones cada campaña. Se decidió montar un juego iterado explícito.

### Diseño

- δ alto: contrato de 3 campañas con cláusula de renovación automática si ambos cumplen.
- Estrategia banco: Generous TFT (se perdona un atraso si se justifica documentalmente).
- Estrategia productores: Pavlov (si la interacción fue positiva, replican; si hubo problema, ajustan la entrega).
- Memoria: tablero público con pagos, entregas y notas de visitas técnicas.

### Resultados

- Cooperación sostenida (C,C) 85% de las rondas.
- Reducción de atrasos del 28% al 9%.
- Escalamiento a otras regiones gracias a reputación compartida.

## 7. Caso contraejemplo · Mesa de transporte urbano

Jugadores: Nación, provincias, empresas de transporte. Se intentó un esquema iterado, pero δ era bajo porque los contratos se renovaban cada 60 días y el financiamiento llegaba tarde. Resultado: todos defecan (no se respetan frecuencias, Nación demora giros, provincias no auditan). Lecciones:

- Sin horizonte razonable, las estrategias cooperativas no tienen tiempo de florecer.
- La ausencia de memoria pública permitió narrativas contradictorias.
- Solución propuesta: contrato anual con pagos mensuales automáticos y tableros de frecuencias alimentados por GPS.

## 8. Herramientas cuantitativas

### 8.1 Valor presente de cooperación

Calcula si cooperar es rentable:
            `V = rac{R}{1 - δ}`
            donde R es el pago estratégico cooperativo por ronda. Si V supera el pago estratégico de defectar una vez, la cooperación es racional.

### 8.2 Matriz de transición

Registra probabilidades de pasar de cooperación a defecto, y viceversa. Permite visualizar en qué punto la relación se degrada y qué señales la recuperan.

### 8.3 Índice de resiliencia

Define cuánto castigo puede soportar la relación antes de romperse. Se mide con encuestas rápidas + datos duros (tiempo sin cooperación). Sirve para decidir cuán agresivo puede ser el castigo.

## 9. Ejercicios

### Ejercicio 1 · Calcula δ

1. Elige un acuerdo actual.
2. Estima cuánto valora cada actor la renovación (0-1).
3. Identifica qué variables puedes modificar para subir δ (duración, reputación, beneficios futuros).

### Ejercicio 2 · Diseña una estrategia condicional

1. Define una regla tipo TFT, Generous TFT o Pavlov para tu relación.
2. Escribe el protocolo de castigo y de perdón.
3. Comparte el documento con el actor contraparte para alinear expectativas.

### Ejercicio 3 · Tablero semanal

1. Diseña una tabla con columnas: ronda, jugada A, jugada B, pago estratégico, notas.
2. Compártela públicamente o en un canal común.
3. Define un emoji o color para cada estado (cooperó, ruido, defectó).

## 10. Checklist del módulo

- ¿Calculaste δ para al menos una relación clave?
- ¿Seleccionaste una estrategia condicional y la documentaste?
- ¿Diseñaste un tablero de memoria pública?
- ¿Clasificaste los defectos en ruido vs abuso?

            **Entrega sugerida:** sube un informe breve con tu estrategia condicional, los valores estimados de δ y el prototipo de tablero. Recibirás feedback para mejorar la resiliencia antes de escalarlo.

## 11. Preparación para el Módulo 4

El siguiente módulo abordará señales, información y reputación pública. Trae el tablero que diseñaste y la clasificación de errores vs abusos: los usaremos para definir señales creíbles y mecanismos de filtrado que sostengan tus acuerdos iterados.

## Aplicación práctica

Explora cómo la repetición, el descuento y la memoria cambian los incentivos. Cobra valor cuando lo conviertes en una decisión observable dentro de tu vida, tu comunidad y la transformación argentina. El objetivo no es repetir una definición, sino usar esta idea para leer mejor una situación, ordenar prioridades y elegir un siguiente paso con menos improvisación.

Busca un caso cercano donde este principio te permita ver algo que antes pasabas por alto: un cuello de botella, un incentivo mal diseñado, una conversación mal planteada o un recurso mal aprovechado. Si el concepto no mejora tu lectura de lo concreto, todavía no terminó de asentarse.

## Idea fuerza

Módulo 3 · Juegos repetidos e iterados vale por su capacidad para mejorar decisiones reales dentro de tu vida, tu comunidad y la transformación argentina. Cuando una lección te ayuda a ver mejor, priorizar mejor y actuar con mayor consistencia, deja de ser información suelta y se convierte en capacidad acumulable.
