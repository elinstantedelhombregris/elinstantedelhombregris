# 🚀 INSTRUCCIONES PARA INICIAR LOS SERVICIOS

## ⚠️ IMPORTANTE: Ejecuta estos comandos desde TU terminal (no desde aquí)

El entorno de ejecución automática no tiene acceso a Node.js/npm. Necesitas ejecutar estos comandos manualmente.

---

## 📋 PASO 1: Iniciar aplicación (una terminal)

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/SocialJusticeHub

# Cargar nvm (si lo usas)
source ~/.nvm/nvm.sh

# Variables de entorno
export NODE_ENV=development
export PORT=5000
export ENABLE_NLP_MODELS=false
export JWT_SECRET="test-secret-key-for-development-only-minimum-32-characters-required"
export JWT_EXPIRES_IN="7d"
export JWT_REFRESH_EXPIRES_IN="30d"
export BCRYPT_ROUNDS=10
export RATE_LIMIT_WINDOW_MS=900000
export RATE_LIMIT_MAX_REQUESTS=100
export LOGIN_RATE_LIMIT_MAX=5
export LOGIN_RATE_LIMIT_WINDOW_MS=900000
export CORS_ORIGIN="http://localhost:5173"
export CORS_CREDENTIALS=true
export DATABASE_URL="./local.db"
export SESSION_SECRET="test-session-secret-key-for-development-only"
export SESSION_COOKIE_SECURE=false
export SESSION_COOKIE_HTTP_ONLY=true
export SESSION_COOKIE_MAX_AGE=86400000

# Iniciar backend
npm run dev
```

---

## ✅ VERIFICACIÓN

Una vez que el servicio esté corriendo, deberías ver:

1. **Backend + Frontend integrado**: Mensaje `serving on port 5000`

Luego verifica en el navegador:
- ✅ http://localhost:5000/api/health → Debe responder `{"status":"ok",...}`
- ✅ http://localhost:5000 → Debe mostrar la aplicación

### Verificación automática (calidad)

En otra terminal, dentro de `SocialJusticeHub`, puedes ejecutar:

```bash
npm run verify
```

Para validación completa (incluye arranque en producción + smoke tests API):

```bash
npm run verify:full
```

---

## 🔐 LOGIN

Una vez que todo esté corriendo:
- **Usuario**: `hombre_gris`
- **Contraseña**: `Password123!`

---

## 🐛 SI ALGO FALLA

1. Verifica que el puerto 5000 esté libre:
   ```bash
   lsof -i :5000
   ```

2. Si están ocupados, mata los procesos:
   ```bash
   kill -9 $(lsof -ti:5000)
   ```

3. Verifica que Node.js esté instalado:
   ```bash
   node --version
   npm --version
   ```

4. Si no están instalados, instálalos con nvm:
   ```bash
   nvm install node
   nvm use node
   ```

---

## 📊 LOGS

Si necesitas ver los logs:
- Backend + Frontend integrado: los verás directamente en la terminal donde ejecutaste `npm run dev`.
