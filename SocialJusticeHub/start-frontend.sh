#!/bin/bash

echo "🎨 Iniciando Frontend en puerto 5173..."
echo ""

cd "$(dirname "$0")"

export VITE_API_PROXY_TARGET="http://localhost:5000"

echo "✅ Vite dev server"
echo "📡 Frontend corriendo en: http://localhost:5173"
echo "🌐 Abre tu navegador en esa dirección"
echo ""

npx vite
