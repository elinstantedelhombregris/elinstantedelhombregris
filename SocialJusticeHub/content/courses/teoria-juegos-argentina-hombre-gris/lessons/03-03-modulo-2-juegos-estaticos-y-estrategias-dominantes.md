
        <div style="background:linear-gradient(120deg,#0f172a 0%,#1d4ed8 60%,#4c1d95 100%);color:#f8fafc;border-radius:20px;padding:2rem;box-shadow:0 25px 80px rgba(15,23,42,0.55);margin-bottom:2rem;">
          <p style="margin:0;font-size:0.85rem;letter-spacing:0.1em;text-transform:uppercase;opacity:0.75;">Módulo 2 · Juegos estáticos y estrategias dominantes</p>
          <h1 style="margin:0.75rem 0 0;font-size:2.5rem;line-height:1.15;">Matrices que explican subsidios, paritarias y licitaciones: dominar los juegos simultáneos en Argentina</h1>
          <p style="margin:1rem 0 0;max-width:72ch;">Cuando las decisiones se toman al mismo tiempo (o sin conocer la jugada del otro), las matrices de payoff revelan dónde se estanca la cooperación. En este módulo aprenderás a construir y analizar juegos estáticos de 2x2 y 3x3, detectar estrategias dominantes, calcular mejores respuestas y utilizar equilibrios (puros y mixtos) para rediseñar políticas públicas.</p>
        </div>

        <section>
          <h2>1. Anatomía de un juego simultáneo</h2>
          <p>Un juego estático es aquel en el que los jugadores eligen sus estrategias de manera simultánea o sin observar lo que hace el resto. Esta estructura aparece en licitaciones selladas, paritarias cuando se presentan ofertas finales, decisiones presupuestarias, fijación de precios y muchas negociaciones reguladoras. Para modelarlo necesitamos:</p>
          <ol>
            <li><strong>Lista de jugadores</strong> con sus estrategias posibles.</li>
            <li><strong>Matriz de payoffs</strong> donde cada celda muestra la recompensa de ambos jugadores para cada combinación de estrategias.</li>
            <li><strong>Herramientas de análisis</strong> para detectar mejor respuesta, estrategia dominante y equilibrios.</li>
          </ol>
          <p>La ventaja del Hombre Gris es que convierte estos modelos en tableros vivos: al compartir la matriz con los actores, se transparentan los incentivos y se identifica qué cambios reglamentarios se necesitan para mover el equilibrio.</p>
        </section>

        <section>
          <h2>2. Construyendo matrices 2x2: subsidios energéticos</h2>
          <p>Tomemos el conflicto clásico entre <strong>Estado (E)</strong> y <strong>Distribuidoras (D)</strong> sobre subsidios energéticos y tarifas.</p>
          <pre style="background:#0f172a;color:#e2e8f0;padding:1.25rem;border-radius:16px;overflow:auto;">
D \ E           | Sostener subsidio (S)                  | Ajustar tarifa (A)
------------------------------------------------------------------------------------
Invertir (I)     | +3 / +4 (servicio estable, popularidad) | +4 / +2 (calidad alta, costo político)
Reducir (R)      | +2 / +1 (corto plazo, deterioro red)    | +5 / -1 (ganancia empresa, conflicto social)
          </pre>
          <p>Interpretación:</p>
          <ul>
            <li>Si ambas partes cooperan (S,I), los usuarios reciben servicio y el gobierno mantiene apoyo, pero la red sigue tensionada.</li>
            <li>Si el Estado ajusta tarifas y la empresa invierte (A,I), el sistema se vuelve sustentable, pero el costo político es alto (payoff +2 para el Estado).</li>
            <li>Si la empresa reduce inversiones cuando el Estado ajusta (A,R), se produce un castigo fuerte para el gobierno.</li>
          </ul>
          <p>Para identificar el equilibrio debemos analizar mejor respuesta:</p>
          <ul>
            <li><strong>Mejor respuesta de D:</strong> Si el Estado sostiene subsidios (S), invertir (I) da payoff +4 vs +1; si ajusta (A), invertir da +2 vs -1. Por lo tanto, <strong>I domina a R</strong>.</li>
            <li><strong>Mejor respuesta de E:</strong> Si D invierte (I), ajustar (A) ofrece +4 vs +3 ⇒ preferencia por A. Si D reduce (R), sostener (S) ofrece +2 vs +5 (pero +5 es para D, no E). Para el Estado, S da +2 vs A con +1. Entonces la mejor respuesta es S. Resultado: equilibrio (S,I).</li>
          </ul>
          <p>Este equilibrio parece razonable pero no óptimo. El objetivo del Hombre Gris es rediseñar la matriz para que (A,I) sea más atractivo (por ejemplo aumentando la recompensa política del ajuste mediante una tarifa social automática y dashboards que expliquen el destino de los fondos).</p>
        </section>

        <section>
          <h2>3. Matrices 3x3: paritarias nacionales</h2>
          <p>En las negociaciones salariales participan <strong>Gobierno (G)</strong>, <strong>Sindicatos (S)</strong> y <strong>Empresas (E)</strong>. Podemos reducir el análisis a un juego G-S donde las empresas responden con inversión o no. Sin embargo, cuando las tres partes actúan simultáneamente, necesitamos una matriz 3x3 (simplificada aquí a dos jugadores con tres estrategias cada uno para visualizar la lógica).</p>
          <pre style="background:#111827;color:#e5e7eb;padding:1.25rem;border-radius:16px;overflow:auto;">
Sindicato \ Gobierno | Aumentos escalonados (AE) | Bono + cláusula gatillo (BG) | Congelar con revisión (CR)
---------------------------------------------------------------------------------------------------------------
Moderado (M)          | +3 / +4                    | +4 / +3                      | +2 / +5
Presión alta (P)      | +1 / +1                    | +3 / +2                      |  0 / +4
Confrontación (C)     | -1 / 0                     | +1 / +1                      | -2 / +3
          </pre>
          <p>Aquí el <strong>Gobierno</strong> busca elegir la columna que maximiza su resultado, considerando la estrategia sindical:</p>
          <ul>
            <li>Si el sindicato es moderado (M), la mejor respuesta del Gobierno es AE (payoff +4).</li>
            <li>Si hay presión alta (P), la mejor respuesta es CR (+4).</li>
            <li>Si hay confrontación (C), la mejor respuesta es BG (+1) para evitar daño.</li>
          </ul>
          <p>El sindicato analiza fila por fila. Si el Gobierno elige AE, M domina (payoff +3). Si elige BG, M gana con +4. Si elige CR, P gana con 0 > -2. Conclusión: (AE, M) es un equilibrio de Nash, pero no siempre alcanzable porque los jugadores no observan la decisión del otro antes de realizarla. Por eso se recurre a preacuerdos (actas) que reducen la simultaneidad o instalan señales públicas.</p>
          <div style="background:#fef3c7;border-radius:14px;padding:1.25rem;border-left:4px solid #f59e0b;margin-top:1rem;">
            <strong>Insight:</strong> los sindicatos moderados necesitan una garantía creíble de que sus concesiones serán recompensadas. Diseñar un mecanismo donde los aumentos escalonados se activen automáticamente ante métricas de inflación genera un incentivo a permanecer en la estrategia M.</div>
        </section>

        <section>
          <h2>4. Estrategias dominantes y dominancia iterada</h2>
          <p>Una <strong>estrategia dominante</strong> produce un payoff igual o superior al resto, sin importar lo que haga el otro jugador. Identificarla permite anticipar el comportamiento real aunque el discurso diga lo contrario.</p>
          <ul>
            <li><strong>Dominancia estricta:</strong> una estrategia es mejor en todas las combinaciones.</li>
            <li><strong>Dominancia débil:</strong> nunca es peor y a veces es mejor.</li>
            <li><strong>Dominancia iterada:</strong> eliminando estrategias dominadas de manera sucesiva se pueden reducir matrices complejas.</li>
          </ul>
          <p><strong>Ejemplo:</strong> Licitación de obra pública con tres ofertas: transparente (T), semi-opaca (S) y opaca (O). Si el Estado implementa auditoría en tiempo real, la estrategia O queda dominada porque siempre termina con sanciones. Al eliminarla, los jugadores se enfocan en T o S. Si además se publican puntajes de reputación, T se vuelve dominante. Esta depuración racionaliza el juego sin necesidad de controlar cada jugada en detalle.</p>
        </section>

        <section>
          <h2>5. Mejor respuesta y diagramas de reacción</h2>
          <p>La <strong>mejor respuesta</strong> es la estrategia óptima dada una elección del rival. Los diagramas de reacción (best-response) nos permiten visualizar cómo se intersectan las mejores respuestas para encontrar equilibrios.</p>
          <div style="background:#cffafe;border-radius:16px;padding:1.25rem;margin-bottom:1rem;">
            <p><strong>Aplicación:</strong> fijación de precios entre dos cadenas de supermercados en el AMBA. Cada una decide precio alto (H) o bajo (L). El diagrama de mejor respuesta muestra que si una elige L, la otra también responde con L para no perder mercado. Resultado: equilibrio (L,L), es decir, guerra de precios. Para moverlo, el Estado debe modificar la matriz (por ejemplo, con incentivos fiscales condicionales a acuerdos de precios + abastecimiento). Así, el payoff de (H,H) aumenta, generando un nuevo equilibrio cooperativo.</p>
          </div>
        </section>

        <section>
          <h2>6. Equilibrios puros y mixtos</h2>
          <h3>6.1 Equilibrios puros</h3>
          <p>Se dan cuando cada jugador elige una estrategia concreta que es mejor respuesta al otro. Muchos conflictos argentinos tienen equilibrios puros malos (ej. informalidad generalizada). Para salir de ellos debemos alterar la matriz. Ejemplos:</p>
          <ul>
            <li><strong>Informalidad laboral:</strong> (Patrón defeca, Estado defeca) es un equilibrio puro. Introducir inspecciones inteligentes + beneficios para las pymes que formalizan cambia la estructura.</li>
            <li><strong>Residuos urbanos:</strong> (Vecino defeca, Municipio defeca) es equilibrio puro. Microacuerdos con recompensas por reciclaje y penalización automática rompen esa estabilidad.</li>
          </ul>
          <h3>6.2 Equilibrios mixtos</h3>
          <p>Cuando no existe equilibrio puro, los jugadores mezclan estrategias con ciertas probabilidades. Ejemplo: control aduanero vs contrabando hormiga. El Estado no puede inspeccionar todos los contenedores, y los contrabandistas deben decidir cuándo arriesgar. Se establece un equilibrio mixto donde el Estado inspecciona con probabilidad p y los contrabandistas intentan con probabilidad q. Ajustando p (más tecnología, analítica) se reduce la rentabilidad de defectar.</p>
          <div style="background:#ede9fe;border-radius:14px;padding:1.25rem;border-left:4px solid #7c3aed;margin-top:1rem;">
            <strong>Nota práctica:</strong> Aunque los equilibrios mixtos parecen abstractos, se pueden traducir en “turnos aleatorios” de auditorías, sorteos de inspección o rotaciones de personal que impiden que el opositor anticipe la jugada.</div>
        </section>

        <section>
          <h2>7. Caso aplicado · Licitación transparente vs. captura</h2>
          <p>Supongamos una licitación provincial con empresas A y B. Cada una puede elegir:</p>
          <ul>
            <li><strong>Oferta honesta (H):</strong> costos reales, sin coimas.</li>
            <li><strong>Oferta maquillada (M):</strong> costos inflados y acuerdos por debajo de la mesa.</li>
          </ul>
          <pre style="background:#1f2937;color:#f8fafc;padding:1.25rem;border-radius:16px;overflow:auto;">
B \ A | Honesta (H)                 | Maquillada (M)
------------------------------------------------------------
Honesta (H) | +4 / +4 (obra eficiente, reputación alta) | +1 / +5 (B captura, A queda fuera)
Maquillada (M) | +5 / +1 (A captura)                | +2 / +2 (sobreprecio, sanciones leves)
          </pre>
          <p>Sin controles, (M,M) puede ser equilibrio porque ambos temen quedar afuera si cooperan. ¿Cómo lo cambiamos?</p>
          <ol>
            <li>Instalando <strong>auditoría previa obligatoria</strong>, el payoff de (M,·) cae por riesgo de sanción.</li>
            <li>Otorgando <strong>bonos de reputación</strong> canjeables por créditos baratos, (H,H) se vuelve más atractivo.</li>
            <li>Publicando la matriz a los oferentes (con incentivos y sanciones) se construye transparencia radical.</li>
          </ol>
          <p>Este caso demuestra que no basta con pedir “ofertas honestas”; hay que rediseñar el juego.</p>
        </section>

        <section>
          <h2>8. Toolkit para juegos estáticos</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.25rem;">
            <article style="background:#ecfccb;border-radius:16px;padding:1.25rem;">
              <h3 style="margin-top:0;">8.1 Plantilla de matriz</h3>
              <p>Incluye instrucciones para: definir estrategias, calcular payoffs (económicos, reputacionales, regulatorios) y señalar equilibrios con íconos. Disponible en la carpeta de recursos.</p>
            </article>
            <article style="background:#f0fdfa;border-radius:16px;padding:1.25rem;">
              <h3 style="margin-top:0;">8.2 Checklist de dominancia</h3>
              <ol>
                <li>Comparar filas/columnas para cada jugador.</li>
                <li>Eliminar estrategias que nunca son óptimas.</li>
                <li>Repetir hasta que quede la matriz reducida.</li>
              </ol>
            </article>
            <article style="background:#fff7ed;border-radius:16px;padding:1.25rem;">
              <h3 style="margin-top:0;">8.3 Script de conversación</h3>
              <p>Guion para presentar la matriz a los actores sin generar resistencia. Incluye preguntas abiertas (“¿Qué necesitarías para moverte hacia esta celda cooperativa?”) y protocolos para documentar compromisos.</p>
            </article>
          </div>
        </section>

        <section>
          <h2>9. Ejercicios prácticos</h2>
          <div style="background:#e2e8f0;border-radius:16px;padding:1.5rem;margin-bottom:1.25rem;">
            <h3 style="margin-top:0;">Ejercicio A · Paritaria local</h3>
            <ol>
              <li>Define las tres principales estrategias del sindicato y del gobierno municipal.</li>
              <li>Construye la matriz 3x3 e identifica el equilibrio actual.</li>
              <li>Propone un cambio (incentivo, sanción, señal) que altere los payoffs.</li>
            </ol>
          </div>
          <div style="background:#dcfce7;border-radius:16px;padding:1.5rem;margin-bottom:1.25rem;">
            <h3 style="margin-top:0;">Ejercicio B · Licitación de servicios urbanos</h3>
            <ol>
              <li>Modela las estrategias (servicio premium vs básico, transparencia vs captura).</li>
              <li>Calcula mejor respuesta para cada empresa.</li>
              <li>Diseña un mecanismo para que cooperar sea dominante (ej. reputación, incentivos financieros, exclusiones).</li>
            </ol>
          </div>
          <div style="background:#fef3c7;border-radius:16px;padding:1.5rem;">
            <h3 style="margin-top:0;">Ejercicio C · Juego ciudadano</h3>
            <p>Elige una interacción cotidiana (ej. pago de expensas, cuidado de un barrio). Construye una matriz 2x2 entre “vecinos organizados” y “administración”. Diagnostica el equilibrio y planifica la primera señal para moverlo.</p>
          </div>
        </section>

        <section>
          <h2>10. Casos argentinos destacados</h2>
          <article style="border-left:4px solid #0ea5e9;background:#e0f2fe;border-radius:14px;padding:1.25rem;margin-bottom:1rem;">
            <h3 style="margin-top:0;">Caso · Programa Precios Justos</h3>
            <p>Juego simultáneo entre supermercados y Gobierno. Sin enforcement digital, el equilibrio derivó en trampas. La introducción de verificadores ciudadanos y apps de denuncia modificó payoffs, pero el castigo siguió siendo débil. La lección: sin sanción automática, la estrategia dominante sigue siendo defraudar.</p>
          </article>
          <article style="border-left:4px solid #22c55e;background:#f0fdf4;border-radius:14px;padding:1.25rem;">
            <h3 style="margin-top:0;">Caso · Consorcio Ruta 3</h3>
            <p>Empresas constructoras y cooperativas se aliaron para presentar propuestas conjuntas. Al compartir información, construyeron una matriz donde la cooperación les daba acceso a financiamiento del BID, volviendo dominante la estrategia honesta. Resultado: obra ejecutada con 15% menos de costos y reputación elevada.</p>
          </article>
        </section>

        <section>
          <h2>11. Checklist de salida</h2>
          <ul>
            <li>¿Modelaste al menos un conflicto real con matrices 2x2 y 3x3?</li>
            <li>¿Identificaste estrategias dominantes y mejores respuestas?</li>
            <li>¿Diseñaste al menos una intervención para modificar payoffs?</li>
            <li>¿Compartiste tu matriz con los actores relevantes?</li>
          </ul>
          <div style="background:#0f172a;color:#e2e8f0;border-radius:16px;padding:1.25rem;margin-top:1rem;">
            <strong>Entrega sugerida:</strong> publica tus matrices y el plan de intervención en el foro. Incluye un audio o video corto explicando cómo piensas mover el equilibrio. Recibirás comentarios para afinarlo antes del módulo 3.</div>
        </section>

        <section>
          <h2>12. Preparación para el Módulo 3</h2>
          <p>Ahora que dominas los juegos simultáneos, daremos un salto a los juegos repetidos e iterados, donde la reputación y el tiempo cambian todo. Trae tus matrices: las convertiremos en series temporales y mediremos qué sucede cuando los jugadores tienen memoria y expectativas de futuro.</p>
        </section>
      
