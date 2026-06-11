# Blog + Guías Dark Editorial Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the 6 blog/guías pages (BlogVlog, BlogPostDetail, StudyGuides, CourseDetail, LessonView, QuizView) to the dark "plata editorial" design system, adding a shared editorial layer (dark prose, TOC with scroll-spy, reading progress, related posts).

**Architecture:** Build 5 shared pieces first (dark color maps + dropcap CSS, MarkdownRenderer dark variant, ReadingProgress, ArticleTOC, RelatedPosts), then redesign each page. All data fetching, routing, progress/locking logic stays untouched — only presentation changes. Spec: `docs/superpowers/specs/2026-06-10-blog-guias-dark-editorial-redesign-design.md`.

**Tech Stack:** React 18 + TypeScript, Tailwind (incl. @tailwindcss/typography), Framer Motion (`lib/motion-variants.ts`), wouter, shadcn/ui.

**Quality bar:** The user asked for "super hermoso". Match the polish of `Home.tsx` (ambient orbs, plata gradient serif titles, glass cards with hover glow). When in doubt, look at Home.tsx for reference patterns.

---

## Design vocabulary (use these exact classes everywhere)

| Element | Classes |
|---|---|
| Page wrapper | `min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-violet-500/30` |
| Plata title | `font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 pb-[0.1em]` |
| Ambient orb | `pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full bg-violet-500/[0.05] blur-3xl` |
| Glass card | `bg-white/[0.03] border border-white/10 rounded-2xl` (hover: `hover:border-white/20 hover:bg-white/[0.05]`) |
| Card hover glow | `hover:shadow-[0_0_40px_rgba(125,91,222,0.10)] hover:-translate-y-1 transition-all duration-500` |
| Violet CTA | `bg-[#7D5BDE] hover:bg-[#8d6ee6] text-white` |
| Secondary button | `bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10` |
| Pill (neutral) | `bg-white/5 border border-white/10 text-slate-300 rounded-full` |
| Section divider | `h-px bg-gradient-to-r from-slate-400/40 to-transparent` |
| Sticky filter bar | `bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5)]` |
| Muted text | headings on cards `text-slate-100`, body `text-slate-300`/`text-slate-400`, metadata `text-slate-500` |
| Skeleton | `bg-white/5 animate-pulse rounded-2xl` |

**Light→dark class mapping** (apply when restyling any leftover light element, e.g. inside CommentsSection):
`bg-white`/`bg-slate-50` → `bg-white/[0.03]` + `border border-white/10` · `text-slate-900` → `text-slate-100` · `text-slate-600/700/800` → `text-slate-300` · `text-slate-400/500` → `text-slate-500` · `border-slate-100/200` → `border-white/10` · `bg-slate-100` → `bg-white/5` · `bg-{color}-50 text-{color}-700 border-{color}-200` → `bg-{color}-500/10 text-{color}-400 border-{color}-500/20` · `shadow-xl` → drop it (or use card-hover-glow).

**Key insight about themes:** the `:root` CSS variables in `index.css` are ALREADY dark ("Deep Void Theme"); `theme-light`/`page-bg-light` classes override them to light. Removing those classes from a page automatically makes every shadcn primitive (Button, Card, Badge, Checkbox, RadioGroup, Progress, Input, Tabs) render dark. Every page task below removes that class.

---

### Task 1: Dark color maps + dropcap CSS

**Files:**
- Create: `client/src/lib/editorial.ts`
- Modify: `client/src/index.css` (append inside `@layer components`)

- [ ] **Step 1: Create `client/src/lib/editorial.ts`**

```ts
// Dark-theme color maps for the plata editorial system.
// Category names match blog post categories stored in the DB.
export const categoryColorsDark: Record<string, string> = {
  'Comunidad': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Organización': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Despertar': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Servicio': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'Sistemas': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Diseño': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Amabilidad': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'Reflexión': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Decisión Colectiva': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
};

export const getCategoryColorDark = (category: string): string =>
  categoryColorsDark[category] || 'bg-white/5 text-slate-300 border-white/10';

export const levelColorsDark: Record<string, string> = {
  beginner: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  intermediate: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  advanced: 'bg-red-500/15 text-red-300 border border-red-500/30',
};
```

- [ ] **Step 2: Add dropcap utility to `client/src/index.css`**

Append at the end of the existing `@layer components` block (after `.journey-mapa`):

```css
  /* Editorial dropcap — first letter of the first paragraph (blog posts only) */
  .editorial-dropcap > div > p:first-of-type::first-letter {
    font-family: 'Playfair Display', Georgia, serif;
    float: left;
    font-size: 3.4em;
    line-height: 0.8;
    padding-right: 0.12em;
    padding-top: 0.08em;
    color: #f5f7fa;
  }
```

(The `> div >` accounts for MarkdownRenderer's wrapper div.)

- [ ] **Step 3: Verify**

Run: `cd SocialJusticeHub && npm run check` — Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add client/src/lib/editorial.ts client/src/index.css
git commit -m "feat: editorial dark color maps + dropcap utility"
```

---

### Task 2: MarkdownRenderer dark variant

**Files:**
- Modify: `client/src/components/MarkdownRenderer.tsx`

- [ ] **Step 1: Add `variant` prop with dark prose classes**

Replace the props interface (keep the parser functions at the top of the file unchanged):

```tsx
interface MarkdownRendererProps {
  content: string;
  className?: string;
  variant?: 'light' | 'dark';
}
```

Extract the current prose class string (lines 157–175) into a constant `LIGHT_PROSE` above the component, verbatim. Add `DARK_PROSE`:

```tsx
const DARK_PROSE = `prose prose-lg prose-invert max-w-none
  prose-headings:font-serif prose-headings:font-bold prose-headings:text-[#F5F7FA]
  prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8 prose-h1:leading-tight
  prose-h2:text-3xl prose-h2:mb-5 prose-h2:mt-10 prose-h2:leading-tight
  prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8 prose-h3:leading-snug
  prose-h4:text-xl prose-h4:mb-3 prose-h4:mt-6
  prose-p:text-[1.0625rem] prose-p:leading-[1.85] prose-p:mb-6 prose-p:text-slate-300
  prose-a:text-violet-400 prose-a:no-underline prose-a:font-semibold hover:prose-a:text-violet-300 hover:prose-a:underline
  prose-strong:text-slate-100 prose-strong:font-bold
  prose-em:text-slate-200 prose-em:italic
  prose-ul:my-6 prose-ul:space-y-2
  prose-ol:my-6 prose-ol:space-y-2
  prose-li:text-slate-300 prose-li:leading-relaxed
  prose-blockquote:border-l-2 prose-blockquote:border-l-slate-400/60 prose-blockquote:bg-white/[0.04]
  prose-blockquote:rounded-r-2xl prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:my-8
  prose-blockquote:font-serif prose-blockquote:text-slate-200 prose-blockquote:not-italic
  prose-code:text-sm prose-code:bg-white/10 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:font-mono prose-code:text-slate-200
  prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-white/10 prose-pre:text-slate-100 prose-pre:rounded-2xl prose-pre:p-6 prose-pre:overflow-x-auto
  prose-img:rounded-2xl prose-img:border prose-img:border-white/10 prose-img:my-8 prose-img:w-full
  prose-hr:border-0 prose-hr:h-px prose-hr:bg-gradient-to-r prose-hr:from-transparent prose-hr:via-slate-400/40 prose-hr:to-transparent prose-hr:my-10
`;
```

New component body:

```tsx
const MarkdownRenderer = ({ content, className = '', variant = 'light' }: MarkdownRendererProps) => {
  const parsedContent = useMemo(() => {
    if (!content) return '';
    const trimmed = content.trim();
    if (isLikelyHtml(trimmed)) {
      return trimmed;
    }
    return convertMarkdownToHtml(trimmed);
  }, [content]);

  const proseClasses = variant === 'dark' ? DARK_PROSE : LIGHT_PROSE;

  return (
    <div
      className={`${proseClasses} ${className}`}
      style={variant === 'light' ? { color: '#1e293b' } : undefined}
      dangerouslySetInnerHTML={{ __html: parsedContent }}
    />
  );
};
```

(Note: the inline `style={{ color: '#1e293b' }}` must only apply to the light variant — it would break dark text otherwise.)

- [ ] **Step 2: Verify** — `npm run check`, expected: no errors. (Default is `'light'`, so existing consumers are unaffected.)

- [ ] **Step 3: Commit**

```bash
git add client/src/components/MarkdownRenderer.tsx
git commit -m "feat: MarkdownRenderer dark editorial prose variant"
```

---

### Task 3: ReadingProgress component

**Files:**
- Create: `client/src/components/editorial/ReadingProgress.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

interface ReadingProgressProps {
  /** The element whose scroll-through defines 0–100% (the article body). */
  targetRef: RefObject<HTMLElement | null>;
}

/** Fixed top bar, plata→violeta gradient, tracks how far the reader has scrolled through the target. */
export default function ReadingProgress({ targetRef }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = targetRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) {
        setProgress(rect.top < 0 ? 100 : 0);
        return;
      }
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      setProgress((scrolled / total) * 100);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [targetRef]);

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-50 pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-slate-400 via-slate-200 to-[#7D5BDE] transition-[width] duration-100 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify** — `npm run check`, expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/editorial/ReadingProgress.tsx
git commit -m "feat: ReadingProgress plata-violeta bar"
```

---

### Task 4: ArticleTOC component (scroll-spy)

**Files:**
- Create: `client/src/components/editorial/ArticleTOC.tsx`

- [ ] **Step 1: Create the component**

It scans the rendered DOM (works for both markdown and pre-rendered HTML content), assigns ids to h2/h3, and highlights the active section. Renders nothing with fewer than 3 headings.

```tsx
import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { List, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

interface ArticleTOCProps {
  /** Container holding the rendered article (h2/h3 are collected from it). */
  containerRef: RefObject<HTMLElement | null>;
  /** Changes when content changes, to re-scan headings (pass the content string). */
  contentKey?: string;
  className?: string;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 64);

export default function ArticleTOC({ containerRef, contentKey, className }: ArticleTOCProps) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const headings = Array.from(container.querySelectorAll<HTMLElement>('h2, h3'));
    const seen = new Map<string, number>();
    const collected: TocItem[] = headings.map((h) => {
      let id = h.id || slugify(h.textContent || '') || 'seccion';
      const count = seen.get(id) ?? 0;
      seen.set(id, count + 1);
      if (count > 0) id = `${id}-${count}`;
      h.id = id;
      h.style.scrollMarginTop = '96px';
      return { id, text: h.textContent || '', level: h.tagName === 'H2' ? 2 : 3 };
    });
    setItems(collected);

    if (collected.length < 3) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -70% 0px' },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [containerRef, contentKey]);

  if (items.length < 3) return null;

  const list = (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'block border-l-2 py-1.5 text-sm leading-snug transition-colors',
              item.level === 2 ? 'pl-3' : 'pl-6',
              activeId === item.id
                ? 'border-[#7D5BDE] text-slate-100 font-medium'
                : 'border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/30',
            )}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <nav aria-label="Tabla de contenidos" className={className}>
      {/* Mobile: collapsible chip */}
      <div className="lg:hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-slate-300"
        >
          <span className="inline-flex items-center gap-2">
            <List className="h-4 w-4 text-[#7D5BDE]" />
            En esta página
          </span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', mobileOpen && 'rotate-180')} />
        </button>
        {mobileOpen && <div className="px-4 pb-4">{list}</div>}
      </div>

      {/* Desktop: sticky sidebar */}
      <div className="hidden lg:block">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          En esta página
        </p>
        {list}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Verify** — `npm run check`, expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/editorial/ArticleTOC.tsx
git commit -m "feat: ArticleTOC with scroll-spy"
```

---

### Task 5: RelatedPosts component

**Files:**
- Create: `client/src/components/editorial/RelatedPosts.tsx`

- [ ] **Step 1: Create the component**

Reuses the existing list endpoint `/api/blog/posts?category=X` (same one BlogVlog paginates) and `normalizeBlogReadTime` for real reading time.

```tsx
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ArrowUpRight, Clock } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { buildBlogPostPath, normalizeBlogReadTime } from '@shared/blog-seo';
import { getCategoryColorDark } from '@/lib/editorial';

interface RelatedPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  type: 'blog' | 'vlog';
  imageUrl?: string;
  publishedAt: string;
}

interface RelatedPostsProps {
  category: string;
  currentPostId: number;
}

export default function RelatedPosts({ category, currentPostId }: RelatedPostsProps) {
  const { data } = useQuery<RelatedPost[]>({
    queryKey: ['related-posts', category, currentPostId],
    queryFn: async () => {
      const params = new URLSearchParams({ page: '1', limit: '6', category });
      const response = await apiRequest('GET', `/api/blog/posts?${params}`);
      if (!response.ok) return [];
      return response.json();
    },
  });

  const related = (data || []).filter((p) => p.id !== currentPostId).slice(0, 3);
  if (related.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="mb-8 flex items-center gap-4">
        <h2 className="font-serif text-2xl font-bold text-slate-100">Seguí leyendo</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-slate-400/40 to-transparent" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((post) => (
          <Link key={post.id} href={buildBlogPostPath(post)}>
            <article className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05] hover:shadow-[0_0_40px_rgba(125,91,222,0.10)]">
              {post.imageUrl && (
                <div className="h-36 overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <span className={`mb-3 inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${getCategoryColorDark(post.category)}`}>
                  {post.category}
                </span>
                <h3 className="mb-2 font-serif text-lg font-bold leading-snug text-slate-100 transition-colors group-hover:text-white">
                  {post.title}
                </h3>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-400 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {normalizeBlogReadTime(post.content)} min lectura
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-slate-500 transition-all group-hover:translate-x-0.5 group-hover:text-violet-400" />
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify** — `npm run check`, expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/editorial/RelatedPosts.tsx
git commit -m "feat: RelatedPosts 'Seguí leyendo' section"
```

---

### Task 6: BlogVlog hub — dark editorial magazine

**Files:**
- Modify: `client/src/pages/BlogVlog.tsx`

All state/fetching/infinite-scroll logic (lines 46–207) stays unchanged. Only `FeaturedCard`, `GridCard`, and the `return` JSX change.

- [ ] **Step 1: Update imports**

Remove `FluidBackground` and `GlassCard` imports. Add:

```tsx
import { normalizeBlogReadTime } from '@shared/blog-seo';   // extend the existing @shared/blog-seo import
import { getCategoryColorDark } from '@/lib/editorial';
```

- [ ] **Step 2: Replace `FeaturedCard`**

Full-bleed editorial piece — image melts into the page background:

```tsx
  const FeaturedCard = ({ post }: { post: BlogPost }) => (
    <Link href={buildBlogPostPath(post)}>
      <div className="group relative flex min-h-[520px] cursor-pointer items-end overflow-hidden rounded-3xl border border-white/10 p-8 transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_60px_rgba(125,91,222,0.12)] md:p-12">
        <div className="absolute inset-0 bg-[#0d1117]">
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-4xl">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-full bg-[#7D5BDE] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              Destacado
            </span>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm ${getCategoryColorDark(post.category)}`}>
              {post.category}
            </span>
          </div>

          <h2 className="mb-5 font-serif text-4xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 pb-[0.1em] md:text-6xl">
            {post.title}
          </h2>

          <p className="mb-8 max-w-2xl text-lg text-slate-300 line-clamp-2 md:text-xl">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
            <span className="inline-flex items-center gap-2"><User className="h-4 w-4" />{post.author.name}</span>
            <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4" />{formatDate(post.publishedAt)}</span>
            <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4" />{normalizeBlogReadTime(post.content)} min lectura</span>
          </div>
        </div>
      </div>
    </Link>
  );
```

- [ ] **Step 3: Replace `GridCard`**

Keep the asymmetric `md:col-span-2` rule. Dark glass + glow:

```tsx
  const GridCard = ({ post, index }: { post: BlogPost, index: number }) => (
    <Link href={buildBlogPostPath(post)}>
      <div
        className={`group flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05] hover:shadow-[0_0_40px_rgba(125,91,222,0.10)] ${
          index % 3 === 0 && post.type !== 'vlog' ? 'md:col-span-2' : ''
        }`}
      >
        <div className="relative h-60 overflow-hidden">
          {post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt={post.title}
              loading="lazy"
              className="h-full w-full object-cover opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/[0.06] to-white/[0.02]">
              {post.type === 'vlog'
                ? <Play className="h-12 w-12 text-slate-600" />
                : <FileText className="h-12 w-12 text-slate-600" />}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 to-transparent" />
          <div className="absolute left-4 top-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-200 backdrop-blur-md">
              {post.type === 'vlog' ? <Play className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
              {post.type === 'vlog' ? 'Vlog' : 'Blog'}
            </span>
          </div>
        </div>

        <div className="flex flex-grow flex-col p-6">
          <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
            <span className={`rounded-full border px-2.5 py-0.5 font-semibold uppercase tracking-wider ${getCategoryColorDark(post.category)}`}>
              {post.category}
            </span>
            <span>•</span>
            <span>{formatDate(post.publishedAt)}</span>
            <span>•</span>
            <span>{normalizeBlogReadTime(post.content)} min</span>
          </div>

          <h3 className="mb-3 font-serif text-2xl font-bold leading-tight text-slate-100 transition-colors group-hover:text-white">
            {post.title}
          </h3>

          <p className="mb-6 flex-grow text-slate-400 line-clamp-3">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <LikeButton
              postId={post.id}
              initialLiked={post.userLiked || false}
              initialCount={post.likeCount ?? (post.likes || []).length}
              onLike={handleLike}
              onUnlike={handleLike}
              size="sm"
              showCount
            />
            <span className="inline-flex items-center text-sm font-medium text-violet-400 transition-transform group-hover:translate-x-1">
              Leer más <ArrowUpRight className="ml-1 h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
```

- [ ] **Step 4: Replace the page `return` shell**

Wrapper, hero, filters, vlog-coming-soon, skeletons, empty state. Keep all conditional logic identical — only classes/structure change:

- Wrapper div: `min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-violet-500/30` (remove `theme-light`, remove `<FluidBackground />`).
- Add ambient orbs right after the wrapper opens:

```tsx
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full bg-violet-500/[0.05] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[480px] w-[480px] translate-x-1/3 translate-y-1/3 rounded-full bg-blue-500/[0.04] blur-3xl" />
      </div>
```

(Make the wrapper `relative overflow-hidden` so the orbs clip correctly.)

- Hero section (same `SmoothReveal` structure, new classes):

```tsx
            <section className="mb-20 flex min-h-[40vh] flex-col items-center justify-center text-center">
              <SmoothReveal direction="up" className="mb-6">
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  <FileText className="h-4 w-4 text-[#7D5BDE]" />
                  <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">Blog & Vlog</span>
                </div>
              </SmoothReveal>
              <SmoothReveal direction="up" delay={0.1}>
                <h1 className="mb-6 font-serif text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 pb-[0.1em] md:text-7xl lg:text-8xl">
                  Crónicas del Despertar
                </h1>
              </SmoothReveal>
              <SmoothReveal direction="up" delay={0.2} className="max-w-2xl">
                <p className="text-xl font-light leading-relaxed text-slate-400 md:text-2xl">
                  Ideas para entender el presente, diseñar mejores decisiones y sostener acción colectiva con sentido.
                </p>
              </SmoothReveal>
            </section>
```

- Filter bar: replace `GlassCard` with a plain div using the sticky-filter-bar vocabulary. Same tabs/search/category logic:

```tsx
            <div className="sticky top-24 z-40 mb-12 py-4">
              <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 rounded-full border border-white/10 bg-[#0a0a0a]/80 p-2 shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl md:flex-row md:gap-4">
                <div className="flex shrink-0 rounded-full bg-white/5 p-1">
                  {(['all', 'blog', 'vlog'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-full px-6 py-1.5 text-sm font-medium transition-colors ${
                        activeTab === tab
                          ? 'bg-[#7D5BDE] text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tab === 'all' ? 'Todo' : tab === 'blog' ? 'Blog' : 'Vlog'}
                    </button>
                  ))}
                </div>

                <div className="hidden h-8 w-px bg-white/10 md:block" />

                <div className="relative w-full flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar tema, autor o categoría..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 w-full border-none bg-transparent pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:ring-0"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="hidden h-8 w-px bg-white/10 md:block" />

                <div className="hide-scrollbar flex max-w-[200px] shrink-0 gap-2 overflow-x-auto px-2 md:max-w-none">
                  {categories.slice(0, 4).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedCategory === cat
                          ? 'bg-slate-200 text-slate-900'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                      }`}
                    >
                      {cat === 'all' ? 'Todos' : cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
```

(This replaces the three near-identical `Button` tab elements with a map — same behavior. The `Button`, `Badge`, `Input` imports may become unused; remove any that are.)

- Vlog coming-soon block: icon circle → `bg-[#7D5BDE]/10` with `Video` icon `text-violet-400`; `h2` uses plata-title classes (`text-3xl md:text-4xl`); paragraphs `text-slate-400` / `text-slate-500`.
- Skeletons: `h-96 bg-white/5 rounded-3xl animate-pulse`.
- Infinite-scroll loader: `text-slate-500` spinner (keep the `ref` + conditional).
- Empty state: text `text-slate-400`; the "Limpiar filtros" Button keeps `variant="link"` plus `className="text-violet-400"`.
- `main` keeps `relative z-10 container mx-auto px-4 pt-24 pb-20`.

- [ ] **Step 5: Verify** — `npm run check`, expected: no errors. Then `npm run dev` + preview `/blog-vlog`: dark hero, glass cards, working filters/infinite scroll.

- [ ] **Step 6: Commit**

```bash
git add client/src/pages/BlogVlog.tsx
git commit -m "feat: redesign BlogVlog — dark editorial magazine hub"
```

---

### Task 7: BlogPostDetail — immersive dark reading

**Files:**
- Modify: `client/src/pages/BlogPostDetail.tsx`
- Modify: `client/src/components/CommentsSection.tsx` (dark restyle via mapping table)

All fetching/like/bookmark/comment handlers stay unchanged.

- [ ] **Step 1: Update imports and remove dead code**

```tsx
import ReadingProgress from '@/components/editorial/ReadingProgress';
import ArticleTOC from '@/components/editorial/ArticleTOC';
import RelatedPosts from '@/components/editorial/RelatedPosts';
import { getCategoryColorDark } from '@/lib/editorial';
```

Delete: the `readProgress` state, the scroll-progress `useEffect` (lines 109–126), the local `categoryColors` map and `getCategoryColor` (lines 272–286) — replaced by `getCategoryColorDark`. Keep `contentRef`.

- [ ] **Step 2: Dark loading state**

```tsx
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans">
        <Header />
        <div className="container mx-auto max-w-4xl px-4 pt-32 pb-20">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-32 rounded-full bg-white/5" />
            <div className="h-12 w-3/4 rounded-2xl bg-white/5" />
            <div className="h-6 w-1/2 rounded-2xl bg-white/5" />
            <div className="mt-10 h-64 rounded-2xl bg-white/5" />
            <div className="h-4 w-full rounded bg-white/5" />
            <div className="h-4 w-full rounded bg-white/5" />
            <div className="h-4 w-3/4 rounded bg-white/5" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }
```

- [ ] **Step 3: Dark error state**

```tsx
  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans">
        <Header />
        <div className="relative overflow-hidden pt-40 pb-32">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full bg-violet-500/[0.06] blur-3xl" aria-hidden />
          <div className="container relative z-10 mx-auto max-w-4xl px-4 text-center">
            <h1 className="mb-4 font-serif text-3xl font-bold text-slate-100">
              {error || 'Post no encontrado'}
            </h1>
            <p className="mb-8 text-slate-400">
              El artículo que buscás no existe o fue movido.
            </p>
            <Link href={BLOG_HUB_PATH}>
              <Button className="bg-[#7D5BDE] text-white hover:bg-[#8d6ee6]">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
```

- [ ] **Step 4: Replace the main `return`**

Single actions row (duplication removed), two-column body with TOC, dropcap, related posts:

```tsx
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-violet-500/30">
      <Header />
      <ReadingProgress targetRef={contentRef} />

      {/* Hero — ambient image backdrop melting into the page */}
      <div className="relative overflow-hidden pt-28 pb-16">
        {post.imageUrl ? (
          <div className="absolute inset-0" aria-hidden>
            <img
              src={post.imageUrl}
              alt=""
              className="h-full w-full scale-110 object-cover opacity-25 blur-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-[#0a0a0a]/80 to-[#0a0a0a]" />
          </div>
        ) : (
          <div className="pointer-events-none absolute -top-32 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full bg-violet-500/[0.06] blur-3xl" aria-hidden />
        )}

        <div className="container relative z-10 mx-auto max-w-4xl px-4">
          {/* Breadcrumb */}
          <motion.nav
            className="mb-6 flex items-center gap-2 text-sm text-slate-500"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link href="/" className="transition-colors hover:text-slate-300">Inicio</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/recursos" className="transition-colors hover:text-slate-300">Recursos</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={collectionPath} className="transition-colors hover:text-slate-300">{collectionLabel}</Link>
          </motion.nav>

          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="mb-8"
          >
            <Link href={collectionPath}>
              <span className="group inline-flex cursor-pointer items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-200">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Volver a {collectionLabel}
              </span>
            </Link>
          </motion.div>

          {/* Badges */}
          <motion.div
            className="mb-5 flex items-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${
              post.type === 'vlog'
                ? 'border-red-500/30 bg-red-500/15 text-red-300'
                : 'border-white/15 bg-white/10 text-slate-200'
            }`}>
              {post.type === 'vlog' ? <Play className="h-3 w-3" /> : <BookOpen className="h-3 w-3" />}
              {post.type === 'vlog' ? 'Vlog' : 'Blog'}
            </span>
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${getCategoryColorDark(post.category)}`}>
              {post.category}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="mb-5 font-serif text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.15] text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 pb-[0.1em]"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {post.title}
          </motion.h1>

          {/* Excerpt */}
          <motion.p
            className="mb-8 max-w-3xl text-lg leading-relaxed text-slate-400 md:text-xl"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {post.excerpt}
          </motion.p>

          {/* Meta row */}
          <motion.div
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4" />{post.author.name}</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatDate(post.publishedAt)}</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />{estimateReadTime(renderedContent)}</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span className="inline-flex items-center gap-1.5"><Eye className="h-4 w-4" />{post.viewCount} vistas</span>
          </motion.div>
        </div>
      </div>

      <main className="container relative z-10 mx-auto px-4 pb-24">
        <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-12">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="min-w-0 max-w-3xl lg:mx-auto"
          >
            {/* Featured image (blog) */}
            {post.imageUrl && post.type === 'blog' && (
              <img
                src={post.imageUrl}
                alt={post.title}
                className="mb-2 h-64 w-full rounded-2xl border border-white/10 object-cover md:h-96"
              />
            )}

            {/* Video embed (vlog) */}
            {post.type === 'vlog' && post.videoUrl && (
              <div className="mb-2 overflow-hidden rounded-2xl border border-white/10">
                <YouTubeEmbed videoId={post.videoUrl} title={post.title} className="rounded-none" />
              </div>
            )}

            <BlogMediaSection slug={post.slug} />

            {/* Mobile TOC */}
            <div className="mt-8 lg:hidden">
              <ArticleTOC containerRef={contentRef} contentKey={renderedContent} />
            </div>

            {/* Article body */}
            <div ref={contentRef} className="editorial-dropcap mt-10">
              <MarkdownRenderer
                variant="dark"
                content={renderedContent}
                className="blog-content
                  prose-table:w-full prose-table:my-6
                  prose-th:bg-white/5 prose-th:font-semibold prose-th:p-3 prose-th:text-left prose-th:text-slate-200
                  prose-td:p-3 prose-td:border-t prose-td:border-white/10
                "
              />
            </div>

            {/* Single actions row */}
            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8">
              <div className="flex flex-wrap items-center gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-400"
                  >
                    <Tag className="h-3 w-3" />
                    {tag.tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <LikeButton
                  postId={post.id}
                  initialLiked={post.userLiked || false}
                  initialCount={post.likeCount ?? post.likes.length}
                  onLike={handleLike}
                  onUnlike={handleLike}
                  size="sm"
                  showCount
                />
                <BookmarkButton
                  postId={post.id}
                  initialBookmarked={post.userBookmarked || false}
                  onBookmark={handleBookmark}
                  onUnbookmark={handleBookmark}
                  size="sm"
                />
                <ShareButtons
                  url={canonicalUrl}
                  title={post.title}
                  description={post.excerpt}
                  hashtags={post.tags.map(tag => tag.tag)}
                  size="sm"
                  variant="ghost"
                  showLabel={false}
                />
              </div>
            </div>
          </motion.article>

          {/* Desktop TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <ArticleTOC containerRef={contentRef} contentKey={renderedContent} />
            </div>
          </aside>
        </div>

        <div className="mx-auto max-w-3xl">
          <RelatedPosts category={post.category} currentPostId={post.id} />

          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <CommentsSection
              postId={post.id}
              comments={post.comments}
              onAddComment={handleAddComment}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
              currentUserId={1}
            />
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
```

- [ ] **Step 5: Restyle `CommentsSection.tsx` dark**

Open `client/src/components/CommentsSection.tsx` and apply the **light→dark mapping table** from the plan header to every className (container cards, comment bubbles, textarea, buttons, author names, timestamps). Textareas/inputs: `bg-white/5 border-white/10 text-slate-200 placeholder-slate-500`. Primary submit button: violet CTA classes. Do not change any handler/prop logic.

- [ ] **Step 6: Verify** — `npm run check`, then preview a post at `/recursos/blog/<slug>`: hero backdrop, TOC scroll-spy (≥3 headings), dropcap, single actions row, related posts, dark comments.

- [ ] **Step 7: Commit**

```bash
git add client/src/pages/BlogPostDetail.tsx client/src/components/CommentsSection.tsx
git commit -m "feat: redesign BlogPostDetail — immersive dark reading with TOC + related posts"
```

---

### Task 8: StudyGuides hub — dark library

**Files:**
- Modify: `client/src/pages/StudyGuides.tsx`

Logic (queries, grouping, stats) unchanged. `categoryMeta` accents brighten for dark; `CourseCard` and page shell restyle.

- [ ] **Step 1: Update imports + categoryMeta**

Remove `FluidBackground`/`GlassCard` imports. Add `import { levelColorsDark } from '@/lib/editorial';`.

Replace `categoryMeta` accents with dark-friendly (Tailwind `-400`) hex values:

```tsx
const categoryMeta: Record<string, { icon: LucideIcon; color: string; accent: string }> = {
  vision:        { icon: Eye,           color: 'text-emerald-400', accent: '#34d399' },
  action:        { icon: Zap,           color: 'text-amber-400',   accent: '#fbbf24' },
  community:     { icon: Users,         color: 'text-blue-400',    accent: '#60a5fa' },
  reflection:    { icon: Brain,         color: 'text-purple-400',  accent: '#c084fc' },
  'hombre-gris': { icon: User,          color: 'text-slate-300',   accent: '#cbd5e1' },
  economia:      { icon: TrendingUp,    color: 'text-green-400',   accent: '#4ade80' },
  comunicacion:  { icon: MessageSquare, color: 'text-cyan-400',    accent: '#22d3ee' },
  civica:        { icon: Landmark,      color: 'text-red-400',     accent: '#f87171' },
};
```

(The `gradient` field is unused after this redesign — remove it and any references.)

- [ ] **Step 2: Replace `CourseCard`**

```tsx
function CourseCard({ course, accentColor }: { course: Course; accentColor: string }) {
  const isCompleted = course.userProgress?.status === 'completed';
  const isInProgress = course.userProgress?.status === 'in_progress';
  const progress = course.userProgress?.progress || 0;

  return (
    <motion.div variants={fadeUp} className="h-full">
      <Link href={`/recursos/guias-estudio/${course.slug}`}>
        <div className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05] hover:shadow-[0_0_40px_rgba(125,91,222,0.10)]">

          {/* Thumbnail */}
          <div className="relative h-44 overflow-hidden">
            {course.thumbnailUrl ? (
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                loading="lazy"
                className="h-full w-full object-cover opacity-80 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${accentColor}14, ${accentColor}05)` }}
              >
                <GraduationCap className="h-14 w-14 opacity-25" style={{ color: accentColor }} />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/70 via-transparent to-transparent" />

            {/* Level badge */}
            <div className="absolute left-3 top-3">
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-md ${levelColorsDark[course.level] || 'border border-white/15 bg-white/10 text-slate-200'}`}>
                {getLevelLabel(course.level)}
              </span>
            </div>

            {/* Completed badge */}
            {isCompleted && (
              <div className="absolute right-3 top-3">
                <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 backdrop-blur-md">
                  <CheckCircle2 className="h-3 w-3" /> Completado
                </span>
              </div>
            )}

            {/* Bottom metadata on image */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
              {course.duration && (
                <span className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[11px] font-medium text-slate-200 backdrop-blur-sm">
                  <Clock className="h-3 w-3" />
                  {formatDuration(course.duration)}
                </span>
              )}
              {course.lessonCount != null && course.lessonCount > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[11px] font-medium text-slate-200 backdrop-blur-sm">
                  <BookOpen className="h-3 w-3" />
                  {course.lessonCount} lecciones
                </span>
              )}
              {course.hasQuiz && (
                <span className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[11px] font-medium text-slate-200 backdrop-blur-sm">
                  <Award className="h-3 w-3" />
                  Quiz
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-5">
            <div className="mb-3">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider"
                style={{ backgroundColor: `${accentColor}14`, color: accentColor }}
              >
                {getCategoryLabel(course.category)}
              </span>
            </div>

            <h3 className="mb-2 font-serif text-lg font-bold leading-snug text-slate-100 transition-colors group-hover:text-white">
              {course.title}
            </h3>

            <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-400">
              {course.description}
            </p>

            {/* Progress (violet = action) */}
            {isInProgress && (
              <div className="mb-4">
                <div className="mb-1.5 flex justify-between text-xs font-medium text-violet-300">
                  <span>En progreso</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#7D5BDE] to-violet-400 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3">
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                {isInProgress ? (
                  <>
                    <PlayCircle className="h-3.5 w-3.5 text-violet-400" />
                    <span className="font-medium text-violet-300">Continuar</span>
                  </>
                ) : isCompleted ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="font-medium text-emerald-300">Repasar</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-3.5 w-3.5" />
                    Comenzar
                  </>
                )}
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-slate-500 transition-all duration-300 group-hover:bg-[#7D5BDE] group-hover:text-white">
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
```

- [ ] **Step 3: Restyle the page shell**

- Wrapper: `min-h-screen bg-[#0a0a0a] text-slate-200 font-sans overflow-hidden selection:bg-violet-500/30 relative` (no `theme-light`, no `FluidBackground`). Add the two ambient orbs (same snippet as Task 6 Step 4).
- Hero: pill badge → `border border-white/10 bg-white/5` with `GraduationCap` `text-[#7D5BDE]` and label `text-slate-400`; `h1` → plata-title classes (keep responsive sizes, drop the emerald/cyan span); subtitle → `text-slate-400`.
- Stats row: numbers `font-serif text-3xl font-bold text-slate-100`, labels `text-sm text-slate-500`. (Drop the per-stat emerald/cyan/blue colors — plata identity.)
- Continue-learning banner: replace `GlassCard` with:

```tsx
              <Link href={`/recursos/guias-estudio/${inProgressCourse.slug}`}>
                <div className="group cursor-pointer rounded-2xl border border-[#7D5BDE]/25 bg-[#7D5BDE]/[0.07] p-6 transition-all duration-300 hover:border-[#7D5BDE]/40 hover:shadow-[0_0_40px_rgba(125,91,222,0.12)]">
                  <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7D5BDE]/15">
                        <PlayCircle className="h-6 w-6 text-violet-300" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-violet-300">Continuá donde dejaste</p>
                        <h3 className="truncate font-serif text-lg font-bold text-slate-100">{inProgressCourse.title}</h3>
                      </div>
                    </div>
                    <div className="flex w-full items-center gap-4 md:w-auto">
                      <div className="flex-1 md:w-32">
                        <div className="mb-1 flex justify-between text-xs font-medium text-violet-300">
                          <span>{inProgressCourse.userProgress?.progress || 0}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-gradient-to-r from-[#7D5BDE] to-violet-400 transition-all" style={{ width: `${inProgressCourse.userProgress?.progress || 0}%` }} />
                        </div>
                      </div>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-violet-300 transition-all group-hover:bg-[#7D5BDE] group-hover:text-white">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
```

- Filter bar: replace `GlassCard` with `div` using sticky-filter-bar classes (`rounded-2xl`, keep `max-w-5xl mx-auto p-3 flex flex-col items-center gap-3`); search input → `bg-white/5 border border-white/10 focus:border-[#7D5BDE]/60 focus:ring-2 focus:ring-[#7D5BDE]/20 text-slate-200 placeholder-slate-500 rounded-full pl-11 pr-4 h-11 outline-none transition-colors`; category buttons container → `bg-white/5 p-1 rounded-full overflow-x-auto max-w-full hide-scrollbar flex`; active button → `bg-[#7D5BDE] text-white`, inactive → `text-slate-400 hover:text-slate-200`.
- Loader spinner: `text-violet-400`. Empty state: icon circle `bg-white/5`, icon `text-slate-500`, title `text-slate-100`, text `text-slate-400`; button keeps `variant="outline"` (now dark via CSS vars) + `className="rounded-full"`.
- Category section headers: icon container `style={{ backgroundColor: \`${meta?.accent || '#94a3b8'}14\` }}`; `h2` → `font-serif text-xl font-bold text-slate-100`; count `text-sm text-slate-500`; divider → `ml-4 h-px flex-1 bg-gradient-to-r from-slate-400/30 to-transparent`.

- [ ] **Step 4: Verify** — `npm run check`, preview `/recursos/guias-estudio`: dark library, violet progress, category sections.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/StudyGuides.tsx
git commit -m "feat: redesign StudyGuides — dark library hub"
```

---

### Task 9: CourseDetail — vertical lesson timeline

**Files:**
- Modify: `client/src/pages/CourseDetail.tsx`

Replaces the Tabs (Contenido/Información/Quiz) with a single timeline flow; the "Información" tab content (just `course.description` repeated) is dropped; the quiz becomes the final timeline node. All queries/mutations/locking helpers unchanged.

- [ ] **Step 1: Update imports**

Remove: `Tabs, TabsContent, TabsList, TabsTrigger`, `LessonCard`, `ProgressBar`, `ListChecks`, `Card, CardContent, CardDescription, CardHeader, CardTitle`, `Badge`. Add: `Lock`, `Check`, `ChevronRight` to the `lucide-react` import; `levelColorsDark` from `@/lib/editorial`; `formatDuration` joins the existing `@/lib/course-utils` import. Delete the unused `activeTab` state.

- [ ] **Step 2: Dark loading/error states**

Same pattern as Task 7 Steps 2–3: wrapper `min-h-screen bg-[#0a0a0a] text-slate-200 font-sans`, loading spinner `animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D5BDE]`, error text `text-red-400`, outline Button back-link (dark via CSS vars).

- [ ] **Step 3: Replace the main `return`**

```tsx
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans selection:bg-violet-500/30">
      <Header />

      <main className="container relative mx-auto px-4 pt-28 pb-24">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-violet-500/[0.05] blur-3xl" aria-hidden />

        {/* Breadcrumb */}
        <div className="relative z-10 mx-auto mb-8 max-w-6xl">
          <Link href="/recursos/guias-estudio">
            <span className="group inline-flex cursor-pointer items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-200">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Volver a Rutas de Transformación
            </span>
          </Link>
        </div>

        <div className="relative z-10 mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
          {/* Main column */}
          <div className="lg:col-span-2">
            {/* Header card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8"
            >
              {course.thumbnailUrl && (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="mb-6 h-64 w-full rounded-2xl border border-white/10 object-cover"
                />
              )}

              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#7D5BDE]/25 bg-[#7D5BDE]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-violet-300">
                  {getCategoryLabel(course.category)}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] ${levelColorsDark[course.level] || 'border border-white/15 bg-white/10 text-slate-200'}`}>
                  {getLevelLabel(course.level)}
                </span>
                {course.isFeatured && (
                  <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-300">
                    Destacado
                  </span>
                )}
              </div>

              <h1 className="mb-3 font-serif text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 pb-[0.1em] md:text-4xl">
                {course.title}
              </h1>
              <p className="text-lg text-slate-400">
                {course.description}
              </p>

              {courseSummary && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
                    En síntesis
                  </p>
                  <p className="text-sm leading-relaxed text-slate-300">
                    {courseSummary}
                  </p>
                </div>
              )}

              {isInProgress && (
                <div className="mt-5">
                  <div className="mb-1.5 flex justify-between text-xs font-medium text-violet-300">
                    <span>Tu avance</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#7D5BDE] to-violet-400 transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                {course.duration && (
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span>{formatDuration(course.duration)}</span></div>
                )}
                <div className="flex items-center gap-2"><BookOpen className="h-4 w-4" /><span>{course.viewCount} vistas</span></div>
                {course.author && (
                  <div className="flex items-center gap-2"><User className="h-4 w-4" /><span>{course.author.name}</span></div>
                )}
                {course.lastReviewedAt && (
                  <div className="flex items-center gap-2"><FileText className="h-4 w-4" /><span>Revisado {new Date(course.lastReviewedAt).toLocaleDateString('es-AR')}</span></div>
                )}
              </div>

              {/* Action button — copy the EXACT same conditional structure from the
                  current file lines 326–388 (isLoggedIn → completed / in-progress / start;
                  else requiresAuth check). Only class changes:
                  - every primary <Button>: className="gap-2 bg-[#7D5BDE] text-white hover:bg-[#8d6ee6]"
                  - every outline <Button>: keep variant="outline" (dark via CSS vars)
                  - "Regístrate gratis..." helper <p>: className="text-sm text-slate-500" */}
              <div className="mt-6">
                {/* ...same logic as current lines 326–388, with the class changes above... */}
              </div>
            </motion.div>

            {/* Timeline */}
            <section>
              <div className="mb-8 flex items-center gap-4">
                <h2 className="font-serif text-2xl font-bold text-slate-100">Recorrido del curso</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-slate-400/40 to-transparent" />
              </div>

              {lessons.length === 0 ? (
                <p className="text-slate-400">No hay lecciones disponibles aún.</p>
              ) : (
                <div className="relative">
                  <div className="absolute bottom-6 left-5 top-6 w-px bg-white/10" aria-hidden />
                  <ol className="space-y-3">
                    {lessons.map((lesson, index) => {
                      const lessonCompleted = completedLessons.includes(lesson.id);
                      const isCurrent = userProgress?.currentLessonId === lesson.id;
                      const locked = isLessonLocked(lesson, lessonAccessContext);

                      const node = lessonCompleted ? (
                        <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7D5BDE] text-white">
                          <Check className="h-5 w-5" />
                        </div>
                      ) : locked ? (
                        <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#16161d] text-slate-600">
                          <Lock className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          isCurrent
                            ? 'border-2 border-[#7D5BDE] bg-[#7D5BDE]/10 text-violet-300'
                            : 'border border-white/15 bg-[#16161d] text-slate-300'
                        }`}>
                          {index + 1}
                        </div>
                      );

                      const card = (
                        <div className={`flex-1 rounded-2xl border p-5 transition-all duration-300 ${
                          locked
                            ? 'border-white/5 bg-white/[0.015]'
                            : isCurrent
                              ? 'border-[#7D5BDE]/40 bg-[#7D5BDE]/[0.06] hover:border-[#7D5BDE]/60'
                              : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                        }`}>
                          <div className="flex items-center justify-between gap-3">
                            <h3 className={`font-semibold leading-snug ${locked ? 'text-slate-600' : 'text-slate-100'}`}>
                              {lesson.title}
                            </h3>
                            {!locked && <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />}
                          </div>
                          {lesson.description && !locked && (
                            <p className="mt-1 text-sm leading-relaxed text-slate-400 line-clamp-2">{lesson.description}</p>
                          )}
                          <div className={`mt-2 flex items-center gap-3 text-xs ${locked ? 'text-slate-700' : 'text-slate-500'}`}>
                            {lesson.duration && (
                              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{lesson.duration} min</span>
                            )}
                            {lesson.isRequired && <span>Requerida</span>}
                            {locked && <span>Se desbloquea completando las lecciones anteriores</span>}
                          </div>
                        </div>
                      );

                      return (
                        <li key={lesson.id} className="flex items-start gap-4">
                          {locked ? (
                            <>{node}{card}</>
                          ) : (
                            <>
                              {node}
                              <Link href={`/recursos/guias-estudio/${course.slug}/leccion/${lesson.id}`} className="flex-1 cursor-pointer">
                                {card}
                              </Link>
                            </>
                          )}
                        </li>
                      );
                    })}

                    {/* Quiz — final node */}
                    {quiz && (
                      <li className="flex items-start gap-4">
                        <div className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          canTakeQuiz
                            ? 'border-2 border-[#7D5BDE] bg-[#7D5BDE]/10 text-violet-300'
                            : 'border border-white/10 bg-[#16161d] text-slate-600'
                        }`}>
                          <Award className="h-5 w-5" />
                        </div>
                        <div className={`flex-1 rounded-2xl border p-5 ${
                          canTakeQuiz ? 'border-[#7D5BDE]/40 bg-[#7D5BDE]/[0.06]' : 'border-white/5 bg-white/[0.015]'
                        }`}>
                          <h3 className={`font-semibold ${canTakeQuiz ? 'text-slate-100' : 'text-slate-600'}`}>
                            {quiz.title}
                          </h3>
                          <p className={`mt-1 text-sm ${canTakeQuiz ? 'text-slate-400' : 'text-slate-700'}`}>
                            {quiz.questions.length} preguntas · mínimo {quiz.passingScore}% para aprobar
                            {quiz.timeLimit ? ` · ${quiz.timeLimit} min` : ''}
                          </p>
                          <div className="mt-3">
                            {canTakeQuiz ? (
                              <Link href={`/recursos/guias-estudio/${course.slug}/quiz`}>
                                <Button size="sm" className="gap-2 bg-[#7D5BDE] text-white hover:bg-[#8d6ee6]">
                                  <Award className="h-4 w-4" />
                                  Tomar Quiz
                                </Button>
                              </Link>
                            ) : (
                              <p className="text-xs text-slate-600">
                                {safeUserContext.isLoggedIn
                                  ? 'Completá las lecciones requeridas para desbloquear el quiz'
                                  : 'Iniciá sesión para tomar el quiz'}
                              </p>
                            )}
                          </div>
                        </div>
                      </li>
                    )}
                  </ol>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {safeUserContext.isLoggedIn && userProgress && (
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                  <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold text-slate-100">
                    <GraduationCap className="h-5 w-5 text-violet-400" />
                    Tu progreso
                  </h3>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#7D5BDE] to-violet-400 transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Lecciones completadas</span>
                      <span className="font-medium text-slate-200">{completedLessons.length} / {lessons.length}</span>
                    </div>
                    {continueLessonId && (
                      <div className="text-slate-500">
                        Seguir con: <span className="text-slate-300">{lessons.find(l => l.id === continueLessonId)?.title}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="mb-4 font-serif text-lg font-bold text-slate-100">Información del curso</h3>
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="mb-1 text-slate-500">Categoría</dt>
                    <dd><span className="rounded-full border border-[#7D5BDE]/25 bg-[#7D5BDE]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-violet-300">{getCategoryLabel(course.category)}</span></dd>
                  </div>
                  <div>
                    <dt className="mb-1 text-slate-500">Nivel</dt>
                    <dd><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] ${levelColorsDark[course.level] || 'border border-white/15 bg-white/10 text-slate-200'}`}>{getLevelLabel(course.level)}</span></dd>
                  </div>
                  {course.duration && (
                    <div>
                      <dt className="mb-1 text-slate-500">Duración estimada</dt>
                      <dd className="font-medium text-slate-200">{formatDuration(course.duration)}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="mb-1 text-slate-500">Lecciones</dt>
                    <dd className="font-medium text-slate-200">{lessons.length} lecciones</dd>
                  </div>
                  {quiz && (
                    <div>
                      <dt className="mb-1 text-slate-500">Quiz incluido</dt>
                      <dd className="font-medium text-slate-200">Sí ({quiz.questions.length} preguntas)</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
```

For the action-button block (commented placeholder above): copy the existing conditional from current lines 326–388 verbatim, changing only the primary Buttons to `className="gap-2 bg-[#7D5BDE] text-white hover:bg-[#8d6ee6]"` and the helper `<p>` to `text-sm text-slate-500`.

- [ ] **Step 4: Verify** — `npm run check`, preview a course page: timeline states (completed/current/locked), sidebar, CTA.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/CourseDetail.tsx
git commit -m "feat: redesign CourseDetail — dark lesson timeline"
```

---

### Task 10: LessonView — focus mode

**Files:**
- Modify: `client/src/pages/LessonView.tsx`

Keep the `lg:grid-cols-4` structure, time tracking, completion mutation, scroll behavior. Restyle dark + add ArticleTOC to the sidebar.

- [ ] **Step 1: Imports**

Add: `import ArticleTOC from '@/components/editorial/ArticleTOC';`. Remove the `Card, CardContent` import (replaced by plain divs).

- [ ] **Step 2: Restyle**

- Both early-return and main wrappers: `min-h-screen bg-[#0a0a0a] text-slate-200 font-sans` (replace `page-bg-light`); "Lección no encontrada" → `text-slate-400`.
- Breadcrumb/prev/next row: "Volver al Curso" → same back-link pattern as Task 9; prev/next keep `variant="outline" size="sm"` Buttons (dark via CSS vars).
- Lesson header card (`Card` → `div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6"`):
  - type Badge → `border-white/15 bg-white/5 text-slate-300` (keep tracking/uppercase classes); duration text → `text-slate-500`; type icon wraps in `<span className="text-violet-400">`.
  - `h1` → `font-serif text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 pb-[0.1em] mb-2`.
  - description → `text-slate-400`.
  - "En síntesis" box → `border-white/10 bg-white/[0.04]`, label `text-violet-300`, body `text-slate-300`.
- Lesson content card → `div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8"` (keep `ref={lessonContentRef}` — move the ref onto this div since `Card` is gone):
  - Locked box → `border-amber-500/25 bg-amber-500/[0.07]`, label `text-amber-300`, body `text-slate-300`; "Ir a la lección disponible" Button → violet CTA classes; "Volver al curso" keeps `variant="outline"`.
  - Text lessons: `<MarkdownRenderer variant="dark" content={currentLesson.content} className="lesson-rich-text" />` (all three MarkdownRenderer call sites).
  - Video: wrap `VideoPlayer` in `<div className="overflow-hidden rounded-2xl border border-white/10">`.
  - Interactive placeholder box → `border-white/10 bg-white/[0.04]`, texts `text-slate-300`/`text-slate-500`.
  - Document link → `text-violet-400 hover:text-violet-300`.
- Complete-lesson card (`Card` → glass div): label `text-slate-200`; "Continuar al siguiente"/"Ir al Quiz Final" Buttons → violet CTA classes; "Tu progreso se guarda automáticamente" → `text-xs text-slate-600 mt-2`.
- Sidebar: lessons-list card → glass div (`rounded-3xl border border-white/10 bg-white/[0.03] p-4`); heading `font-semibold mb-4 text-slate-100`; item states:
  - locked: `opacity-50 cursor-not-allowed border-white/5 bg-white/[0.015]`
  - current: `border-[#7D5BDE]/50 bg-[#7D5BDE]/10` + title `text-violet-200`
  - completed: `border-emerald-500/25 bg-emerald-500/[0.06]` + title `text-emerald-200`, check `text-emerald-400`
  - default: `border-white/10 hover:border-white/25 hover:bg-white/[0.04]` + title `text-slate-300`
- Below the lessons card, inside the same sticky container, add the TOC (text lessons only):

```tsx
              {currentLesson.type === 'text' && !currentLessonLocked && (
                <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <ArticleTOC containerRef={lessonContentRef} contentKey={currentLesson.content} />
                </div>
              )}
```

- [ ] **Step 3: Verify** — `npm run check`, preview a text lesson: dark prose, TOC in sidebar, prev/next, completion checkbox.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/LessonView.tsx
git commit -m "feat: redesign LessonView — dark focus mode with TOC"
```

---

### Task 11: QuizQuestion dark variant + QuizView redesign

**Files:**
- Modify: `client/src/components/QuizQuestion.tsx`
- Modify: `client/src/pages/QuizView.tsx`

- [ ] **Step 1: QuizQuestion `variant` prop**

Add `variant?: 'light' | 'dark'` (default `'light'`) to `QuizQuestionProps` and destructure it as `const isDark = variant === 'dark';`. Apply per-variant classes — dark values:

- Label option states (multiple_choice AND true_false branches):
  - base: `border-white/10 text-slate-200 hover:border-white/25`
  - selected (no result): `border-[#7D5BDE] bg-[#7D5BDE]/10`
  - correct: `border-emerald-500/60 bg-emerald-500/10`
  - wrong selected: `border-red-500/60 bg-red-500/10`
  - result icons: `text-emerald-400` / `text-red-400`
- short_answer Input: base `bg-white/5 border-white/10 text-slate-200 placeholder-slate-500`; correct `border-emerald-500/60 bg-emerald-500/10`; wrong `border-red-500/60 bg-red-500/10`.
- Outer `Card` → when dark, render `<div className="rounded-2xl border border-white/10 bg-white/[0.03]">` instead (conditional wrapper); question `h3` → `text-slate-100`; "Puntos" → `text-slate-500`; header result icons `text-emerald-400`/`text-red-400`.
- Explanation box → dark: `border-blue-500/25 bg-blue-500/10`, title `text-blue-300`, body `text-blue-200/90`.

Implementation pattern (keeps light behavior byte-identical):

```tsx
// example for an option Label:
className={cn(
  'flex-1 cursor-pointer p-3 rounded-lg border-2 transition-colors',
  isDark && 'border-white/10 text-slate-200 hover:border-white/25',
  isSelected && !showResult && (isDark ? 'border-[#7D5BDE] bg-[#7D5BDE]/10' : 'border-blue-500 bg-blue-50'),
  showResult && isCorrectOption && (isDark ? 'border-emerald-500/60 bg-emerald-500/10' : 'border-green-500 bg-green-50'),
  showResult && isSelected && !isCorrectOption && (isDark ? 'border-red-500/60 bg-red-500/10' : 'border-red-500 bg-red-50'),
)}
```

- [ ] **Step 2: QuizView dark redesign**

All four early returns + main wrapper: `min-h-screen bg-[#0a0a0a] text-slate-200 font-sans` (drop `bg-gray-50` and `theme-light`). Early-return Cards → glass divs (`rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center`), body text `text-slate-400`, Buttons → violet CTA.

**Instructions state:** glass card `mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/[0.03] p-8`; title → `font-serif text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 pb-[0.1em] mb-2`; description `text-slate-400`. Replace the blue instructions box with a pills row:

```tsx
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">{questions.length} preguntas</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">Mínimo {quiz.passingScore}%</span>
                    {quiz.timeLimit && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">{quiz.timeLimit} minutos</span>
                    )}
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">Reintentos: {quiz.allowRetakes ? 'Sí' : 'No'}</span>
                    {quiz.maxAttempts && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300">Máx. {quiz.maxAttempts} intentos</span>
                    )}
                  </div>
```

"Comenzar Quiz" Button → violet CTA.

**Taking state:** card → glass div `mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/[0.03]` with inner padding divs replacing CardHeader/CardContent; title `font-serif text-2xl font-bold text-slate-100`; "Pregunta X de Y" `text-slate-500`; timer `text-slate-200` (add: turns `text-red-400` when `timeRemaining !== null && timeRemaining < 60`). Replace shadcn `Progress` with the plata bar:

```tsx
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-slate-400 via-slate-200 to-[#7D5BDE] transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
```

`<QuizQuestion variant="dark" ... />`. Question navigation grid buttons:

```tsx
                            className={`h-10 rounded-lg text-sm font-medium transition-colors ${
                              isCurrent
                                ? 'bg-transparent text-violet-300 ring-2 ring-[#7D5BDE]'
                                : isAnswered
                                  ? 'bg-[#7D5BDE] text-white'
                                  : 'bg-white/10 text-slate-400 hover:bg-white/20'
                            }`}
```

Grid label "Navegación de Preguntas (X/Y respondidas)" → `text-slate-400`. Nav buttons: Anterior/Siguiente keep `variant="outline"`; "Finalizar Quiz" → violet CTA.

**Results state:** card → glass div. Score block:

```tsx
                  <div className="mb-8 text-center">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 1.12, 1], opacity: 1 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={`mb-4 inline-flex h-24 w-24 items-center justify-center rounded-full border ${
                        submitQuizMutation.data.passed
                          ? 'border-emerald-500/30 bg-emerald-500/10'
                          : 'border-red-500/30 bg-red-500/10'
                      }`}
                    >
                      {submitQuizMutation.data.passed ? (
                        <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                      ) : (
                        <XCircle className="h-12 w-12 text-red-400" />
                      )}
                    </motion.div>
                    <h2 className={`mb-2 text-2xl font-bold ${submitQuizMutation.data.passed ? 'text-emerald-300' : 'text-red-300'}`}>
                      {submitQuizMutation.data.passed ? '¡Aprobado!' : 'No Aprobado'}
                    </h2>
                    <p className="mb-2 font-serif text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 pb-[0.1em]">
                      {submitQuizMutation.data.score}%
                    </p>
                    <p className="text-slate-500">
                      Puntuación mínima requerida: {quiz.passingScore}%
                    </p>
                  </div>
```

XP box → `border-emerald-500/25 bg-emerald-500/[0.07]`, title `text-emerald-300`, body `text-emerald-200/90`. Breakdown title → `font-serif text-xl font-bold text-slate-100`. Per-question cards → `<div className={isCorrect ? 'rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.05] p-4' : 'rounded-2xl border border-red-500/25 bg-red-500/[0.05] p-4'}>`; question text `text-slate-200`; "Tu respuesta"/"Respuesta correcta" labels `text-slate-500`, values `text-emerald-300`/`text-red-300`; explanation box `rounded-lg bg-blue-500/10 p-2 text-blue-200/90` with `<strong className="text-blue-300">`; points `text-slate-600`. Action buttons: "Ver Certificado" → violet CTA; "Reintentar"/"Volver al Curso" keep `variant="outline"`.

- [ ] **Step 3: Verify** — `npm run check`. Preview a quiz: instructions pills, dark options, nav grid states, results screen.

- [ ] **Step 4: Commit**

```bash
git add client/src/components/QuizQuestion.tsx client/src/pages/QuizView.tsx
git commit -m "feat: redesign QuizView + QuizQuestion dark variant"
```

---

### Task 12: Final verification + visual QA

- [ ] **Step 1: Full verify**

Run: `cd SocialJusticeHub && npm run verify`
Expected: TypeScript check passes, route guard passes, production build succeeds.

- [ ] **Step 2: Visual QA with preview (desktop + mobile)**

Start the dev server (preview tools). Screenshot and inspect each page at desktop and mobile (390px) widths:

1. `/blog-vlog` — hero plata, featured full-bleed, glass grid, sticky filters work, infinite scroll loads page 2.
2. `/recursos/blog/<any-slug>` — hero backdrop, reading progress fills as you scroll, TOC scroll-spy highlights, dropcap on first paragraph, single actions row, "Seguí leyendo", dark comments.
3. `/recursos/guias-estudio` — library grid, violet progress, continue banner (if logged), category sections.
4. `/recursos/guias-estudio/<slug>` — timeline with completed/current/locked states, sidebar.
5. A text lesson — dark prose, sidebar lesson list + TOC, prev/next.
6. A quiz — all three states (instructions → taking → results).

Check specifically: no leftover white backgrounds, no `text-slate-900`-on-dark unreadable text, Header/Footer blend with `#0a0a0a`, focus states visible on inputs/buttons.

- [ ] **Step 3: Fix anything found, re-run `npm run check`, commit**

```bash
git add -A
git commit -m "Fix dark-theme QA issues: blog + guías visual sweep"
```

(Skip the commit if nothing needed fixing.)
