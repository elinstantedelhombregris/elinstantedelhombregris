import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

interface WordData {
  word: string;
  count: number;
  examples: string[];
  category: 'dream' | 'value' | 'need';
}

interface WordCloudData {
  dream: WordData[];
  value: WordData[];
  need: WordData[];
}

interface Dream {
  id: number;
  userId: number | null;
  dream: string | null;
  value: string | null;
  need: string | null;
  location: string | null;
  latitude: string | null;
  longitude: string | null;
  createdAt: Date | null;
  type: 'dream' | 'value' | 'need';
}

// Palabras transformadoras clave que representan la visión del Hombre Gris
const TRANSFORMATIVE_KEYWORDS = {
  // Conceptos de transformación sistémica
  systemic: [
    'transformación', 'cambio', 'revolución', 'reforma', 'renovación',
    'sistema', 'estructura', 'organización', 'institución', 'proceso'
  ],
  
  // Valores fundamentales
  values: [
    'transparencia', 'amabilidad', 'justicia', 'equidad', 'dignidad',
    'respeto', 'integridad', 'honestidad', 'solidaridad', 'empatía',
    'colaboración', 'cooperación', 'inclusión', 'diversidad', 'igualdad'
  ],
  
  // Acción y agencia
  action: [
    'acción', 'participación', 'movilización', 'organización', 'empoderamiento',
    'liderazgo', 'innovación', 'creatividad', 'iniciativa', 'compromiso',
    'responsabilidad', 'protagonismo', 'autonomía', 'autodeterminación'
  ],
  
  // Desarrollo humano
  development: [
    'educación', 'formación', 'capacitación', 'aprendizaje', 'conocimiento',
    'desarrollo', 'crecimiento', 'evolución', 'progreso', 'avance',
    'mejora', 'perfeccionamiento', 'excelencia', 'calidad', 'bienestar'
  ],
  
  // Justicia y derechos
  justice: [
    'derechos', 'libertad', 'democracia', 'participación', 'representación',
    'acceso', 'oportunidad', 'redistribución', 'reparación', 'restitución',
    'garantía', 'protección', 'defensa', 'reivindicación'
  ],
  
  // Economía y recursos
  economy: [
    'trabajo', 'empleo', 'economía', 'producción', 'distribución',
    'recursos', 'bienes', 'servicios', 'salario', 'ingreso',
    'inversión', 'desarrollo', 'sustentabilidad', 'sostenibilidad'
  ],
  
  // Salud y vida
  health: [
    'salud', 'bienestar', 'cuidado', 'atención', 'prevención',
    'tratamiento', 'curación', 'sanación', 'vida', 'calidad',
    'derecho', 'acceso', 'universal', 'público', 'gratuito'
  ],
  
  // Comunidad y colectivo
  community: [
    'comunidad', 'pueblo', 'sociedad', 'colectivo', 'ciudadanía',
    'vecindario', 'barrio', 'territorio', 'espacio', 'común',
    'público', 'compartido', 'participativo', 'abierto', 'inclusivo'
  ],
  
  // Futuro y visión
  future: [
    'futuro', 'visión', 'horizonte', 'posibilidad', 'potencial',
    'esperanza', 'aspiración', 'sueño', 'ideal', 'meta',
    'objetivo', 'propósito', 'misión', 'destino', 'legado'
  ],
  
  // Medio ambiente
  environment: [
    'ambiente', 'naturaleza', 'ecosistema', 'planeta', 'tierra',
    'clima', 'biodiversidad', 'conservación', 'protección', 'restauración',
    'regeneración', 'ecología', 'sostenible', 'renovable', 'limpio'
  ]
};

// Palabras irrelevantes que deben ser ignoradas
const IRRELEVANT_WORDS = new Set([
  // Artículos
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  // Pronombres
  'yo', 'tú', 'él', 'ella', 'nosotros', 'vosotros', 'ellos', 'ellas',
  'me', 'te', 'se', 'nos', 'os', 'les', 'le', 'lo', 'mi', 'tu', 'su',
  // Preposiciones
  'a', 'de', 'en', 'con', 'por', 'para', 'sin', 'sobre', 'entre', 'hacia',
  'desde', 'hasta', 'durante', 'mediante', 'según', 'bajo', 'ante', 'tras',
  // Conjunciones
  'y', 'e', 'o', 'u', 'pero', 'mas', 'aunque', 'sino', 'porque', 'pues',
  'que', 'si', 'cuando', 'donde', 'como', 'cual', 'quien', 'cuanto',
  // Verbos auxiliares y muy comunes
  'ser', 'estar', 'haber', 'tener', 'hacer', 'decir', 'poder', 'deber',
  'ir', 'ver', 'dar', 'saber', 'querer', 'llegar', 'pasar', 'quedar',
  'es', 'está', 'son', 'están', 'sea', 'esté', 'sean', 'estén',
  'ha', 'han', 'he', 'has', 'hay', 'había', 'habían',
  // Adverbios muy comunes
  'muy', 'más', 'menos', 'tan', 'tanto', 'mucho', 'poco', 'bien', 'mal',
  'sí', 'no', 'también', 'tampoco', 'solo', 'solamente', 'apenas',
  // Otros
  'este', 'ese', 'aquel', 'esta', 'esa', 'aquella', 'estos', 'esos', 'aquellos',
  'todo', 'toda', 'todos', 'todas', 'algo', 'nada', 'alguien', 'nadie',
  'mismo', 'misma', 'mismos', 'mismas', 'otro', 'otra', 'otros', 'otras',
  'cada', 'varios', 'varias', 'algún', 'alguna', 'algunos', 'algunas',
  'ningún', 'ninguna', 'ningunos', 'ningunas', 'cualquier', 'cualesquiera'
]);

// Calcula el peso transformador de una palabra
const getTransformativeWeight = (word: string): number => {
  const lowerWord = word.toLowerCase();
  let weight = 1;
  
  // Verificar si es una palabra transformadora clave
  for (const [category, keywords] of Object.entries(TRANSFORMATIVE_KEYWORDS)) {
    if (keywords.some(keyword => lowerWord.includes(keyword) || keyword.includes(lowerWord))) {
      // Pesos especiales según la categoría
      switch (category) {
        case 'systemic': weight = 10; break;
        case 'values': weight = 9; break;
        case 'action': weight = 8; break;
        case 'development': weight = 7; break;
        case 'justice': weight = 9; break;
        case 'economy': weight = 6; break;
        case 'health': weight = 7; break;
        case 'community': weight = 8; break;
        case 'future': weight = 8; break;
        case 'environment': weight = 7; break;
        default: weight = 5;
      }
      return weight;
    }
  }
  
  // Si tiene más de 6 caracteres, probablemente sea más significativa
  if (word.length > 6) weight = 2;
  
  return weight;
};

// Normaliza una palabra (elimina tildes, convierte a minúsculas)
const normalizeWord = (word: string): string => {
  return word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

// Extrae palabras significativas de un texto
const extractSignificantWords = (text: string): string[] => {
  if (!text) return [];
  
  // Tokenizar por espacios y signos de puntuación
  const tokens = text
    .toLowerCase()
    .replace(/[.,;:¡!¿?()[\]{}«»""']/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3); // Mínimo 4 caracteres
  
  // Filtrar palabras irrelevantes y quedarnos solo con las significativas
  const significantWords = tokens.filter(word => {
    const normalized = normalizeWord(word);
    
    // Ignorar si está en la lista de irrelevantes
    if (IRRELEVANT_WORDS.has(normalized)) return false;
    
    // Verificar si es una palabra transformadora
    const weight = getTransformativeWeight(word);
    
    // Solo incluir palabras con peso >= 2 (significativas)
    return weight >= 2;
  });
  
  return significantWords;
};

// Analiza y almacena palabras con su peso transformador
const analyzeAndStore = (
  text: string,
  wordCounts: Record<string, { count: number, weight: number, examples: string[] }>,
  fullText: string
) => {
  const words = extractSignificantWords(text);
  
  words.forEach(word => {
    const normalized = normalizeWord(word);
    const weight = getTransformativeWeight(word);
    
    if (!wordCounts[normalized]) {
      wordCounts[normalized] = {
        count: 0,
        weight: 0,
        examples: []
      };
    }
    
    wordCounts[normalized].count += 1;
    wordCounts[normalized].weight = Math.max(wordCounts[normalized].weight, weight);
    
    // Agregar ejemplo contextual (máximo 3 por palabra)
    if (wordCounts[normalized].examples.length < 3) {
      const sentences = fullText.split(/[.!?;]/);
      const relevantSentence = sentences.find(s => 
        s.toLowerCase().includes(normalized) || s.toLowerCase().includes(word)
      );
      if (relevantSentence && relevantSentence.trim()) {
        wordCounts[normalized].examples.push(relevantSentence.trim());
      }
    }
  });
};

export const useWordCloudAnalysis = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { data: dreams = [], refetch } = useQuery<Dream[]>({
    queryKey: ['/api/dreams'],
    staleTime: 30000, // 30 segundos
  });

  const processCategory = useCallback((
    wordCounts: Record<string, { count: number, weight: number, examples: string[] }>,
    category: 'dream' | 'value' | 'need'
  ) => {
    return Object.entries(wordCounts)
      // Calcular score ponderado: count * weight
      .map(([word, data]) => ({
        word,
        count: data.count,
        weight: data.weight,
        score: data.count * data.weight,
        examples: data.examples.length > 0 ? data.examples : [`Ejemplo con "${word}"`]
      }))
      // Ordenar por score ponderado (no solo por count)
      .sort((a, b) => b.score - a.score)
      // Tomar las top 15 palabras más transformadoras
      .slice(0, 15)
      .map(wordData => ({
        word: wordData.word,
        count: wordData.count,
        examples: wordData.examples,
        category
      }));
  }, []);

  const wordCloudData = useMemo(() => {
    if (!dreams || !Array.isArray(dreams) || dreams.length === 0) {
      return {
        dream: [],
        value: [],
        need: []
      };
    }

    const wordCounts = {
      dream: {} as Record<string, { count: number, weight: number, examples: string[] }>,
      value: {} as Record<string, { count: number, weight: number, examples: string[] }>,
      need: {} as Record<string, { count: number, weight: number, examples: string[] }>
    };

    dreams.forEach(item => {
      if (item.dream) {
        analyzeAndStore(item.dream, wordCounts.dream, item.dream);
      }
      if (item.value) {
        analyzeAndStore(item.value, wordCounts.value, item.value);
      }
      if (item.need) {
        analyzeAndStore(item.need, wordCounts.need, item.need);
      }
    });

    return {
      dream: processCategory(wordCounts.dream, 'dream'),
      value: processCategory(wordCounts.value, 'value'),
      need: processCategory(wordCounts.need, 'need')
    };
  }, [dreams, processCategory]);

  // Actualizar estado de carga solo cuando cambian los datos
  useEffect(() => {
    if (wordCloudData) {
      setIsLoading(false);
      setLastUpdated(new Date());
    }
  }, [dreams.length]); // Solo depende de la cantidad de sueños, no del objeto completo

  // Función para forzar actualización
  const refreshData = async () => {
    setIsLoading(true);
    await refetch();
  };

  return {
    wordCloudData,
    isLoading,
    lastUpdated,
    refreshData
  };
};
