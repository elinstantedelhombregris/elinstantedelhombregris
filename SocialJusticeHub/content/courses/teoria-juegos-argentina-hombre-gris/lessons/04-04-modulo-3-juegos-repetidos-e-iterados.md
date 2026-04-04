
        <div style="background:linear-gradient(135deg,#0f172a 0%,#115e59 50%,#15803d 100%);color:#ecfccb;border-radius:22px;padding:2.5rem;box-shadow:0 25px 90px rgba(2,6,23,0.7);margin-bottom:2rem;">
          <p style="margin:0;font-size:0.85rem;letter-spacing:0.12em;text-transform:uppercase;opacity:0.7;">Módulo 3 · Juegos repetidos e iterados</p>
          <h1 style="margin:0.85rem 0 0;font-size:2.6rem;line-height:1.12;">Cuando la reputación pesa: delta, memoria y cooperación sostenida para rediseñar Argentina</h1>
          <p style="margin:1rem 0 0;max-width:78ch;">Las partidas argentinas rara vez son únicas. Los mismos actores se cruzan en múltiples mesas, elecciones, licitaciones y agendas territoriales. Este módulo te entrega las herramientas para modelar esa repetición: factores de descuento, estrategias como Tit for Tat, Grim Trigger o Pavlov, y métodos para medir reputación y memoria corta. Con estos conceptos podrás diseñar microacuerdos que se sostengan ronda tras ronda.</p>
        </div>

        <section>
          <h2>1. Factor de descuento (δ) y horizonte</h2>
          <p>El factor de descuento δ representa cuánto valoran los jugadores el futuro. Va de 0 (no me importa mañana) a 1 (valoro el futuro tanto como el presente). Cuando δ es alto, cooperar se vuelve atractivo porque las recompensas futuras pesan.</p>
          <div style="background:#ecfccb;border-radius:16px;padding:1.5rem;border:1px solid #bbf7d0;margin-bottom:1.5rem;">
            <strong>Visualización:</strong> Si δ ≥ 0.5 en un juego tipo Prisionero, es posible sostener cooperación con estrategias condicionales. En Argentina, sectores con contrato a largo plazo (energía, agro, infraestructura) suelen tener δ alto; en cambio, programas asistenciales de corta duración tienen δ bajo, lo que incentiva el oportunismo.</div>
          <p><strong>Ejemplo:</strong> Un municipio ofrece un contrato de residuos por 5 años. Si el adjudicatario valora la renovación (δ≈0.8), preferirá cooperar para no perder reputación. Si el contrato dura 6 meses (δ≈0.2), la tentación de capturar todo al inicio es mayor. Diseñar acuerdos con horizonte mínimo y renovaciones condicionadas aumenta δ.</p>
        </section>

        <section>
          <h2>2. Estrategias clásicas en juegos iterados</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem;">
            <article style="background:#dcfce7;border-radius:16px;padding:1.25rem;border:1px solid #86efac;">
              <h3 style="margin-top:0;">Tit for Tat (TFT)</h3>
              <ul>
                <li>Coopera en la primera ronda.</li>
                <li>Replica la jugada anterior del otro.</li>
                <li>Perdona rápido si el otro vuelve a cooperar.</li>
              </ul>
              <p>Funciona bien cuando hay poca información y se necesita construir confianza rápidamente.</p>
            </article>
            <article style="background:#fee2e2;border-radius:16px;padding:1.25rem;border:1px solid #fecaca;">
              <h3 style="margin-top:0;">Grim Trigger</h3>
              <p>Coopera hasta que el otro defeque; luego castiga para siempre. Es efectivo si el castigo perpetuo es creíble, pero en Argentina suele disparar espirales de venganza. Lo usamos sólo en contratos donde la expulsión definitiva es factible (ej. licitaciones con cláusula anticorrupción).</p>
            </article>
            <article style="background:#f3e8ff;border-radius:16px;padding:1.25rem;border:1px solid #d8b4fe;">
              <h3 style="margin-top:0;">Generous TFT</h3>
              <p>Similar a TFT, pero perdona ocasionalmente fallas para absorber ruido (errores). Útil en contextos con burocracia pesada, donde no todo defecto es malicia.</p>
            </article>
            <article style="background:#cffafe;border-radius:16px;padding:1.25rem;border:1px solid #a5f3fc;">
              <h3 style="margin-top:0;">Pavlov (Win-Stay, Lose-Shift)</h3>
              <p>Mantiene la estrategia si el resultado fue bueno, cambia si fue malo. Excelente para laboratorios donde se experimenta con nuevas reglas y se mide rápidamente el impacto.</p>
            </article>
          </div>
        </section>

        <section>
          <h2>3. Folk Theorem y condiciones para cooperación</h2>
          <p>El <strong>Folk Theorem</strong> establece que, en juegos repetidos infinitos con suficiente paciencia (δ alto), casi cualquier resultado puede sostenerse como equilibrio con las estrategias correctas. Traducción para el Hombre Gris: si instalamos reputación pública y castigos proporcionales, podemos diseñar microacuerdos donde la cooperación sea racional.</p>
          <ul>
            <li><strong>Condición 1:</strong> δ suficientemente alto (los actores esperan seguir interactuando).</li>
            <li><strong>Condición 2:</strong> Existe monitoreo creíble (memoria pública).</li>
            <li><strong>Condición 3:</strong> Castigos que duelen pero no destruyen (memoria corta).</li>
          </ul>
          <p><strong>Aplicación:</strong> redes de salud pública. Si hospitales y provincias esperan seguir colaborando, y se publican indicadores mensuales de derivaciones, es más racional compartir recursos que ocultarlos.</p>
        </section>

        <section>
          <h2>4. Resiliencia frente a ruido (errores)</h2>
          <p>En la práctica, muchos defectos son ruido: faltan datos, alguien olvidó enviar un reporte, la transferencia se atrasó. Las estrategias deben tolerar esos fallos para no caer en guerras inútiles.</p>
          <div style="background:#fff7ed;border-radius:16px;padding:1.5rem;border-left:4px solid #f97316;">
            <strong>Protocolo “Ruido controlado”:</strong>
            <ol>
              <li>Clasifica defectos en <em>error</em> (sin intención) o <em>abuso</em>.</li>
              <li>Define pruebas objetivas (capturas del sistema, actas firmadas).</li>
              <li>Permite un margen de error (ej. 1 defecto cada 5 rondas) antes de castigar.</li>
              <li>Comunica públicamente cuándo se activa el castigo para evitar sospechas.</li>
            </ol>
          </div>
        </section>

        <section>
          <h2>5. Memoria pública y tableros</h2>
          <p>Sin registro, los juegos repetidos se degradan a juegos simultáneos (todos especulan). Necesitamos tableros que muestren quién coopera y quién defeca.</p>
          <figure style="margin:1.5rem 0;text-align:center;">
            <img src="/course-graphics/hombre-gris/payoff-evolution.svg" alt="Curvas de payoff acumulado" style="width:100%;max-width:840px;border-radius:18px;box-shadow:0 20px 60px rgba(15,23,42,0.35);" />
            <figcaption style="margin-top:0.75rem;color:#475569;">El tablero debe mostrar la curva acumulada para cooperación vs defecto. Si la curva cooperativa no domina, rediseña los incentivos.</figcaption>
          </figure>
          <p>Herramientas:</p>
          <ul>
            <li><strong>Dashboards públicos:</strong> actualizados cada semana, con indicadores clave (cumplimiento, tiempo de respuesta, compromisos).</li>
            <li><strong>Bitácoras compartidas:</strong> actas digitales firmadas después de cada ronda.</li>
            <li><strong>Semáforos reputacionales:</strong> verde (cooperó), amarillo (ruido), rojo (defecto intencional).</li>
          </ul>
        </section>

        <section>
          <h2>6. Caso completo · Laboratorio de crédito cooperativo</h2>
          <p>Contexto: banco público y asociación de productores rurales en Santa Fe. Se repetían renegociaciones cada campaña. Se decidió montar un juego iterado explícito.</p>
          <div style="background:#e0f2fe;border-radius:16px;padding:1.5rem;border-left:4px solid #0ea5e9;">
            <h3 style="margin-top:0;">Diseño</h3>
            <ul>
              <li>δ alto: contrato de 3 campañas con cláusula de renovación automática si ambos cumplen.</li>
              <li>Estrategia banco: Generous TFT (se perdona un atraso si se justifica documentalmente).</li>
              <li>Estrategia productores: Pavlov (si la interacción fue positiva, replican; si hubo problema, ajustan la entrega).</li>
              <li>Memoria: tablero público con pagos, entregas y notas de visitas técnicas.</li>
            </ul>
            <h3>Resultados</h3>
            <ul>
              <li>Cooperación sostenida (C,C) 85% de las rondas.</li>
              <li>Reducción de atrasos del 28% al 9%.</li>
              <li>Escalamiento a otras regiones gracias a reputación compartida.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2>7. Caso contraejemplo · Mesa de transporte urbano</h2>
          <p>Jugadores: Nación, provincias, empresas de transporte. Se intentó un esquema iterado, pero δ era bajo porque los contratos se renovaban cada 60 días y el financiamiento llegaba tarde. Resultado: todos defecan (no se respetan frecuencias, Nación demora giros, provincias no auditan). Lecciones:</p>
          <ul>
            <li>Sin horizonte razonable, las estrategias cooperativas no tienen tiempo de florecer.</li>
            <li>La ausencia de memoria pública permitió narrativas contradictorias.</li>
            <li>Solución propuesta: contrato anual con pagos mensuales automáticos y dashboards de frecuencias alimentados por GPS.</li>
          </ul>
        </section>

        <section>
          <h2>8. Herramientas cuantitativas</h2>
          <article style="background:#ecfccb;border-radius:16px;padding:1.25rem;margin-bottom:1rem;">
            <h3 style="margin-top:0;">8.1 Valor presente de cooperación</h3>
            <p>Calcula si cooperar es rentable: 
            <code style="background:#0f172a;color:#e2e8f0;padding:0.2rem 0.4rem;border-radius:6px;">V = rac{R}{1 - δ}</code> 
            donde R es el payoff cooperativo por ronda. Si V supera el payoff de defectar una vez, la cooperación es racional.</p>
          </article>
          <article style="background:#fef3c7;border-radius:16px;padding:1.25rem;margin-bottom:1rem;">
            <h3 style="margin-top:0;">8.2 Matriz de transición</h3>
            <p>Registra probabilidades de pasar de cooperación a defecto, y viceversa. Permite visualizar en qué punto la relación se degrada y qué señales la recuperan.</p>
          </article>
          <article style="background:#f0fdfa;border-radius:16px;padding:1.25rem;">
            <h3 style="margin-top:0;">8.3 Índice de resiliencia</h3>
            <p>Define cuánto castigo puede soportar la relación antes de romperse. Se mide con encuestas rápidas + datos duros (tiempo sin cooperación). Sirve para decidir cuán agresivo puede ser el castigo.</p>
          </article>
        </section>

        <section>
          <h2>9. Ejercicios</h2>
          <div style="background:#e2e8f0;border-radius:16px;padding:1.5rem;margin-bottom:1.25rem;">
            <h3 style="margin-top:0;">Ejercicio 1 · Calcula δ</h3>
            <ol>
              <li>Elige un acuerdo actual.</li>
              <li>Estima cuánto valora cada actor la renovación (0-1).</li>
              <li>Identifica qué variables puedes modificar para subir δ (duración, reputación, beneficios futuros).</li>
            </ol>
          </div>
          <div style="background:#dcfce7;border-radius:16px;padding:1.5rem;margin-bottom:1.25rem;">
            <h3 style="margin-top:0;">Ejercicio 2 · Diseña una estrategia condicional</h3>
            <ol>
              <li>Define una regla tipo TFT, Generous TFT o Pavlov para tu relación.</li>
              <li>Escribe el protocolo de castigo y de perdón.</li>
              <li>Comparte el documento con el actor contraparte para alinear expectativas.</li>
            </ol>
          </div>
          <div style="background:#fff7ed;border-radius:16px;padding:1.5rem;">
            <h3 style="margin-top:0;">Ejercicio 3 · Tablero semanal</h3>
            <ol>
              <li>Diseña una tabla con columnas: ronda, jugada A, jugada B, payoff, notas.</li>
              <li>Compártela públicamente o en un canal común.</li>
              <li>Define un emoji o color para cada estado (cooperó, ruido, defectó).</li>
            </ol>
          </div>
        </section>

        <section>
          <h2>10. Checklist del módulo</h2>
          <ul>
            <li>¿Calculaste δ para al menos una relación clave?</li>
            <li>¿Seleccionaste una estrategia condicional y la documentaste?</li>
            <li>¿Diseñaste un tablero de memoria pública?</li>
            <li>¿Clasificaste los defectos en ruido vs abuso?</li>
          </ul>
          <div style="background:#0f172a;color:#e2e8f0;border-radius:16px;padding:1.25rem;margin-top:1rem;">
            <strong>Entrega sugerida:</strong> sube un informe breve con tu estrategia condicional, los valores estimados de δ y el prototipo de tablero. Recibirás feedback para mejorar la resiliencia antes de escalarlo.</div>
        </section>

        <section>
          <h2>11. Preparación para el Módulo 4</h2>
          <p>El siguiente módulo abordará señales, información y reputación pública. Trae el tablero que diseñaste y la clasificación de errores vs abusos: los usaremos para definir señales creíbles y mecanismos de screening que sostengan tus acuerdos iterados.</p>
        </section>
      
