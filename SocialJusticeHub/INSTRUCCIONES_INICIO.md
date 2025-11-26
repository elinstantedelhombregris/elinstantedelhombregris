# 🚀 INSTRUCCIONES PARA INICIAR LOS SERVICIOS

## ⚠️ IMPORTANTE: Ejecuta estos comandos desde TU terminal (no desde aquí)

El entorno de ejecución automática no tiene acceso a Node.js/npm. Necesitas ejecutar estos comandos manualmente.

---

## 📋 PASO 1: Abre DOS terminales separadas

### Terminal 1 - Backend (Puerto 5000)

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/SocialJusticeHub

# Cargar nvm (si lo usas)
source ~/.nvm/nvm.sh

# Variables de entorno
export NODE_ENV=development
export PORT=5000
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

### Terminal 2 - Frontend (Puerto 5173)

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/SocialJusticeHub

# Cargar nvm (si lo usas)
source ~/.nvm/nvm.sh

# Iniciar frontend
npm run dev
```

**NOTA:** Si el comando `npm run dev` no funciona para el frontend, usa:
```bash
cd client
npm run dev
```

O ejecuta vite directamente:
```bash
npx vite
```

---

## ✅ VERIFICACIÓN

Una vez que ambos servicios estén corriendo, deberías ver:

1. **Backend**: Mensajes como "serving on port 5000" o similar
2. **Frontend**: Mensajes como "Local: http://localhost:5173" o similar

Luego verifica en el navegador:
- ✅ http://localhost:5000/api/health → Debe responder `{"status":"ok",...}`
- ✅ http://localhost:5173 → Debe mostrar la aplicación

---

## 🔐 LOGIN

Una vez que todo esté corriendo:
- **Usuario**: `hombre_gris`
- **Contraseña**: `Password123!`

---

## 🐛 SI ALGO FALLA

1. Verifica que los puertos 5000 y 5173 estén libres:
   ```bash
   lsof -i :5000
   lsof -i :5173
   ```

2. Si están ocupados, mata los procesos:
   ```bash
   kill -9 $(lsof -ti:5000)
   kill -9 $(lsof -ti:5173)
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
- Backend: Los verás directamente en la Terminal 1
- Frontend: Los verás directamente en la Terminal 2
