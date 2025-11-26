import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  AlertTriangle, 
  BarChart3,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Brain
} from 'lucide-react';
import { useWordCloudAnalysis } from '@/hooks/useWordCloudAnalysis';

interface WordData {
  word: string;
  count: number;
  examples: string[];
  category: 'dream' | 'value' | 'need';
}

const WordCloud: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'dream' | 'value' | 'need'>('dream');
  const [selectedWord, setSelectedWord] = useState<WordData | null>(null);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);

  const { wordCloudData, isLoading, lastUpdated, refreshData } = useWordCloudAnalysis();

  // Obtener palabras de la categoría activa
  const currentWords = useMemo(() => {
    return wordCloudData[activeCategory] || [];
  }, [wordCloudData, activeCategory]);

  // Calcular estadísticas
  const maxCount = useMemo(() => {
    return Math.max(...currentWords.map(word => word.count), 1);
  }, [currentWords]);

  const totalWords = useMemo(() => {
    return currentWords.reduce((sum, word) => sum + word.count, 0);
  }, [currentWords]);

  const sectionTitle = useMemo(() => {
    switch (activeCategory) {
      case 'dream':
        return 'Patrones de visiones';
      case 'value':
        return 'Lenguaje de valores';
      case 'need':
        return 'Necesidades priorizadas';
      default:
        return 'Palabras más mencionadas';
    }
  }, [activeCategory]);

  const sectionSubtitle = useMemo(() => {
    switch (activeCategory) {
      case 'dream':
        return 'Qué imaginamos colectivamente para rediseñar Argentina.';
      case 'value':
        return 'Principios que sostienen nuestra cultura en red.';
      case 'need':
        return 'Demandas concretas que guían recursos y políticas.';
      default:
        return 'Conceptos recurrentes en las contribuciones.';
    }
  }, [activeCategory]);

  // Funciones de utilidad
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'dream': return <Eye className="w-5 h-5" />;
      case 'value': return <Heart className="w-5 h-5" />;
      case 'need': return <AlertTriangle className="w-5 h-5" />;
      default: return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'dream': return 'from-blue-500 to-blue-600';
      case 'value': return 'from-pink-500 to-pink-600';
      case 'need': return 'from-amber-500 to-amber-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'dream': return 'Visiones';
      case 'value': return 'Valores';
      case 'need': return 'Necesidades';
      default: return 'Palabras';
    }
  };

  const getWordColor = (category: string) => {
    switch (category) {
      case 'dream': return 'text-blue-600 hover:text-blue-800';
      case 'value': return 'text-pink-600 hover:text-pink-800';
      case 'need': return 'text-amber-600 hover:text-amber-800';
      default: return 'text-gray-600 hover:text-gray-800';
    }
  };

  const getFontSize = (count: number) => {
    const minSize = 14;
    const maxSize = 48;
    const ratio = count / maxCount;
    return Math.max(minSize, minSize + (maxSize - minSize) * ratio);
  };

  const getHoverBgColor = (category: string) => {
    switch (category) {
      case 'dream': return 'hover:bg-blue-50';
      case 'value': return 'hover:bg-pink-50';
      case 'need': return 'hover:bg-amber-50';
      default: return 'hover:bg-gray-50';
    }
  };

  const getDetailLabel = (category: string) => {
    switch (category) {
      case 'dream': return 'Visión en tendencia';
      case 'value': return 'Valor recurrente';
      case 'need': return 'Necesidad prioritaria';
      default: return 'Palabra destacada';
    }
  };

  // Handlers
  const handleWordClick = (word: WordData) => {
    setSelectedWord(word);
    setCurrentExampleIndex(0);
  };

  const handleWordHover = (word: string) => {
    setHoveredWord(word);
  };

  const handleWordLeave = () => {
    setHoveredWord(null);
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

  // Estado de carga
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 mb-8 border border-gray-200">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Analizando los {getCategoryLabel(activeCategory).toLowerCase()}...
            </h3>
            <p className="text-gray-600 mb-4">
              Procesando {wordCloudData.dream.length + wordCloudData.value.length + wordCloudData.need.length} contribuciones para extraer patrones
            </p>
            <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado vacío
  if (currentWords.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 mb-8 border border-gray-200">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              {getCategoryIcon(activeCategory)}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              No hay {getCategoryLabel(activeCategory).toLowerCase()} aún
            </h3>
            <p className="text-gray-600 mb-6">
              Comparte tu primer {getCategoryLabel(activeCategory).toLowerCase().slice(0, -1)} para ver el análisis
            </p>
            <Button
              onClick={refreshData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 md:p-8 mb-8 border border-gray-200 shadow-lg">
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${getCategoryColor(activeCategory)} rounded-2xl flex items-center justify-center shadow-lg`}>
            {getCategoryIcon(activeCategory)}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-1">Mapa semántico</p>
            <h3 className="text-2xl font-bold text-gray-800">
              Nube de {getCategoryLabel(activeCategory)}
            </h3>
            <p className="text-gray-600">
              Las palabras que dan forma a nuestras {getCategoryLabel(activeCategory).toLowerCase()} y orientan la acción.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Badge variant="outline" className="uppercase tracking-wide text-xs">IA en vivo</Badge>
          <div className="text-sm text-gray-500">
            <span className="block text-xs uppercase text-gray-400">Última actualización</span>
            <span className="font-semibold text-gray-700">
              {lastUpdated?.toLocaleTimeString('es-AR') || 'Sin registro'}
            </span>
          </div>
          <Button
            onClick={refreshData}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Navegación de categorías */}
      <div className="flex justify-center mb-8 overflow-x-auto">
        <div className="flex bg-white rounded-xl p-2 shadow-lg border min-w-max">
          {(['dream', 'value', 'need'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 rounded-lg transition-all flex items-center gap-3 ${
                activeCategory === category 
                  ? `bg-gradient-to-r ${getCategoryColor(category)} text-white shadow-md transform scale-105` 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {getCategoryIcon(category)}
              <span className="font-medium">{getCategoryLabel(category)}</span>
              <Badge variant="secondary" className="text-xs">
                {wordCloudData[category]?.length || 0}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Nube de palabras */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {sectionTitle}
                </CardTitle>
                <Badge variant="outline">
                  {currentWords.length} palabras • {totalWords} menciones
                </Badge>
              </div>
              <CardDescription className="text-gray-500">
                {sectionSubtitle}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 items-center justify-center min-h-[400px] p-6 bg-gradient-to-br from-gray-50 to-white rounded-lg">
                {currentWords.map((word, index) => (
                  <button
                    key={`${word.word}-${index}`}
                    onClick={() => handleWordClick(word)}
                    onMouseEnter={() => handleWordHover(word.word)}
                    onMouseLeave={handleWordLeave}
                    className={`
                      inline-block px-4 py-2 rounded-full transition-all duration-300 cursor-pointer
                      ${getWordColor(word.category)}
                        ${hoveredWord === word.word ? 'shadow-xl transform scale-110' : 'shadow-md'}
                      hover:shadow-lg hover:transform hover:scale-105
                      border-2 border-transparent hover:border-current
                    `}
                    style={{
                      fontSize: `${getFontSize(word.count)}px`,
                      fontWeight: word.count > maxCount * 0.7 ? 'bold' : 'normal',
                      backgroundColor: hoveredWord === word.word ? 
                        (word.category === 'dream' ? 'rgba(59, 130, 246, 0.1)' : 
                         word.category === 'value' ? 'rgba(236, 72, 153, 0.1)' : 
                         'rgba(245, 158, 11, 0.1)') : 'rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    {word.word}
                    <span className="ml-2 text-xs opacity-70 font-normal">
                      {word.count}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel de detalles */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Detalles
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedWord ? (
                <div className="space-y-6">
                  {/* Información de la palabra */}
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getWordColor(selectedWord.category)} mb-3`}>
                      "{selectedWord.word}"
                    </div>
                    <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                      {getDetailLabel(selectedWord.category)}
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      {selectedWord.count} menciones en {getCategoryLabel(selectedWord.category).toLowerCase()}
                    </div>
                    
                    {/* Barra de frecuencia */}
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                      <div 
                        className={`h-3 rounded-full bg-gradient-to-r ${getCategoryColor(selectedWord.category)}`}
                        style={{ width: `${(selectedWord.count / maxCount) * 100}%` }}
                      />
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Frecuencia: {((selectedWord.count / maxCount) * 100).toFixed(1)}%
                    </div>
                  </div>
                  
                  {/* Ejemplos */}
                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-700 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Ejemplos en contexto:
                    </h5>
                    
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 min-h-[120px] flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg text-gray-700 mb-2 italic">
                          "{selectedWord.examples[currentExampleIndex]}"
                        </div>
                        <div className="text-sm text-gray-500">
                          Ejemplo {currentExampleIndex + 1} de {selectedWord.examples.length}
                        </div>
                      </div>
                    </div>
                    
                    {selectedWord.examples.length > 1 && (
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
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Haz clic en una palabra para ver detalles
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer con estadísticas */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span>Análisis en tiempo real</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <span>{wordCloudData.dream.length + wordCloudData.value.length + wordCloudData.need.length} aportes analizados</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            Modo actual: {getCategoryLabel(activeCategory)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordCloud;
