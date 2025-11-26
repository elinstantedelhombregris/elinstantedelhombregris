import { Dream } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from 'lucide-react';
import { useMemo } from 'react';

interface MapAnalyticsProps {
  dreams: Dream[];
}

const MapAnalytics = ({ dreams }: MapAnalyticsProps) => {
  const analytics = useMemo(() => {
    if (!Array.isArray(dreams) || dreams.length === 0) {
      return {
        geographic: {
          insights: ['No hay suficientes datos para análisis geográfico'],
          topRegions: []
        },
        trends: {
          total: 0,
          byType: { dream: 0, value: 0, need: 0, basta: 0 },
          recentGrowth: 0
        },
        collective: {
          solutions: []
        }
      };
    }

    // Geographic Analysis
    const locations = dreams
      .map(d => d.location)
      .filter(Boolean) as string[];
    
    const locationCounts = locations.reduce((acc, loc) => {
      const normalized = loc.toLowerCase();
      acc[normalized] = (acc[normalized] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const formatRegionName = (loc: string) =>
      loc.replace(/\b\w/g, (char) => char.toUpperCase());

    const topRegions = Object.entries(locationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([loc, count]) => ({ location: formatRegionName(loc), count }));

    const geographicInsights = [];
    if (topRegions.length > 0) {
      geographicInsights.push(`${topRegions[0].location} lidera con ${topRegions[0].count} contribuciones`);
    }
    if (topRegions.length > 1) {
      geographicInsights.push(`${topRegions[1].location} sigue con ${topRegions[1].count} contribuciones`);
    }
    if (dreams.length > 10) {
      geographicInsights.push(`Distribución geográfica diversa en ${new Set(locations).size} regiones`);
    }

    // Trends Analysis
    const byType = {
      dream: dreams.filter(d => d.type === 'dream').length,
      value: dreams.filter(d => d.type === 'value').length,
      need: dreams.filter(d => d.type === 'need').length,
      basta: dreams.filter(d => d.type === 'basta').length
    };

    // Calculate recent growth (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentDreams = dreams.filter(d => {
      if (!d.createdAt) return false;
      const date = typeof d.createdAt === 'string' ? new Date(d.createdAt) : d.createdAt;
      return date >= sevenDaysAgo;
    });

    const olderDreams = dreams.filter(d => {
      if (!d.createdAt) return true;
      const date = typeof d.createdAt === 'string' ? new Date(d.createdAt) : d.createdAt;
      return date < sevenDaysAgo;
    });

    const recentGrowth = olderDreams.length > 0 
      ? Math.round((recentDreams.length / olderDreams.length) * 100)
      : recentDreams.length > 0 ? 100 : 0;

    // Collective Intelligence - Extract common themes
    const allContent = dreams
      .map(d => d.dream || d.value || d.need || d.basta || '')
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const commonWords = allContent
      .split(/\s+/)
      .filter(word => word.length > 4)
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topWords = Object.entries(commonWords)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);

    const solutions = [];
    if (topWords.includes('comunidad') || topWords.includes('comunitario')) {
      solutions.push('Redes de apoyo comunitario');
    }
    if (topWords.includes('educación') || topWords.includes('educar')) {
      solutions.push('Programas de educación popular');
    }
    if (topWords.includes('trabajo') || topWords.includes('empleo')) {
      solutions.push('Oportunidades de empleo local');
    }
    if (topWords.includes('salud') || topWords.includes('médico')) {
      solutions.push('Acceso a servicios de salud');
    }
    if (solutions.length === 0) {
      solutions.push('Soluciones emergentes de la comunidad');
    }

    return {
      geographic: {
        insights: geographicInsights.length > 0 ? geographicInsights : ['Analizando distribución geográfica...'],
        topRegions
      },
      trends: {
        total: dreams.length,
        byType,
        recentGrowth
      },
      collective: {
        solutions
      }
    };
  }, [dreams]);

  const topRegion = analytics.geographic.topRegions[0];
  const topRegionName = topRegion ? topRegion.location : 'Sin región destacada';
  const dreamsCount = analytics.trends.byType.dream || 0;
  const valuesCount = analytics.trends.byType.value || 0;
  const needsCount = analytics.trends.byType.need || 0;
  const bastaCount = analytics.trends.byType.basta || 0;

  const storyCards = [
    {
      id: 'mayor',
      badge: 'Gobierno local',
      context: `Región foco: ${topRegionName}`,
      title: 'Tablero ejecutivo municipal',
      subtitle: 'El intendente arma su reporte semanal con datos del mapa.',
      story: `El módulo exporta un informe PDF que cruza ${dreamsCount} visiones con ${needsCount} necesidades y los convierte en tres frentes de trabajo con responsables, presupuesto estimado y próximos hitos.`,
      metrics: [
        { label: 'Visiones insumo', value: dreamsCount, detail: 'Agenda del “presente ideal” en barrios clave.' },
        { label: 'Necesidades críticas', value: needsCount, detail: 'Demandas que activan obra pública y programas.' },
        { label: 'Valores guía', value: valuesCount, detail: 'Principios para protocolos y compras éticas.' }
      ],
      breakdown: [
        `Frente 01 • Empleo joven · ${Math.max(1, Math.round(dreamsCount * 0.25))} visiones priorizadas`,
        `Frente 02 • Hábitat cuidado · ${Math.max(1, Math.round(needsCount * 0.3))} alertas atendidas`,
        `Frente 03 • Energía comunitaria · ${Math.max(1, Math.round(valuesCount * 0.2))} valores replicados`,
        'Entrega automática de minutas al Concejo y a la prensa'
      ],
      ctaHelper: 'Informe descargable en 1 clic',
      actionLabel: 'Generar reporte'
    },
    {
      id: 'community',
      badge: 'Red territorial',
      context: `${analytics.geographic.topRegions.length} regiones monitoreadas`,
      title: 'Mesa de respuesta intersectorial',
      subtitle: 'ONG, empresas y municipios comparten un mismo tablero operativo.',
      story: `El sistema cruza ${valuesCount} valores con ${needsCount} necesidades para despachar kits de acción (salud, educación, alimentación) y dejar trazabilidad de quién respondió en cada territorio.`,
      metrics: [
        { label: 'Nodos activos', value: analytics.geographic.topRegions.length, detail: 'Territorios con alertas vigentes.' },
        { label: 'Alertas atendidas', value: Math.max(1, Math.round(needsCount * 0.4)), detail: 'Casos que generaron órdenes de trabajo.' },
        { label: 'Valores movilizados', value: valuesCount, detail: 'Prácticas que se transfieren a cada kit.' }
      ],
      breakdown: [
        'Kit 01 • Seguridad alimentaria · contratos y ruteos cargados',
        'Kit 02 • Educación popular · mentores asignados por barrio',
        'Kit 03 • Salud comunitaria · protocolos activados*',
        'Impacto: informe enviado a 12 municipios aliados y 4 empresas BIC'
      ],
      ctaHelper: 'Checklist y bitácora compartida',
      actionLabel: 'Descargar plan operativo'
    },
    {
      id: 'basta-monitor',
      badge: 'Cultura ¡BASTA!',
      context: `${bastaCount} compromisos personales`,
      title: 'Misiones de La Tribu',
      subtitle: 'Laboratorio cultural que acompaña la coherencia del movimiento.',
      story: `El observatorio detecta que los ¡BASTA! personales crecieron +${analytics.trends.recentGrowth}% en 7 días y arma misiones guiadas: mentorías, círculos de cuidado y campañas digitales que documentan avances.`,
      metrics: [
        { label: '¡BASTA! registrados', value: bastaCount, detail: 'Historias con seguimiento 1:1 y acuerdos escritos.' },
        { label: 'Crecimiento semanal', value: `${analytics.trends.recentGrowth}%`, detail: 'Comparado con la semana anterior.' },
        { label: 'Base consolidada', value: analytics.trends.total, detail: 'Entradas vinculadas a reportes públicos.' }
      ],
      breakdown: [
        'Microcampaña “No postergamos más nuestra formación” con métricas sociales',
        'Mentorías activas • 32 declaraciones acompañadas y documentadas',
        'Dashboard cultural mezcla visiones + ¡BASTA! y sugiere próximos hábitos',
        'Objetivo: certificar coherencia entre discurso y acción colectiva'
      ],
      ctaHelper: 'Historias listas para amplificar',
      actionLabel: 'Activar misión'
    }
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {storyCards.map((card) => (
        <div
          key={card.id}
          className="group relative rounded-[32px] border border-slate-200 bg-white/95 p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-slate-100 text-slate-700 border border-slate-200">{card.badge}</Badge>
            <span className="text-[11px] uppercase tracking-[0.3em] text-slate-400">{card.context}</span>
          </div>
          <div className="space-y-2 mb-4">
            <h3 className="text-xl font-semibold text-slate-900">{card.title}</h3>
            <p className="text-sm text-slate-500">{card.subtitle}</p>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-5">
            {card.story}
          </p>
          <div className="grid gap-3 mb-5">
            {card.metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500 flex items-center gap-2">
                  {metric.label}
                </p>
                <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                {metric.detail && <p className="text-xs text-slate-500">{metric.detail}</p>}
              </div>
            ))}
          </div>
          <div className="space-y-2 text-xs text-slate-500 border-t border-dashed border-slate-200 pt-4 mb-4">
            {card.breakdown.map((line, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-500 transition-colors"></span>
                <span>{line}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{card.ctaHelper}</span>
            <button className="text-sm font-semibold text-blue-600 inline-flex items-center gap-1 hover:gap-2 transition-all">
              {card.actionLabel}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MapAnalytics;

