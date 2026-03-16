import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'wouter';
import { ChevronRight, ArrowLeft, Download, Printer, Loader2 } from 'lucide-react';
import { marked } from 'marked';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SmoothReveal from '@/components/ui/SmoothReveal';
import { INITIATIVE_CATEGORIES } from '@/lib/initiative-utils';
import { STRATEGIC_INITIATIVES } from '../../../shared/strategic-initiatives';

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
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 theme-light">
        <Header />
        <main className="container mx-auto px-4 pt-32 pb-20 text-center">
          <h1 className="text-3xl font-serif font-bold mb-4">Documento no encontrado</h1>
          <p className="text-slate-600 mb-8">El documento que buscás no existe o fue movido.</p>
          <Link href="/recursos/iniciativas" className="text-blue-600 hover:underline font-medium">
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
    <div className="min-h-screen bg-white font-sans text-slate-900 theme-light">
      <Header />

      {/* Sticky action bar */}
      <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href={`/recursos/iniciativas/${initiative.slug}`}>
            <span className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              Volver al resumen
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={generating || loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors"
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
          <nav className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
            <Link href="/recursos" className="hover:text-blue-600 transition-colors">Recursos</Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <Link href="/recursos/iniciativas" className="hover:text-blue-600 transition-colors">Iniciativas</Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <Link href={`/recursos/iniciativas/${initiative.slug}`} className="hover:text-blue-600 transition-colors">{initiative.title}</Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <span className="text-slate-900 font-medium">Documento Completo</span>
          </nav>
        </SmoothReveal>

        {/* Document header */}
        <SmoothReveal direction="up" delay={0.1} className="mb-12">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm mb-6 ${categoryMeta.color}`}>
            <CategoryIcon className="w-3.5 h-3.5" />
            <span className="text-xs font-bold tracking-wider uppercase">{categoryMeta.label}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-3 text-slate-900">
            {initiative.title}
          </h1>
          <p className="text-lg text-slate-500 font-light">
            {initiative.subtitle}
          </p>
        </SmoothReveal>

        {/* Document content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            <p className="text-slate-500">Cargando documento...</p>
          </div>
        ) : (
          <div
            id="document-content"
            className="prose prose-slate prose-lg max-w-none
              prose-headings:font-serif prose-headings:tracking-tight
              prose-h1:text-3xl prose-h1:mt-16 prose-h1:mb-6 prose-h1:pb-4 prose-h1:border-b prose-h1:border-slate-200
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:leading-relaxed prose-p:text-slate-700
              prose-strong:text-slate-900
              prose-blockquote:border-l-4 prose-blockquote:border-amber-400 prose-blockquote:bg-amber-50/50 prose-blockquote:rounded-r-xl prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:italic prose-blockquote:text-slate-700
              prose-table:text-sm prose-table:border-collapse
              prose-th:bg-slate-100 prose-th:text-left prose-th:p-3 prose-th:border prose-th:border-slate-200 prose-th:font-semibold
              prose-td:p-3 prose-td:border prose-td:border-slate-200 prose-td:align-top
              prose-hr:border-slate-200 prose-hr:my-12
              prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              prose-li:text-slate-700
              print:prose-base print:max-w-full"
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
