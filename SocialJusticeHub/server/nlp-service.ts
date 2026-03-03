import { pipeline, env } from '@xenova/transformers';

// Configurar entorno para ejecutar en Node.js
env.allowLocalModels = false;
env.allowRemoteModels = process.env.ENABLE_NLP_MODELS === 'true';

export interface NLPAnalysisResult {
  sentiment: {
    label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    score: number;
  };
  emotions: Array<{
    label: string;
    score: number;
  }>;
  keywords: string[];
  topics: string[];
  summary: string;
  entities: Array<{
    entity: string;
    type: string;
    confidence: number;
  }>;
  language: string;
}

export class NLPService {
  private sentimentPipeline: any = null;
  private emotionPipeline: any = null;
  private summarizationPipeline: any = null;
  private nerPipeline: any = null;
  private readonly modelsEnabled: boolean;

  constructor() {
    this.modelsEnabled = process.env.ENABLE_NLP_MODELS === 'true';
    if (this.modelsEnabled) {
      this.initializePipelines();
    } else {
      console.log('ℹ️ NLP model pipelines disabled (set ENABLE_NLP_MODELS=true to enable remote model loading)');
    }
  }

  private async initializePipelines() {
    try {
      // Inicializar pipelines de ML
      console.log('🚀 Inicializando servicios de NLP...');

      // Pipeline para análisis de sentimientos
      this.sentimentPipeline = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');

      // Pipeline para detección de emociones (usando un modelo multilingüe)
      this.emotionPipeline = await pipeline('text-classification', 'j-hartmann/emotion-english-distilroberta-base');

      // Pipeline para resumen
      this.summarizationPipeline = await pipeline('summarization', 'Xenova/distilbart-cnn-12-6');

      // Pipeline para reconocimiento de entidades nombradas
      this.nerPipeline = await pipeline('token-classification', 'Xenova/bert-base-NER');

      console.log('✅ Servicios de NLP inicializados correctamente');
    } catch (error) {
      console.error('❌ Error inicializando servicios de NLP:', error);
    }
  }

  async analyzeText(text: string): Promise<NLPAnalysisResult> {
    try {
      if (!text || text.trim().length === 0) {
        throw new Error('Texto vacío para análisis');
      }

      // Ejecutar análisis en paralelo
      const [sentiment, emotions, summary, entities] = await Promise.all([
        this.analyzeSentiment(text),
        this.analyzeEmotions(text),
        this.summarizeText(text),
        this.extractEntities(text)
      ]);

      // Extraer keywords usando análisis simple
      const keywords = this.extractKeywords(text);

      // Detectar idioma (simplificado)
      const language = this.detectLanguage(text);

      // Identificar tópicos principales
      const topics = this.identifyTopics(text, entities);

      return {
        sentiment,
        emotions,
        keywords,
        topics,
        summary,
        entities,
        language
      };
    } catch (error) {
      console.error('Error en análisis de texto:', error);
      throw new Error(`Error analizando texto: ${error}`);
    }
  }

  private async analyzeSentiment(text: string) {
    if (!this.sentimentPipeline) {
      // Fallback si no está inicializado
      return { label: 'NEUTRAL' as const, score: 0.5 };
    }

    try {
      const result = await this.sentimentPipeline(text);
      return {
        label: result[0].label as 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL',
        score: result[0].score
      };
    } catch (error) {
      console.error('Error en análisis de sentimiento:', error);
      return { label: 'NEUTRAL' as const, score: 0.5 };
    }
  }

  private async analyzeEmotions(text: string) {
    if (!this.emotionPipeline) {
      return [];
    }

    try {
      const results = await this.emotionPipeline(text);
      return results.slice(0, 5).map((result: any) => ({
        label: result.label,
        score: result.score
      }));
    } catch (error) {
      console.error('Error en análisis de emociones:', error);
      return [];
    }
  }

  private async summarizeText(text: string) {
    if (!this.summarizationPipeline || text.length < 100) {
      return text.length > 200 ? text.substring(0, 200) + '...' : text;
    }

    try {
      const result = await this.summarizationPipeline(text, {
        max_length: 150,
        min_length: 30,
        do_sample: false
      });

      return result[0].summary_text;
    } catch (error) {
      console.error('Error en resumen:', error);
      return text.length > 200 ? text.substring(0, 200) + '...' : text;
    }
  }

  private async extractEntities(text: string) {
    if (!this.nerPipeline) {
      return [];
    }

    try {
      const results = await this.nerPipeline(text);

      // Procesar entidades nombradas
      const entities = results
        .filter((entity: any) => entity.score > 0.8)
        .reduce((acc: any[], entity: any) => {
          const existing = acc.find(e => e.entity === entity.word && e.type === entity.entity_group);

          if (existing) {
            existing.confidence = Math.max(existing.confidence, entity.score);
          } else {
            acc.push({
              entity: entity.word,
              type: entity.entity_group,
              confidence: entity.score
            });
          }

          return acc;
        }, []);

      return entities.slice(0, 10); // Top 10 entidades
    } catch (error) {
      console.error('Error en extracción de entidades:', error);
      return [];
    }
  }

  private extractKeywords(text: string): string[] {
    // Implementación simple de extracción de keywords
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word));

    // Contar frecuencia de palabras
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Retornar palabras más frecuentes
    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'may', 'might', 'must', 'can', 'que', 'los', 'las', 'los', 'una', 'uno',
      'unos', 'unas', 'este', 'esta', 'esto', 'ese', 'esa', 'eso', 'aquel',
      'aquella', 'aquello', 'del', 'desde', 'hasta', 'entre', 'durante'
    ]);

    return stopWords.has(word.toLowerCase());
  }

  private detectLanguage(text: string): string {
    // Detección simple basada en caracteres comunes
    const spanishChars = 'áéíóúñ¿¡';
    const hasSpanishChars = spanishChars.split('').some(char => text.includes(char));

    if (hasSpanishChars) return 'es';

    // Si no detecta caracteres específicos, asumir inglés
    return 'en';
  }

  private identifyTopics(text: string, entities: any[]): string[] {
    const topics = new Set<string>();

    // Agregar tópicos basados en entidades
    entities.forEach(entity => {
      if (entity.type === 'LOC') topics.add('geografía');
      if (entity.type === 'PER') topics.add('personas');
      if (entity.type === 'ORG') topics.add('organizaciones');
      if (entity.type === 'MISC') topics.add('misceláneo');
    });

    // Agregar tópicos basados en palabras clave
    const lowerText = text.toLowerCase();
    if (lowerText.includes('argentina') || lowerText.includes('país')) topics.add('nacional');
    if (lowerText.includes('cambio') || lowerText.includes('transformación')) topics.add('cambio');
    if (lowerText.includes('social') || lowerText.includes('sociedad')) topics.add('social');
    if (lowerText.includes('economía') || lowerText.includes('dinero')) topics.add('economía');
    if (lowerText.includes('política') || lowerText.includes('gobierno')) topics.add('política');

    return Array.from(topics).slice(0, 5);
  }

  // Método específico para analizar psicografías de Parravicini
  async analyzePsychography(text: string): Promise<{
    propheticElements: string[];
    temporalReferences: string[];
    symbolicLanguage: string[];
    socialImpact: string[];
    spiritualMeaning: string[];
  }> {
    const analysis = await this.analyzeText(text);

    return {
      propheticElements: this.extractPropheticElements(text),
      temporalReferences: this.extractTemporalReferences(text),
      symbolicLanguage: this.extractSymbolicLanguage(text),
      socialImpact: this.extractSocialImpact(text),
      spiritualMeaning: this.extractSpiritualMeaning(text, analysis)
    };
  }

  private extractPropheticElements(text: string): string[] {
    const propheticKeywords = [
      'vendrá', 'llegará', 'ocurrirá', 'sucederá', 'verá', 'contemplará',
      'future', 'próximo', 'pronto', 'inminente', 'predicción', 'profecía'
    ];

    return propheticKeywords.filter(keyword =>
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private extractTemporalReferences(text: string): string[] {
    const temporalPatterns = [
      /\d{4}/g, // años como 2024
      /siglo \w+/gi, // siglo XXI
      /próxim\w+ \w+/gi, // próximos años
      /dentro de \w+/gi, // dentro de poco
      /hasta el \w+/gi, // hasta el 2030
    ];

    const references: string[] = [];

    temporalPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) references.push(...matches);
    });

    return [...new Set(references)].slice(0, 10);
  }

  private extractSymbolicLanguage(text: string): string[] {
    const symbolicKeywords = [
      'hombre gris', 'tercera oleada', 'nueva argentina', 'transformación',
      'luz', 'oscuridad', 'esperanza', 'cambio', 'renovación', 'unidad',
      'solidaridad', 'conciencia', 'despertar', 'evolución'
    ];

    return symbolicKeywords.filter(keyword =>
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private extractSocialImpact(text: string): string[] {
    const socialKeywords = [
      'sociedad', 'comunidad', 'pueblo', 'ciudadanos', 'argentina',
      'nación', 'población', 'colectivo', 'social', 'político',
      'económico', 'cultural', 'educación', 'salud', 'trabajo'
    ];

    return socialKeywords.filter(keyword =>
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private extractSpiritualMeaning(text: string, analysis: NLPAnalysisResult): string[] {
    const spiritualKeywords = [
      'espiritual', 'alma', 'espíritu', 'conciencia', 'divino',
      'sagrado', 'fe', 'esperanza', 'amor', 'paz', 'armonía',
      'unidad', 'evolución', 'despertar', 'iluminación'
    ];

    const meanings = spiritualKeywords.filter(keyword =>
      text.toLowerCase().includes(keyword.toLowerCase())
    );

    // Agregar insights basados en análisis de emociones
    if (analysis.emotions.some(e => e.label === 'joy' || e.label === 'optimism')) {
      meanings.push('mensaje esperanzador');
    }
    if (analysis.emotions.some(e => e.label === 'sadness' || e.label === 'fear')) {
      meanings.push('advertencia sobre desafíos');
    }

    return meanings;
  }

  // Método para comparar textos similares (útil para encontrar patrones en psicografías)
  async findSimilarTexts(text: string, textCollection: string[]): Promise<Array<{
    text: string;
    similarity: number;
    index: number;
  }>> {
    const targetEmbedding = await this.getTextEmbedding(text);

    const similarities = await Promise.all(
      textCollection.map(async (collectionText, index) => {
        const collectionEmbedding = await this.getTextEmbedding(collectionText);
        const similarity = this.calculateCosineSimilarity(targetEmbedding, collectionEmbedding);

        return {
          text: collectionText,
          similarity,
          index
        };
      })
    );

    return similarities
      .filter(item => item.similarity > 0.3) // Solo textos con similitud significativa
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  }

  private async getTextEmbedding(text: string): Promise<number[]> {
    // Para simplicidad, usar un embedding simple basado en TF-IDF
    // En producción, usaríamos un modelo real de embeddings
    const words = text.toLowerCase().split(/\s+/);
    const wordFreq = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Crear un vector simple (en producción usar modelos reales)
    return Object.values(wordFreq).slice(0, 100); // Vector de 100 dimensiones máximo
  }

  private calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    const dotProduct = vectorA.reduce((sum, a, i) => sum + a * (vectorB[i] || 0), 0);
    const normA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
    const normB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (normA * normB);
  }
}

// Instancia singleton
export const nlpService = new NLPService();
