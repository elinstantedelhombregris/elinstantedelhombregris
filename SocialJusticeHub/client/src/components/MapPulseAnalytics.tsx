import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Activity, 
  TrendingUp, 
  BarChart3, 
  Sparkles, 
  MapPin,
  Brain
} from 'lucide-react';
import PulseDashboard from './PulseDashboard';
import TemporalTrends from './TemporalTrends';
import ComparativeWordAnalysis from './ComparativeWordAnalysis';
import InsightsGenerator from './InsightsGenerator';
import SentimentIntensityMap from './SentimentIntensityMap';
import { cn } from '@/lib/utils';

const MapPulseAnalytics = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Activity,
      component: PulseDashboard,
      description: 'Métricas en tiempo real'
    },
    {
      id: 'trends',
      label: 'Tendencias',
      icon: TrendingUp,
      component: TemporalTrends,
      description: 'Evolución temporal'
    },
    {
      id: 'words',
      label: 'Palabras',
      icon: BarChart3,
      component: ComparativeWordAnalysis,
      description: 'Análisis comparativo'
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: Sparkles,
      component: InsightsGenerator,
      description: 'Inteligencia automática'
    },
    {
      id: 'sentiment',
      label: 'Sentimiento',
      icon: MapPin,
      component: SentimentIntensityMap,
      description: 'Mapa emocional'
    }
  ];

  const activeTabConfig = tabs.find(t => t.id === activeTab);
  const ActiveComponent = activeTabConfig?.component;

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-slate-900/50 border border-slate-700 rounded-2xl p-2 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "flex flex-col items-center gap-2 py-3 px-4 rounded-xl transition-all",
                  "data-[state=active]:bg-slate-800 data-[state=active]:text-white",
                  "data-[state=inactive]:text-slate-400 data-[state=inactive]:hover:text-slate-300",
                  "data-[state=active]:shadow-lg data-[state=active]:shadow-blue-900/25"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-blue-400" : "text-slate-500"
                )} />
                <span className="text-xs font-mono uppercase tracking-widest">
                  {tab.label}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <AnimatePresence mode="wait">
          {tabs.map((tab) => {
            const TabComponent = tab.component;
            const isActive = activeTab === tab.id;
            
            return (
              <TabsContent
                key={tab.id}
                value={tab.id}
                className="mt-0"
              >
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <tab.icon className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{tab.label}</h3>
                          <p className="text-sm text-slate-400">{tab.description}</p>
                        </div>
                      </div>
                    </div>
                    <TabComponent />
                  </motion.div>
                )}
              </TabsContent>
            );
          })}
        </AnimatePresence>
      </Tabs>
    </div>
  );
};

export default MapPulseAnalytics;

