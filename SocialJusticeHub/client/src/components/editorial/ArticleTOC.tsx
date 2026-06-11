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
