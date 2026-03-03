import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Settings, 
  X, 
  Minus, 
  Plus, 
  Sun, 
  Moon, 
  Monitor,
  Type,
  Palette,
  Eye,
  Clock,
  Maximize2,
  Minimize2,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ReaderModeProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

interface ReaderSettings {
  fontSize: number;
  lineHeight: number;
  maxWidth: number;
  theme: 'light' | 'dark' | 'sepia';
  fontFamily: 'system' | 'serif' | 'mono';
  showProgress: boolean;
  showWordCount: boolean;
  showReadingTime: boolean;
}

export default function ReaderMode({
  children,
  title = 'Modo Lectura',
  className = ''
}: ReaderModeProps) {
  const [isActive, setIsActive] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  
  const [settings, setSettings] = useState<ReaderSettings>({
    fontSize: 18,
    lineHeight: 1.6,
    maxWidth: 800,
    theme: 'light',
    fontFamily: 'system',
    showProgress: true,
    showWordCount: true,
    showReadingTime: true
  });

  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden';
      calculateReadingStats();
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isActive]);

  useEffect(() => {
    const handleScroll = () => {
      if (!isActive) return;
      
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isActive]);

  const calculateReadingStats = () => {
    const content = document.querySelector('.reader-content');
    if (content) {
      const text = content.textContent || '';
      const words = text.trim().split(/\s+/).length;
      const avgWordsPerMinute = 200;
      const minutes = Math.ceil(words / avgWordsPerMinute);
      
      setWordCount(words);
      setReadingTime(minutes);
    }
  };

  const updateSetting = (key: keyof ReaderSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings({
      fontSize: 18,
      lineHeight: 1.6,
      maxWidth: 800,
      theme: 'light',
      fontFamily: 'system',
      showProgress: true,
      showWordCount: true,
      showReadingTime: true
    });
  };

  const getThemeClasses = () => {
    switch (settings.theme) {
      case 'dark':
        return 'bg-gray-900 text-gray-100';
      case 'sepia':
        return 'bg-amber-50 text-amber-900';
      default:
        return 'bg-white text-gray-900';
    }
  };

  const getFontFamily = () => {
    switch (settings.fontFamily) {
      case 'serif':
        return 'font-serif';
      case 'mono':
        return 'font-mono';
      default:
        return 'font-sans';
    }
  };

  const getThemeIcon = () => {
    switch (settings.theme) {
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'sepia':
        return <Palette className="w-4 h-4" />;
      default:
        return <Sun className="w-4 h-4" />;
    }
  };

  const toggleReaderMode = () => {
    setIsActive(!isActive);
    setIsSettingsOpen(false);
  };

  const getFontSizeClass = () => {
    if (settings.fontSize <= 14) return 'text-sm';
    if (settings.fontSize <= 16) return 'text-base';
    if (settings.fontSize <= 18) return 'text-lg';
    if (settings.fontSize <= 20) return 'text-xl';
    if (settings.fontSize <= 22) return 'text-2xl';
    return 'text-3xl';
  };

  return (
    <>
      {/* Reader Mode Button */}
      <Button
        onClick={toggleReaderMode}
        variant="outline"
        size="sm"
        className={`flex items-center gap-2 ${className}`}
      >
        <BookOpen className="w-4 h-4" />
        Modo Lectura
      </Button>

      {/* Reader Mode Overlay */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-hidden"
          >
            {/* Background */}
            <div className={`absolute inset-0 ${getThemeClasses()}`}>
              {/* Progress Bar */}
              {settings.showProgress && (
                <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-10">
                  <motion.div
                    className="h-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${readingProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              )}

              {/* Header */}
              <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 p-4 z-20">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
                    
                    {settings.showReadingTime && (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {readingTime} min
                      </Badge>
                    )}
                    
                    {settings.showWordCount && (
                      <Badge variant="secondary" className="text-xs">
                        <Type className="w-3 h-3 mr-1" />
                        {wordCount.toLocaleString()} palabras
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                      className="flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Ajustes
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleReaderMode}
                      className="flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Salir
                    </Button>
                  </div>
                </div>
              </div>

              {/* Settings Panel */}
              <AnimatePresence>
                {isSettingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-20 right-4 z-30"
                  >
                    <Card className="w-80 shadow-xl">
                      <CardContent className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-800">Ajustes de Lectura</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetSettings}
                            className="text-xs"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Reset
                          </Button>
                        </div>

                        {/* Font Size */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Type className="w-4 h-4" />
                            Tamaño de Fuente
                          </label>
                          <div className="flex items-center gap-3">
                            <Minus className="w-4 h-4 text-gray-400" />
                            <Slider
                              value={[settings.fontSize]}
                              onValueChange={([value]) => updateSetting('fontSize', value)}
                              min={12}
                              max={24}
                              step={1}
                              className="flex-1"
                            />
                            <Plus className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="text-xs text-gray-500 text-center">
                            {settings.fontSize}px
                          </div>
                        </div>

                        {/* Line Height */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-gray-700">
                            Espaciado de Líneas
                          </label>
                          <div className="flex items-center gap-3">
                            <Minus className="w-4 h-4 text-gray-400" />
                            <Slider
                              value={[settings.lineHeight]}
                              onValueChange={([value]) => updateSetting('lineHeight', value)}
                              min={1.2}
                              max={2.0}
                              step={0.1}
                              className="flex-1"
                            />
                            <Plus className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="text-xs text-gray-500 text-center">
                            {settings.lineHeight}x
                          </div>
                        </div>

                        {/* Max Width */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-gray-700">
                            Ancho Máximo
                          </label>
                          <div className="flex items-center gap-3">
                            <Minus className="w-不能 h-4 text-gray-400" />
                            <Slider
                              value={[settings.maxWidth]}
                              onValueChange={([value]) => updateSetting('maxWidth', value)}
                              min={600}
                              max={1200}
                              step={50}
                              className="flex-1"
                            />
                            <Plus className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="text-xs text-gray-500 text-center">
                            {settings.maxWidth}px
                          </div>
                        </div>

                        {/* Theme */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Palette className="w-4 h-4" />
                            Tema
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { key: 'light', label: 'Claro', icon: Sun },
                              { key: 'sepia', label: 'Sepia', icon: Palette },
                              { key: 'dark', label: 'Oscuro', icon: Moon }
                            ].map((theme) => {
                              const Icon = theme.icon;
                              return (
                                <Button
                                  key={theme.key}
                                  variant={settings.theme === theme.key ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => updateSetting('theme', theme.key)}
                                  className="flex items-center gap-2"
                                >
                                  <Icon className="w-3 h-3" />
                                  {theme.label}
                                </Button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Font Family */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Type className="w-4 h-4" />
                            Tipografía
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { key: 'system', label: 'Sistema' },
                              { key: 'serif', label: 'Serif' },
                              { key: 'mono', label: 'Mono' }
                            ].map((font) => (
                              <Button
                                key={font.key}
                                variant={settings.fontFamily === font.key ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => updateSetting('fontFamily', font.key)}
                                className={`${font.key === 'serif' ? 'font-serif' : font.key === 'mono' ? 'font-mono' : 'font-sans'}`}
                              >
                                {font.label}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Display Options */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Mostrar
                          </label>
                          <div className="space-y-2">
                            {[
                              { key: 'showProgress', label: 'Barra de progreso' },
                              { key: 'showWordCount', label: 'Contador de palabras' },
                              { key: 'showReadingTime', label: 'Tiempo de lectura' }
                            ].map((option) => (
                              <label key={option.key} className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={settings[option.key as keyof ReaderSettings] as boolean}
                                  onChange={(e) => updateSetting(option.key as keyof ReaderSettings, e.target.checked)}
                                  className="rounded border-gray-300"
                                />
                                {option.label}
                              </label>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Content */}
              <div className="max-w-4xl mx-auto p-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`
                    reader-content prose prose-lg max-w-none
                    ${getFontFamily()}
                    ${getFontSizeClass()}
                    ${getThemeClasses()}
                  `}
                  style={{
                    lineHeight: settings.lineHeight,
                    maxWidth: `${settings.maxWidth}px`,
                    margin: '0 auto'
                  }}
                >
                  {children}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Compact reader mode for articles
export function ArticleReaderMode({
  children,
  title,
  className = ''
}: ReaderModeProps) {
  const [isActive, setIsActive] = useState(false);
  const [fontSize, setFontSize] = useState(18);

  const toggleReaderMode = () => {
    setIsActive(!isActive);
  };

  return (
    <>
      <Button
        onClick={toggleReaderMode}
        variant="outline"
        size="sm"
        className={`flex items-center gap-2 ${className}`}
      >
        <BookOpen className="w-4 h-4" />
        Lectura
      </Button>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-50 overflow-auto"
          >
            <div className="max-w-4xl mx-auto p-8">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 mb-8">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-semibold">{title}</h1>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-sm w-8 text-center">{fontSize}px</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleReaderMode}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div
                className="prose prose-lg max-w-none"
                style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
              >
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
