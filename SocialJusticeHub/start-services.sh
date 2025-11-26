#!/bin/sh

# Script para iniciar backend y frontend usando rutas absolutas

cd "$(dirname "$0")"

# Cargar nvm si existe
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Variables de entorno del backend
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

echo "🚀 Iniciando servicios..."
echo ""

# Matar procesos existentes en los puertos
if command -v lsof >/dev/null 2>&1; then
    lsof -ti:5000 | xargs kill -9 2>/dev/null
    lsof -ti:5173 | xargs kill -9 2>/dev/null
fi

# Iniciar backend
echo "📡 Iniciando backend en puerto 5000..."
if [ -f "node_modules/.bin/tsx" ]; then
    NODE_ENV=development PORT=5000 node_modules/.bin/tsx server/index.ts > backend.log 2>&1 &
    BACKEND_PID=$!
    echo "   Backend PID: $BACKEND_PID"
else
    echo "   ERROR: tsx no encontrado"
fi

# Esperar un momento para que el backend inicie
sleep 2

# Iniciar frontend
echo "🌐 Iniciando frontend en puerto 5173..."
if [ -f "node_modules/.bin/vite" ]; then
    node_modules/.bin/vite > frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "   Frontend PID: $FRONTEND_PID"
else
    echo "   ERROR: vite no encontrado"
fi

echo ""
echo "✅ Servicios iniciados"
echo ""
echo "📊 Ver logs:"
echo "   tail -f backend.log"
echo "   tail -f frontend.log"
echo ""
echo "🔗 URLs:"
echo "   Backend: http://localhost:5000"
echo "   Frontend: http://localhost:5173"
echo ""
echo "⏳ Esperando a que los servicios inicien..."
sleep 3

# Verificar que estén corriendo
echo ""
echo "🔍 Verificando servicios..."
if curl -s http://localhost:5000/api/health >/dev/null 2>&1; then
    echo "   ✅ Backend respondiendo"
else
    echo "   ❌ Backend no responde - revisa backend.log"
fi

if curl -s http://localhost:5173/ >/dev/null 2>&1; then
    echo "   ✅ Frontend respondiendo"
else
    echo "   ❌ Frontend no responde - revisa frontend.log"
fi

