# Profile Picture + Bio: Inline Editing on Dashboard

**Date:** 2026-04-16
**Status:** Draft for review
**Owner:** El Instante del Hombre Gris

## Problem

Users report they cannot change their profile picture from the dashboard. Investigation shows:

1. The avatar upload pipeline (DB column `users.avatarUrl`, hook `useAvatarUpload`, endpoints `POST/DELETE /api/auth/avatar`) is already implemented and works on `UserProfile` (`/profile`).
2. `/dashboard` now renders `InsightDashboard`, which displays the avatar (`InsightDashboard.tsx:133-138`) but offers no upload control and no visible link to `/profile`.
3. The only link to `/profile` lives inside the mobile hamburger menu (`Header.tsx:260`), invisible on desktop.
4. There is no `bio` field anywhere in the system (schema, validation, API, UI).

## Goals

- Let users change their profile picture directly from `InsightDashboard` (no navigation required).
- Let users add and edit a short bio (max 500 characters) directly from `InsightDashboard`.
- Mirror the same bio editing on `/profile` for consistency with other profile fields.
- Make `/profile` reachable from the desktop header.

## Non-goals

- No external file-upload service or object storage. Avatars stay base64 data URIs in Postgres (existing 2MB cap, existing PNG/JPEG/WebP/GIF allowlist).
- No public exposure of bio (not shown in Community, Header, or other users' views).
- No rich text, markdown, or formatting in bio — plain text only.
- No avatar cropping, resizing, or filter UI.
- No new shared "EditableProfileCard" component — both pages use the existing `useAvatarUpload` hook and the existing `PUT /api/auth/profile` endpoint; duplication is just JSX.

## Design

### 1. Database schema

Add a single nullable column to the `users` table.

**`shared/schema.ts`** — add inside the `users` pgTable definition:

```ts
bio: text("bio"), // free-form bio, capped at 500 chars by Zod validation
```

**`shared/schema-sqlite.ts`** — add the equivalent column for the local-dev fallback schema so the two schemas stay in parity.

**Migration:** `npm run db:push` (Drizzle pushes to Neon). Column is nullable, no data backfill required.

### 2. Backend

**`server/validation.ts`** — extend `updateProfileSchema`:

```ts
bio: z
  .string()
  .trim()
  .max(500, "La bio no puede superar los 500 caracteres")
  .optional()
  .nullable(),
```

The client sends `null` (not `""`) when the bio is cleared (see section 3b). The server stores whatever validated value arrives — no string-to-null coercion needed in the route handler.

**`server/auth.ts`** — extend the `AuthUser` interface with `bio?: string | null`. Include `bio` in whichever helper maps a DB user row into the `AuthUser` shape that `GET /api/auth/me` returns. The current user fetched on every page load must include `bio`.

**`server/routes.ts`** — no new routes. `PUT /api/auth/profile` already passes the validated payload through; once `bio` is in the schema it is accepted automatically. Confirm the response also returns the updated `bio` so the client can sync.

**Avatar endpoints** (`POST /api/auth/avatar`, `DELETE /api/auth/avatar`) — unchanged. Already work.

### 3. Frontend: inline edits on `InsightDashboard`

Located in `client/src/pages/InsightDashboard.tsx`, around the existing avatar/name block (lines ~130-150).

#### 3a. Avatar — clickable upload

Wrap the existing `<Avatar>` in a button that triggers a hidden `<input type="file" accept="image/png,image/jpeg,image/webp,image/gif">`.

- Use the existing `useAvatarUpload` hook (`client/src/hooks/useAvatarUpload.ts`) — same hook `UserProfile` uses today.
- On hover, show a camera icon overlay (`opacity-0 group-hover:opacity-100`, centered, semi-transparent background) so the affordance is discoverable.
- While `isUploading`, show a small spinner overlay and disable the click target.
- When `user.avatarUrl` is set, render a small `×` button in the corner that calls `deleteMutation` (with a confirm — Spanish: "¿Eliminar tu foto de perfil?"). Hide the `×` when the user has no custom avatar.
- Toasts already fire from inside the hook ("Avatar actualizado", "Avatar eliminado") — no extra toast logic.

#### 3b. Bio — inline editor

Add a new block underneath `{user.name}` (currently line 143).

**View mode (default):**
- If `user.bio` is set → render it as muted text (`text-slate-400 text-sm`), with a small pencil icon button to enter edit mode.
- If `user.bio` is null/empty → render placeholder "Agregá una bio para contar quién sos." as a clickable affordance that enters edit mode.

**Edit mode:**
- `<Textarea>` (shadcn) prefilled with current `bio || ""`, autofocus on entry.
- Character counter shown below: `{value.length}/500`. Counter turns red when `> 500`.
- Two buttons: "Guardar" (primary) and "Cancelar" (ghost).
- Cancel reverts the local draft and exits edit mode without an API call.
- Save calls `apiRequest('PUT', '/api/auth/profile', { bio: draft.trim() || null })`, then invalidates `['/api/auth/me']` and updates `userContext`. Same patterns the avatar hook uses.
- On success: toast "Bio actualizada". On error: toast "No se pudo guardar la bio" with the server message if available.
- Save is disabled while the mutation is pending and while `value.length > 500`.

#### 3c. Same edits on `UserProfile`

`client/src/pages/UserProfile.tsx` already has the avatar editor. Add the same `bio` field to its existing edit form (alongside `name`, `email`, `location`):

- Add a `<Textarea>` with the same 500-char limit and counter.
- Wire it into the existing `mutationFn` that already calls `PUT /api/auth/profile`.
- No need for the inline view/edit toggle here — the whole `UserProfile` page already has an edit mode.

### 4. Header — desktop link to `/profile`

In `client/src/components/Header.tsx`, the user dropdown / desktop menu currently lacks a "Mi Perfil" entry (it exists only in the mobile hamburger menu, line 260). Add the same `Link href="/profile"` with the `User` icon and label "Mi Perfil" to whichever desktop menu shows the user's avatar/name. Logged-out users do not see it.

### 5. Spanish microcopy reference

| Action | Text |
|--------|------|
| Bio placeholder | "Agregá una bio para contar quién sos." |
| Bio edit button label | "Editar bio" |
| Save | "Guardar" |
| Cancel | "Cancelar" |
| Counter format | "{n}/500" |
| Bio save success toast | Title: "Bio actualizada" / Description: "Tu bio fue guardada." |
| Bio save error toast | Title: "Error" / Description: "No se pudo guardar la bio." |
| Bio over limit error | "La bio no puede superar los 500 caracteres" |
| Avatar delete confirm | "¿Eliminar tu foto de perfil?" |
| Header link | "Mi Perfil" |

Avatar upload/delete toasts already exist inside the hook — do not change them.

## Data flow

**Avatar upload:**
1. User clicks avatar on `InsightDashboard` → hidden `<input type="file">` opens.
2. `useAvatarUpload.handleFileChange` → `FileReader.readAsDataURL` → `POST /api/auth/avatar` with `{ image: dataUri }`.
3. Server validates (existing logic), updates `users.avatarUrl`, returns updated user.
4. Hook updates `userContext` and invalidates `/api/auth/me`. Avatar re-renders everywhere (Header, dashboard, profile).

**Bio update:**
1. User clicks bio area → enters edit mode with local draft state.
2. User edits, clicks Guardar → `PUT /api/auth/profile` with `{ bio: trimmedDraftOrNull }`.
3. Server validates with updated `updateProfileSchema`, persists, returns updated user (including `bio`).
4. Client invalidates `/api/auth/me`, updates `userContext`, exits edit mode.

## Error handling

- Bio over 500 chars: blocked client-side (Save disabled + counter red); server also rejects via Zod with the Spanish message.
- Network/server failure on bio save: toast error, edit mode stays open with the unsaved draft so the user does not lose what they wrote.
- Avatar errors: existing hook behavior (toast with message from `Error.message` such as "La imagen es demasiado grande. Máximo 2MB." or "Formato no soportado…").

## Files touched

- `shared/schema.ts` — add `bio` column
- `shared/schema-sqlite.ts` — mirror `bio` column
- `server/validation.ts` — add `bio` to `updateProfileSchema`
- `server/auth.ts` — add `bio` to `AuthUser` and the user-row mapper
- `client/src/pages/InsightDashboard.tsx` — clickable avatar + bio inline editor
- `client/src/pages/UserProfile.tsx` — add bio field to existing edit form
- `client/src/components/Header.tsx` — add desktop `Mi Perfil` link

No new files. No new dependencies.

## Verification

After implementation, run from `SocialJusticeHub/`:

```bash
npm run check       # TypeScript
npm run check:routes
npm run build
```

Manual smoke test:
1. Log in, land on `/dashboard`.
2. Click avatar → file picker → upload a PNG → see new avatar appear in dashboard and header within seconds.
3. Click pencil next to bio (or placeholder), type 100 chars, save → bio persists after refresh.
4. Try to save 600-char bio → blocked client-side, counter red.
5. Click `×` on avatar → confirm → fallback Dicebear avatar returns.
6. Click "Mi Perfil" in the desktop header → lands on `/profile` → bio field is present in the edit form and reflects what was saved on the dashboard.
