# 🚀 CÓMO INICIAR LA APLICACIÓN - ¡BASTA!

## ⚡ Inicio Rápido (2 Pasos)

### 1️⃣ Abre una terminal e inicia el BACKEND:
```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/SocialJusticeHub
./start-backend.sh
```

### 2️⃣ Abre OTRA terminal e inicia el FRONTEND:
```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/SocialJusticeHub
./start-frontend.sh
```

### 3️⃣ Abre tu navegador:
```
http://localhost:5173
```

## 🎯 ¡Listo! Ya puedes usar la aplicación

---

## 📖 Explicación Detallada

### ¿Por qué dos terminales?

La aplicación tiene dos partes:
1. **Backend (API)** - Puerto 5000 - Maneja la autenticación, base de datos, etc.
2. **Frontend (Interfaz)** - Puerto 5173 - La página web que ves en el navegador

Ambas deben estar corriendo al mismo tiempo.

### ¿Qué hace cada script?

#### `start-backend.sh`
- Configura las variables de entorno necesarias
- Inicia el servidor Express con Node.js
- Habilita la API en http://localhost:5000
- Maneja:
  - ✅ Registro de usuarios
  - ✅ Login con JWT
  - ✅ Tokens de autenticación
  - ✅ Base de datos SQLite
  - ✅ Rate limiting
  - ✅ Seguridad (bcrypt, helmet, CORS)

#### `start-frontend.sh`
- Inicia Vite dev server
- Sirve la interfaz React en http://localhost:5173
- Proporciona:
  - ✅ Hot reload (cambios en tiempo real)
  - ✅ Interfaz de usuario moderna
  - ✅ Páginas de registro/login
  - ✅ Navegación de la aplicación

---

## 🔐 Sistema de Autenticación

### Registro de Nuevo Usuario

1. Ve a: http://localhost:5173/register

2. Completa el formulario:
   - **Nombre completo:** Tu nombre
   - **Email:** dirección@valida.com
   - **Usuario:** minimo3caracteres
   - **Contraseña:** Mínimo 8 caracteres con:
     - Al menos UNA mayúscula (A-Z)
     - Al menos una minúscula (a-z)
     - Al menos un número (0-9)
     - Al menos un carácter especial (!@#$%^&*)
   - **Confirmar contraseña:** La misma contraseña
   - **Ubicación:** (opcional)

3. Ejemplo de contraseña válida: `MiPass123!`

### Iniciar Sesión

1. Ve a: http://localhost:5173/login

2. Ingresa:
   - **Usuario:** tu nombre de usuario
   - **Contraseña:** tu contraseña

3. Recibirás automáticamente:
   - Token de acceso (7 días de validez)
   - Token de refresh (30 días de validez)
   - Acceso a todas las funcionalidades

---

## ❌ Problemas Comunes y Soluciones

### "Puerto 5000 ya está en uso"
```bash
# Detener proceso en puerto 5000
lsof -ti:5000 | xargs kill -9

# Luego reiniciar el backend
./start-backend.sh
```

### "Puerto 5173 ya está en uso"
```bash
# Detener proceso en puerto 5173
lsof -ti:5173 | xargs kill -9

# Luego reiniciar el frontend
./start-frontend.sh
```

### "Cannot find module" o errores de npm
```bash
# Instalar dependencias
npm install

# Luego reiniciar
./start-backend.sh  # (en terminal 1)
./start-frontend.sh # (en terminal 2)
```

### "CORS error" en el navegador
Asegúrate de que el backend esté configurado con:
```bash
CORS_ORIGIN="http://localhost:5173"
```
(Esto ya está en `start-backend.sh`)

### No aparece la página (pantalla en blanco)
1. Verifica que AMBOS servidores estén corriendo
2. Revisa la consola del navegador (F12) para errores
3. Verifica que estés accediendo a http://localhost:5173 (no 3000)

### "Credenciales inválidas" al hacer login
- Verifica que tu contraseña cumpla con todos los requisitos
- Verifica que el usuario esté registrado
- Después de 5 intentos fallidos, la cuenta se bloquea por 15 minutos

---

## 🛠️ Comandos Útiles

### Verificar que el backend está corriendo:
```bash
curl http://localhost:5000/api/health
```

Respuesta esperada:
```json
{"status":"ok","timestamp":"2025-10-03T...","uptime":123.456}
```

### Verificar que el frontend está corriendo:
```bash
curl -I http://localhost:5173
```

Debe responder con código 200.

### Detener todo:
```bash
# Presiona Ctrl+C en cada terminal
# O ejecuta:
pkill -f "tsx server/index.ts"
pkill -f "vite"
```

### Ver procesos corriendo:
```bash
ps aux | grep -E "tsx|vite" | grep -v grep
```

---

## 📊 Estado del Sistema

### ✅ FUNCIONA (100%)
- Registro de usuarios
- Login con JWT
- Tokens de autenticación
- Rate limiting
- Validación de entrada
- Hashing de contraseñas (bcrypt)
- Base de datos SQLite
- API completa
- Frontend React
- Navegación
- Rutas protegidas

### ❌ NO IMPLEMENTADO
- OAuth (Google, Microsoft, Facebook)
- Verificación de email
- Recuperación de contraseña
- 2FA (Autenticación de dos factores)

**Nota:** OAuth requiere registro en cada plataforma y configuración adicional. El sistema actual usa autenticación tradicional con usuario/contraseña que es igual de seguro.

---

## 🎓 Arquitectura del Sistema

```
┌─────────────────┐         ┌──────────────────┐
│    FRONTEND     │         │     BACKEND      │
│  (Puerto 5173)  │◄───────►│  (Puerto 5000)   │
│                 │  HTTP   │                  │
│   React + Vite  │ Requests│ Express + Node   │
│                 │         │                  │
│  - Interfaz UI  │         │  - API REST      │
│  - Formularios  │         │  - JWT Auth      │
│  - Navegación   │         │  - SQLite DB     │
└─────────────────┘         │  - Bcrypt        │
                            └──────────────────┘
```

### Flujo de Autenticación:
```
Usuario → Formulario Login (Frontend)
          ↓
       POST /api/login (HTTP)
          ↓
       Verificar credenciales (Backend)
          ↓
       Generar JWT Token (Backend)
          ↓
       Enviar token al cliente (Frontend)
          ↓
       Guardar en localStorage (Frontend)
          ↓
       Usar token en futuras requests (Frontend)
```

---

## 📚 Documentación Adicional

- `ESTADO_ACTUAL_AUTH.md` - Estado detallado del sistema
- `SOLUCION_ACCESO_PAGINA.md` - Solución al problema de acceso
- `INSTRUCCIONES_INICIO.md` - Instrucciones completas
- `README_AUTH_SETUP.md` - Documentación técnica

---

## ⚙️ Configuración de Producción

Para usar en producción, necesitas:

1. **Cambiar los secretos:**
   - JWT_SECRET → clave de 64+ caracteres
   - SESSION_SECRET → clave diferente

2. **Habilitar HTTPS:**
   - SESSION_COOKIE_SECURE=true

3. **Aumentar seguridad:**
   - BCRYPT_ROUNDS=14

4. **Configurar dominio real:**
   - CORS_ORIGIN=https://tudominio.com

5. **Usar base de datos robusta:**
   - PostgreSQL en lugar de SQLite

---

## 🆘 Soporte

Si tienes problemas:

1. **Revisa los logs** en las terminales donde corren los servidores
2. **Verifica la consola del navegador** (F12 → Console)
3. **Lee los archivos de documentación** mencionados arriba
4. **Verifica que ambos servidores** estén corriendo

---

**¡Disfruta usando ¡BASTA!** 🎉

**Última actualización:** 2025-10-03
**Versión:** 1.0.0

