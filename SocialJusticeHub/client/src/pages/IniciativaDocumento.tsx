import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'wouter';
import { ChevronRight, ArrowLeft, Download, Printer, Loader2 } from 'lucide-react';
import { marked } from 'marked';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SmoothReveal from '@/components/ui/SmoothReveal';
import { INITIATIVE_CATEGORIES } from '@/lib/initiative-utils';
import { STRATEGIC_INITIATIVES } from '../../../shared/strategic-initiatives';
import {
  GLASS_CARD,
  SECTION_BADGE,
  ACCENT_BUTTON,
} from '@/lib/design-tokens';

export default function IniciativaDocumento() {
  const params = useParams<{ slug: string }>();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const initiative = STRATEGIC_INITIATIVES.find(i => i.slug === params.slug);

  useEffect(() => {
    if (initiative) {
      document.title = `${initiative.title} — Documento Completo`;
    }
    window.scrollTo(0, 0);
  }, [initiative]);

  useEffect(() => {
    if (!initiative?.documentFile) return;

    fetch(`/docs/${initiative.documentFile}`)
      .then(res => res.text())
      .then(md => {
        const html = marked.parse(md, { async: false }) as string;
        setContent(html);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [initiative]);

  const handleDownloadPDF = useCallback(async () => {
    setGenerating(true);
    try {
      const { generatePDF } = await import('@/lib/pdf-utils');
      await generatePDF('document-content', `${initiative?.title ?? 'documento'}_Argentina_ES`);
    } finally {
      setGenerating(false);
    }
  }, [initiative]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (!initiative || !initiative.documentFile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Header />
        <main className="container mx-auto px-4 pt-32 pb-20 text-center">
          <h1 className="text-3xl font-serif font-bold mb-4">Documento no encontrado</h1>
          <p className="text-white/60 mb-8">El documento que buscás no existe o fue movido.</p>
          <Link href="/recursos/ruta#iniciativas" className="text-[#9D85E8] hover:underline font-medium">
            ← Volver a Iniciativas Estratégicas
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryMeta = INITIATIVE_CATEGORIES[initiative.category];
  const CategoryIcon = categoryMeta.icon;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white print:bg-white print:text-slate-900">
      <Header />

      {/* Sticky action bar */}
      <div className="sticky top-16 z-30 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href={`/recursos/ruta/iniciativas/${initiative.slug}`}>
            <span className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              Volver al resumen
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={generating || loading}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50 transition-all ${ACCENT_BUTTON}`}
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{generating ? 'Generando...' : 'Descargar PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 pt-8 pb-20">
        {/* Breadcrumb */}
        <SmoothReveal direction="up" className="mb-8 print:hidden">
          <nav className="flex items-center gap-2 text-sm text-white/40 flex-wrap">
            <Link href="/recursos" className="hover:text-[#9D85E8] transition-colors">Recursos</Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <Link href="/recursos/ruta#iniciativas" className="hover:text-[#9D85E8] transition-colors">Iniciativas</Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <Link href={`/recursos/ruta/iniciativas/${initiative.slug}`} className="hover:text-[#9D85E8] transition-colors">{initiative.title}</Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <span className="text-white/80 font-medium">Documento Completo</span>
          </nav>
        </SmoothReveal>

        {/* Document header */}
        <SmoothReveal direction="up" delay={0.1} className="mb-12">
          <div className={`${SECTION_BADGE} mb-6 inline-flex items-center gap-2`}>
            <CategoryIcon className="w-3.5 h-3.5" />
            <span>{categoryMeta.label}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-3 text-white print:text-slate-900">
            {initiative.title}
          </h1>
          <p className="text-lg text-white/50 font-light print:text-slate-500">
            {initiative.subtitle}
          </p>
        </SmoothReveal>

        {/* Document content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
            <p className="text-white/50">Cargando documento...</p>
          </div>
        ) : (
          <div
            id="document-content"
            className="prose prose-invert prose-lg max-w-none
              prose-headings:font-serif prose-headings:tracking-tight
              prose-h1:text-3xl prose-h1:mt-16 prose-h1:mb-6 prose-h1:pb-4 prose-h1:border-b prose-h1:border-white/10
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:leading-relaxed prose-p:text-white/70
              prose-strong:text-white
              prose-blockquote:border-l-4 prose-blockquote:border-[#7D5BDE]/60 prose-blockquote:bg-[#7D5BDE]/[0.05] prose-blockquote:rounded-r-xl prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:italic prose-blockquote:text-white/70
              prose-table:text-sm prose-table:border-collapse
              prose-th:bg-white/5 prose-th:text-left prose-th:p-3 prose-th:border prose-th:border-white/10 prose-th:font-semibold
              prose-td:p-3 prose-td:border prose-td:border-white/10 prose-td:align-top
              prose-hr:border-white/10 prose-hr:my-12
              prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              prose-pre:bg-white/[0.03] prose-pre:text-white/80 prose-pre:rounded-xl prose-pre:border prose-pre:border-white/10
              prose-a:text-[#9D85E8] prose-a:no-underline hover:prose-a:underline
              prose-li:text-white/70
              print:prose-slate print:prose-base print:max-w-full"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
