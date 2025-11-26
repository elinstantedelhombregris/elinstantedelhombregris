import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dream } from "@shared/schema";

// Stop words en español
const STOP_WORDS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no', 'haber',
  'por', 'con', 'su', 'para', 'como', 'estar', 'tener', 'le', 'había',
  'ser', 'es', 'son', 'está', 'están', 'esté', 'estén', 'sea', 'sean',
  'ha', 'han', 'he', 'has', 'hay', 'había', 'habían', 'habrá', 'habrán',
  'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'esos', 'esas',
  'aquel', 'aquella', 'aquellos', 'aquellas', 'le', 'les', 'lo', 'la', 'los', 'las',
  'me', 'te', 'nos', 'os', 'se', 'mi', 'tu', 'su', 'nuestro', 'vuestro',
  'mío', 'tuyo', 'suyo', 'mía', 'tuya', 'suya', 'míos', 'tuyos', 'suyos',
  'mías', 'tuyas', 'suyas', 'muy', 'más', 'menos', 'tan', 'tanto', 'mucho', 'poco'
]);

// Keywords para análisis de sentimiento
const POSITIVE_KEYWORDS = new Set([
  'esperanza', 'futuro', 'cambio', 'transformación', 'mejora', 'progreso',
  'sueño', 'visión', 'bienestar', 'felicidad', 'alegría', 'éxito',
  'logro', 'avance', 'desarrollo', 'crecimiento', 'oportunidad', 'posibilidad',
  'unión', 'solidaridad', 'colaboración', 'cooperación', 'juntos', 'comunidad'
]);

const NEGATIVE_KEYWORDS = new Set([
  'problema', 'crisis', 'falta', 'ausencia', 'dificultad', 'obstáculo',
  'fracaso', 'error', 'conflicto', 'violencia', 'injusticia', 'desigualdad',
  'pobreza', 'hambre', 'desempleo', 'corrupción', 'abandono', 'negligencia'
]);

const URGENCY_KEYWORDS = new Set([
  'urgente', 'inmediato', 'ahora', 'ya', 'rápido', 'pronto', 'emergencia',
  'crítico', 'grave', 'serio', 'importante', 'prioritario', 'necesario',
  'basta', 'suficiente', 'no más', 'detener', 'parar', 'frenar'
]);

// Normalizar palabra
const normalizeWord = (word: string): string => {
  return word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,;:¡!¿?()[\]{}«»""']/g, '')
    .trim();
};

// Extraer palabras significativas
const extractWords = (text: string | null): string[] => {
  if (!text) return [];
  return text
    .split(/\s+/)
    .map(normalizeWord)
    .filter(word => word.length > 3 && !STOP_WORDS.has(word));
};

// Análisis de sentimiento básico
const analyzeSentiment = (text: string | null): { sentiment: 'positive' | 'negative' | 'neutral', score: number } => {
  if (!text) return { sentiment: 'neutral', score: 0 };
  
  const words = extractWords(text);
  if (words.length === 0) return { sentiment: 'neutral', score: 0 };
  
  let positive = 0;
  let negative = 0;
  let urgent = 0;
  
  words.forEach(word => {
    if (POSITIVE_KEYWORDS.has(word)) positive++;
    if (NEGATIVE_KEYWORDS.has(word)) negative++;
    if (URGENCY_KEYWORDS.has(word)) urgent++;
  });
  
  const score = (positive - negative) / words.length;
  const sentiment = score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral';
  
  return { sentiment, score: Math.abs(score) };
};

// Calcular intensidad de urgencia
const calculateUrgency = (text: string | null, type: string): number => {
  if (!text) return 0;
  const words = extractWords(text);
  const urgentCount = words.filter(w => URGENCY_KEYWORDS.has(w)).length;
  const baseUrgency = type === 'basta' ? 0.5 : type === 'need' ? 0.3 : 0.1;
  return Math.min(1, baseUrgency + (urgentCount / words.length) * 0.7);
};

export interface WordAnalysis {
  word: string;
  count: number;
  examples: string[];
}

export interface PulseMetrics {
  velocity: {
    lastHour: number;
    last24Hours: number;
    lastWeek: number;
  };
  geographicDistribution: Array<{
    location: string;
    count: number;
    percentage: number;
  }>;
  typeRatios: {
    dream: number;
    value: number;
    need: number;
    basta: number;
  };
  totalNodes: number;
}

export interface Insight {
  id: string;
  type: 'pattern' | 'trend' | 'alert' | 'phrase';
  category: 'dream' | 'value' | 'need' | 'basta' | 'all';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'urgent';
  data?: any;
}

export interface TemporalData {
  date: string;
  dream: number;
  value: number;
  need: number;
  basta: number;
  total: number;
}

export interface SentimentData {
  location: string;
  positive: number;
  negative: number;
  neutral: number;
  urgency: number;
  total: number;
}

export const useMapPulseAnalysis = () => {
  const { data: dreams = [] } = useQuery<Dream[]>({
    queryKey: ['/api/dreams'],
    staleTime: 30000,
  });

  // Análisis de palabras por tipo
  const wordAnalysis = useMemo(() => {
    const analysis: Record<'dream' | 'value' | 'need' | 'basta', WordAnalysis[]> = {
      dream: [],
      value: [],
      need: [],
      basta: []
    };

    const wordCounts: Record<string, Record<string, { count: number; examples: string[] }>> = {
      dream: {},
      value: {},
      need: {},
      basta: {}
    };

    dreams.forEach((dream: Dream) => {
      const types: Array<'dream' | 'value' | 'need' | 'basta'> = ['dream', 'value', 'need', 'basta'];
      types.forEach(type => {
        const text = dream[type];
        if (!text) return;
        
        const words = extractWords(text);
        words.forEach(word => {
          if (!wordCounts[type][word]) {
            wordCounts[type][word] = { count: 0, examples: [] };
          }
          wordCounts[type][word].count++;
          if (wordCounts[type][word].examples.length < 3) {
            const sentences = text.split(/[.!?;]/);
            const relevant = sentences.find(s => s.toLowerCase().includes(word));
            if (relevant && relevant.trim()) {
              wordCounts[type][word].examples.push(relevant.trim().substring(0, 100));
            }
          }
        });
      });
    });

    // Convertir a arrays ordenados
    Object.keys(wordCounts).forEach(type => {
      analysis[type as keyof typeof analysis] = Object.entries(wordCounts[type])
        .map(([word, data]) => ({ word, count: data.count, examples: data.examples }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
    });

    return analysis;
  }, [dreams]);

  // Métricas de pulso
  const pulseMetrics = useMemo((): PulseMetrics => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const lastHour = dreams.filter((d: Dream) => {
      const date = d.createdAt ? new Date(d.createdAt) : null;
      return date && date >= oneHourAgo;
    }).length;

    const last24Hours = dreams.filter((d: Dream) => {
      const date = d.createdAt ? new Date(d.createdAt) : null;
      return date && date >= oneDayAgo;
    }).length;

    const lastWeek = dreams.filter((d: Dream) => {
      const date = d.createdAt ? new Date(d.createdAt) : null;
      return date && date >= oneWeekAgo;
    }).length;

    // Distribución geográfica
    const locationCounts: Record<string, number> = {};
    dreams.forEach((d: Dream) => {
      const loc = d.location || 'Sin ubicación';
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });

    const total = dreams.length;
    const geographicDistribution = Object.entries(locationCounts)
      .map(([location, count]) => ({
        location,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Ratios por tipo
    const typeCounts = {
      dream: dreams.filter((d: Dream) => d.type === 'dream').length,
      value: dreams.filter((d: Dream) => d.type === 'value').length,
      need: dreams.filter((d: Dream) => d.type === 'need').length,
      basta: dreams.filter((d: Dream) => d.type === 'basta').length
    };

    const totalByType = typeCounts.dream + typeCounts.value + typeCounts.need + typeCounts.basta;

    return {
      velocity: {
        lastHour,
        last24Hours,
        lastWeek
      },
      geographicDistribution,
      typeRatios: {
        dream: totalByType > 0 ? (typeCounts.dream / totalByType) * 100 : 0,
        value: totalByType > 0 ? (typeCounts.value / totalByType) * 100 : 0,
        need: totalByType > 0 ? (typeCounts.need / totalByType) * 100 : 0,
        basta: totalByType > 0 ? (typeCounts.basta / totalByType) * 100 : 0
      },
      totalNodes: total
    };
  }, [dreams]);

  // Generación de insights
  const insights = useMemo((): Insight[] => {
    const insightsList: Insight[] = [];

    // Top palabras por tipo
    Object.entries(wordAnalysis).forEach(([type, words]) => {
      if (words.length > 0) {
        const topWord = words[0];
        insightsList.push({
          id: `top-word-${type}`,
          type: 'phrase',
          category: type as any,
          title: `Palabra clave en ${type === 'dream' ? 'Visiones' : type === 'value' ? 'Valores' : type === 'need' ? 'Necesidades' : '¡BASTA!'}`,
          description: `"${topWord.word}" aparece ${topWord.word} veces`,
          severity: 'info',
          data: topWord
        });
      }
    });

    // Patrones emergentes (comparar con semana anterior)
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeek = dreams.filter((d: Dream) => {
      const date = d.createdAt ? new Date(d.createdAt) : null;
      return date && date >= oneWeekAgo;
    });

    const lastWeek = dreams.filter((d: Dream) => {
      const date = d.createdAt ? new Date(d.createdAt) : null;
      return date && date >= twoWeeksAgo && date < oneWeekAgo;
    });

    if (lastWeek.length > 0) {
      const growth = ((thisWeek.length - lastWeek.length) / lastWeek.length) * 100;
      if (Math.abs(growth) > 20) {
        insightsList.push({
          id: 'activity-trend',
          type: 'trend',
          category: 'all',
          title: growth > 0 ? 'Aumento de actividad' : 'Disminución de actividad',
          description: `${growth > 0 ? '+' : ''}${growth.toFixed(0)}% comparado con la semana anterior`,
          severity: growth > 50 ? 'urgent' : growth > 20 ? 'warning' : 'info',
          data: { growth, thisWeek: thisWeek.length, lastWeek: lastWeek.length }
        });
      }
    }

    // Co-ocurrencias
    const allWords = new Set<string>();
    dreams.forEach((d: Dream) => {
      const text = d.dream || d.value || d.need || d.basta;
      if (text) {
        extractWords(text).forEach(w => allWords.add(w));
      }
    });

    // Alertas de urgencia
    const urgentDreams = dreams.filter((d: Dream) => {
      const text = d.dream || d.value || d.need || d.basta;
      if (!text) return false;
      const urgency = calculateUrgency(text, d.type);
      return urgency > 0.7;
    });

    if (urgentDreams.length > 0) {
      insightsList.push({
        id: 'urgency-alert',
        type: 'alert',
        category: 'all',
        title: 'Alta urgencia detectada',
        description: `${urgentDreams.length} contribuciones con nivel de urgencia alto`,
        severity: 'urgent',
        data: { count: urgentDreams.length }
      });
    }

    return insightsList.sort((a, b) => {
      const severityOrder = { urgent: 3, warning: 2, info: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }, [dreams, wordAnalysis]);

  // Datos temporales
  const temporalData = useMemo((): TemporalData[] => {
    const now = new Date();
    const days: TemporalData[] = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      const dayDreams = dreams.filter((d: Dream) => {
        const dreamDate = d.createdAt ? new Date(d.createdAt) : null;
        return dreamDate && dreamDate >= startOfDay && dreamDate <= endOfDay;
      });

      days.push({
        date: dateStr,
        dream: dayDreams.filter(d => d.type === 'dream').length,
        value: dayDreams.filter(d => d.type === 'value').length,
        need: dayDreams.filter(d => d.type === 'need').length,
        basta: dayDreams.filter(d => d.type === 'basta').length,
        total: dayDreams.length
      });
    }

    return days;
  }, [dreams]);

  // Datos de sentimiento por región
  const sentimentData = useMemo((): SentimentData[] => {
    const locationSentiments: Record<string, { positive: number; negative: number; neutral: number; urgency: number; total: number }> = {};

    dreams.forEach((d: Dream) => {
      const location = d.location || 'Sin ubicación';
      if (!locationSentiments[location]) {
        locationSentiments[location] = { positive: 0, negative: 0, neutral: 0, urgency: 0, total: 0 };
      }

      const text = d.dream || d.value || d.need || d.basta;
      if (text) {
        const sentiment = analyzeSentiment(text);
        locationSentiments[location][sentiment.sentiment]++;
        locationSentiments[location].urgency += calculateUrgency(text, d.type);
        locationSentiments[location].total++;
      }
    });

    return Object.entries(locationSentiments)
      .map(([location, data]) => ({
        location,
        ...data,
        urgency: data.total > 0 ? data.urgency / data.total : 0
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [dreams]);

  // Co-ocurrencias de palabras
  const coOccurrences = useMemo(() => {
    const pairs: Record<string, number> = {};
    
    dreams.forEach((d: Dream) => {
      const text = d.dream || d.value || d.need || d.basta;
      if (!text) return;
      
      const words = extractWords(text);
      for (let i = 0; i < words.length - 1; i++) {
        for (let j = i + 1; j < words.length; j++) {
          const pair = [words[i], words[j]].sort().join(' + ');
          pairs[pair] = (pairs[pair] || 0) + 1;
        }
      }
    });

    return Object.entries(pairs)
      .map(([pair, count]) => ({ pair, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [dreams]);

  return {
    wordAnalysis,
    pulseMetrics,
    insights,
    temporalData,
    sentimentData,
    coOccurrences,
    isLoading: false
  };
};

