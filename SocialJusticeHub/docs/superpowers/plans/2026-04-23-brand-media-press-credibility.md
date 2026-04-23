# Brand & Media — Press Credibility Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the press-credibility bundle defined in `docs/superpowers/specs/2026-04-23-brand-media-press-credibility-design.md` — fix broken press-kit asset serving, reframe 22 strategic plans as Diseño Idealizado with status badges, and unify the visual language around the real metallic emblem on press-facing surfaces only.

**Architecture:** Eight atomic tasks, each producing one commit on `main`. Work is sequenced so earlier tasks unblock later ones: SVG assets first (they're dependencies for later UI work), then content changes (framing + count + plan cards), then the shared `StatusBadge` component (consumed by all 22 plan cards), then doc/memory sweeps, then visual polish.

**Tech Stack:** React 18 + TypeScript + Vite + Tailwind 3 + shadcn/ui + Framer Motion + wouter. No new runtime deps required. Verification via `npm run check` (tsc) + `npm run check:routes` + `npm run build` + manual dev-server smoke.

---

## File Structure

**Create:**
- `SocialJusticeHub/client/public/press-kit/logo-principal.svg`
- `SocialJusticeHub/client/public/press-kit/logo-basta.svg`
- `SocialJusticeHub/client/public/press-kit/social-card-landscape.svg`
- `SocialJusticeHub/client/public/press-kit/social-card-square.svg`
- `SocialJusticeHub/client/public/press-kit/social-card-story.svg`
- `SocialJusticeHub/client/public/press-kit/el-instante-logo-metallic-hero-512.png`
- `SocialJusticeHub/client/public/press-kit/el-instante-logo-metallic-hero-1024.png`
- `SocialJusticeHub/client/public/press-kit/el-instante-logo-metallic-hero-2048.png`
- `SocialJusticeHub/client/src/components/StatusBadge.tsx`

**Modify:**
- `SocialJusticeHub/client/src/pages/KitDePrensa.tsx` (count, plan list, framing block, hero restyle)
- `SocialJusticeHub/client/src/pages/UnaRutaParaArgentina.tsx` (framing block, count)
- `SocialJusticeHub/client/src/pages/LaVision.tsx` (count if present)
- `SocialJusticeHub/client/src/pages/ElMapa.tsx` (count if present)
- `SocialJusticeHub/client/src/components/Footer.tsx` (add emblem next to wordmark)
- `SocialJusticeHub/tailwind.config.ts` (silver/gold tokens)
- `SocialJusticeHub/CLAUDE.md` (plan count)
- `/Users/juanb/Desktop/ElInstantedelHombreGris/CLAUDE.md` (plan count)
- `/Users/juanb/Desktop/ElInstantedelHombreGris/BRAND_MEDIA_PACKAGE.md` (resolve "16 vs 17+ vs 4")
- `/Users/juanb/.claude/projects/-Users-juanb-Desktop-ElInstantedelHombreGris/memory/project_basta_ten_mandates.md`
- `/Users/juanb/.claude/projects/-Users-juanb-Desktop-ElInstantedelHombreGris/memory/MEMORY.md` (if it mentions count)

**Delete:**
- `SocialJusticeHub/public/press-kit/` (after files are moved)

---

## Task 1: Install the real SVG logo pack in the served directory

**Files:**
- Create: `SocialJusticeHub/client/public/press-kit/logo-principal.svg`
- Create: `SocialJusticeHub/client/public/press-kit/logo-basta.svg`
- Create: `SocialJusticeHub/client/public/press-kit/social-card-landscape.svg`
- Create: `SocialJusticeHub/client/public/press-kit/social-card-square.svg`
- Create: `SocialJusticeHub/client/public/press-kit/social-card-story.svg`
- Delete: `SocialJusticeHub/public/press-kit/` (entire dir after move)

- [ ] **Step 1: Create the press-kit directory under the served `public/`**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/SocialJusticeHub
mkdir -p client/public/press-kit
```

- [ ] **Step 2: Write `client/public/press-kit/logo-principal.svg`**

Replace any existing content. Full file contents:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="El Instante del Hombre Gris">
  <title>El Instante del Hombre Gris emblem</title>
  <!-- Outer gold ring: 24 radial teeth suggesting flame/sun/laurel -->
  <g fill="#C8A64A">
    <g transform="translate(256 256)">
      <!-- Generate 24 teeth around the center. Each tooth is a thin triangle pointing outward. -->
      <g id="tooth"><path d="M0 -240 L-10 -205 L10 -205 Z"/></g>
      <use href="#tooth" transform="rotate(15)"/>
      <use href="#tooth" transform="rotate(30)"/>
      <use href="#tooth" transform="rotate(45)"/>
      <use href="#tooth" transform="rotate(60)"/>
      <use href="#tooth" transform="rotate(75)"/>
      <use href="#tooth" transform="rotate(90)"/>
      <use href="#tooth" transform="rotate(105)"/>
      <use href="#tooth" transform="rotate(120)"/>
      <use href="#tooth" transform="rotate(135)"/>
      <use href="#tooth" transform="rotate(150)"/>
      <use href="#tooth" transform="rotate(165)"/>
      <use href="#tooth" transform="rotate(180)"/>
      <use href="#tooth" transform="rotate(195)"/>
      <use href="#tooth" transform="rotate(210)"/>
      <use href="#tooth" transform="rotate(225)"/>
      <use href="#tooth" transform="rotate(240)"/>
      <use href="#tooth" transform="rotate(255)"/>
      <use href="#tooth" transform="rotate(270)"/>
      <use href="#tooth" transform="rotate(285)"/>
      <use href="#tooth" transform="rotate(300)"/>
      <use href="#tooth" transform="rotate(315)"/>
      <use href="#tooth" transform="rotate(330)"/>
      <use href="#tooth" transform="rotate(345)"/>
      <!-- Ring band behind teeth -->
      <circle r="200" fill="none" stroke="#C8A64A" stroke-width="14"/>
    </g>
  </g>
  <!-- Silver inner mandala -->
  <g transform="translate(256 256)">
    <circle r="160" fill="#C8CDD2"/>
    <!-- Four-fold cutouts create mandala geometry (charcoal reveals background) -->
    <g fill="#0A0A0A">
      <ellipse cx="0" cy="-100" rx="18" ry="54"/>
      <ellipse cx="0" cy="100" rx="18" ry="54"/>
      <ellipse cx="-100" cy="0" rx="54" ry="18"/>
      <ellipse cx="100" cy="0" rx="54" ry="18"/>
      <circle r="82" fill="none" stroke="#0A0A0A" stroke-width="3"/>
    </g>
  </g>
  <!-- Heart cutout at center (charcoal reveals background) -->
  <g transform="translate(256 256)" fill="#0A0A0A">
    <path d="M 0 38
             C -34 4, -68 -18, -48 -48
             C -28 -72, 0 -60, 0 -30
             C 0 -60, 28 -72, 48 -48
             C 68 -18, 34 4, 0 38 Z"/>
  </g>
</svg>
```

- [ ] **Step 3: Write `client/public/press-kit/logo-basta.svg`**

Full file contents (800×240, emblem on the left + wordmark + ¡BASTA! endorsement right):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 240" role="img" aria-label="El Instante del Hombre Gris / ¡BASTA!">
  <title>El Instante del Hombre Gris / ¡BASTA!</title>
  <!-- Emblem (scaled from logo-principal, centered in a 200px-wide slot on the left) -->
  <g transform="translate(100 120) scale(0.42)">
    <g fill="#C8A64A">
      <g id="btooth"><path d="M0 -240 L-10 -205 L10 -205 Z"/></g>
      <use href="#btooth"/>
      <use href="#btooth" transform="rotate(15)"/>
      <use href="#btooth" transform="rotate(30)"/>
      <use href="#btooth" transform="rotate(45)"/>
      <use href="#btooth" transform="rotate(60)"/>
      <use href="#btooth" transform="rotate(75)"/>
      <use href="#btooth" transform="rotate(90)"/>
      <use href="#btooth" transform="rotate(105)"/>
      <use href="#btooth" transform="rotate(120)"/>
      <use href="#btooth" transform="rotate(135)"/>
      <use href="#btooth" transform="rotate(150)"/>
      <use href="#btooth" transform="rotate(165)"/>
      <use href="#btooth" transform="rotate(180)"/>
      <use href="#btooth" transform="rotate(195)"/>
      <use href="#btooth" transform="rotate(210)"/>
      <use href="#btooth" transform="rotate(225)"/>
      <use href="#btooth" transform="rotate(240)"/>
      <use href="#btooth" transform="rotate(255)"/>
      <use href="#btooth" transform="rotate(270)"/>
      <use href="#btooth" transform="rotate(285)"/>
      <use href="#btooth" transform="rotate(300)"/>
      <use href="#btooth" transform="rotate(315)"/>
      <use href="#btooth" transform="rotate(330)"/>
      <use href="#btooth" transform="rotate(345)"/>
      <circle r="200" fill="none" stroke="#C8A64A" stroke-width="14"/>
    </g>
    <circle r="160" fill="#C8CDD2"/>
    <g fill="#0A0A0A">
      <ellipse cx="0" cy="-100" rx="18" ry="54"/>
      <ellipse cx="0" cy="100" rx="18" ry="54"/>
      <ellipse cx="-100" cy="0" rx="54" ry="18"/>
      <ellipse cx="100" cy="0" rx="54" ry="18"/>
      <circle r="82" fill="none" stroke="#0A0A0A" stroke-width="3"/>
    </g>
    <g fill="#0A0A0A">
      <path d="M 0 38 C -34 4, -68 -18, -48 -48 C -28 -72, 0 -60, 0 -30 C 0 -60, 28 -72, 48 -48 C 68 -18, 34 4, 0 38 Z"/>
    </g>
  </g>
  <!-- Wordmark -->
  <g font-family="Georgia, 'Playfair Display', serif" fill="#C8CDD2">
    <text x="220" y="115" font-size="36" font-weight="500">El Instante</text>
    <text x="220" y="155" font-size="26" fill="#8A8F95" letter-spacing="2">del Hombre Gris</text>
  </g>
  <!-- Endorsement line -->
  <g font-family="'JetBrains Mono', monospace" fill="#C8A64A">
    <text x="220" y="195" font-size="14" letter-spacing="3">¡BASTA!</text>
  </g>
</svg>
```

- [ ] **Step 4: Write `client/public/press-kit/social-card-landscape.svg`**

Full file contents (1200×630, Open Graph / Twitter card):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" role="img" aria-label="El Instante del Hombre Gris — social card landscape">
  <title>El Instante del Hombre Gris — social card</title>
  <!-- Background -->
  <rect width="1200" height="630" fill="#0A0A0A"/>
  <!-- Emblem top-left -->
  <g transform="translate(120 130) scale(0.38)">
    <g fill="#C8A64A">
      <g id="ltooth"><path d="M0 -240 L-10 -205 L10 -205 Z"/></g>
      <use href="#ltooth"/>
      <use href="#ltooth" transform="rotate(15)"/>
      <use href="#ltooth" transform="rotate(30)"/>
      <use href="#ltooth" transform="rotate(45)"/>
      <use href="#ltooth" transform="rotate(60)"/>
      <use href="#ltooth" transform="rotate(75)"/>
      <use href="#ltooth" transform="rotate(90)"/>
      <use href="#ltooth" transform="rotate(105)"/>
      <use href="#ltooth" transform="rotate(120)"/>
      <use href="#ltooth" transform="rotate(135)"/>
      <use href="#ltooth" transform="rotate(150)"/>
      <use href="#ltooth" transform="rotate(165)"/>
      <use href="#ltooth" transform="rotate(180)"/>
      <use href="#ltooth" transform="rotate(195)"/>
      <use href="#ltooth" transform="rotate(210)"/>
      <use href="#ltooth" transform="rotate(225)"/>
      <use href="#ltooth" transform="rotate(240)"/>
      <use href="#ltooth" transform="rotate(255)"/>
      <use href="#ltooth" transform="rotate(270)"/>
      <use href="#ltooth" transform="rotate(285)"/>
      <use href="#ltooth" transform="rotate(300)"/>
      <use href="#ltooth" transform="rotate(315)"/>
      <use href="#ltooth" transform="rotate(330)"/>
      <use href="#ltooth" transform="rotate(345)"/>
      <circle r="200" fill="none" stroke="#C8A64A" stroke-width="14"/>
    </g>
    <circle r="160" fill="#C8CDD2"/>
    <g fill="#0A0A0A">
      <ellipse cx="0" cy="-100" rx="18" ry="54"/>
      <ellipse cx="0" cy="100" rx="18" ry="54"/>
      <ellipse cx="-100" cy="0" rx="54" ry="18"/>
      <ellipse cx="100" cy="0" rx="54" ry="18"/>
      <circle r="82" fill="none" stroke="#0A0A0A" stroke-width="3"/>
    </g>
    <g fill="#0A0A0A">
      <path d="M 0 38 C -34 4, -68 -18, -48 -48 C -28 -72, 0 -60, 0 -30 C 0 -60, 28 -72, 48 -48 C 68 -18, 34 4, 0 38 Z"/>
    </g>
  </g>
  <!-- Title -->
  <g font-family="Georgia, 'Playfair Display', serif" fill="#C8CDD2">
    <text x="280" y="280" font-size="72" font-weight="600">El Instante</text>
    <text x="280" y="360" font-size="56" fill="#8A8F95">del Hombre Gris</text>
  </g>
  <!-- Gold divider -->
  <rect x="280" y="400" width="180" height="3" fill="#C8A64A"/>
  <!-- Subtitle -->
  <g font-family="Inter, Arial, sans-serif" fill="#C8CDD2">
    <text x="280" y="440" font-size="22" opacity="0.85">Ciudadanos con herramientas para diseñar Argentina</text>
  </g>
  <!-- URL bottom-right -->
  <g font-family="'JetBrains Mono', monospace" fill="#C8A64A">
    <text x="1080" y="580" font-size="18" text-anchor="end">elinstantedelhombregris.com</text>
  </g>
</svg>
```

- [ ] **Step 5: Write `client/public/press-kit/social-card-square.svg`**

Full file contents (1080×1080, Instagram feed):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" role="img" aria-label="El Instante del Hombre Gris — social card square">
  <title>El Instante del Hombre Gris — social card square</title>
  <rect width="1080" height="1080" fill="#0A0A0A"/>
  <g transform="translate(540 380) scale(0.55)">
    <g fill="#C8A64A">
      <g id="sqtooth"><path d="M0 -240 L-10 -205 L10 -205 Z"/></g>
      <use href="#sqtooth"/>
      <use href="#sqtooth" transform="rotate(15)"/>
      <use href="#sqtooth" transform="rotate(30)"/>
      <use href="#sqtooth" transform="rotate(45)"/>
      <use href="#sqtooth" transform="rotate(60)"/>
      <use href="#sqtooth" transform="rotate(75)"/>
      <use href="#sqtooth" transform="rotate(90)"/>
      <use href="#sqtooth" transform="rotate(105)"/>
      <use href="#sqtooth" transform="rotate(120)"/>
      <use href="#sqtooth" transform="rotate(135)"/>
      <use href="#sqtooth" transform="rotate(150)"/>
      <use href="#sqtooth" transform="rotate(165)"/>
      <use href="#sqtooth" transform="rotate(180)"/>
      <use href="#sqtooth" transform="rotate(195)"/>
      <use href="#sqtooth" transform="rotate(210)"/>
      <use href="#sqtooth" transform="rotate(225)"/>
      <use href="#sqtooth" transform="rotate(240)"/>
      <use href="#sqtooth" transform="rotate(255)"/>
      <use href="#sqtooth" transform="rotate(270)"/>
      <use href="#sqtooth" transform="rotate(285)"/>
      <use href="#sqtooth" transform="rotate(300)"/>
      <use href="#sqtooth" transform="rotate(315)"/>
      <use href="#sqtooth" transform="rotate(330)"/>
      <use href="#sqtooth" transform="rotate(345)"/>
      <circle r="200" fill="none" stroke="#C8A64A" stroke-width="14"/>
    </g>
    <circle r="160" fill="#C8CDD2"/>
    <g fill="#0A0A0A">
      <ellipse cx="0" cy="-100" rx="18" ry="54"/>
      <ellipse cx="0" cy="100" rx="18" ry="54"/>
      <ellipse cx="-100" cy="0" rx="54" ry="18"/>
      <ellipse cx="100" cy="0" rx="54" ry="18"/>
      <circle r="82" fill="none" stroke="#0A0A0A" stroke-width="3"/>
    </g>
    <g fill="#0A0A0A">
      <path d="M 0 38 C -34 4, -68 -18, -48 -48 C -28 -72, 0 -60, 0 -30 C 0 -60, 28 -72, 48 -48 C 68 -18, 34 4, 0 38 Z"/>
    </g>
  </g>
  <g font-family="Georgia, 'Playfair Display', serif" fill="#C8CDD2" text-anchor="middle">
    <text x="540" y="790" font-size="68" font-weight="600">El Instante</text>
    <text x="540" y="860" font-size="52" fill="#8A8F95">del Hombre Gris</text>
  </g>
  <rect x="450" y="900" width="180" height="3" fill="#C8A64A"/>
  <g font-family="'JetBrains Mono', monospace" fill="#C8A64A" text-anchor="middle">
    <text x="540" y="1020" font-size="20">elinstantedelhombregris.com</text>
  </g>
</svg>
```

- [ ] **Step 6: Write `client/public/press-kit/social-card-story.svg`**

Full file contents (1080×1920, Instagram/Facebook stories):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" role="img" aria-label="El Instante del Hombre Gris — social card story">
  <title>El Instante del Hombre Gris — social card story</title>
  <rect width="1080" height="1920" fill="#0A0A0A"/>
  <g transform="translate(540 620) scale(0.65)">
    <g fill="#C8A64A">
      <g id="sttooth"><path d="M0 -240 L-10 -205 L10 -205 Z"/></g>
      <use href="#sttooth"/>
      <use href="#sttooth" transform="rotate(15)"/>
      <use href="#sttooth" transform="rotate(30)"/>
      <use href="#sttooth" transform="rotate(45)"/>
      <use href="#sttooth" transform="rotate(60)"/>
      <use href="#sttooth" transform="rotate(75)"/>
      <use href="#sttooth" transform="rotate(90)"/>
      <use href="#sttooth" transform="rotate(105)"/>
      <use href="#sttooth" transform="rotate(120)"/>
      <use href="#sttooth" transform="rotate(135)"/>
      <use href="#sttooth" transform="rotate(150)"/>
      <use href="#sttooth" transform="rotate(165)"/>
      <use href="#sttooth" transform="rotate(180)"/>
      <use href="#sttooth" transform="rotate(195)"/>
      <use href="#sttooth" transform="rotate(210)"/>
      <use href="#sttooth" transform="rotate(225)"/>
      <use href="#sttooth" transform="rotate(240)"/>
      <use href="#sttooth" transform="rotate(255)"/>
      <use href="#sttooth" transform="rotate(270)"/>
      <use href="#sttooth" transform="rotate(285)"/>
      <use href="#sttooth" transform="rotate(300)"/>
      <use href="#sttooth" transform="rotate(315)"/>
      <use href="#sttooth" transform="rotate(330)"/>
      <use href="#sttooth" transform="rotate(345)"/>
      <circle r="200" fill="none" stroke="#C8A64A" stroke-width="14"/>
    </g>
    <circle r="160" fill="#C8CDD2"/>
    <g fill="#0A0A0A">
      <ellipse cx="0" cy="-100" rx="18" ry="54"/>
      <ellipse cx="0" cy="100" rx="18" ry="54"/>
      <ellipse cx="-100" cy="0" rx="54" ry="18"/>
      <ellipse cx="100" cy="0" rx="54" ry="18"/>
      <circle r="82" fill="none" stroke="#0A0A0A" stroke-width="3"/>
    </g>
    <g fill="#0A0A0A">
      <path d="M 0 38 C -34 4, -68 -18, -48 -48 C -28 -72, 0 -60, 0 -30 C 0 -60, 28 -72, 48 -48 C 68 -18, 34 4, 0 38 Z"/>
    </g>
  </g>
  <g font-family="Georgia, 'Playfair Display', serif" fill="#C8CDD2" text-anchor="middle">
    <text x="540" y="1160" font-size="88" font-weight="600">El Instante</text>
    <text x="540" y="1260" font-size="66" fill="#8A8F95">del Hombre Gris</text>
  </g>
  <rect x="450" y="1320" width="180" height="3" fill="#C8A64A"/>
  <g font-family="Inter, Arial, sans-serif" fill="#C8CDD2" text-anchor="middle">
    <text x="540" y="1400" font-size="30" opacity="0.85">Ciudadanos con herramientas</text>
    <text x="540" y="1440" font-size="30" opacity="0.85">para diseñar Argentina</text>
  </g>
  <g font-family="'JetBrains Mono', monospace" fill="#C8A64A" text-anchor="middle">
    <text x="540" y="1820" font-size="24">elinstantedelhombregris.com</text>
  </g>
</svg>
```

- [ ] **Step 7: Delete the old misplaced press-kit directory**

```bash
rm -rf SocialJusticeHub/public/press-kit
# If the parent SocialJusticeHub/public/ is now empty, remove it too so nobody re-creates assets in the wrong place
rmdir SocialJusticeHub/public 2>/dev/null || echo "public/ still has siblings; leaving in place"
```

- [ ] **Step 8: Verify dev server serves the files**

```bash
cd SocialJusticeHub
npm run dev &
sleep 5
curl -sI http://localhost:3001/press-kit/logo-principal.svg | head -5
curl -sI http://localhost:3001/press-kit/logo-basta.svg | head -5
curl -sI http://localhost:3001/press-kit/social-card-landscape.svg | head -5
curl -sI http://localhost:3001/press-kit/social-card-square.svg | head -5
curl -sI http://localhost:3001/press-kit/social-card-story.svg | head -5
# Kill the dev server
kill %1 2>/dev/null
```

Expected for each: `HTTP/1.1 200 OK` and `Content-Type: image/svg+xml`. If any response is `text/html`, Vite is still serving the SPA shell — re-check the directory path.

- [ ] **Step 9: Visual sanity check**

Open each of the 5 SVGs in a browser (file:// is fine). Confirm:
- Outer gold ring of 24 teeth is visible.
- Silver inner disc with four-fold mandala cutouts visible.
- Heart cutout at center is visible.
- Background is charcoal on the social cards, transparent on `logo-principal.svg` and `logo-basta.svg`.

If any of the four mandala ellipses or the heart path render as thin horizontal lines or disappear, the viewBox scaling is off — re-check the transform values.

- [ ] **Step 10: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add SocialJusticeHub/client/public/press-kit/
git rm -r SocialJusticeHub/public/press-kit
git status  # confirm what's staged
git commit -m "$(cat <<'EOF'
fix(press-kit): move SVGs to served dir + replace HG placeholder with real emblem

Press-kit SVGs now live under SocialJusticeHub/client/public/press-kit/
(Vite's actual public root) so /press-kit/*.svg returns the asset
instead of the SPA HTML shell. Each SVG was redrawn around the real
silver/gold emblem — outer gold ring of 24 teeth, silver mandala
inner form, heart cutout at center. No more HG placeholder.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Export metallic hero PNGs from root Logo.png

**Files:**
- Create: `SocialJusticeHub/client/public/press-kit/el-instante-logo-metallic-hero-512.png`
- Create: `SocialJusticeHub/client/public/press-kit/el-instante-logo-metallic-hero-1024.png`
- Create: `SocialJusticeHub/client/public/press-kit/el-instante-logo-metallic-hero-2048.png`

- [ ] **Step 1: Check that ImageMagick or `sips` is available**

```bash
which sips || which magick || which convert
```

macOS ships with `sips` by default, so it will be present. If only `magick` is available, substitute commands accordingly in the next step.

- [ ] **Step 2: Export the three sizes from `Logo.png`**

Using `sips` (macOS built-in):

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
sips -Z 512  Logo.png --out SocialJusticeHub/client/public/press-kit/el-instante-logo-metallic-hero-512.png
sips -Z 1024 Logo.png --out SocialJusticeHub/client/public/press-kit/el-instante-logo-metallic-hero-1024.png
sips -Z 2048 Logo.png --out SocialJusticeHub/client/public/press-kit/el-instante-logo-metallic-hero-2048.png
```

`-Z` resizes preserving aspect ratio so the largest side equals the given value. Logo.png is 3393×3393, so these come out square.

- [ ] **Step 3: Verify file sizes and dimensions**

```bash
cd SocialJusticeHub/client/public/press-kit
for f in el-instante-logo-metallic-hero-*.png; do
  echo "$f: $(sips -g pixelWidth -g pixelHeight "$f" | tail -2 | tr -d ' ')"
done
ls -lh el-instante-logo-metallic-hero-*.png
```

Expected: `pixelWidth:512`/`pixelHeight:512`, `pixelWidth:1024`/`pixelHeight:1024`, `pixelWidth:2048`/`pixelHeight:2048`. File sizes roughly 150KB/500KB/1.5MB respectively — if any file is zero bytes or under 10KB, the resize failed.

- [ ] **Step 4: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add SocialJusticeHub/client/public/press-kit/el-instante-logo-metallic-hero-*.png
git commit -m "$(cat <<'EOF'
feat(press-kit): add metallic hero PNGs at 512/1024/2048

Exported from root Logo.png for ceremonial surfaces (press hero,
deck covers, print) where the simplified SVG emblem is too flat.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Add "Diseño Idealizado" framing block on three surfaces

**Files:**
- Modify: `SocialJusticeHub/client/src/pages/UnaRutaParaArgentina.tsx`
- Modify: `SocialJusticeHub/client/src/pages/KitDePrensa.tsx`
- Check: `SocialJusticeHub/client/src/pages/LaVision.tsx` (only if it lists or totals plans)
- Check: `SocialJusticeHub/client/src/pages/ElMapa.tsx` (only if it lists or totals plans)

- [ ] **Step 1: Identify the insertion point in `UnaRutaParaArgentina.tsx`**

```bash
cd SocialJusticeHub
grep -n "strategicInitiatives\|STRATEGIC_INITIATIVES\|NarratorBlock\|ChapterTitle" client/src/pages/UnaRutaParaArgentina.tsx | head -20
```

Find the first ChapterTitle/NarratorBlock/hero section that introduces the list of plans. The framing block is inserted immediately after the hero title and immediately before the plan list begins. If the page uses CinematicScroll chapters, insert the framing as its own Narrator paragraph inside the first relevant chapter.

- [ ] **Step 2: Add the framing JSX to `UnaRutaParaArgentina.tsx`**

Insert this JSX block at the location identified in Step 1. Exact wrapping element depends on the chapter shape; if the page uses `<NarratorBlock>` for body paragraphs, wrap the framing as a new `<NarratorBlock>`. If the page uses plain `<section>` with Tailwind classes, use a plain `<aside>`.

Plain-aside version (use this if no `NarratorBlock` wraps the introduction):

```tsx
<aside
  role="note"
  aria-label="Diseño Idealizado"
  className="mx-auto max-w-3xl my-12 p-8 rounded-xl bg-white/[0.03] border border-silver/20 ring-1 ring-gold/10"
>
  <h3 className="font-serif text-2xl md:text-3xl text-silver mb-4 tracking-wide">
    Diseño Idealizado
  </h3>
  <p className="text-base md:text-lg leading-relaxed text-silver/90">
    La Ruta para Argentina y sus 22 planes son un ejercicio de <strong>diseño idealizado</strong>: no son una hoja de ruta cerrada ni una promesa de gobierno.
  </p>
  <p className="mt-4 text-base md:text-lg leading-relaxed text-silver/90">
    Son un mapa de hacia dónde <em>podríamos apuntar</em> si las personas dejan de esperar y empiezan a diseñar. Sirven como <strong>ejemplo e inspiración</strong> — muestran lo que se puede pensar, medir, proponer y ordenar cuando la ciudadanía se toma en serio el rediseño del país.
  </p>
  <p className="mt-4 text-base md:text-lg leading-relaxed text-silver/90">
    Construirlos de verdad <strong>requiere la participación de las personas</strong>. Vos, tu barrio, tu oficio, tu comunidad. Sin ese aporte, ninguno de estos planes es real.
  </p>
</aside>
```

Notes:
- `border-silver/20` and `ring-gold/10` reference tokens that don't exist yet — **they get added in Task 7**. Until Task 7 runs, Tailwind will simply emit no CSS for those classes, so the border/ring becomes invisible but the rest of the block (background, padding, typography) still renders correctly. The block is still legibly distinct as a callout; it just looks a little flatter until Task 7 activates the accent colors.
- If you want a better fallback visual while waiting for Task 7, temporarily substitute `border-white/20` and `ring-white/10` and then swap back in Task 7. Optional.

- [ ] **Step 3: Add the framing to `KitDePrensa.tsx` above line 496**

Open `client/src/pages/KitDePrensa.tsx`. Find the exact line that currently reads `Los 16 planes estratégicos — Diseño de País` (approximately line 496 before edits). That line sits inside a section heading block. Immediately BEFORE the section that contains that heading, insert the same `<aside>` JSX from Step 2.

- [ ] **Step 4: Check `LaVision.tsx` and `ElMapa.tsx` for plan-count references**

```bash
grep -n "planes estrat\|16 plan\|17 plan\|PLAN[A-Z]\{2,\}" client/src/pages/LaVision.tsx client/src/pages/ElMapa.tsx 2>/dev/null
```

If either page lists plans or totals them, add the framing `<aside>` above the list in the same pattern. If neither page references plans, skip.

- [ ] **Step 5: Type-check**

```bash
npm run check
```

Expected: no new errors. Pre-existing error in `server/routes.ts:matchCount` (see memory `project_routes_ts_preexisting_ts_error`) still appears — ignore it unless a new error appears in the files you just edited.

- [ ] **Step 6: Visual smoke test**

```bash
npm run dev
```

Open http://localhost:3001/una-ruta-para-argentina and http://localhost:3001/kit-de-prensa. Confirm the framing block renders above the plan list on both pages. Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add SocialJusticeHub/client/src/pages/UnaRutaParaArgentina.tsx \
        SocialJusticeHub/client/src/pages/KitDePrensa.tsx
# Plus LaVision.tsx and/or ElMapa.tsx if modified
git commit -m "$(cat <<'EOF'
feat(brand): add Diseño Idealizado framing above plan lists

Ruta para Argentina and Kit de Prensa now explicitly frame the 22
strategic plans as idealized design — not a roadmap or promise of
government, but a map of where we could aim if citizens participate.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Sweep plan count 16 → 22 and add the 6 missing plan cards

**Files:**
- Modify: `SocialJusticeHub/client/src/pages/KitDePrensa.tsx`
- Modify (conditionally): `SocialJusticeHub/client/src/pages/UnaRutaParaArgentina.tsx`, `LaVision.tsx`, `ElMapa.tsx`

- [ ] **Step 1: Audit every "16 planes" / "17 planes" / "17+ PLAN" reference**

```bash
cd SocialJusticeHub
grep -rn -E "16 [Pp]lanes|16 PLAN|17 [Pp]lanes|17 PLAN|17\+ PLAN|cuatro plan|4 [Pp]lanes" \
  --include="*.tsx" --include="*.ts" client/ shared/ server/ 2>/dev/null
```

List every match. Any match in **live-user-facing copy** (pages, components, JSX strings) needs to change. Matches in markdown docs or historical plan docs in `docs/superpowers/plans/` are historical — leave those alone. Matches in `docs/superpowers/specs/` that describe the 16→22 work itself are self-referential — leave those alone.

- [ ] **Step 2: Update `KitDePrensa.tsx` line 49** (una-línea description)

Find:

```
text: 'El Instante del Hombre Gris es una plataforma argentina de inteligencia colectiva con 16 planes estratégicos para rediseñar el país desde la participación ciudadana, los datos abiertos y la acción organizada.',
```

Replace with:

```
text: 'El Instante del Hombre Gris es una plataforma argentina de inteligencia colectiva con 22 planes estratégicos para rediseñar el país desde la participación ciudadana, los datos abiertos y la acción organizada.',
```

- [ ] **Step 3: Update `KitDePrensa.tsx` line 53** (un-párrafo description)

Change `16 planes estratégicos completos` → `22 planes estratégicos completos`.

The list of covered areas already mentions "justicia, economía, educación, salud, energía, seguridad, cultura, vivienda, soberanía digital y más"; leave that enumeration as-is (the "y más" covers the 6 new areas).

- [ ] **Step 4: Update `KitDePrensa.tsx` line 61** (descripción-completa)

Find the line that contains `los 16 planes estratégicos se visualizan como un sistema vivo de dependencias. Tercero, el diseño de un país nuevo: 16 planes estratégicos completos que cubren justicia popular, reconversión del empleo público, empresas al costo real, soberanía monetaria, soberanía digital, regulación de sustancias, refundación educativa, salud integral, suelo vivo, soberanía hídrica, 24 ciudades nuevas, posicionamiento geopolítico, soberanía energética, seguridad ciudadana, vivienda digna y cultura viva.`

Replace both "16" with "22" and expand the enumeration of covered areas. New text:

```
los 22 planes estratégicos se visualizan como un sistema vivo de dependencias. Tercero, el diseño de un país nuevo: 22 planes estratégicos completos que cubren justicia popular, reconversión del empleo público, empresas al costo real, soberanía monetaria, soberanía digital, regulación de sustancias, refundación educativa, salud integral, suelo vivo, soberanía hídrica, 24 ciudades nuevas, posicionamiento geopolítico, soberanía energética, seguridad ciudadana, vivienda digna, cultura viva, mesa civil deliberativa, talleres federales, cuidado y vínculo, memoria operativa, tierra y pueblos originarios, y movilidad y logística.
```

- [ ] **Step 5: Update `KitDePrensa.tsx` line 496** (section heading)

Change `Los 16 planes estratégicos — Diseño de País` → `Los 22 planes estratégicos — Diseño de País`.

- [ ] **Step 6: Update `KitDePrensa.tsx` line 667** (anywhere it says "16 planes estratégicos auditables")

Change `16 planes estratégicos auditables` → `22 planes estratégicos auditables`.

- [ ] **Step 7: Extend the `strategicPlans` array with the 6 new cards**

The `strategicPlans` array currently starts around line 123. It has 16 entries, last one is `PLANCUL`. Add 6 new entries in ordinal order (17 through 22) after the existing `PLANCUL` entry.

First, add the required icons to the existing lucide import at the top of the file. Locate the existing import:

```tsx
import {
  Copy, Check, Download, Eye, Users, Brain, MapPin, Vote,
  Sparkles, Globe, Zap, BookOpen, GraduationCap, Building2,
  Briefcase, Leaf, Scale, ArrowRight, ChevronDown, FileText,
  Palette, Type, Image, Monitor, Smartphone, Square,
  Code2, Shield, BarChart3, Heart, Mail, HeartPulse, Store,
  FlaskConical, Droplets, Landmark, Cpu, Flame, ShieldCheck,
  Home, Music
} from 'lucide-react';
```

`Users`, `Globe`, and `Heart` already exist. Add the 4 icons that are new: `Hammer`, `HeartHandshake`, `Archive`, `Mountain`, `Route`. Final import becomes:

```tsx
import {
  Copy, Check, Download, Eye, Users, Brain, MapPin, Vote,
  Sparkles, Globe, Zap, BookOpen, GraduationCap, Building2,
  Briefcase, Leaf, Scale, ArrowRight, ChevronDown, FileText,
  Palette, Type, Image, Monitor, Smartphone, Square,
  Code2, Shield, BarChart3, Heart, Mail, HeartPulse, Store,
  FlaskConical, Droplets, Landmark, Cpu, Flame, ShieldCheck,
  Home, Music, Hammer, HeartHandshake, Archive, Mountain, Route
} from 'lucide-react';
```

Then add the 6 new entries to the `strategicPlans` array, after the existing `PLANCUL` entry and before the closing `]`:

```tsx
    { code: 'PLANMESA', name: 'Mesa Civil', icon: Users, desc: 'Corteza deliberativa: mesas ciudadanas institucionales, cédula civil y dietas de servicio. Representación rotativa sin profesionalización política.' },
    { code: 'PLANTALLER', name: 'Talleres Federales', icon: Hammer, desc: 'Red nacional de talleres productivos federales. Galpones públicos + Red Bastarda: manos que producen, formación en oficios y empleo con sentido.' },
    { code: 'PLANCUIDADO', name: 'Cuidado y Vínculo', icon: HeartHandshake, desc: 'Capa cero del sistema: infancia, mayores, discapacidad y salud mental. Fondo Federal de Cuidado y jornada 6+2 para que cuidar no sea invisible.' },
    { code: 'PLANMEMORIA', name: 'Memoria Operativa', icon: Archive, desc: 'Columna memorial: archivo vivo del país. Convenios con universidades y el Archivo General para que lo aprendido no se vuelva a perder.' },
    { code: 'PLANTER', name: 'Tierra, Subsuelo y Pueblos Originarios', icon: Mountain, desc: 'Raíz territorial: soberanía sobre tierra y subsuelo, con Fondo Soberano Ciudadano de regalías extractivas que paga dividendo a todos.' },
    { code: 'PLANMOV', name: 'Movilidad, Logística y Conectividad Territorial', icon: Route, desc: 'Arterias del país: reconstrucción ferroviaria, hidrovía, corredores federales y logística soberana. 20 años, financiamiento mixto.' },
```

Note `Users` for `PLANMESA` is already imported — reusing is fine. The icon was used previously for `journeySteps` and will now double as the PLANMESA icon; this is intentional (mesa civil ≈ people gathered).

- [ ] **Step 8: Check `UnaRutaParaArgentina.tsx` for hardcoded counts**

```bash
grep -n "16 plan\|17 plan\|17+ PLAN\|16 PLAN" client/src/pages/UnaRutaParaArgentina.tsx
```

For any matches, change to `22` consistently. If the page pulls from `STRATEGIC_INITIATIVES` and just renders `.length`, no change needed.

- [ ] **Step 9: Type-check**

```bash
npm run check
```

Expected: no new errors. All 5 new icons must resolve — if any fail, `lucide-react` version is older than `0.300.x`. In that case, open `node_modules/lucide-react/dist/lucide-react.d.ts` and grep for the icon name; if missing, pick a close alternative (`Hammer` → `Wrench`, `HeartHandshake` → `Heart`, `Archive` → `Folder`, `Mountain` → `Triangle`, `Route` → `MapPin`).

- [ ] **Step 10: Visual smoke test**

```bash
npm run dev
```

Open http://localhost:3001/kit-de-prensa, scroll to "Los 22 planes estratégicos — Diseño de País", confirm:
- Heading reads "22", not "16".
- Exactly 22 plan cards render in the grid.
- Each new card shows its icon, code, name, and description without layout breakage.

Stop the dev server.

- [ ] **Step 11: Commit**

```bash
git add SocialJusticeHub/client/src/pages/KitDePrensa.tsx
# Plus UnaRutaParaArgentina.tsx if modified
git commit -m "$(cat <<'EOF'
feat(press-kit): update plan count to 22 and add 6 missing plan cards

Kit de Prensa now shows all 22 plans (previously only the first 16):
PLANMESA, PLANTALLER, PLANCUIDADO, PLANMEMORIA, PLANTER, PLANMOV.
Copy descriptions updated everywhere that still said "16 planes".
Source of truth: shared/arquitecto-data.ts (ordinal 1 through 22).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Build the StatusBadge component

**Files:**
- Create: `SocialJusticeHub/client/src/components/StatusBadge.tsx`

- [ ] **Step 1: Create the component file**

Write this exact content to `client/src/components/StatusBadge.tsx`:

```tsx
import { cn } from '@/lib/utils';

export type StatusKind = 'activo' | 'beta' | 'desarrollo' | 'idealizado';

interface StatusBadgeProps {
  kind: StatusKind;
  size?: 'sm' | 'md';
  className?: string;
}

const LABELS: Record<StatusKind, string> = {
  activo: 'Activo',
  beta: 'En beta',
  desarrollo: 'En desarrollo',
  idealizado: 'Diseño idealizado',
};

const DOT_COLORS: Record<StatusKind, string> = {
  activo: 'bg-emerald-500',
  beta: 'bg-cyan-400',
  desarrollo: 'bg-amber-500',
  idealizado: 'bg-[#C8A64A]',
};

export function StatusBadge({ kind, size = 'sm', className }: StatusBadgeProps) {
  const padding = size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 font-mono font-medium text-white/85',
        padding,
        className,
      )}
      aria-label={`Estado: ${LABELS[kind]}`}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', DOT_COLORS[kind])} aria-hidden="true" />
      {LABELS[kind]}
    </span>
  );
}

export default StatusBadge;
```

Notes:
- Imports `cn` from `@/lib/utils` (already exists in the project per CLAUDE.md).
- Uses `font-mono` (JetBrains Mono) via the global font stack.
- `bg-[#C8A64A]` is an arbitrary Tailwind value — works without Task 8's gold token. When Task 8 lands we can optionally swap to `bg-gold`, but the hardcoded color will continue to work.
- No interactivity — it's a label, not a button.

- [ ] **Step 2: Import and use it on every plan card in `KitDePrensa.tsx`**

Find the JSX that renders each entry of `strategicPlans` (use the grid starting around line ~500 in the current file — search for `strategicPlans.map`). Each plan card is rendered with a structure roughly like:

```tsx
{strategicPlans.map((plan, index) => {
  const Icon = plan.icon;
  return (
    <motion.div key={plan.code} ...>
      {/* existing icon + code + name + desc */}
    </motion.div>
  );
})}
```

Add the badge as the last inline element at the top-right of each card (or the bottom, depending on existing card layout — whichever keeps the visual balance). Minimal intrusive placement: at the top-right of the header row, next to the `code`.

Add the import at the top of `KitDePrensa.tsx`:

```tsx
import StatusBadge from '@/components/StatusBadge';
```

Inside the map callback, add the badge inside the card wrapper:

```tsx
<div className="flex items-start justify-between gap-2 mb-2">
  <span className="font-mono text-xs text-blue-400">{plan.code}</span>
  <StatusBadge kind="idealizado" />
</div>
```

Exact placement depends on the existing card structure — if cards already have a header row with the code, add the badge as a sibling after the code. If not, wrap the code + badge in a new flex container as shown.

- [ ] **Step 3: Apply the same badge to plan cards in `UnaRutaParaArgentina.tsx` if they exist**

```bash
grep -n "InitiativeCard\|STRATEGIC_INITIATIVES.map\|initiative.code" client/src/pages/UnaRutaParaArgentina.tsx | head -10
```

If the page renders plan cards directly (not via a separate component), add `<StatusBadge kind="idealizado" />` to each card. If it delegates to `InitiativeCard`, modify `InitiativeCard.tsx` to include the badge in its header row. Either way, every plan card rendered on this page shows `Diseño idealizado`.

- [ ] **Step 4: Type-check**

```bash
npm run check
```

Expected: no new errors.

- [ ] **Step 5: Visual smoke test**

```bash
npm run dev
```

Open http://localhost:3001/kit-de-prensa and http://localhost:3001/una-ruta-para-argentina. Confirm:
- Every one of the 22 plan cards on Kit de Prensa shows the pill "Diseño idealizado" with a gold dot.
- Every plan card on Una Ruta also shows the same pill.
- Badge doesn't wrap awkwardly at narrow widths (≤375px). If it does, reduce plan card inner padding or let the badge wrap to a second line.

Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add SocialJusticeHub/client/src/components/StatusBadge.tsx \
        SocialJusticeHub/client/src/pages/KitDePrensa.tsx
# Plus UnaRutaParaArgentina.tsx or InitiativeCard.tsx if modified
git commit -m "$(cat <<'EOF'
feat(brand): add StatusBadge and label all 22 plans as Diseño idealizado

New component with 4 kinds — activo / beta / desarrollo / idealizado.
All 22 strategic plan cards now show 'Diseño idealizado' visually
reinforcing the framing block added in the previous commit.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Update memory, CLAUDE.md files, and BRAND_MEDIA_PACKAGE.md

**Files:**
- Modify: `/Users/juanb/Desktop/ElInstantedelHombreGris/CLAUDE.md`
- Modify: `/Users/juanb/Desktop/ElInstantedelHombreGris/BRAND_MEDIA_PACKAGE.md`
- Modify: `/Users/juanb/.claude/projects/-Users-juanb-Desktop-ElInstantedelHombreGris/memory/project_basta_ten_mandates.md`
- Modify (if exists): `/Users/juanb/.claude/projects/-Users-juanb-Desktop-ElInstantedelHombreGris/memory/MEMORY.md`

- [ ] **Step 1: Audit all instruction files for outdated counts**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
grep -n -E "17\+? PLAN|17 [Pp]lanes|16 [Pp]lanes|10\+? PLAN|10 [Mm]andatos|4 [Pp]lanes|4 PLAN" \
  CLAUDE.md BRAND_MEDIA_PACKAGE.md SocialJusticeHub/CLAUDE.md 2>/dev/null
grep -n -E "17\+? PLAN|17 [Pp]lanes|16 [Pp]lanes|10\+? PLAN|10 [Mm]andatos|4 [Pp]lanes|4 PLAN" \
  /Users/juanb/.claude/projects/-Users-juanb-Desktop-ElInstantedelHombreGris/memory/*.md 2>/dev/null
```

Review every match manually — some may be referring to PLAN count correctly in a historical context; others are active instructions that need updating.

- [ ] **Step 2: Update `/Users/juanb/Desktop/ElInstantedelHombreGris/CLAUDE.md` line 109**

Find:

```
- **!BASTA!** — Always written with exclamation marks. A popular governance framework with 17+ PLANs (mandates). Citizens design, State administers, Politics executes.
```

Replace with:

```
- **!BASTA!** — Always written with exclamation marks. A popular governance framework with 22 PLANs (al 23 de abril de 2026), framed as idealized design — they show where the country could aim, not commitments. Citizens design, State administers, Politics executes. `PLANRUTA` is the meta/bootstrap plan and is not counted among the 22.
```

- [ ] **Step 3: Update `BRAND_MEDIA_PACKAGE.md` line 47**

Find:

```
   - The site says `16 planes estratégicos`; repo guidance mentions `17+ PLANs`; older narrative says `4 planes`. Pick one current number and add "as of [date]."
```

Replace with:

```
   - Resolved: 22 planes estratégicos (al 23 de abril de 2026), framed as idealized design. Source of truth: `shared/arquitecto-data.ts` (ordinal 1 through 22). `PLANRUTA` is the meta/bootstrap plan and is not counted among the 22.
```

- [ ] **Step 4: Update `BRAND_MEDIA_PACKAGE.md` line 915**

Find:

```
Live press kit says 16 plans. Repo guidance says 17+ PLANs. Older narrative says 4 plans. Publish one official count with "last updated" date.
```

Replace with:

```
Resolved: 22 planes estratégicos (al 23 de abril de 2026), framed as idealized design. Sourced from `shared/arquitecto-data.ts`.
```

- [ ] **Step 5: Sweep other `BRAND_MEDIA_PACKAGE.md` references**

```bash
grep -n "16 plan\|17 plan\|16 strategic\|17+" BRAND_MEDIA_PACKAGE.md
```

Review each match. Update any that refer to the plan count as an unresolved or outdated number. Leave audit-historical references intact if they describe the original problem that the spec is solving (e.g., "The current live press kit page presents 16 strategic plans" describes a past state and is OK as audit text — but if updated fact-sheet sections still say "16" as the current count, change to "22").

- [ ] **Step 6: Update the memory file**

Open `/Users/juanb/.claude/projects/-Users-juanb-Desktop-ElInstantedelHombreGris/memory/project_basta_ten_mandates.md`. Find any mention of "10+", "17+", or "16" plans/PLANs/mandates. Update to "22" with the date. Add or update the `description` frontmatter field to reflect the current count.

Also check `/Users/juanb/.claude/projects/-Users-juanb-Desktop-ElInstantedelHombreGris/memory/MEMORY.md` and update the one-line hook for the ten-mandates memory to say "22 PLANs" instead of "10+" or "17+".

- [ ] **Step 7: Verify no live instruction file still says an outdated count**

Re-run the grep from Step 1. Every match should either be in `docs/superpowers/plans/` (historical), in `docs/superpowers/specs/` (self-referential), or be audit-historical context inside `BRAND_MEDIA_PACKAGE.md`. No live instruction file should present an outdated count as current fact.

- [ ] **Step 8: Commit** (memory files are outside the repo; they don't go into this commit)

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add CLAUDE.md BRAND_MEDIA_PACKAGE.md
# Also SocialJusticeHub/CLAUDE.md if it was modified
git commit -m "$(cat <<'EOF'
docs: resolve plan count to 22 and frame as idealized design

BRAND_MEDIA_PACKAGE.md section 2 / section 8 and the root CLAUDE.md
no longer present "16 vs 17+ vs 4" as an open question. Source of
truth is shared/arquitecto-data.ts. PLANRUTA is the meta plan, not
counted among the 22.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Note: the memory file updates happen via the `Write` tool outside git. They are not part of the commit but should still be completed in this task.

---

## Task 7: Add silver/gold Tailwind tokens and polish the Kit de Prensa hero

**Files:**
- Modify: `SocialJusticeHub/tailwind.config.ts`
- Modify: `SocialJusticeHub/client/src/pages/KitDePrensa.tsx` (hero section)
- Modify: `SocialJusticeHub/client/src/components/Footer.tsx`

- [ ] **Step 1: Pre-check for token name collisions**

```bash
cd SocialJusticeHub
grep -nE "[\"'](silver|silver-dim|gold|gold-shadow)[\"']|className=.*\\b(silver|gold)\\b" \
  client/ shared/ 2>/dev/null | head -20
grep -n "silver\|gold" tailwind.config.ts
```

If any match shows an existing `silver` or `gold` class in use, rename the new tokens to `ceremonial-silver` and `ceremonial-gold` throughout this task. Otherwise proceed with `silver` / `gold`.

- [ ] **Step 2: Add tokens to `tailwind.config.ts`**

Locate the existing `theme.extend.colors` block. Add four keys inside that object (adjust keys if renamed in Step 1):

```ts
silver: '#C8CDD2',
'silver-dim': '#8A8F95',
gold: '#C8A64A',
'gold-shadow': '#8A6A24',
```

Do NOT remove existing color keys. Do NOT change iris-violet, the charcoal background, or the glass surface classes.

- [ ] **Step 3: Type-check + build sanity**

```bash
npm run check
```

Expected: no errors. Tailwind adds utility classes at build time, so type-check won't catch misused classes — that's fine.

- [ ] **Step 4: Identify the existing Kit de Prensa hero**

```bash
grep -nE "SECTION 1: HERO|hero|Hero" client/src/pages/KitDePrensa.tsx | head -10
```

Read the hero section (roughly lines ~180–260 in the current file). It uses `bg-[#0a0a0a]` as base plus purple/blue gradient orbs and a Playfair title.

- [ ] **Step 5: Restyle the Kit de Prensa hero**

Open `client/src/pages/KitDePrensa.tsx`. Find the existing hero section — it's marked with the comment `SECTION 1: HERO` and uses `<section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">`. Replace the entire JSX of the hero `<section>` (keep the outer `<section>` tag and className, replace only its children) with the following:

```tsx
{/* Metallic emblem */}
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
  className="relative z-10 mb-8"
>
  <img
    src="/press-kit/el-instante-logo-metallic-hero-1024.png"
    alt="El Instante del Hombre Gris emblem"
    className="w-40 h-40 md:w-56 md:h-56 mx-auto drop-shadow-2xl"
  />
</motion.div>

{/* Title + subtitle */}
<div className="relative z-10 text-center max-w-4xl mx-auto px-6">
  <motion.h1
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    className="font-serif text-5xl md:text-7xl text-silver tracking-tight mb-6"
  >
    Kit de Prensa
  </motion.h1>
  <motion.p
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    className="text-lg md:text-xl text-silver/80 leading-relaxed max-w-2xl mx-auto"
  >
    Recursos aprobados, fichas, logos y descripciones para periodistas, aliados y comunidades que cubren El Instante del Hombre Gris y el marco ¡BASTA!
  </motion.p>
  <motion.div
    initial={{ opacity: 0, scaleX: 0 }}
    animate={{ opacity: 1, scaleX: 1 }}
    transition={{ delay: 0.5, duration: 0.6 }}
    className="mt-10 h-0.5 w-24 bg-gold mx-auto origin-left"
  />
</div>
```

Notes:
- Remove the existing "Atmospheric gradient orbs" wrapper and its children — they're the purple/blue orbs this restyle eliminates.
- Preserve the outer `<section>` tag and its classes so page spacing stays intact.
- If the existing hero also has CTA buttons or a scroll-indicator, keep their JSX appended after the block above — the restyle only replaces the visual composition, not the functional chrome.
- If `text-silver` / `bg-gold` classes render as unstyled in dev because Tailwind cache missed the new tokens, run `rm -rf node_modules/.vite` and restart `npm run dev`. Tailwind needs a rebuild when `tailwind.config.ts` changes.

- [ ] **Step 6: Add emblem to Footer.tsx alongside the wordmark**

Open `client/src/components/Footer.tsx`. Find the wordmark group around line 35 (the `El Instante / del Hombre Gris` split text). Add a small emblem image to the LEFT of the wordmark:

```tsx
<div className="flex items-center gap-3">
  <img
    src="/press-kit/logo-principal.svg"
    alt="El Instante del Hombre Gris emblem"
    className="h-10 w-10 shrink-0"
    loading="lazy"
  />
  <div>
    {/* existing wordmark JSX stays here */}
  </div>
</div>
```

The exact JSX depends on the current wrapper — if the wordmark is wrapped in an `<h2>` or a `<Link>`, keep that wrapper and add the `<img>` as its sibling inside a flex container. If uncertain, leave the wordmark markup identical and just add the emblem as a preceding `<img>` inside the wordmark's existing parent flex container.

Do NOT modify `Header.tsx` in this task. Header already has an `<img>` branding element (verified via `alt="El Instante del Hombre Gris"`) — whether that's the real emblem or a placeholder is a Task 8 add-on, optional.

- [ ] **Step 7: Full verification pass**

```bash
cd SocialJusticeHub
npm run check
npm run check:routes
npm run build
```

All three must pass. If `npm run build` fails because of missing `silver`/`gold` classes, confirm the new color keys in `tailwind.config.ts` are spelled exactly as used in the JSX. Tailwind is spelling-sensitive at build time.

- [ ] **Step 8: End-to-end visual smoke test**

```bash
npm run dev
```

Visit every surface that could be affected:

| URL | Check |
|---|---|
| `http://localhost:3001/` | Home still renders, no regressions in hero or sections, emblem visible in footer |
| `http://localhost:3001/la-vision` | No regressions |
| `http://localhost:3001/el-mapa` | No regressions |
| `http://localhost:3001/mandato-territorial` | No regressions |
| `http://localhost:3001/circulos` | No regressions |
| `http://localhost:3001/una-ruta-para-argentina` | Framing block visible, 22 plan cards with Diseño idealizado badge |
| `http://localhost:3001/kit-de-prensa` | New silver/gold hero with metallic emblem, framing block, 22 plan cards with badges, no purple gradient orbs in hero |
| `http://localhost:3001/press-kit/logo-principal.svg` | Returns SVG with real emblem |
| `http://localhost:3001/press-kit/el-instante-logo-metallic-hero-1024.png` | Returns metallic PNG |

Look for console errors in the browser DevTools. Any console error that wasn't present before this plan started is a regression — stop and investigate before committing.

Stop the dev server.

- [ ] **Step 9: Commit**

```bash
git add SocialJusticeHub/tailwind.config.ts \
        SocialJusticeHub/client/src/pages/KitDePrensa.tsx \
        SocialJusticeHub/client/src/components/Footer.tsx
git commit -m "$(cat <<'EOF'
feat(brand): silver/gold tokens + metallic emblem in press hero and footer

Adds silver (#C8CDD2) and gold (#C8A64A) as first-class Tailwind
accent tokens. Restyles only the Kit de Prensa hero around the
real metallic emblem. Adds the emblem to the footer alongside the
wordmark. Other surfaces keep the existing dark/glass system.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Final verification and push

- [ ] **Step 1: Run full verification suite**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/SocialJusticeHub
npm run verify
```

Expected: `check` + `check:routes` + `build` all pass.

If there's a known pre-existing error in `server/routes.ts:matchCount`, document it in the PR description or commit message; do NOT try to "fix" it in this plan — see memory `project_routes_ts_preexisting_ts_error`.

- [ ] **Step 2: Confirm working tree is clean**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git status
```

Expected: "nothing to commit, working tree clean." If anything is left over, it's either a forgotten edit or an auto-generated file — investigate before pushing.

- [ ] **Step 3: Log of commits this plan produced**

```bash
git log --oneline -10
```

Expected to see, at the top:
1. `feat(brand): silver/gold tokens + metallic emblem in press hero and footer`
2. `docs: resolve plan count to 22 and frame as idealized design`
3. `feat(brand): add StatusBadge and label all 22 plans as Diseño idealizado`
4. `feat(press-kit): update plan count to 22 and add 6 missing plan cards`
5. `feat(brand): add Diseño Idealizado framing above plan lists`
6. `feat(press-kit): add metallic hero PNGs at 512/1024/2048`
7. `fix(press-kit): move SVGs to served dir + replace HG placeholder with real emblem`

Plus the two earlier spec commits.

- [ ] **Step 4: Push to `main`**

Per user preference, this work ships on `main`. No feature branch.

```bash
git push origin main
```

- [ ] **Step 5: Post-deploy verification on production**

After the Vercel deploy completes:

```bash
curl -sI https://www.elinstantedelhombregris.com/press-kit/logo-principal.svg | head -5
curl -sI https://www.elinstantedelhombregris.com/press-kit/el-instante-logo-metallic-hero-1024.png | head -5
```

Expected: `HTTP/2 200` and correct `content-type`. If either returns HTML or 404, the Vite `publicDir` isn't behaving in production the same way as local — flag this to the user rather than trying to patch blindly. It likely means `vercel.json` needs a route fix.

Load `https://www.elinstantedelhombregris.com/kit-de-prensa` and confirm:
- Hero shows metallic emblem.
- Framing block reads "Diseño Idealizado".
- 22 plan cards render with `Diseño idealizado` badge.

---

## Success Criteria

- `curl -I` on every `/press-kit/*.svg` and `/press-kit/*.png` URL in production returns HTTP 200 with correct content-type.
- No string in `SocialJusticeHub/client/src/`, `SocialJusticeHub/shared/`, `SocialJusticeHub/server/`, `BRAND_MEDIA_PACKAGE.md`, `CLAUDE.md` (root and SocialJusticeHub), or live memory files presents "16 planes", "17 planes", "17+ PLAN", or "4 planes" as the current count. Historical/audit references in `docs/superpowers/plans/` and `docs/superpowers/specs/` are OK.
- `KitDePrensa.tsx` plan list renders all 22 cards with `Diseño idealizado` status badge on each.
- `UnaRutaParaArgentina.tsx` and `KitDePrensa.tsx` both render the "Diseño Idealizado" framing block above the plan list.
- Footer shows the real silver/gold emblem on every page.
- `npm run check` and `npm run check:routes` pass; `npm run build` succeeds.
- No browser console errors introduced on any major page.
- User can review all changes in the last 7 commits on `main` and see a coherent press-credibility story.
