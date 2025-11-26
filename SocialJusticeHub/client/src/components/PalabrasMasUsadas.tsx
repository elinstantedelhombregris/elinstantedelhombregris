import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  Brain, 
  ChevronLeft, 
  ChevronRight,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { useWordAnalysis } from '@/hooks/use-word-analysis';

// Mock de análisis de palabras - en producción vendría de una API
const mockWordAnalysis = {
  adjectives: [
    { word: "mejor", count: 45, examples: ["Un país mejor", "Un futuro mejor", "Una sociedad mejor"] },
    { word: "nuevo", count: 38, examples: ["Una nueva Argentina", "Nuevo sistema", "Nuevas oportunidades"] },
    { word: "justo", count: 32, examples: ["Un país justo", "Sociedad justa", "Distribución justa"] },
    { word: "libre", count: 28, examples: ["Argentina libre", "Pueblo libre", "Educación libre"] },
    { word: "próspero", count: 25, examples: ["País próspero", "Economía próspera", "Futuro próspero"] },
    { word: "unido", count: 22, examples: ["Pueblo unido", "Argentina unida", "Sociedad unida"] },
    { word: "amable", count: 20, examples: ["Sociedad amable", "Cultura amable", "Gente amable"] },
    { word: "transparente", count: 18, examples: ["Gobierno transparente", "Sistema transparente", "Política transparente"] }
  ],
  verbs: [
    { word: "construir", count: 40, examples: ["Construir juntos", "Construir el futuro", "Construir esperanza"] },
    { word: "cambiar", count: 35, examples: ["Cambiar el sistema", "Cambiar la realidad", "Cambiar todo"] },
    { word: "crear", count: 30, examples: ["Crear oportunidades", "Crear empleo", "Crear valor"] },
    { word: "trabajar", count: 28, examples: ["Trabajar juntos", "Trabajar duro", "Trabajar por el país"] },
    { word: "educar", count: 25, examples: ["Educar a los niños", "Educar para la vida", "Educar con valores"] },
    { word: "proteger", count: 22, examples: ["Proteger la familia", "Proteger el medio ambiente", "Proteger derechos"] },
    { word: "desarrollar", count: 20, examples: ["Desarrollar el país", "Desarrollar talentos", "Desarrollar tecnología"] },
    { word: "transformar", count: 18, examples: ["Transformar la sociedad", "Transformar la educación", "Transformar la política"] }
  ],
  nouns: [
    { word: "futuro", count: 50, examples: ["Un futuro mejor", "Futuro para todos", "Futuro prometedor"] },
    { word: "país", count: 45, examples: ["Mi país", "Este país", "Nuestro país"] },
    { word: "educación", count: 40, examples: ["Educación pública", "Educación de calidad", "Educación gratuita"] },
    { word: "trabajo", count: 35, examples: ["Trabajo digno", "Más trabajo", "Trabajo para todos"] },
    { word: "salud", count: 30, examples: ["Salud pública", "Acceso a la salud", "Sistema de salud"] },
    { word: "seguridad", count: 28, examples: ["Seguridad ciudadana", "Más seguridad", "Seguridad para todos"] },
    { word: "oportunidades", count: 25, examples: ["Más oportunidades", "Oportunidades para todos", "Nuevas oportunidades"] },
    { word: "esperanza", count: 22, examples: ["Renovar la esperanza", "Mantener la esperanza", "Esperanza para el futuro"] }
  ]
};

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

const PalabrasMasUsadas = () => {
  const [activeCategory, setActiveCategory] = useState<'adjectives' | 'verbs' | 'nouns'>('adjectives');
  const [selectedWord, setSelectedWord] = useState<WordData | null>(null);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);

  // Usar el hook real para análisis de palabras
  const { wordAnalysis, isLoading, lastUpdated } = useWordAnalysis();

  // El análisis se actualiza automáticamente cuando cambian los sueños

  const currentWords = wordAnalysis[activeCategory] || [];
  const totalWords = currentWords.reduce((sum, word) => sum + word.count, 0);

  // Mostrar estado de carga si no hay datos
  if (isLoading || currentWords.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 mb-8 border border-gray-200">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Analizando los sueños...
            </h3>
            <p className="text-gray-600">
              {currentWords.length === 0 
                ? "Comparte tu primer sueño para ver el análisis de palabras"
                : "Procesando las palabras más usadas"
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'adjectives': return <Sparkles className="w-4 h-4" />;
      case 'verbs': return <TrendingUp className="w-4 h-4" />;
      case 'nouns': return <Brain className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'adjectives': return 'from-pink-500 to-rose-500';
      case 'verbs': return 'from-blue-500 to-cyan-500';
      case 'nouns': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'adjectives': return 'Adjetivos';
      case 'verbs': return 'Verbos';
      case 'nouns': return 'Sustantivos';
      default: return 'Palabras';
    }
  };

  const handleWordHover = (word: WordData) => {
    setSelectedWord(word);
    setCurrentExampleIndex(0);
    setIsAutoRotating(true);
  };

  const handleWordLeave = () => {
    setSelectedWord(null);
    setIsAutoRotating(false);
  };

  const nextExample = () => {
    if (selectedWord) {
      setCurrentExampleIndex((prev) => (prev + 1) % selectedWord.examples.length);
    }
  };

  const prevExample = () => {
    if (selectedWord) {
      setCurrentExampleIndex((prev) => (prev - 1 + selectedWord.examples.length) % selectedWord.examples.length);
    }
  };

  // Auto-rotar ejemplos
  useEffect(() => {
    if (isAutoRotating && selectedWord) {
      const interval = setInterval(() => {
        setCurrentExampleIndex((prev) => (prev + 1) % selectedWord.examples.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isAutoRotating, selectedWord]);

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 mb-8 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Palabras que Mueven Argentina
            </h3>
            <p className="text-sm text-gray-600">
              Análisis en tiempo real de los sueños compartidos
            </p>
          </div>
        </div>
        
        <div className="flex bg-white rounded-lg p-1 shadow-sm">
          {(['adjectives', 'verbs', 'nouns'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 ${
                activeCategory === category 
                  ? `bg-gradient-to-r ${getCategoryColor(category)} text-white shadow-md` 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {getCategoryIcon(category)}
              <span className="hidden sm:inline">{getCategoryLabel(category)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Lista de palabras */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-800">
              {getCategoryLabel(activeCategory)} más usados
            </h4>
            <Badge variant="outline" className="text-xs">
              {totalWords} menciones
            </Badge>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {currentWords.map((word, index) => (
              <div
                key={word.word}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                onMouseEnter={() => handleWordHover(word)}
                onMouseLeave={handleWordLeave}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                    {word.word}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${getCategoryColor(activeCategory)}`}
                      style={{ width: `${(word.count / Math.max(...currentWords.map(w => w.count))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-8 text-right">
                    {word.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carrousel de ejemplos */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-800">Ejemplos en contexto</h4>
            {selectedWord && (
              <Badge variant="secondary" className="text-xs">
                {selectedWord.examples.length} ejemplos
              </Badge>
            )}
          </div>
          
          {selectedWord ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800 mb-2">
                  "{selectedWord.word}"
                </div>
                <div className="text-sm text-gray-600">
                  {selectedWord.count} menciones en sueños
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 min-h-[120px] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg text-gray-700 mb-2 italic">
                    "{selectedWord.examples[currentExampleIndex]}"
                  </div>
                  <div className="text-sm text-gray-500">
                    Ejemplo {currentExampleIndex + 1} de {selectedWord.examples.length}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevExample}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                
                <div className="flex gap-1">
                  {selectedWord.examples.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentExampleIndex ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextExample}
                  className="flex items-center gap-2"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Pasa el cursor sobre una palabra para ver ejemplos
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer con estadísticas */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span>Análisis en tiempo real</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Actualizado con cada sueño</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Última actualización: {lastUpdated.toLocaleTimeString('es-AR')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PalabrasMasUsadas;
