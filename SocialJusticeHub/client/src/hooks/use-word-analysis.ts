import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface WordData {
  word: string;
  count: number;
  examples: string[];
}

interface WordAnalysis {
  adjectives: WordData[];
  verbs: WordData[];
  nouns: WordData[];
}

// Función para analizar texto y extraer palabras por categoría
const analyzeText = (text: string): { adjectives: string[], verbs: string[], nouns: string[] } => {
  // Listas básicas de palabras en español (en producción sería más completa)
  const adjectives = [
    'mejor', 'nuevo', 'justo', 'libre', 'próspero', 'unido', 'amable', 'transparente',
    'bueno', 'grande', 'pequeño', 'importante', 'necesario', 'posible', 'difícil',
    'fácil', 'rápido', 'lento', 'alto', 'bajo', 'rico', 'pobre', 'feliz', 'triste'
  ];
  
  const verbs = [
    'construir', 'cambiar', 'crear', 'trabajar', 'educar', 'proteger', 'desarrollar',
    'transformar', 'mejorar', 'ayudar', 'aprender', 'enseñar', 'crecer', 'avanzar',
    'luchar', 'ganar', 'perder', 'vivir', 'soñar', 'pensar', 'sentir', 'amar'
  ];
  
  const nouns = [
    'futuro', 'país', 'educación', 'trabajo', 'salud', 'seguridad', 'oportunidades',
    'esperanza', 'familia', 'comunidad', 'sociedad', 'gobierno', 'política', 'economía',
    'cultura', 'historia', 'presente', 'pasado', 'vida', 'mundo', 'gente', 'personas'
  ];

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);

  return {
    adjectives: words.filter(word => adjectives.includes(word)),
    verbs: words.filter(word => verbs.includes(word)),
    nouns: words.filter(word => nouns.includes(word))
  };
};

// Hook para análisis de palabras
export const useWordAnalysis = () => {
  const [wordAnalysis, setWordAnalysis] = useState<WordAnalysis>({
    adjectives: [],
    verbs: [],
    nouns: []
  });

  // Obtener todos los sueños
  const { data: dreams = [] } = useQuery({
    queryKey: ['/api/dreams'],
    staleTime: 30000, // 30 segundos
  });

  // Analizar palabras cuando cambian los sueños
  useEffect(() => {
    if (dreams && Array.isArray(dreams)) {
      const allText = dreams
        .map(dream => {
          let text = '';
          if (dream.dream) text += dream.dream + ' ';
          if (dream.value) text += dream.value + ' ';
          if (dream.need) text += dream.need + ' ';
          return text;
        })
        .join(' ');

      const analysis = analyzeText(allText);
      
      // Contar palabras y crear ejemplos
      const wordCounts = {
        adjectives: {} as Record<string, { count: number, examples: string[] }>,
        verbs: {} as Record<string, { count: number, examples: string[] }>,
        nouns: {} as Record<string, { count: number, examples: string[] }>
      };

      // Procesar adjetivos
      analysis.adjectives.forEach(word => {
        if (!wordCounts.adjectives[word]) {
          wordCounts.adjectives[word] = { count: 0, examples: [] };
        }
        wordCounts.adjectives[word].count++;
        
        // Buscar ejemplos en los sueños
        dreams.forEach(dream => {
          const text = `${dream.dream || ''} ${dream.value || ''} ${dream.need || ''}`.toLowerCase();
          if (text.includes(word) && wordCounts.adjectives[word].examples.length < 3) {
            const sentences = text.split(/[.!?]/);
            const example = sentences.find(s => s.includes(word))?.trim();
            if (example && !wordCounts.adjectives[word].examples.includes(example)) {
              wordCounts.adjectives[word].examples.push(example);
            }
          }
        });
      });

      // Procesar verbos
      analysis.verbs.forEach(word => {
        if (!wordCounts.verbs[word]) {
          wordCounts.verbs[word] = { count: 0, examples: [] };
        }
        wordCounts.verbs[word].count++;
        
        dreams.forEach(dream => {
          const text = `${dream.dream || ''} ${dream.value || ''} ${dream.need || ''}`.toLowerCase();
          if (text.includes(word) && wordCounts.verbs[word].examples.length < 3) {
            const sentences = text.split(/[.!?]/);
            const example = sentences.find(s => s.includes(word))?.trim();
            if (example && !wordCounts.verbs[word].examples.includes(example)) {
              wordCounts.verbs[word].examples.push(example);
            }
          }
        });
      });

      // Procesar sustantivos
      analysis.nouns.forEach(word => {
        if (!wordCounts.nouns[word]) {
          wordCounts.nouns[word] = { count: 0, examples: [] };
        }
        wordCounts.nouns[word].count++;
        
        dreams.forEach(dream => {
          const text = `${dream.dream || ''} ${dream.value || ''} ${dream.need || ''}`.toLowerCase();
          if (text.includes(word) && wordCounts.nouns[word].examples.length < 3) {
            const sentences = text.split(/[.!?]/);
            const example = sentences.find(s => s.includes(word))?.trim();
            if (example && !wordCounts.nouns[word].examples.includes(example)) {
              wordCounts.nouns[word].examples.push(example);
            }
          }
        });
      });

      // Convertir a formato final y ordenar por frecuencia
      const finalAnalysis: WordAnalysis = {
        adjectives: Object.entries(wordCounts.adjectives)
          .map(([word, data]) => ({
            word,
            count: data.count,
            examples: data.examples.length > 0 ? data.examples : [`Ejemplo con "${word}"`]
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8),
        
        verbs: Object.entries(wordCounts.verbs)
          .map(([word, data]) => ({
            word,
            count: data.count,
            examples: data.examples.length > 0 ? data.examples : [`Ejemplo con "${word}"`]
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8),
        
        nouns: Object.entries(wordCounts.nouns)
          .map(([word, data]) => ({
            word,
            count: data.count,
            examples: data.examples.length > 0 ? data.examples : [`Ejemplo con "${word}"`]
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8)
      };

      setWordAnalysis(finalAnalysis);
    }
  }, [dreams]);

  return {
    wordAnalysis,
    isLoading: false,
    lastUpdated: new Date()
  };
};
