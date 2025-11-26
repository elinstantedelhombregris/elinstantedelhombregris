# 🧪 INSTRUCCIONES DE TESTING Y DEPLOYMENT

## CÓMO PROBAR LOS CAMBIOS IMPLEMENTADOS

---

## 🚀 PASO 1: INICIAR EL SERVIDOR DE DESARROLLO

```bash
# Navegar al directorio del proyecto
cd /Users/juanb/Desktop/ElInstantedelHombreGris/SocialJusticeHub

# Instalar dependencias (si es necesario)
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

El servidor debería iniciar en `http://localhost:5000`

---

## ✅ PASO 2: CHECKLIST DE PRUEBAS

### **PÁGINA PRINCIPAL (`http://localhost:5000/`)**

#### **1. Hero Section**
- [ ] Se carga correctamente
- [ ] Los botones de CTA son clickeables
- [ ] El scroll hacia el mapa funciona

#### **2. Sección "¿Qué es ¡BASTA!?"**
- [ ] El timeline de 4 pasos se muestra correctamente
- [ ] Los 3 tabs (Negación, Afirmación, Visión) cambian de contenido
- [ ] Las animaciones son suaves
- [ ] Los botones finales funcionan

#### **3. Mapa Unificado** ⭐ (COMPONENTE CRÍTICO)
- [ ] El mapa de Argentina se carga correctamente
- [ ] Los 3 tabs (Sueños, Valores, Necesidades) funcionan
- [ ] El formulario permite escribir texto
- [ ] El contador de caracteres funciona (X / 500)
- [ ] El checkbox de ubicación se puede marcar
- [ ] Al enviar el formulario:
  - [ ] Aparece un toast de confirmación
  - [ ] El marcador aparece en el mapa
  - [ ] El formulario se limpia
- [ ] Los marcadores en el mapa muestran popups al hacer click
- [ ] Las estadísticas (4 tarjetas) muestran números correctos
- [ ] Las "Entradas Recientes" se actualizan por tab

**Testing detallado del mapa:**
```
1. Click en tab "Sueños" → escribir "Mi sueño para Argentina"
2. Marcar checkbox de ubicación
3. Click en "Compartir mi sueño"
4. Verificar toast de éxito
5. Verificar que el marcador azul aparece en el mapa
6. Click en el marcador → verificar popup con el texto
7. Repetir para "Valores" (marcador rosa) y "Necesidades" (marcador amarillo)
```

#### **4. Nube de Palabras**
- [ ] La nube de palabras se genera correctamente
- [ ] Los 3 tabs (Sueños, Valores, Necesidades) funcionan
- [ ] Las palabras son clickeables
- [ ] El panel de detalles muestra información
- [ ] El botón "Actualizar" funciona

#### **5. Guía del Cambio Interactiva** ⭐ (COMPONENTE CRÍTICO)
- [ ] La tarjeta de progreso personal se muestra
- [ ] Los 5 niveles están visibles
- [ ] Al hacer click en un nivel, se expande
- [ ] Se ven las acciones con checkboxes
- [ ] Se ve la historia real del nivel
- [ ] El botón CTA del nivel es clickeable
- [ ] La barra de progreso funciona visualmente
- [ ] El nivel 1 está desbloqueado, los demás con candado

**Testing detallado de la guía:**
```
1. Verificar que la tarjeta superior muestra "Nivel 1" y "0%"
2. Click en "VOS" (nivel 1) → debe expandirse
3. Verificar que se ven 4 acciones
4. Verificar que se ve una historia de María
5. Click en el botón "Comenzar mi transformación"
6. Click en "TU FAMILIA" (nivel 2) → debe mostrar candado
7. Hacer scroll hasta el final → botón "Descargar Guía"
```

#### **6. Comunidad en Acción**
- [ ] Se muestran 3 proyectos (o placeholders)
- [ ] Los filtros funcionan
- [ ] Los botones son clickeables

#### **7. Historias Inspiradoras**
- [ ] Se muestran 3 historias
- [ ] El carrusel es scrolleable
- [ ] Las imágenes se cargan

#### **8. Recursos Educativos**
- [ ] Se muestran las tarjetas de recursos
- [ ] El webinar destacado se ve correctamente

#### **9. Call to Action Final**
- [ ] Los 3 botones se ven correctamente
- [ ] Son clickeables

---

### **PÁGINA HOMBRE GRIS (`http://localhost:5000/el-instante-del-hombre-gris`)**

#### **1. Hero Filosófico**
- [ ] La quote del Hombre Gris se muestra
- [ ] Los 3 iconos (Sueños, Valores, Necesidades) están visibles
- [ ] Los botones CTA funcionan
- [ ] El scroll indicator anima

#### **2. ¿Quién es el Hombre Gris?**
- [ ] Las 3 tarjetas de metamorfosis (Camello, León, Niño) se ven
- [ ] La quote destacada con fondo morado se muestra
- [ ] Los emojis se renderizan correctamente

#### **3. Filosofía del Hombre Gris**
- [ ] Las 6 tarjetas de pilares filosóficos se muestran
- [ ] Las 4 citas del Hombre Gris están visibles
- [ ] Los 3 objetivos del movimiento se ven
- [ ] La sección CTA final funciona

#### **4. Conexión con el Árbol**
- [ ] La sección verde con el ícono de árbol se ve
- [ ] El botón "Explorar el Árbol Interactivo" es clickeable
- [ ] Redirige a `/la-semilla-de-basta`

#### **5. Blog & Vlog Teaser**
- [ ] Las 2 tarjetas (Blog y Vlog) se muestran
- [ ] Los botones redirigen a `/blog-vlog`

#### **6. Call to Action del Hombre Gris**
- [ ] Las 6 tarjetas de acción se muestran
- [ ] Los botones son clickeables
- [ ] Las estadísticas se ven correctamente
- [ ] La quote final está visible

---

## 📱 PASO 3: TESTING MOBILE

### **Usando Chrome DevTools**

1. Abrir Chrome DevTools (F12)
2. Click en el ícono de dispositivo móvil (Ctrl+Shift+M)
3. Seleccionar dispositivo:
   - iPhone 12 Pro
   - Samsung Galaxy S20
   - iPad Air

### **Checklist Mobile**

#### **Página Principal**
- [ ] Hero section se adapta correctamente
- [ ] Los textos son legibles
- [ ] Los botones son clickeables (no muy pequeños)
- [ ] El mapa es navegable con touch
- [ ] Los tabs se ven bien en 3 columnas pequeñas
- [ ] El formulario es usable
- [ ] La guía del cambio es scrolleable
- [ ] Las tarjetas de estadísticas se adaptan (2x2)

#### **Página Hombre Gris**
- [ ] Las 3 metamorfosis se apilan verticalmente
- [ ] Los pilares filosóficos se adaptan
- [ ] Todo es legible y usable

### **Testing en Dispositivo Real (Opcional)**

Si tienes un smartphone:
1. Conectar a la misma red WiFi que tu computadora
2. Encontrar tu IP local: `ipconfig` (Windows) o `ifconfig` (Mac/Linux)
3. En el móvil, ir a: `http://[TU_IP]:5000`
4. Probar la experiencia completa

---

## 🐛 PASO 4: IDENTIFICAR Y REPORTAR BUGS

### **Si encuentras un error:**

1. **Anotar**:
   - ¿En qué página?
   - ¿Qué estabas haciendo?
   - ¿Qué esperabas que pasara?
   - ¿Qué pasó en realidad?

2. **Captura de pantalla**:
   - Hacer screenshot del error
   - Si hay error en consola, capturar también

3. **Abrir consola del navegador**:
   - F12 → Tab "Console"
   - Buscar mensajes en rojo (errores)
   - Copiar el mensaje completo

### **Errores Comunes y Soluciones**

#### **El mapa no se carga**
```
Síntoma: Área gris en lugar del mapa
Causa: Leaflet no se cargó correctamente
Solución: Recargar la página (Ctrl+R)
```

#### **No aparecen los datos del mapa**
```
Síntoma: Mapa vacío, sin marcadores
Causa: La base de datos puede estar vacía
Solución: Usar el DataPopulator component o agregar datos manualmente
```

#### **Error 404 al hacer submit**
```
Síntoma: Toast de error al compartir sueño
Causa: El backend no está corriendo
Solución: Verificar que el servidor esté activo
```

#### **Estilos rotos**
```
Síntoma: Diseño sin colores, todo blanco y negro
Causa: Tailwind CSS no compiló
Solución: Reiniciar el servidor npm run dev
```

---

## ⚡ PASO 5: TESTING DE PERFORMANCE

### **Usando Lighthouse (Chrome DevTools)**

1. Abrir DevTools (F12)
2. Tab "Lighthouse"
3. Seleccionar:
   - [x] Performance
   - [x] Accessibility
   - [x] Best Practices
   - [x] SEO
4. Click "Analyze page load"

### **Métricas Objetivo**

| Métrica | Target | Crítico |
|---------|--------|---------|
| Performance | >85 | >70 |
| Accessibility | >90 | >80 |
| Best Practices | >90 | >80 |
| SEO | >85 | >70 |

### **Si Performance < 70**

Posibles optimizaciones:
- Lazy load de imágenes
- Optimizar el tamaño de las imágenes
- Minimizar JavaScript no usado
- Usar code splitting

---

## 🚀 PASO 6: DEPLOYMENT (CUANDO ESTÉ LISTO)

### **Opción 1: Vercel (Recomendado)**

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Producción
vercel --prod
```

### **Opción 2: Netlify**

```bash
# Build
npm run build

# Deploy manual en netlify.com
# Arrastra la carpeta /dist
```

### **Variables de Entorno**

Antes de deployment, verificar:
- Base de datos de producción configurada
- API keys necesarias
- CORS configurado correctamente

---

## 📊 PASO 7: MONITOREO POST-DEPLOYMENT

### **Analytics a Configurar**

1. **Google Analytics 4**
   - Tracking de páginas
   - Eventos en CTAs
   - Conversiones (submit de formularios)

2. **Hotjar o similar**
   - Heatmaps de clicks
   - Session recordings
   - Feedback surveys

3. **Error Tracking (Sentry)**
   - Captura de errores JavaScript
   - Performance monitoring
   - User context

---

## 📝 NOTAS FINALES

### **Archivos Importantes**

```
Nuevos componentes:
- MapaUnificado.tsx
- ChangeGuideInteractive.tsx
- QueEsBasta.tsx

Páginas modificadas:
- Home.tsx
- ElInstanteDelHombreGris.tsx

Documentación:
- REORGANIZACION_IMPLEMENTADA.md
- INSTRUCCIONES_TESTING.md (este archivo)
```

### **Próximos Pasos Sugeridos**

1. ✅ Testing completo manual
2. ⏭️ Configurar analytics
3. ⏭️ Crear contenido real para ejemplos
4. ⏭️ Optimizar imágenes y assets
5. ⏭️ Configurar SEO metadata
6. ⏭️ Testing de carga con usuarios reales
7. ⏭️ Deployment a staging
8. ⏭️ Deployment a producción

---

## 🆘 SOPORTE

Si tienes problemas:
1. Revisar la consola del navegador
2. Revisar REORGANIZACION_IMPLEMENTADA.md
3. Verificar que todas las dependencias estén instaladas
4. Limpiar cache: `npm run dev` después de borrar node_modules

---

**¡Buena suerte con el testing! 🚀**

*"El cambio empieza en vos, Argentina te necesita."*
— ¡BASTA!

