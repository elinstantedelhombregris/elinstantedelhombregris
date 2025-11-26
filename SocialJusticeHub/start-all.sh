#!/bin/zsh

# Script para iniciar backend y frontend
# Cargar nvm
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
echo "📡 Backend en puerto 5000"
echo "🌐 Frontend en puerto 5173"
echo ""

# Matar procesos existentes
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

# Iniciar backend
cd "$(dirname "$0")"
echo "Iniciando backend..."
npm run dev > backend.log 2>&1 &
BACKEND_PID=$!

# Esperar un momento
sleep 3

# Iniciar frontend
cd "$(dirname "$0")"
echo "Iniciando frontend..."
npx vite > frontend.log 2>&1 &
FRONTEND_PID=$!

echo ""
echo "✅ Servicios iniciados"
echo "📋 Backend PID: $BACKEND_PID"
echo "📋 Frontend PID: $FRONTEND_PID"
echo ""
echo "📊 Ver logs:"
echo "   tail -f backend.log"
echo "   tail -f frontend.log"
echo ""
echo "🔗 URLs:"
echo "   Backend: http://localhost:5000"
echo "   Frontend: http://localhost:5173"

