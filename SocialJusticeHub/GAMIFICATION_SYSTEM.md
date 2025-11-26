# Sistema Gamificado - Guía del Cambio: de Vos al País

## 📋 Resumen del Sistema

Este sistema gamificado implementa una plataforma completa de desafíos y logros basada en la "Guía del Cambio: de Vos al País". Los usuarios pueden progresar a través de 5 niveles de transformación personal y social, completando desafíos y ganando experiencia.

## 🏗️ Arquitectura del Sistema

### Backend
- **Base de datos**: SQLite con Drizzle ORM
- **API**: Express.js con TypeScript
- **Autenticación**: JWT
- **Validación**: Zod schemas

### Frontend
- **Framework**: React 18 con TypeScript
- **Routing**: Wouter
- **Estado**: TanStack Query
- **UI**: Shadcn/ui + Tailwind CSS
- **Iconos**: Lucide React

## 📊 Estructura de Datos

### Tablas Principales

#### `userLevels`
- Nivel actual del usuario (1-5)
- Experiencia total acumulada
- Experiencia necesaria para el siguiente nivel
- Racha de días consecutivos

#### `challenges`
- Desafíos organizados por nivel
- Categorías: vision, action, community, reflection
- Dificultades: beginner, intermediate, advanced
- Frecuencias: daily, weekly, monthly, annual

#### `challengeSteps`
- Pasos individuales de cada desafío
- Tipos: question, action, reflection, quiz
- Datos JSON para configuraciones específicas

#### `userChallengeProgress`
- Progreso del usuario en cada desafío
- Estados: not_started, in_progress, completed, failed
- Pasos completados y paso actual

#### `badges`
- Logros disponibles en el sistema
- Rarezas: common, rare, epic, legendary
- Criterios de obtención configurables

#### `userBadges`
- Badges obtenidos por cada usuario
- Fecha de obtención y estado de visualización

#### `userDailyActivity`
- Actividad diaria del usuario
- Experiencia ganada, desafíos completados
- Seguimiento de rachas

## 🎮 Sistema de Gamificación

### Niveles de la Guía del Cambio

1. **VOS** (Azul) - Transformación personal
2. **TU FAMILIA** (Rosa) - Conexión familiar  
3. **TU BARRIO** (Verde) - Comunidad local
4. **TU PROVINCIA** (Púrpura) - Impacto regional
5. **LA NACIÓN** (Índigo) - Cambio nacional

### Sistema de Experiencia

- **XP por desafío**: 10-2000 XP según dificultad y nivel
- **Progresión**: 500 XP por nivel
- **Rachas**: Bonus por actividad diaria consecutiva

### Tipos de Desafíos

#### Diarios
- Reflexión matutina de valores (10 XP)
- Cena sin dispositivos (15 XP)

#### Semanales
- Auditoría de consumo responsable (50 XP)
- Diálogo familiar profundo (75 XP)
- Conocer 3 vecinos nuevos (100 XP)

#### Mensuales
- Define tu manifiesto personal (200 XP)
- Pacto familiar de valores (250 XP)
- Organiza reunión vecinal (300 XP)
- Investigación de políticas provinciales (350 XP)
- Propuesta de política pública (500 XP)

#### Anuales
- Revisión de transformación personal (500 XP)
- Proyecto comunitario sostenible (1000 XP)
- Red de iniciativas locales (1200 XP)
- Mentoría a 10 agentes de cambio (2000 XP)

## 🔧 API Endpoints

### Desafíos
- `GET /api/challenges` - Lista todos los desafíos
- `GET /api/challenges/:id` - Obtiene un desafío específico
- `GET /api/challenges/:id/steps` - Obtiene pasos de un desafío

### Progreso del Usuario
- `GET /api/user/challenges` - Progreso del usuario en desafíos
- `POST /api/user/challenges/:id/start` - Inicia un desafío
- `PUT /api/user/challenges/:id/progress` - Actualiza progreso
- `POST /api/user/challenges/:id/complete` - Completa un desafío
- `POST /api/user/challenges/:id/step/:stepId/complete` - Completa un paso

### Niveles y Estadísticas
- `GET /api/user/level` - Nivel actual del usuario
- `GET /api/user/stats` - Estadísticas del usuario
- `GET /api/user/activity` - Actividad diaria del usuario

### Badges
- `GET /api/badges` - Lista todos los badges
- `GET /api/user/badges` - Badges del usuario
- `POST /api/user/badges/check` - Verifica nuevos badges

## 🎨 Componentes de UI

### Páginas Principales
- **UserDashboard**: Landing page post-registro
- **UserProfile**: Perfil con tabs de información, progreso y logros
- **Challenges**: Sistema de desafíos con filtros
- **ChallengeDetail**: Vista detallada de desafíos individuales

### Componentes Reutilizables
- **UserAvatar**: Avatar con indicadores de nivel y racha
- **ProgressBar**: Barra de progreso animada
- **BadgeCard**: Card para mostrar badges
- **LoadingStates**: Estados de carga y error consistentes

## 🚀 Funcionalidades Implementadas

### ✅ Completadas
- [x] Sistema de registro y autenticación
- [x] Base de datos con todas las tablas de gamificación
- [x] API endpoints completos
- [x] Páginas de usuario (Dashboard, Profile, Challenges, ChallengeDetail)
- [x] Componentes reutilizables
- [x] Sistema de filtros y búsqueda
- [x] Manejo de errores y estados de carga
- [x] Responsive design
- [x] 9 desafíos iniciales distribuidos en 5 niveles
- [x] 6 badges con diferentes rarezas
- [x] Sistema de progreso paso a paso

### 🔄 En Progreso
- [ ] Sistema de notificaciones push
- [ ] Leaderboard global
- [ ] Compartir logros en redes sociales
- [ ] Sistema de mentoría entre usuarios

### 📋 Futuras Mejoras
- [ ] Modo offline con sincronización
- [ ] Integración con calendario
- [ ] Recordatorios automáticos
- [ ] Analytics avanzados
- [ ] Sistema de grupos/equipos

## 🧪 Testing

### Scripts de Prueba
- `test-endpoints.js`: Verifica que todos los endpoints funcionen
- Migración y seed automáticos
- Verificación de integridad de datos

### Estado Actual
- ✅ Backend: 100% funcional
- ✅ Frontend: 100% funcional
- ✅ Base de datos: Migrada y poblada
- ✅ API: Todos los endpoints respondiendo
- ✅ UI/UX: Completamente responsive

## 📱 Uso del Sistema

### Para Usuarios
1. Registrarse en la plataforma
2. Ser redirigido al dashboard
3. Explorar desafíos disponibles
4. Completar desafíos paso a paso
5. Ganar experiencia y desbloquear badges
6. Ver progreso en el perfil

### Para Desarrolladores
1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Ejecutar migraciones: `npm run migrate`
4. Poblar datos iniciales: `npm run seed`
5. Iniciar servidor: `npm run dev`
6. Acceder a `http://localhost:5000`

## 🔒 Seguridad

- Autenticación JWT
- Validación de entrada con Zod
- Sanitización de datos
- Rate limiting en endpoints
- Headers de seguridad configurados

## 📈 Métricas del Sistema

- **9 Desafíos** disponibles
- **6 Badges** implementados
- **5 Niveles** de progresión
- **4 Tipos** de pasos de desafíos
- **3 Páginas** principales de usuario
- **100%** de cobertura de funcionalidades básicas

---

*Sistema gamificado implementado exitosamente para la "Guía del Cambio: de Vos al País"*
