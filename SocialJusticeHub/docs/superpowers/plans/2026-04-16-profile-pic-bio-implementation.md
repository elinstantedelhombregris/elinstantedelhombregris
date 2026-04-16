# Profile Picture + Bio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface the existing avatar upload flow inline on `InsightDashboard` and add a new editable bio field (max 500 chars) end-to-end (DB → API → UI).

**Architecture:** Reuse the working `useAvatarUpload` hook and the existing `PUT /api/auth/profile` endpoint. Add a single nullable `bio` column. No new files, no new dependencies, no shared component — both `InsightDashboard` and `UserProfile` reference the same hook + endpoint with their own JSX.

**Tech Stack:** Drizzle ORM (Neon Postgres), Express, Zod validation, JWT auth, React 18 + wouter + @tanstack/react-query + shadcn/ui (Avatar, Textarea, Button), Framer Motion. No unit-test framework — verification is `npm run check` (tsc), `npm run verify` (check + routes + build), and a manual smoke checklist.

**Spec:** `SocialJusticeHub/docs/superpowers/specs/2026-04-16-profile-pic-bio-design.md`

**Working directory for all commands:** `SocialJusticeHub/`

---

## Files Touched

| File | Responsibility |
|------|---------------|
| `shared/schema.ts` | Add `bio` column to `users` (Postgres) |
| `shared/schema-sqlite.ts` | Mirror `bio` column to local-dev schema |
| `server/validation.ts` | Add `bio` to `updateProfileSchema` |
| `server/auth.ts` | Add `bio` to `AuthUser` interface |
| `server/routes.ts` | Include `bio` in 4 response payloads (auth/me, PUT profile, POST avatar, DELETE avatar) |
| `client/src/pages/UserProfile.tsx` | Add bio field to existing edit form |
| `client/src/pages/InsightDashboard.tsx` | Make avatar clickable for upload + add inline bio editor |
| `client/src/components/Header.tsx` | Add visible "Mi Perfil" link to desktop user actions |

No new files created.

---

### Task 1: Add `bio` column to Postgres schema

**Files:**
- Modify: `shared/schema.ts:7-43` (the `users` pgTable definition)

- [ ] **Step 1: Add the column to the Postgres schema**

In `shared/schema.ts`, locate the `users` table definition. Find the line:

```ts
  // Profile image (base64 data URI)
  avatarUrl: text("avatar_url"),
```

Replace it with:

```ts
  // Profile image (base64 data URI)
  avatarUrl: text("avatar_url"),

  // Free-form bio, capped at 500 chars by Zod validation
  bio: text("bio"),
```

- [ ] **Step 2: Verify TypeScript compiles**

Run from `SocialJusticeHub/`:

```bash
npm run check
```

Expected: completes with no new errors. (The Drizzle inferred type on `users` will now include `bio: string | null`.)

- [ ] **Step 3: Commit**

```bash
git add shared/schema.ts
git commit -m "feat(schema): add bio column to users (postgres)"
```

---

### Task 2: Mirror `bio` column to SQLite dev schema

**Files:**
- Modify: `shared/schema-sqlite.ts:6-36` (the `users` sqliteTable definition)

- [ ] **Step 1: Add the column to the SQLite schema**

In `shared/schema-sqlite.ts`, locate the `users` table. Find the line:

```ts
  // Onboarding
  onboardingCompleted: integer("onboarding_completed", { mode: 'boolean' }).default(false),
```

Add immediately above it:

```ts
  // Free-form bio, capped at 500 chars by Zod validation
  bio: text("bio"),

```

(Note: `avatarUrl` is intentionally NOT added here. It is missing from `schema-sqlite.ts` already and that pre-existing divergence is out of scope for this task.)

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run check
```

Expected: completes with no new errors.

- [ ] **Step 3: Commit**

```bash
git add shared/schema-sqlite.ts
git commit -m "feat(schema): mirror bio column to sqlite dev schema"
```

---

### Task 3: Push schema change to Neon

**Files:** none (DB-only operation)

- [ ] **Step 1: Confirm `.env` has DATABASE_URL pointing to your Neon dev branch**

```bash
grep -c '^DATABASE_URL=' .env
```

Expected output: `1`. If `0`, do NOT proceed — restore `.env` from `env.example` and set `DATABASE_URL` first.

- [ ] **Step 2: Push the schema**

```bash
npm run db:push
```

Expected: Drizzle Kit prints `[+] adding column "bio" text` (or similar) and confirms applied. If it asks "is bio created or renamed from another column?" answer `+ bio                  create column`.

- [ ] **Step 3: Verify the column exists**

```bash
npx tsx -e "import { db } from './server/db'; import { sql } from 'drizzle-orm'; const r = await db.execute(sql\`SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='bio'\`); console.log(r.rows); process.exit(0);"
```

Expected: prints a row with `column_name: 'bio'`. If empty array, the push didn't apply — re-run step 2.

- [ ] **Step 4: No commit (no file changes)**

---

### Task 4: Add `bio` to backend validation schema

**Files:**
- Modify: `server/validation.ts:66-84` (`updateProfileSchema`)

- [ ] **Step 1: Add bio to the Zod schema**

In `server/validation.ts`, locate `updateProfileSchema`. Replace the entire object with:

```ts
export const updateProfileSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios')
    .optional(),

  email: z.string()
    .email('Formato de email inválido')
    .max(255, 'El email no puede exceder 255 caracteres')
    .toLowerCase()
    .optional(),

  location: z.string()
    .max(255, 'La ubicación no puede exceder 255 caracteres')
    .optional(),

  bio: z.string()
    .trim()
    .max(500, 'La bio no puede superar los 500 caracteres')
    .nullable()
    .optional(),

  dataShareOptOut: z.boolean().optional()
});
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run check
```

Expected: completes with no new errors.

- [ ] **Step 3: Commit**

```bash
git add server/validation.ts
git commit -m "feat(validation): accept bio (max 500 chars) in updateProfileSchema"
```

---

### Task 5: Add `bio` to `AuthUser` interface

**Files:**
- Modify: `server/auth.ts:7-14` (`AuthUser` interface)

- [ ] **Step 1: Add bio to AuthUser**

In `server/auth.ts`, locate the `AuthUser` interface (lines 7-14). Replace it with:

```ts
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  name: string;
  location?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run check
```

Expected: completes with no new errors.

- [ ] **Step 3: Commit**

```bash
git add server/auth.ts
git commit -m "feat(auth): include bio in AuthUser interface"
```

---

### Task 6: Include `bio` in API response payloads

**Files:**
- Modify: `server/routes.ts:2304-2470` (4 distinct response builders)

- [ ] **Step 1: Add `bio` to `GET /api/auth/me` response**

In `server/routes.ts`, locate the `res.json({ ... })` call inside the `app.get("/api/auth/me", ...)` handler (around line 2315). Find the line:

```ts
        avatarUrl: user.avatarUrl,
```

Add immediately after it:

```ts
        bio: user.bio,
```

- [ ] **Step 2: Add `bio` to `PUT /api/auth/profile` response**

In the same file, inside `app.put("/api/auth/profile", ...)` (around line 2356), locate:

```ts
          avatarUrl: updatedUser.avatarUrl,
```

Add immediately after it:

```ts
          bio: updatedUser.bio,
```

- [ ] **Step 3: Add `bio` to `POST /api/auth/avatar` response**

In the same file, inside `app.post("/api/auth/avatar", ...)` (around line 2433), locate:

```ts
          avatarUrl: updatedUser.avatarUrl,
```

Add immediately after it:

```ts
          bio: updatedUser.bio,
```

- [ ] **Step 4: Add `bio` to `DELETE /api/auth/avatar` response**

In the same file, inside `app.delete("/api/auth/avatar", ...)` (around line 2455-2470), locate the `res.json({ message: 'Avatar eliminado exitosamente', user: { ... } })` block. Find:

```ts
          avatarUrl: updatedUser.avatarUrl,
```

(or the equivalent line — there may not be one if the delete handler was abbreviated; if so, ensure the response user object includes `avatarUrl: updatedUser.avatarUrl` first.)

Add immediately after it:

```ts
          bio: updatedUser.bio,
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npm run check
```

Expected: completes with no new errors.

- [ ] **Step 6: Manually verify the API returns `bio`**

Start the dev server in one terminal:

```bash
npm run dev
```

In another terminal, log in and call `/api/auth/me` (replace `$TOKEN` with a real JWT obtained from logging in via the UI):

```bash
curl -s http://localhost:3001/api/auth/me -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | grep -E '"bio"|"avatarUrl"'
```

Expected: line `"bio": null,` (or a value if you've set one) appears.

Stop the dev server with Ctrl+C.

- [ ] **Step 7: Commit**

```bash
git add server/routes.ts
git commit -m "feat(api): include bio in user response payloads"
```

---

### Task 7: Add `bio` field to `UserProfile` edit form

**Files:**
- Modify: `client/src/pages/UserProfile.tsx:97-101` (editForm state)
- Modify: `client/src/pages/UserProfile.tsx:191-205` (profileMutation)
- Modify: `client/src/pages/UserProfile.tsx:229-242` (handleEditToggle, handleSave)
- Modify: `client/src/pages/UserProfile.tsx` (the JSX where name/email/location fields render — search for `editForm.location` to find the section)

- [ ] **Step 1: Confirm shadcn `Textarea` exists**

```bash
ls client/src/components/ui/textarea.tsx
```

Expected: prints the path. If "No such file", run `npx shadcn@latest add textarea` from `SocialJusticeHub/` first (it does NOT auto-install).

- [ ] **Step 2: Add `bio` to the editForm state**

In `client/src/pages/UserProfile.tsx`, find:

```tsx
  const [editForm, setEditForm] = useState({
    name: userContext?.user?.name || '',
    email: userContext?.user?.email || '',
    location: userContext?.user?.location || ''
  });
```

Replace with:

```tsx
  const [editForm, setEditForm] = useState({
    name: userContext?.user?.name || '',
    email: userContext?.user?.email || '',
    location: userContext?.user?.location || '',
    bio: userContext?.user?.bio || ''
  });
```

- [ ] **Step 3: Add `bio` to the profile mutation type**

Find:

```tsx
    mutationFn: async (data: { name?: string; email?: string; location?: string }) => {
```

Replace with:

```tsx
    mutationFn: async (data: { name?: string; email?: string; location?: string; bio?: string | null }) => {
```

- [ ] **Step 4: Send `bio` from `handleSave`**

Find:

```tsx
  const handleSave = () => {
    profileMutation.mutate({ name: editForm.name, email: editForm.email, location: editForm.location });
  };
```

Replace with:

```tsx
  const handleSave = () => {
    profileMutation.mutate({
      name: editForm.name,
      email: editForm.email,
      location: editForm.location,
      bio: editForm.bio.trim() || null,
    });
  };
```

- [ ] **Step 5: Reset `bio` in `handleEditToggle`**

Find:

```tsx
  const handleEditToggle = () => {
    if (isEditing) {
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        location: user.location || ''
      });
    }
    setIsEditing(!isEditing);
  };
```

Replace with:

```tsx
  const handleEditToggle = () => {
    if (isEditing) {
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        location: user.location || '',
        bio: user.bio || ''
      });
    }
    setIsEditing(!isEditing);
  };
```

- [ ] **Step 6: Add the bio Textarea in the JSX**

Add the `Textarea` import near the existing imports (alphabetical with other `@/components/ui/*` imports):

```tsx
import { Textarea } from '@/components/ui/textarea';
```

Then in the JSX, search for the location input/field block. The pattern looks like:

```tsx
<input
  ...
  value={editForm.location}
  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
  ...
/>
```

Immediately after that input's closing element (and outside its wrapper if it's wrapped), insert:

```tsx
<div className="space-y-1.5">
  <label className="text-xs uppercase tracking-wider text-slate-500 font-mono">Bio</label>
  {isEditing ? (
    <>
      <Textarea
        value={editForm.bio}
        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
        placeholder="Contá quién sos en pocas palabras."
        maxLength={500}
        rows={4}
        className="bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-600 focus-visible:ring-blue-500/40"
      />
      <div className={`text-[10px] font-mono text-right ${editForm.bio.length > 500 ? 'text-red-400' : 'text-slate-500'}`}>
        {editForm.bio.length}/500
      </div>
    </>
  ) : (
    <p className="text-sm text-slate-300 whitespace-pre-wrap min-h-[1.25rem]">
      {user.bio || <span className="text-slate-600 italic">Sin bio.</span>}
    </p>
  )}
</div>
```

If you cannot find a clean insertion point, place this block in the same parent container as the other editable fields (name/email/location), keeping it the last field in the edit form.

- [ ] **Step 7: Verify TypeScript compiles**

```bash
npm run check
```

Expected: completes with no new errors.

- [ ] **Step 8: Manual smoke**

Start the dev server (`npm run dev`), log in, navigate to `/profile`, click the existing "Editar" button, type ~50 chars in the new Bio field, click "Guardar". Reload the page — bio should persist. Counter should display `n/500` and turn red if you paste > 500 chars. Stop the dev server.

- [ ] **Step 9: Commit**

```bash
git add client/src/pages/UserProfile.tsx
git commit -m "feat(profile): add bio field to UserProfile edit form"
```

---

### Task 8: Make the avatar on `InsightDashboard` clickable for upload

**Files:**
- Modify: `client/src/pages/InsightDashboard.tsx:1-26` (imports)
- Modify: `client/src/pages/InsightDashboard.tsx:38-49` (component top — add ref)
- Modify: `client/src/pages/InsightDashboard.tsx:130-141` (avatar block)

- [ ] **Step 1: Add the imports**

In `client/src/pages/InsightDashboard.tsx`, find:

```tsx
import { useContext, useEffect, useState } from 'react';
```

Replace with:

```tsx
import { useContext, useEffect, useRef, useState } from 'react';
```

Find:

```tsx
import { Flame, Trophy, Target, ShieldCheck, Activity, ArrowRight, Zap, Crown, BookOpen } from 'lucide-react';
```

Replace with:

```tsx
import { Flame, Trophy, Target, ShieldCheck, Activity, ArrowRight, Zap, Crown, BookOpen, Camera, Loader2, X } from 'lucide-react';
```

After the existing `import { apiRequest } from '@/lib/queryClient';` line, add:

```tsx
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
```

- [ ] **Step 2: Wire up the avatar upload hook inside the component**

In the `InsightDashboard` component body, immediately after this line:

```tsx
  const userContext = useContext(UserContext);
```

Add:

```tsx
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    uploadMutation: avatarUploadMutation,
    deleteMutation: avatarDeleteMutation,
    handleFileChange: handleAvatarChange,
  } = useAvatarUpload(fileInputRef);
```

- [ ] **Step 3: Replace the static avatar block with a clickable one**

Find the existing avatar block (lines ~131-141):

```tsx
              <div className="relative group">
                <div className="w-16 h-16 rounded-2xl bg-white/5 overflow-hidden border border-white/10 group-hover:border-blue-500/30 transition-colors duration-300">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} className={`${user.avatarUrl ? 'object-cover' : 'opacity-80'} group-hover:opacity-100 transition-opacity`} />
                    <AvatarFallback className="bg-slate-900 text-slate-400 font-bold text-xl">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-[3px] border-[#0a0a0a]" />
              </div>
```

Replace with:

```tsx
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploadMutation.isPending}
                  aria-label="Cambiar foto de perfil"
                  title="Cambiar foto de perfil"
                  className="block w-16 h-16 rounded-2xl bg-white/5 overflow-hidden border border-white/10 group-hover:border-blue-500/30 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                >
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} className={`${user.avatarUrl ? 'object-cover' : 'opacity-80'} group-hover:opacity-100 transition-opacity`} />
                    <AvatarFallback className="bg-slate-900 text-slate-400 font-bold text-xl">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none">
                    {avatarUploadMutation.isPending ? (
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5 text-white" />
                    )}
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                {user.avatarUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('¿Eliminar tu foto de perfil?')) {
                        avatarDeleteMutation.mutate();
                      }
                    }}
                    disabled={avatarDeleteMutation.isPending}
                    aria-label="Eliminar foto de perfil"
                    title="Eliminar foto de perfil"
                    className="absolute -top-1.5 -right-1.5 z-20 p-1 rounded-full bg-slate-800 hover:bg-red-600 text-slate-200 hover:text-white border-2 border-[#0a0a0a] transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-[3px] border-[#0a0a0a] pointer-events-none" />
              </div>
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npm run check
```

Expected: completes with no new errors.

- [ ] **Step 5: Manual smoke**

`npm run dev`, log in, land on `/dashboard`. Hover the avatar — camera icon appears over a dark overlay. Click → file picker opens. Pick a small PNG → spinner shows briefly → toast "Avatar actualizado" → avatar updates in place AND in the header (because the hook invalidates `/api/auth/me`). Hover again → red `×` button appears in top-right. Click `×`, confirm dialog → avatar reverts to Dicebear default and toast "Avatar eliminado" fires. Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add client/src/pages/InsightDashboard.tsx
git commit -m "feat(dashboard): make avatar clickable for inline upload + delete"
```

---

### Task 9: Add inline bio editor on `InsightDashboard`

**Files:**
- Modify: `client/src/pages/InsightDashboard.tsx:1-26` (imports)
- Modify: `client/src/pages/InsightDashboard.tsx` (component body — add bio state)
- Modify: `client/src/pages/InsightDashboard.tsx:142-155` (block under user.name)

- [ ] **Step 1: Add the imports**

In `client/src/pages/InsightDashboard.tsx`, find the existing tanstack import:

```tsx
import { useQuery } from '@tanstack/react-query';
```

Replace with:

```tsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
```

Find the lucide-react import (now extended in Task 8):

```tsx
import { Flame, Trophy, Target, ShieldCheck, Activity, ArrowRight, Zap, Crown, BookOpen, Camera, Loader2, X } from 'lucide-react';
```

Replace with:

```tsx
import { Flame, Trophy, Target, ShieldCheck, Activity, ArrowRight, Zap, Crown, BookOpen, Camera, Loader2, X, Pencil, Check } from 'lucide-react';
```

Add these two imports near the other component imports:

```tsx
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
```

- [ ] **Step 2: Add bio state and mutation in the component body**

In `InsightDashboard`, immediately after the `useAvatarUpload` block added in Task 8, add:

```tsx
  const queryClient = useQueryClient();
  const [bioEditing, setBioEditing] = useState(false);
  const [bioDraft, setBioDraft] = useState('');

  const bioMutation = useMutation({
    mutationFn: async (bio: string | null) => {
      const response = await apiRequest('PUT', '/api/auth/profile', { bio });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'No se pudo guardar la bio');
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (userContext) userContext.setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({ title: 'Bio actualizada', description: 'Tu bio fue guardada.' });
      setBioEditing(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });
```

- [ ] **Step 3: Render the bio block under the user name**

Find this block (around line 142-155):

```tsx
              <div>
                <h1 className="text-2xl font-bold text-white font-serif tracking-tight">{user.name}</h1>
                <div className="flex items-center gap-2 mt-1.5">
                  {archetype ? (
                    <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 text-[10px] uppercase tracking-wider">
                      {archetype.emoji} {archetype.name}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-slate-700 text-slate-500 text-[10px] uppercase tracking-wider">
                      Sin evaluar
                    </Badge>
                  )}
                </div>
              </div>
```

Replace with:

```tsx
              <div className="min-w-0 max-w-md">
                <h1 className="text-2xl font-bold text-white font-serif tracking-tight">{user.name}</h1>
                <div className="flex items-center gap-2 mt-1.5">
                  {archetype ? (
                    <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 text-[10px] uppercase tracking-wider">
                      {archetype.emoji} {archetype.name}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-slate-700 text-slate-500 text-[10px] uppercase tracking-wider">
                      Sin evaluar
                    </Badge>
                  )}
                </div>
                <div className="mt-2.5">
                  {bioEditing ? (
                    <div className="space-y-1.5">
                      <Textarea
                        value={bioDraft}
                        onChange={(e) => setBioDraft(e.target.value)}
                        placeholder="Contá quién sos en pocas palabras."
                        maxLength={500}
                        rows={3}
                        autoFocus
                        className="bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-600 focus-visible:ring-blue-500/40 text-sm"
                      />
                      <div className="flex items-center justify-between gap-3">
                        <span className={`text-[10px] font-mono ${bioDraft.length > 500 ? 'text-red-400' : 'text-slate-500'}`}>
                          {bioDraft.length}/500
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setBioEditing(false)}
                            disabled={bioMutation.isPending}
                            className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => bioMutation.mutate(bioDraft.trim() || null)}
                            disabled={bioMutation.isPending || bioDraft.length > 500}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {bioMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                            Guardar
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setBioDraft(user.bio || ''); setBioEditing(true); }}
                      className="group/bio flex items-start gap-2 text-left text-sm text-slate-400 hover:text-slate-200 transition-colors max-w-full"
                      aria-label="Editar bio"
                    >
                      <span className="line-clamp-2 whitespace-pre-wrap">
                        {user.bio || <span className="italic text-slate-500">Agregá una bio para contar quién sos.</span>}
                      </span>
                      <Pencil className="h-3 w-3 mt-1 flex-shrink-0 opacity-0 group-hover/bio:opacity-100 transition-opacity" />
                    </button>
                  )}
                </div>
              </div>
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npm run check
```

Expected: completes with no new errors. If `user.bio` reports as not on the type, the cause is one of these — fix in order: (a) `npm run check` was run before Task 5 was committed, re-run; (b) `client` doesn't share the `AuthUser` type from `server/auth.ts` — in that case the type comes from `UserContext`; check `client/src/App.tsx` for the User shape and add `bio?: string | null` there.

- [ ] **Step 5: Manual smoke**

`npm run dev`, log in, go to `/dashboard`. Below your name and badge you see "Agregá una bio para contar quién sos." in italic. Click it → textarea + counter + Guardar/Cancelar appear. Type 50 chars, click Guardar → toast "Bio actualizada", text replaces the placeholder. Hover the bio → pencil icon appears. Click again, type to push over 500 chars → counter goes red and Guardar disables. Click Cancelar → reverts without API call. Reload the page → bio persists. Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add client/src/pages/InsightDashboard.tsx
git commit -m "feat(dashboard): inline bio editor with character counter"
```

---

### Task 10: Add visible "Mi Perfil" link to Header desktop area

**Files:**
- Modify: `client/src/components/Header.tsx:144-181` (desktop user actions block)

- [ ] **Step 1: Add the link**

In `client/src/components/Header.tsx`, locate the desktop user-actions block (logged-in branch, around lines 144-181). Find:

```tsx
                <Link href="/dashboard">
                  <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                    showSolid
                      ? 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
                      : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                  }`}>
                    <Avatar className="h-6 w-6 border border-white/20">
                      <AvatarImage src={userContext.user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userContext.user?.username}`} className={userContext.user?.avatarUrl ? 'object-cover' : ''} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium pr-1">
                      Mi Panel
                    </span>
                  </div>
                </Link>
```

Immediately after that closing `</Link>`, add:

```tsx
                <Link href="/profile">
                  <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                    showSolid
                      ? 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
                      : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                  }`}
                  title="Mi Perfil">
                    <User className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Mi Perfil</span>
                  </div>
                </Link>
```

(`User` is already imported on line 16; `Link` already on line 2.)

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run check
```

Expected: completes with no new errors.

- [ ] **Step 3: Manual smoke**

`npm run dev`, log in. On any page (try `/`, `/dashboard`, `/community`), the desktop header now shows "Mi Perfil" pill next to "Mi Panel". Click it → lands on `/profile`. Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add client/src/components/Header.tsx
git commit -m "feat(header): add Mi Perfil link to desktop user actions"
```

---

### Task 11: Final verification — full pipeline + manual checklist

**Files:** none

- [ ] **Step 1: Full TypeScript + route + build pipeline**

```bash
npm run verify
```

Expected: all three steps (`check`, `check:routes`, `build`) succeed with exit code 0. If any fail, fix the reported issue and re-run before continuing.

- [ ] **Step 2: End-to-end manual smoke**

```bash
npm run dev
```

Walk through every item, marking each:

  - [ ] **Login** with an existing account, land on `/dashboard`.
  - [ ] **Hover dashboard avatar** → camera icon overlay appears.
  - [ ] **Click avatar** → file picker → upload a < 2MB PNG → spinner → toast "Avatar actualizado" → avatar updates in dashboard AND in header pill.
  - [ ] **Refresh** the page → uploaded avatar still visible.
  - [ ] **Click ✕** on dashboard avatar → confirm dialog → avatar reverts to Dicebear → toast "Avatar eliminado".
  - [ ] **Click bio placeholder** → textarea appears → type "Hola, soy un ciudadano de prueba." → click Guardar → toast "Bio actualizada" → bio displays.
  - [ ] **Refresh** → bio still visible.
  - [ ] **Hover bio** → pencil icon appears → click → textarea reopens with current bio → paste 600+ chars → counter turns red → Guardar disabled.
  - [ ] **Click Cancelar** → reverts to displayed bio without API call.
  - [ ] **Click "Mi Perfil"** in desktop header → lands on `/profile`.
  - [ ] On `/profile`, click **Editar** → edit form opens → Bio field shows the same bio set on dashboard with the 500-char counter.
  - [ ] Edit bio on `/profile`, save, reload → updated bio visible on both `/profile` and `/dashboard`.
  - [ ] **Try uploading > 2MB image** on dashboard → toast "La imagen es demasiado grande. Máximo 2MB." (existing hook behavior).
  - [ ] **Try uploading a `.txt` file** (rename a small text to `.png` to bypass the file picker, OR just confirm the picker filters by accept attribute) → toast "Formato no soportado…" (existing hook behavior).

  Stop the dev server when done.

- [ ] **Step 3: Confirm git history is clean**

```bash
git log --oneline -10
```

Expected: roughly 9 commits added by this plan, atop the original `main`.

```bash
git status
```

Expected: `nothing to commit, working tree clean`.

- [ ] **Step 4: No commit (verification step)**

---

## Done

All spec requirements are now in code:

| Spec section | Tasks |
|--------------|-------|
| §1 DB schema | 1, 2, 3 |
| §2 Backend (validation, auth, API) | 4, 5, 6 |
| §3a Avatar inline upload | 8 |
| §3b Bio inline editor | 9 |
| §3c Bio on UserProfile | 7 |
| §4 Header desktop link | 10 |
| §5 Spanish microcopy | embedded throughout 7, 8, 9 |
| Verification | 11 |
