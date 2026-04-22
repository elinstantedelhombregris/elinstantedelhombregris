Módulo 2 · Juegos estáticos y estrategias dominantes

# Matrices que explican subsidios, paritarias y licitaciones: dominar los juegos simultáneos en Argentina

Cuando las decisiones se toman al mismo tiempo (o sin conocer la jugada del otro), las matrices de pago estratégico revelan dónde se estanca la cooperación. En este módulo aprenderás a construir y analizar juegos estáticos de 2x2 y 3x3, detectar estrategias dominantes, calcular mejores respuestas y utilizar equilibrios (puros y mixtos) para rediseñar políticas públicas.

## 1. Anatomía de un juego simultáneo

Un juego estático es aquel en el que los jugadores eligen sus estrategias de manera simultánea o sin observar lo que hace el resto. Esta estructura aparece en licitaciones selladas, paritarias cuando se presentan ofertas finales, decisiones presupuestarias, fijación de precios y muchas negociaciones reguladoras. Para modelarlo necesitamos:

1. **Lista de jugadores** con sus estrategias posibles.
2. **Matriz de pagos estratégicos** donde cada celda muestra la recompensa de ambos jugadores para cada combinación de estrategias.
3. **Herramientas de análisis** para detectar mejor respuesta, estrategia dominante y equilibrios.

La ventaja del Hombre Gris es que convierte estos modelos en tableros vivos: al compartir la matriz con los actores, se transparentan los incentivos y se identifica qué cambios reglamentarios se necesitan para mover el equilibrio.

## 2. Construyendo matrices 2x2: subsidios energéticos

Tomemos el conflicto clásico entre **Estado (E)** y **Distribuidoras (D)** sobre subsidios energéticos y tarifas.

<pre>
D \ E           | Sostener subsidio (S)                  | Ajustar tarifa (A)
------------------------------------------------------------------------------------
Invertir (I)     | +3 / +4 (servicio estable, popularidad) | +4 / +2 (calidad alta, costo político)
Reducir (R)      | +2 / +1 (corto plazo, deterioro red)    | +5 / -1 (ganancia empresa, conflicto social)
          </pre>

Interpretación:

- Si ambas partes cooperan (S,I), los usuarios reciben servicio y el gobierno mantiene apoyo, pero la red sigue tensionada.
- Si el Estado ajusta tarifas y la empresa invierte (A,I), el sistema se vuelve sustentable, pero el costo político es alto (pago estratégico +2 para el Estado).
- Si la empresa reduce inversiones cuando el Estado ajusta (A,R), se produce un castigo fuerte para el gobierno.

Para identificar el equilibrio debemos analizar mejor respuesta:

- **Mejor respuesta de D:** Si el Estado sostiene subsidios (S), invertir (I) da pago estratégico +4 vs +1; si ajusta (A), invertir da +2 vs -1. Por lo tanto, **I domina a R**.
- **Mejor respuesta de E:** Si D invierte (I), ajustar (A) ofrece +4 vs +3 ⇒ preferencia por A. Si D reduce (R), sostener (S) ofrece +2 vs +5 (pero +5 es para D, no E). Para el Estado, S da +2 vs A con +1. Entonces la mejor respuesta es S. Resultado: equilibrio (S,I).

Este equilibrio parece razonable pero no óptimo. El objetivo del Hombre Gris es rediseñar la matriz para que (A,I) sea más atractivo (por ejemplo aumentando la recompensa política del ajuste mediante una tarifa social automática y tableros que expliquen el destino de los fondos).

## 3. Matrices 3x3: paritarias nacionales

En las negociaciones salariales participan **Gobierno (G)**, **Sindicatos (S)** y **Empresas (E)**. Podemos reducir el análisis a un juego G-S donde las empresas responden con inversión o no. Sin embargo, cuando las tres partes actúan simultáneamente, necesitamos una matriz 3x3 (simplificada aquí a dos jugadores con tres estrategias cada uno para visualizar la lógica).

<pre>
Sindicato \ Gobierno | Aumentos escalonados (AE) | Bono + cláusula gatillo (BG) | Congelar con revisión (CR)
---------------------------------------------------------------------------------------------------------------
Moderado (M)          | +3 / +4                    | +4 / +3                      | +2 / +5
Presión alta (P)      | +1 / +1                    | +3 / +2                      |  0 / +4
Confrontación (C)     | -1 / 0                     | +1 / +1                      | -2 / +3
          </pre>

Aquí el **Gobierno** busca elegir la columna que maximiza su resultado, considerando la estrategia sindical:

- Si el sindicato es moderado (M), la mejor respuesta del Gobierno es AE (pago estratégico +4).
- Si hay presión alta (P), la mejor respuesta es CR (+4).
- Si hay confrontación (C), la mejor respuesta es BG (+1) para evitar daño.

El sindicato analiza fila por fila. Si el Gobierno elige AE, M domina (pago estratégico +3). Si elige BG, M gana con +4. Si elige CR, P gana con 0 > -2. Conclusión: (AE, M) es un equilibrio de Nash, pero no siempre alcanzable porque los jugadores no observan la decisión del otro antes de realizarla. Por eso se recurre a preacuerdos (actas) que reducen la simultaneidad o instalan señales públicas.

            **Insight:** los sindicatos moderados necesitan una garantía creíble de que sus concesiones serán recompensadas. Diseñar un mecanismo donde los aumentos escalonados se activen automáticamente ante métricas de inflación genera un incentivo a permanecer en la estrategia M.

## 4. Estrategias dominantes y dominancia iterada

Una **estrategia dominante** produce un pago estratégico igual o superior al resto, sin importar lo que haga el otro jugador. Identificarla permite anticipar el comportamiento real aunque el discurso diga lo contrario.

- **Dominancia estricta:** una estrategia es mejor en todas las combinaciones.
- **Dominancia débil:** nunca es peor y a veces es mejor.
- **Dominancia iterada:** eliminando estrategias dominadas de manera sucesiva se pueden reducir matrices complejas.

**Ejemplo:** Licitación de obra pública con tres ofertas: transparente (T), semi-opaca (S) y opaca (O). Si el Estado implementa auditoría en tiempo real, la estrategia O queda dominada porque siempre termina con sanciones. Al eliminarla, los jugadores se enfocan en T o S. Si además se publican puntajes de reputación, T se vuelve dominante. Esta depuración racionaliza el juego sin necesidad de controlar cada jugada en detalle.

## 5. Mejor respuesta y diagramas de reacción

La **mejor respuesta** es la estrategia óptima dada una elección del rival. Los diagramas de reacción (best-response) nos permiten visualizar cómo se intersectan las mejores respuestas para encontrar equilibrios.

**Aplicación:** fijación de precios entre dos cadenas de supermercados en el AMBA. Cada una decide precio alto (H) o bajo (L). El diagrama de mejor respuesta muestra que si una elige L, la otra también responde con L para no perder mercado. Resultado: equilibrio (L,L), es decir, guerra de precios. Para moverlo, el Estado debe modificar la matriz (por ejemplo, con incentivos fiscales condicionales a acuerdos de precios + abastecimiento). Así, el pago estratégico de (H,H) aumenta, generando un nuevo equilibrio cooperativo.

## 6. Equilibrios puros y mixtos

### 6.1 Equilibrios puros

Se dan cuando cada jugador elige una estrategia concreta que es mejor respuesta al otro. Muchos conflictos argentinos tienen equilibrios puros malos (ej. informalidad generalizada). Para salir de ellos debemos alterar la matriz. Ejemplos:

- **Informalidad laboral:** (Patrón defeca, Estado defeca) es un equilibrio puro. Introducir inspecciones inteligentes + beneficios para las pymes que formalizan cambia la estructura.
- **Residuos urbanos:** (Vecino defeca, Municipio defeca) es equilibrio puro. Microacuerdos con recompensas por reciclaje y penalización automática rompen esa estabilidad.

### 6.2 Equilibrios mixtos

Cuando no existe equilibrio puro, los jugadores mezclan estrategias con ciertas probabilidades. Ejemplo: control aduanero vs contrabando hormiga. El Estado no puede inspeccionar todos los contenedores, y los contrabandistas deben decidir cuándo arriesgar. Se establece un equilibrio mixto donde el Estado inspecciona con probabilidad p y los contrabandistas intentan con probabilidad q. Ajustando p (más tecnología, analítica) se reduce la rentabilidad de defectar.

            **Nota práctica:** Aunque los equilibrios mixtos parecen abstractos, se pueden traducir en “turnos aleatorios” de auditorías, sorteos de inspección o rotaciones de personal que impiden que el opositor anticipe la jugada.

## 7. Caso aplicado · Licitación transparente vs. captura

Supongamos una licitación provincial con empresas A y B. Cada una puede elegir:

- **Oferta honesta (H):** costos reales, sin coimas.
- **Oferta maquillada (M):** costos inflados y acuerdos por debajo de la mesa.

<pre>
B \ A | Honesta (H)                 | Maquillada (M)
------------------------------------------------------------
Honesta (H) | +4 / +4 (obra eficiente, reputación alta) | +1 / +5 (B captura, A queda fuera)
Maquillada (M) | +5 / +1 (A captura)                | +2 / +2 (sobreprecio, sanciones leves)
          </pre>

Sin controles, (M,M) puede ser equilibrio porque ambos temen quedar afuera si cooperan. ¿Cómo lo cambiamos?

1. Instalando **auditoría previa obligatoria**, el pago estratégico de (M,·) cae por riesgo de sanción.
2. Otorgando **bonos de reputación** canjeables por créditos baratos, (H,H) se vuelve más atractivo.
3. Publicando la matriz a los oferentes (con incentivos y sanciones) se construye transparencia radical.

Este caso demuestra que no basta con pedir “ofertas honestas”; hay que rediseñar el juego.

## 8. Toolkit para juegos estáticos

### 8.1 Plantilla de matriz

Incluye instrucciones para: definir estrategias, calcular pagos estratégicos (económicos, reputacionales, regulatorios) y señalar equilibrios con íconos. Disponible en la carpeta de recursos.

### 8.2 Checklist de dominancia

1. Comparar filas/columnas para cada jugador.
2. Eliminar estrategias que nunca son óptimas.
3. Repetir hasta que quede la matriz reducida.

### 8.3 Script de conversación

Guion para presentar la matriz a los actores sin generar resistencia. Incluye preguntas abiertas (“¿Qué necesitarías para moverte hacia esta celda cooperativa?”) y protocolos para documentar compromisos.

## 9. Ejercicios prácticos

### Ejercicio A · Paritaria local

1. Define las tres principales estrategias del sindicato y del gobierno municipal.
2. Construye la matriz 3x3 e identifica el equilibrio actual.
3. Propone un cambio (incentivo, sanción, señal) que altere los pagos estratégicos.

### Ejercicio B · Licitación de servicios urbanos

1. Modela las estrategias (servicio premium vs básico, transparencia vs captura).
2. Calcula mejor respuesta para cada empresa.
3. Diseña un mecanismo para que cooperar sea dominante (ej. reputación, incentivos financieros, exclusiones).

### Ejercicio C · Juego ciudadano

Elige una interacción cotidiana (ej. pago de expensas, cuidado de un barrio). Construye una matriz 2x2 entre “vecinos organizados” y “administración”. Diagnostica el equilibrio y planifica la primera señal para moverlo.

## 10. Casos argentinos destacados

### Caso · Programa Precios Justos

Juego simultáneo entre supermercados y Gobierno. Sin cumplimiento digital, el equilibrio derivó en trampas. La introducción de verificadores ciudadanos y apps de denuncia modificó pagos estratégicos, pero el castigo siguió siendo débil. La lección: sin sanción automática, la estrategia dominante sigue siendo defraudar.

### Caso · Consorcio Ruta 3

Empresas constructoras y cooperativas se aliaron para presentar propuestas conjuntas. Al compartir información, construyeron una matriz donde la cooperación les daba acceso a financiamiento del BID, volviendo dominante la estrategia honesta. Resultado: obra ejecutada con 15% menos de costos y reputación elevada.

## 11. Checklist de salida

- ¿Modelaste al menos un conflicto real con matrices 2x2 y 3x3?
- ¿Identificaste estrategias dominantes y mejores respuestas?
- ¿Diseñaste al menos una intervención para modificar pagos estratégicos?
- ¿Compartiste tu matriz con los actores relevantes?

            **Entrega sugerida:** publica tus matrices y el plan de intervención en el foro. Incluye un audio o video corto explicando cómo piensas mover el equilibrio. Recibirás comentarios para afinarlo antes del módulo 3.

## 12. Preparación para el Módulo 3

Ahora que dominas los juegos simultáneos, daremos un salto a los juegos repetidos e iterados, donde la reputación y el tiempo cambian todo. Trae tus matrices: las convertiremos en series temporales y mediremos qué sucede cuando los jugadores tienen memoria y expectativas de futuro.

## Idea fuerza

Módulo 2 · Juegos estáticos y estrategias dominantes vale por su capacidad para mejorar decisiones reales dentro de tu vida, tu comunidad y la transformación argentina. Cuando una lección te ayuda a ver mejor, priorizar mejor y actuar con mayor consistencia, deja de ser información suelta y se convierte en capacidad acumulable.
