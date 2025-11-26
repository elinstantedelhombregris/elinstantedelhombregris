# 🔐 Sistema de Autenticación Empresarial - ¡BASTA!

## 🚀 Configuración Rápida

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Development Environment Configuration
NODE_ENV=development
PORT=5000

# JWT Configuration (¡IMPORTANTE! Cambiar en producción)
JWT_SECRET=tu-clave-super-secreta-de-al-menos-32-caracteres-para-jwt
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_RATE_LIMIT_MAX=5
LOGIN_RATE_LIMIT_WINDOW_MS=900000

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
CORS_CREDENTIALS=true

# Database Configuration
DATABASE_URL=./local.db

# Session Configuration
SESSION_SECRET=tu-clave-secreta-para-sesiones-cambiar-en-produccion
SESSION_COOKIE_SECURE=false
SESSION_COOKIE_HTTP_ONLY=true
SESSION_COOKIE_MAX_AGE=86400000
```

### 3. Ejecutar Migración de Base de Datos
```bash
npm run db:migrate-auth
```

### 4. Iniciar el Servidor
```bash
npm run dev
```

## 🔒 Características de Seguridad Implementadas

### ✅ **Autenticación JWT**
- Tokens de acceso (7 días)
- Tokens de refresh (30 días)
- Verificación automática de tokens
- Manejo de expiración

### ✅ **Hashing Seguro de Contraseñas**
- bcrypt con 12 rounds (configurable)
- Validación de fortaleza de contraseñas
- Verificación segura de credenciales

### ✅ **Rate Limiting**
- Límite general: 100 requests/15min
- Límite de login: 5 intentos/15min
- Bloqueo temporal de cuentas
- Limpieza automática de intentos

### ✅ **Validación de Entrada**
- Esquemas Zod robustos
- Sanitización de datos
- Validación de email, username, contraseñas
- Mensajes de error detallados

### ✅ **Middleware de Seguridad**
- Headers de seguridad (Helmet)
- CORS configurado
- Límite de tamaño de requests
- Logging de requests
- Manejo de errores centralizado

### ✅ **Base de Datos Segura**
- Contraseñas hasheadas
- Campos de auditoría (created_at, updated_at)
- Tracking de intentos de login
- Bloqueo temporal de cuentas
- Verificación de email (preparado)

## 🛠️ API Endpoints

### **Autenticación**
- `POST /api/register` - Registro de usuario
- `POST /api/login` - Inicio de sesión
- `POST /api/auth/refresh` - Renovar tokens
- `POST /api/auth/logout` - Cerrar sesión

### **Perfil de Usuario**
- `GET /api/auth/me` - Obtener perfil actual
- `PUT /api/auth/profile` - Actualizar perfil
- `PUT /api/auth/change-password` - Cambiar contraseña

### **Rutas Protegidas**
Todas las rutas que requieren autenticación usan el header:
```
Authorization: Bearer <access_token>
```

## 🔧 Configuración de Producción

### Variables de Entorno Críticas
```env
# ¡CAMBIAR EN PRODUCCIÓN!
JWT_SECRET=clave-super-secreta-de-64-caracteres-minimo
SESSION_SECRET=otra-clave-secreta-diferente

# Seguridad
NODE_ENV=production
SESSION_COOKIE_SECURE=true
BCRYPT_ROUNDS=14
```

### Consideraciones de Seguridad
1. **JWT_SECRET**: Debe ser al menos 32 caracteres, idealmente 64+
2. **HTTPS**: Obligatorio en producción
3. **Rate Limiting**: Ajustar según el tráfico esperado
4. **Logging**: Configurar logging centralizado
5. **Monitoring**: Implementar alertas de seguridad

## 🧪 Testing

### Probar Autenticación
```bash
# Registro
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Usuario Test",
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPass123!",
    "confirmPassword": "TestPass123!"
  }'

# Login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPass123!"
  }'

# Perfil (con token)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <access_token>"
```

## 🚨 Troubleshooting

### Error: "JWT_SECRET must be at least 32 characters"
- Verificar que JWT_SECRET tenga al menos 32 caracteres

### Error: "Missing required environment variables"
- Verificar que todas las variables requeridas estén en .env

### Error: "Database migration failed"
- Verificar que la base de datos no esté en uso
- Ejecutar `npm run db:migrate-auth` nuevamente

### Error: "Rate limit exceeded"
- Esperar 15 minutos o reiniciar el servidor
- Verificar configuración de rate limiting

## 📚 Próximas Mejoras

- [ ] Verificación de email
- [ ] Recuperación de contraseña
- [ ] Autenticación de dos factores (2FA)
- [ ] OAuth (Google, Microsoft, Facebook)
- [ ] Roles y permisos (RBAC)
- [ ] Audit logging
- [ ] Blacklist de tokens
- [ ] Sesiones concurrentes

## 🤝 Contribución

Para contribuir al sistema de autenticación:
1. Seguir las mejores prácticas de seguridad
2. Escribir tests para nuevas funcionalidades
3. Documentar cambios en la API
4. Revisar el código de seguridad

---

**⚠️ IMPORTANTE**: Este sistema está diseñado para desarrollo. Para producción, implementar todas las medidas de seguridad adicionales mencionadas.
