# Launch Readiness — Críticas y Altas

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mitigar las deficiencias críticas y altas detectadas en la auditoría técnica antes del lanzamiento del 5 de mayo de 2026.

**Architecture:** Cambios quirúrgicos sobre `server/`, `client/src/lib/`, y los componentes de auth. Sin refactors estructurales — los archivos grandes (>700 líneas), los `as any` masivos, el cambio de driver de Neon, y la suite de tests completa quedan diferidos a un sprint post-launch (ver "Diferidos / P2" al final). En el plazo de 24h optimizamos para *blast-radius pequeño + rollback fácil*, no para arreglar todo.

**Tech Stack:** Express 4 + jsonwebtoken + cookie-parser, React + @tanstack/react-query, Drizzle/Neon-HTTP, Zod, Vitest (smoke).

**Reality check (leer antes de empezar):**
- Lanzamiento es mañana. Cada cambio que rompe auth o queries es catastrófico.
- TDD completo no es posible sin infra de tests previa. Los steps usan **verificación manual + smoke tests**, no `assert`. Está reflejado en cada task.
- Hay un task P0.0 que crea infra mínima de tests (Vitest) para que los siguientes tasks tengan red.
- Los items marcados **[ALTO RIESGO]** requieren testing manual exhaustivo + plan de rollback antes de mergear.
- Si en cualquier momento algo de auth se rompe en `dev`, **revertir el commit y pasar al siguiente task**. No quemar tiempo debugueando la noche del launch.

**Orden de ejecución (por prioridad):**
- **P0** (críticas, bloquean launch): Tasks 1–6
- **P1** (altas, deseables): Tasks 7–11
- **P2** (diferidos post-launch): documentados al final, no se ejecutan ahora.

---

## Task 0: Setup mínimo — Vitest + smoke harness

**Por qué primero:** Sin un harness mínimo, todos los demás tasks dependen de testing manual. 30 min de setup ahora valen 5h de re-test si algo se rompe.

**Files:**
- Create: `SocialJusticeHub/vitest.config.ts`
- Create: `SocialJusticeHub/tests/smoke/auth.smoke.test.ts`
- Modify: `SocialJusticeHub/package.json`

- [ ] **Step 1: Instalar Vitest + supertest**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/SocialJusticeHub
npm install --save-dev vitest @vitest/ui supertest @types/supertest
```

- [ ] **Step 2: Crear `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    testTimeout: 15000,
    globals: false,
  },
});
```

- [ ] **Step 3: Agregar scripts al `package.json`**

En `"scripts"`, agregar:

```json
"test:unit": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Smoke test inicial (sirve de control)**

`tests/smoke/auth.smoke.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('smoke: harness boots', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Correr y verificar**

```bash
npm run test:unit
```

Expected: 1 passed.

- [ ] **Step 6: Commit**

```bash
git add SocialJusticeHub/vitest.config.ts SocialJusticeHub/tests/ SocialJusticeHub/package.json SocialJusticeHub/package-lock.json
git commit -m "chore(launch): add minimal Vitest harness for smoke tests"
```

---

## Task 1: Secrets fail-fast en producción

**Files:**
- Modify: `SocialJusticeHub/server/config.ts:61-105`

**Por qué:** Hoy `ensureSecret` genera secretos efímeros con `crypto.randomBytes` cuando faltan en `NODE_ENV=production` o `VERCEL=1`. Cada cold start invalida sesiones JWT. En Vercel serverless cada invocación puede ser un proceso nuevo: **los usuarios pierden sesión al azar**.

- [ ] **Step 1: Reemplazar `ensureSecret` por hard fail**

En `server/config.ts`, reemplazar la función `ensureSecret` y la lógica de `validateConfig` que la usa (líneas 66–105). Reemplazar:

```typescript
function ensureSecret(envKey: 'JWT_SECRET' | 'SESSION_SECRET') {
  const current = process.env[envKey];
  if (current && current.length >= 32) return;

  const replacement = crypto.randomBytes(32).toString('hex'); // 64 chars
  process.env[envKey] = replacement;
  console.warn(
    `[config] ${envKey} missing/weak; generated an ephemeral secret. ` +
      `Set ${envKey} in your environment for stable auth/session behavior.`
  );
}
```

Por:

```typescript
function assertStrongSecret(envKey: 'JWT_SECRET' | 'SESSION_SECRET') {
  const current = process.env[envKey];
  if (!current || current.length < 32) {
    throw new Error(
      `[config] ${envKey} is required and must be at least 32 characters. ` +
      `Set it in the deployment environment before booting.`
    );
  }
}
```

- [ ] **Step 2: Reemplazar la lógica de `validateConfig` que usaba `ensureSecret`**

Reemplazar el bloque (líneas ~84–105):

```typescript
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    if (isProductionLikeEnv()) {
      for (const varName of missingVars) {
        ensureSecret(varName as 'JWT_SECRET' | 'SESSION_SECRET');
      }
    } else {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }
  
  // Validate JWT secret strength
  if (process.env.JWT_SECRET!.length < 32) {
    if (isProductionLikeEnv()) {
      ensureSecret('JWT_SECRET');
    } else {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }
  }
```

Por:

```typescript
  for (const varName of requiredEnvVars) {
    assertStrongSecret(varName as 'JWT_SECRET' | 'SESSION_SECRET');
  }
```

- [ ] **Step 3: Eliminar el import `crypto` si quedó sin uso**

Verificar `server/config.ts:2`. Si `crypto` no se usa más, borrar la línea `import crypto from 'crypto';`.

- [ ] **Step 4: Verificar localmente**

```bash
cd SocialJusticeHub
# El .env local tiene secretos válidos, debería arrancar:
npm run check
```

Expected: PASS.

- [ ] **Step 5: Verificar el fail-fast (en una shell aparte)**

```bash
cd SocialJusticeHub
JWT_SECRET= SESSION_SECRET= NODE_ENV=production npx tsx -e "import('./server/config').catch(e => { console.log('OK fails:', e.message); process.exit(0); })"
```

Expected: imprime `OK fails: [config] JWT_SECRET is required...` y exit 0.

- [ ] **Step 6: Verificar Vercel env vars antes de deploy**

```bash
# Confirma que en Vercel ya están JWT_SECRET y SESSION_SECRET (≥32 chars).
# Si no, configurarlas ANTES de mergear este task. Si no, el próximo deploy crashea en boot.
```

- [ ] **Step 7: Commit**

```bash
git add SocialJusticeHub/server/config.ts
git commit -m "fix(security): fail-fast on missing JWT/SESSION secrets in production"
```

---

## Task 2: Validación de query params (`limit`, `offset`, `page`)

**Files:**
- Create: `SocialJusticeHub/server/lib/pagination.ts`
- Modify: `SocialJusticeHub/server/routes.ts` (líneas 1978-1979, 2040-2041, 4474-4484)
- Test: `SocialJusticeHub/tests/unit/pagination.test.ts`

**Por qué:** Hoy `parseInt(req.query.limit)` sin clamp permite `?limit=999999`, `?limit=-1`, o `?limit=abc` que devuelve `NaN`. Riesgo de DoS por consulta o errores 500.

- [ ] **Step 1: Crear el helper de paginación con Zod**

`server/lib/pagination.ts`:

```typescript
import { z } from 'zod';
import type { Request } from 'express';

const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).max(10000).default(0),
  page: z.coerce.number().int().min(1).max(500).optional(),
});

export type Pagination = z.infer<typeof paginationSchema>;

export function parsePagination(req: Request): Pagination {
  const result = paginationSchema.safeParse(req.query);
  if (!result.success) {
    return { limit: 20, offset: 0 };
  }
  const { limit, offset, page } = result.data;
  if (page !== undefined) {
    return { limit, offset: (page - 1) * limit, page };
  }
  return { limit, offset };
}
```

- [ ] **Step 2: Test del helper**

`tests/unit/pagination.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { parsePagination } from '../../server/lib/pagination';

const fakeReq = (query: Record<string, string>) => ({ query }) as any;

describe('parsePagination', () => {
  it('clamps oversized limit', () => {
    expect(parsePagination(fakeReq({ limit: '99999' })).limit).toBe(20);
  });
  it('rejects negative offset', () => {
    expect(parsePagination(fakeReq({ offset: '-5' })).offset).toBe(0);
  });
  it('handles non-numeric input', () => {
    expect(parsePagination(fakeReq({ limit: 'abc' }))).toEqual({ limit: 20, offset: 0 });
  });
  it('converts page to offset', () => {
    expect(parsePagination(fakeReq({ page: '3', limit: '10' })).offset).toBe(20);
  });
  it('uses defaults', () => {
    expect(parsePagination(fakeReq({}))).toEqual({ limit: 20, offset: 0 });
  });
});
```

- [ ] **Step 3: Correr tests**

```bash
cd SocialJusticeHub && npm run test:unit
```

Expected: 5 passed (más el smoke = 6 total).

- [ ] **Step 4: Reemplazar parseo crudo en `routes.ts`**

Buscar todas las ocurrencias problemáticas:

```bash
cd SocialJusticeHub
grep -n "parseInt(req.query" server/routes.ts
grep -n "parseInt(req.query" server/routes-*.ts
```

Para cada match: reemplazar el `parseInt(req.query.limit ...)` y `parseInt(req.query.offset ...)` por:

```typescript
import { parsePagination } from './lib/pagination'; // arriba del archivo

// dentro del handler:
const { limit, offset } = parsePagination(req);
```

Las líneas mencionadas en la auditoría (`routes.ts:1978-1979, 2040-2041, 4474-4484`) son los puntos críticos. Aplicar primero a esos.

- [ ] **Step 5: Verificar TypeScript**

```bash
npm run check
```

Expected: PASS.

- [ ] **Step 6: Smoke test manual**

```bash
# Con dev server corriendo (npm run dev en otra terminal)
curl 'http://localhost:3001/api/community?limit=999999' | head -c 500
# Verificar que NO devuelve 999999 items.
curl 'http://localhost:3001/api/community?limit=-1' | head -c 200
# Verificar que NO crashea.
```

- [ ] **Step 7: Commit**

```bash
git add SocialJusticeHub/server/lib/pagination.ts SocialJusticeHub/server/routes.ts SocialJusticeHub/server/routes-*.ts SocialJusticeHub/tests/unit/pagination.test.ts
git commit -m "fix(api): validate pagination query params (limit/offset/page) with Zod"
```

---

## Task 3: Healthcheck real (toca la DB)

**Files:**
- Modify: `SocialJusticeHub/server/routes.ts:127-133`

**Por qué:** Hoy `/api/health` siempre devuelve 200 sin chequear nada. Vercel y los uptime monitors no detectan DB caída.

- [ ] **Step 1: Reemplazar el handler de `/api/health`**

Buscar el handler actual (alrededor de `routes.ts:127-133`) y reemplazar por:

```typescript
app.get('/api/health', async (_req, res) => {
  try {
    const start = Date.now();
    // SELECT 1 — barato, valida conexión a Neon
    await db.execute(sql`SELECT 1`);
    const dbLatencyMs = Date.now() - start;
    res.status(200).json({ status: 'ok', dbLatencyMs });
  } catch (error) {
    console.error('[health] DB check failed:', error);
    res.status(503).json({ status: 'degraded', reason: 'database_unreachable' });
  }
});
```

Asegurarse de que `db` y `sql` están importados arriba del archivo:

```typescript
import { db } from './db';
import { sql } from 'drizzle-orm';
```

- [ ] **Step 2: Verificar localmente**

```bash
# Con dev server corriendo:
curl -i http://localhost:3001/api/health
```

Expected: `200 OK` con `{"status":"ok","dbLatencyMs":<n>}`.

- [ ] **Step 3: Commit**

```bash
git add SocialJusticeHub/server/routes.ts
git commit -m "fix(ops): make /api/health verify DB connectivity"
```

---

## Task 4: Rate limit en endpoints públicos pesados

**Files:**
- Modify: `SocialJusticeHub/server/routes.ts` (registro del rate limit en `/api/community`, `/api/dreams`, `/api/open-data/stats`)

**Por qué:** Endpoints sin auth + sin rate limit + retornando listados grandes = vector de DoS gratis. Ya existe `generalRateLimit` y `authRateLimit` en `server/middleware.ts`; falta aplicarlos.

- [ ] **Step 1: Crear un rate limit específico para endpoints de lectura pública**

En `server/middleware.ts`, después de `authRateLimit`, agregar:

```typescript
export const publicReadRateLimit = (() => {
  if (config.server.nodeEnv === 'development') {
    return (_req: Request, _res: Response, next: NextFunction) => next();
  }
  return rateLimit({
    windowMs: 60 * 1000, // 1 min
    max: 60,             // 60 req/min/IP
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        error: 'Too many requests',
        message: 'Demasiadas solicitudes. Esperá un momento.',
      });
    },
  });
})();
```

- [ ] **Step 2: Aplicar en `routes.ts` a los endpoints públicos pesados**

Identificar los 3 endpoints (`/api/community`, `/api/dreams`, `/api/open-data/stats`) y antes del handler agregar `publicReadRateLimit`. Ejemplo:

```typescript
import { publicReadRateLimit } from './middleware';

app.get('/api/community', publicReadRateLimit, async (req, res) => {
  // ...
});
```

- [ ] **Step 3: Verificar TypeScript**

```bash
cd SocialJusticeHub && npm run check
```

Expected: PASS.

- [ ] **Step 4: Verificar localmente (development es no-op, OK)**

```bash
curl -i http://localhost:3001/api/community | head
```

Expected: 200 (en dev no hay rate limit; en producción sí).

- [ ] **Step 5: Commit**

```bash
git add SocialJusticeHub/server/middleware.ts SocialJusticeHub/server/routes.ts
git commit -m "fix(security): rate-limit public read endpoints (60 req/min)"
```

---

## Task 5: JWT en cookies httpOnly **[ALTO RIESGO]**

**Files:**
- Modify: `SocialJusticeHub/server/auth.ts` (middleware `authenticateToken`, `optionalAuth`)
- Modify: `SocialJusticeHub/server/routes.ts` o donde estén los handlers de `/api/auth/login`, `/register`, `/logout`, `/refresh`
- Modify: `SocialJusticeHub/server/index.ts` (agregar `cookie-parser`)
- Modify: `SocialJusticeHub/client/src/lib/queryClient.ts`
- Modify: `SocialJusticeHub/client/src/pages/Login.tsx`
- Modify: `SocialJusticeHub/client/src/pages/Register.tsx`

**Por qué:** Tokens JWT en `localStorage` son extraíbles por cualquier XSS. Cookies `httpOnly + Secure + SameSite=Lax` los hacen inaccesibles desde JS.

**[ALTO RIESGO]** — Toca todo el flujo de auth. Si te quedás sin tiempo o algo no funciona en `dev`, **revertí y dejá esto para post-launch + rotá secrets en su lugar**. La XSS es un riesgo teórico hoy; romper auth en producción es un incidente cierto.

- [ ] **Step 1: Instalar `cookie-parser`**

```bash
cd SocialJusticeHub
npm install cookie-parser
npm install --save-dev @types/cookie-parser
```

- [ ] **Step 2: Registrar `cookie-parser` en `server/index.ts`**

Después de `app.use(corsConfig());` (línea 43) agregar:

```typescript
import cookieParser from 'cookie-parser';
// ...
app.use(cookieParser());
```

- [ ] **Step 3: Hacer que `authenticateToken` y `optionalAuth` lean cookie + header**

En `server/auth.ts`, modificar `TokenManager.extractTokenFromHeader` para que también acepte el cookie. O más simple — en cada middleware:

```typescript
// Reemplazar dentro de authenticateToken (línea 209):
const token =
  (req as any).cookies?.authToken ??
  TokenManager.extractTokenFromHeader(req.headers.authorization);
```

Mismo cambio en `optionalAuth` (línea 241). El fallback a `Authorization` header garantiza retro-compat con clientes ya logueados.

- [ ] **Step 4: Setear cookie en login + register + refresh**

Localizar en `server/routes.ts` (o `server/routes-auth.ts` si existe) los endpoints `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`. Donde se hace `res.json({ tokens: { accessToken, refreshToken } })` o equivalente, agregar antes:

```typescript
res.cookie('authToken', accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días, debe matchear JWT_EXPIRES_IN
  path: '/',
});
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
  path: '/api/auth/refresh',
});
```

**Importante:** seguir devolviendo el token en el body por ahora — no romper clientes viejos que aún leen `tokens.accessToken`. La transición es: cookie + body durante 1 release, eliminar body en P2.

- [ ] **Step 5: Crear endpoint `/api/auth/logout` que limpie las cookies**

```typescript
app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie('authToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
  res.status(200).json({ ok: true });
});
```

Si ya existe, asegurarse que clearea las cookies.

- [ ] **Step 6: Cliente — dejar de guardar el token en localStorage en login**

`client/src/pages/Login.tsx:72-73`. Reemplazar:

```typescript
localStorage.setItem('authToken', data.tokens.accessToken);
localStorage.setItem('refreshToken', data.tokens.refreshToken);
```

Por: nada. El servidor ya setea las cookies; el cliente no las maneja.

- [ ] **Step 7: Cliente — mismo cambio en `Register.tsx:107-108`**

Borrar las líneas equivalentes.

- [ ] **Step 8: Cliente — `apiRequest` y `getQueryFn` ya tienen `credentials: 'include'`**

`client/src/lib/queryClient.ts:32` y `:77` ya incluyen `credentials: "include"`. **No tocar.** Solo eliminar el `Authorization` header (las líneas 17–25 y 69–73) — el browser ahora manda la cookie.

Reemplazar en `apiRequest` (líneas 17-25):

```typescript
const token = localStorage.getItem('authToken');

const headers: Record<string, string> = {};
if (data) {
  headers['Content-Type'] = 'application/json';
}
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

Por:

```typescript
const headers: Record<string, string> = {};
if (data) {
  headers['Content-Type'] = 'application/json';
}
```

Y en `getQueryFn` (líneas 69-73):

```typescript
const token = localStorage.getItem('authToken');
const headers: Record<string, string> = {};
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

Por:

```typescript
const headers: Record<string, string> = {};
```

- [ ] **Step 9: Cliente — manejo de 401/403 en `apiRequest`**

Líneas 36-50: en lugar de `localStorage.removeItem`, hacer logout via `/api/auth/logout`:

```typescript
if (res.status === 403) {
  try {
    const errorData = await res.json().catch(() => ({}));
    if (errorData.code === 'INVALID_TOKEN') {
      await fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
      window.location.href = '/login';
    }
  } catch {}
  return res;
}
```

- [ ] **Step 10: CORS — confirmar que `credentials: true` está activo**

`server/middleware.ts:84` — `credentials: config.cors.credentials`, default `true`. **Verificar en `.env` de Vercel que `CORS_CREDENTIALS` no esté en `false`** y que `CORS_ORIGIN` sea el origin exacto de producción (no `*` — los browsers rechazan `Access-Control-Allow-Origin: *` con `credentials: include`).

- [ ] **Step 11: Verificar en `dev` (manual, exhaustivo)**

```bash
cd SocialJusticeHub && npm run dev
```

En el browser:
1. Abrir DevTools → Application → Cookies. Loguearse. Verificar que aparece `authToken` con `HttpOnly=true`.
2. En Console: `localStorage.getItem('authToken')` → debe ser `null`.
3. Recargar página. Sigue logueado (cookie persistente).
4. Hacer una request autenticada (ej: ir a `/perfil`). Debe funcionar.
5. Hacer logout. Cookie desaparece. `/perfil` redirige a login.
6. Probar registro completo.

Si CUALQUIERA de los pasos falla → **revertir el commit y saltar este task**. Documentar en el commit message qué falló.

- [ ] **Step 12: Verificar TypeScript + build**

```bash
npm run check && npm run build
```

Expected: PASS.

- [ ] **Step 13: Commit**

```bash
git add -A SocialJusticeHub/server/ SocialJusticeHub/client/src/ SocialJusticeHub/package.json SocialJusticeHub/package-lock.json
git commit -m "fix(security): move JWT to httpOnly cookies (mitigate XSS token theft)"
```

---

## Task 6: 404 → 403 en checks de autorización

**Files:**
- Modify: `SocialJusticeHub/server/routes.ts:1014, 1038, 1064` (y otros lugares con el mismo patrón)

**Por qué:** Devolver 404 cuando el usuario está autenticado pero no autorizado oculta bugs de permisos y dificulta debugging. Además 403 es semánticamente correcto.

- [ ] **Step 1: Encontrar todos los `404 not authorized`**

```bash
cd SocialJusticeHub
grep -nE "status\(404\).*not.*[Aa]uth|404.*not.*owner|userId !== req\.user" server/routes.ts server/routes-*.ts
```

Listar las ocurrencias.

- [ ] **Step 2: Reemplazar cada match por 403**

Para cada bloque tipo:

```typescript
if (record.userId !== req.user?.userId) {
  return res.status(404).json({ message: 'Not found' });
}
```

Cambiar a:

```typescript
if (record.userId !== req.user?.userId) {
  return res.status(403).json({ message: 'No autorizado para esta acción' });
}
```

**Mantener** los 404 reales (cuando el record no existe).

- [ ] **Step 3: Verificar TypeScript**

```bash
npm run check
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add SocialJusticeHub/server/routes.ts SocialJusticeHub/server/routes-*.ts
git commit -m "fix(api): return 403 instead of 404 for authorization failures"
```

---

## Task 7: Paginación en `/api/dreams` y `/api/community`

**Files:**
- Modify: `SocialJusticeHub/server/routes.ts:169-172` (dreams) y `:796-861` (community)
- Modify: `SocialJusticeHub/server/storage.ts` (firma de `getDreams`, `getCommunityPosts`)

**Por qué:** Endpoints sin paginación pueden devolver miles de records — bloquea el event loop y satura el cliente.

- [ ] **Step 1: Agregar `limit/offset` a `getDreams` en `storage.ts`**

Buscar la firma actual:

```bash
grep -n "getDreams" SocialJusticeHub/server/storage.ts
```

Modificar la firma para aceptar `{ limit, offset }`:

```typescript
async getDreams({ limit = 20, offset = 0 }: { limit?: number; offset?: number } = {}) {
  return await db.select().from(dreams).limit(limit).offset(offset).orderBy(desc(dreams.createdAt));
}
```

(Adaptar al patrón actual del repo — orderBy puede variar.)

- [ ] **Step 2: Idem para `getCommunityPosts`**

Mismo patrón. Agregar `limit/offset` a la firma + aplicarlos en la query Drizzle.

- [ ] **Step 3: En `routes.ts`, usar `parsePagination`**

```typescript
import { parsePagination } from './lib/pagination';

app.get('/api/dreams', async (req, res) => {
  const { limit, offset } = parsePagination(req);
  const dreams = await storage.getDreams({ limit, offset });
  res.json({ data: dreams, pagination: { limit, offset } });
});
```

(Mantener el contrato de respuesta si los clientes ya esperan un array crudo. Si es así, devolver el array directo y no envolverlo. Verificar consumer en `client/src/`.)

- [ ] **Step 4: Verificar consumer en frontend**

```bash
grep -rn "/api/dreams\|/api/community" SocialJusticeHub/client/src/
```

Si los consumers esperan array crudo y no `{ data: ... }`, devolver array crudo.

- [ ] **Step 5: Verificar TypeScript + smoke**

```bash
cd SocialJusticeHub && npm run check
# Manual:
curl 'http://localhost:3001/api/dreams?limit=5' | head -c 500
```

- [ ] **Step 6: Commit**

```bash
git add SocialJusticeHub/server/routes.ts SocialJusticeHub/server/storage.ts
git commit -m "fix(api): paginate /api/dreams and /api/community"
```

---

## Task 8: Fix N+1 en `notifyInitiativeMembers`

**Files:**
- Modify: `SocialJusticeHub/server/routes.ts:104-116` (helper `notifyInitiativeMembers`)
- Modify: `SocialJusticeHub/server/storage.ts` (agregar `createNotificationsBatch`)

**Por qué:** Loop de `await createNotification` por cada miembro = N round-trips a Neon. En una iniciativa con 100 miembros = 100 HTTP calls secuenciales.

- [ ] **Step 1: Agregar batch insert en `storage.ts`**

```typescript
async createNotificationsBatch(items: InsertNotification[]): Promise<Notification[]> {
  if (items.length === 0) return [];
  return await db.insert(notifications).values(items).returning();
}
```

(Verificar el nombre exacto de la tabla y el tipo `InsertNotification` en `shared/schema.ts`.)

- [ ] **Step 2: Reemplazar el loop en `notifyInitiativeMembers` (`routes.ts:104-116`)**

Reemplazar:

```typescript
for (const member of members) {
  await storage.createNotification({ /* ... */ });
}
```

Por:

```typescript
const items = members.map(member => ({
  userId: member.userId,
  // ...resto de campos según schema
}));
await storage.createNotificationsBatch(items);
```

- [ ] **Step 3: Verificar TypeScript**

```bash
npm run check
```

Expected: PASS.

- [ ] **Step 4: Smoke test manual (si es posible)**

Crear iniciativa con 2-3 miembros, agregar acción que dispare notificación, verificar que cada miembro recibió la notificación.

- [ ] **Step 5: Commit**

```bash
git add SocialJusticeHub/server/routes.ts SocialJusticeHub/server/storage.ts
git commit -m "perf: batch-insert notifications in notifyInitiativeMembers (fix N+1)"
```

---

## Task 9: `staleTime` global razonable

**Files:**
- Modify: `SocialJusticeHub/client/src/lib/queryClient.ts:94`

**Por qué:** `staleTime: Infinity` global hace que datos vivos (comunidad, dreams, notificaciones) nunca se refresquen sin reload manual. Bug UX silencioso.

- [ ] **Step 1: Cambiar el default**

En `queryClient.ts:94`, reemplazar:

```typescript
staleTime: Infinity,
```

Por:

```typescript
staleTime: 60 * 1000, // 1 min — datos se consideran frescos por 1 min
```

- [ ] **Step 2: Para queries específicos que SÍ son inmutables, override**

Si hay queries que cargaban geoJSON o data estática (mapas, life areas content), buscar y agregar `staleTime: Infinity` localmente. Buscar consumers:

```bash
grep -rn "useQuery" SocialJusticeHub/client/src/components/MapFiltersBar.tsx
```

Si encuentra una query de geoJSON estático, hacer:

```typescript
useQuery({ queryKey: [...], staleTime: Infinity, gcTime: Infinity })
```

- [ ] **Step 3: Build + smoke**

```bash
cd SocialJusticeHub && npm run check && npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add SocialJusticeHub/client/src/lib/queryClient.ts SocialJusticeHub/client/src/
git commit -m "fix(client): default staleTime to 60s (was Infinity), keep Infinity for static data"
```

---

## Task 10: Logging del DB connection string fuera

**Files:**
- Modify: `SocialJusticeHub/server/db.ts:11`

**Por qué:** Pequeño pero valioso — `console.log("Connecting to Neon...")` no leakea credenciales pero está agregado para debug y ya no aporta. Limpieza barata.

- [ ] **Step 1: Borrar el log**

En `server/db.ts:11`, borrar:

```typescript
console.log("Connecting to Neon Postgres...");
```

- [ ] **Step 2: Verificar arranque**

```bash
cd SocialJusticeHub && npm run dev
# Debe arrancar igual.
```

- [ ] **Step 3: Commit**

```bash
git add SocialJusticeHub/server/db.ts
git commit -m "chore: remove redundant DB connection log"
```

---

## Task 11: Smoke test de auth end-to-end

**Files:**
- Create: `SocialJusticeHub/tests/smoke/auth-flow.test.ts`

**Por qué:** Después de migrar JWT a cookies, queremos un test que prevenga regresiones futuras del flujo de auth.

- [ ] **Step 1: Test contra el server real (con DB de test)**

`tests/smoke/auth-flow.test.ts`:

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

const BASE = process.env.SMOKE_BASE_URL ?? 'http://localhost:3001';

describe.skipIf(!process.env.RUN_SMOKE)('smoke: auth flow', () => {
  it('healthcheck returns 200 with dbLatencyMs', async () => {
    const res = await request(BASE).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.dbLatencyMs).toBeTypeOf('number');
  });

  it('rejects login with bad credentials', async () => {
    const res = await request(BASE)
      .post('/api/auth/login')
      .send({ username: 'no-such-user', password: 'wrong-pwd-1234!' });
    expect([401, 400, 403]).toContain(res.status);
  });
});
```

(Lo dejamos `skipIf(!process.env.RUN_SMOKE)` para que CI no lo corra hasta que esté listo el entorno de smoke.)

- [ ] **Step 2: Correr local**

```bash
cd SocialJusticeHub
RUN_SMOKE=1 SMOKE_BASE_URL=http://localhost:3001 npm run test:unit
```

(Con dev server corriendo en otra terminal.) Expected: 2 passed.

- [ ] **Step 3: Commit**

```bash
git add SocialJusticeHub/tests/smoke/auth-flow.test.ts
git commit -m "test(smoke): add auth flow smoke tests (gated by RUN_SMOKE)"
```

---

## Verificación final pre-deploy

- [ ] **Step 1: Suite completa**

```bash
cd SocialJusticeHub
npm run test:unit
npm run check
npm run check:routes
npm run build
```

Expected: todo PASS.

- [ ] **Step 2: Smoke manual de los flujos críticos**

Con `npm run dev` corriendo, verificar en el browser:
1. Login + redirect funciona, cookie `authToken` aparece, no hay token en localStorage.
2. Refresh de página mantiene sesión.
3. Logout limpia cookie.
4. Registro completo crea usuario y deja logueado.
5. `/api/health` responde 200 con `dbLatencyMs`.
6. `/api/community?limit=999999` no devuelve 999999.
7. `/api/dreams?limit=5` devuelve 5 ítems.

- [ ] **Step 3: Configurar/verificar env vars en Vercel**

```
JWT_SECRET=<≥32 chars>
SESSION_SECRET=<≥32 chars>
DATABASE_URL=<neon prod connection string>
NODE_ENV=production
CORS_ORIGIN=https://elinstantedelhombregris.com
CORS_CREDENTIALS=true
```

**Si falta JWT_SECRET o SESSION_SECRET, el deploy CRASHEA en boot** (Task 1). Verificar antes de pushear.

- [ ] **Step 4: Push a `main`**

```bash
git push origin main
```

(Per memoria: este repo trabaja directo sobre `main`.)

- [ ] **Step 5: Monitor primeros 30 min post-deploy**

Curl periódico (cada 1 min) durante 30 min:

```bash
while true; do
  curl -s -o /dev/null -w "%{http_code} %{time_total}s\n" https://elinstantedelhombregris.com/api/health
  sleep 60
done
```

Si `health` empieza a tirar 503 → revisar logs en Vercel. Si `auth` se rompe → rollback rápido del commit de cookies (Task 5).

---

## Diferidos / P2 (post-launch sprint)

Estos NO se hacen ahora. Documentar en backlog.

| Item | Razón de diferir | Mitigación temporal |
|------|------------------|---------------------|
| Migrar driver Neon a `@neondatabase/serverless` con `Pool` (WebSocket) | Cambiar driver la noche del launch = blast radius enorme. `neon-http` no soporta transactions, pero la app no parece usarlas en flujos críticos. | Monitor de latencia del healthcheck. Si hay problemas, hot-fix dedicado. |
| Eliminar todos los `as any` (`routes-life-areas.ts`, etc.) | 20+ instancias, requiere escribir tipos correctos para Drizzle queries. Trabajo de 2-3 días. | Code review obligatorio en PRs nuevos. |
| Refactor de archivos >700 líneas (`InitiativeDetail.tsx` 1644, `UnaRutaParaArgentina.tsx` 1156) | Refactor visual = riesgo de regresión visual. No es problema de seguridad. | Documentar como deuda técnica. |
| Migraciones versionadas (drizzle generate + folder de migrations) | Cambiar workflow de DB el día del launch = horror. | No correr `drizzle-kit push` post-launch sin revisión humana. |
| Logger estructurado (pino), reemplazar 323 `console.log` | Trabajo de 1 día, no bloquea launch. | Ya tenemos redacción de keys sensibles en `index.ts`. |
| Sentry / observabilidad | Setup de cuenta + integración + DSN en Vercel = ~2h pero no bloquea. | Vercel ya tiene logs básicos en el dashboard. |
| CSP más restrictiva (sacar `unsafe-eval`, agregar SRI a unpkg) | Riesgo de romper Leaflet. Necesita testing visual. | XSS surface ya reducida con cookies httpOnly. |
| Migrar `/api/dreams` y `/api/community` a cursor pagination en lugar de offset | Mejora pero `offset` con clamp ya no es DoS. | OK para post-launch. |
| Eliminar passwords legacy plaintext (`auth.ts:43-46`) | Romper logins de usuarios viejos sin migración. | Migration script ya existe (`db:migrate-auth`). |

---

## Estimación de tiempo

| Bloque | Tasks | Estimado |
|--------|-------|----------|
| Setup | 0 | 30 min |
| P0 Críticas | 1, 2, 3, 4 | ~2.5 h |
| P0 Auth migration | 5 | 2-3 h (incluye testing manual) |
| P1 Altas | 6, 7, 8, 9, 10 | ~3 h |
| Tests | 11 | 30 min |
| Verificación + deploy | Verif final | 1 h |
| **Total** | | **~10 h** |

Con margen para 1 imprevisto importante (ej: el task 5 falla y hay que revertir y rotar secrets como mitigación).

**Si te quedan menos de 6h, saltear Task 5 (cookies) y hacer rotación de secrets como mitigación temporal.** Las otras tasks son seguras.
