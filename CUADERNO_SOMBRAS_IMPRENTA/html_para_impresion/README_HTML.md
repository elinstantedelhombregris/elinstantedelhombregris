# Archivos HTML para Impresión - Cuaderno de Sombras

## 📄 Archivos Incluidos

Este directorio contiene archivos HTML con diseño minimalista y hermoso, listos para ser convertidos a PDF e impresos.

### Archivos Principales

1. **styles.css** - Hoja de estilos principal con diseño minimalista
2. **01_portada_exterior.html** - Portada del cuaderno
3. **02_portada_interior.html** - Portada interior y página en blanco
4. **03_pacto_sombra.html** - Pacto de compromiso
5. **04_glosario.html** - Glosario de términos (2 páginas)
6. **05_guia_uso.html** - Guía de uso del cuaderno (2 páginas)
7. **06_plantilla_escritura.html** - Plantilla de página de escritura libre
8. **07_plantilla_reflexion.html** - Plantilla de reflexión semanal

## 🖨️ Cómo Convertir a PDF

### Opción 1: Desde el Navegador (Recomendado)

1. Abre cualquier archivo HTML en tu navegador (Chrome, Firefox, Safari)
2. Presiona `Cmd+P` (Mac) o `Ctrl+P` (Windows/Linux)
3. Selecciona "Guardar como PDF" como destino
4. Configura:
   - Tamaño de papel: A5
   - Márgenes: Ninguno
   - Escala: 100%
5. Guarda el PDF

### Opción 2: Usando Puppeteer (Automático)

```bash
# Instalar dependencias
npm install puppeteer

# Ejecutar script de conversión (si está disponible)
node convert-to-pdf.js
```

### Opción 3: Usando wkhtmltopdf

```bash
# Instalar wkhtmltopdf
brew install wkhtmltopdf  # Mac
# o descargar desde https://wkhtmltopdf.org/

# Convertir archivo
wkhtmltopdf --page-size A5 --margin-top 0 --margin-bottom 0 --margin-left 0 --margin-right 0 archivo.html salida.pdf
```

### Opción 4: Usando herramientas online

- [HTML to PDF](https://www.html2pdf.com/)
- [PDF24](https://tools.pdf24.org/es/html-a-pdf)
- [CloudConvert](https://cloudconvert.com/html-to-pdf)

## 🎨 Características del Diseño

- **Minimalista**: Diseño limpio y elegante
- **Tipografía**: Inter (sans-serif) y Crimson Text (serif para citas)
- **Colores**: Paleta monocromática con acentos celestes
- **Formato**: A5 (148 × 210 mm)
- **Listo para impresión**: Configurado para impresión profesional

## 📋 Próximos Pasos

1. **Revisar los archivos HTML** en el navegador
2. **Convertir a PDF** usando uno de los métodos arriba
3. **Revisar los PDFs** antes de enviar a imprenta
4. **Generar múltiples copias** de las plantillas de escritura para las 160 páginas de contenido
5. **Combinar todos los PDFs** en un solo archivo maestro

## 🔧 Personalización

Si necesitas ajustar el diseño:

1. Edita `styles.css` para cambiar colores, tipografías o espaciado
2. Los colores están definidos como variables CSS en `:root`
3. Las fuentes se cargan desde Google Fonts (puedes cambiarlas)

## 📝 Notas Importantes

- Los archivos están optimizados para impresión en formato A5
- Las líneas de escritura tienen espaciado de 7mm
- Los márgenes están configurados según especificaciones técnicas
- Los colores están en RGB (convertir a CMYK para impresión offset)

## 🚀 Generar Todas las Páginas

Para generar las 192 páginas completas, necesitarás:

1. Usar las plantillas de escritura libre para generar múltiples páginas (144 páginas)
2. Crear los prompts semanales (8 páginas)
3. Crear las reflexiones semanales (8 páginas)
4. Crear las páginas finales (carta, síntesis, etc.)
5. Combinar todo en orden

¿Necesitas ayuda para generar todas las páginas? Puedo crear un script que genere automáticamente todas las páginas del cuaderno.

