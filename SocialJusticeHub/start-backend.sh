#!/bin/bash

echo "🚀 Iniciando Backend en puerto 5000..."
echo ""

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

echo "✅ Variables de entorno configuradas"
echo "📡 Backend corriendo en: http://localhost:5000"
echo "🔐 API de autenticación disponible"
echo ""

npm run dev

