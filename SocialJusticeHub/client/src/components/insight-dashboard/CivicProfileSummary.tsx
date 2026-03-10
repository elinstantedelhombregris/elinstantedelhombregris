import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { CIVIC_ARCHETYPES, CIVIC_DIMENSIONS } from '@shared/civic-assessment-questions';

interface Props {
  profile: {
    archetype: string;
    dimensionScores: Record<string, number>;
    topStrengths: string[];
    growthAreas: string[];
  } | null;
}

export default function CivicProfileSummary({ profile }: Props) {
  if (!profile) {
    return (
      <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg border-l-4 border-l-blue-500 overflow-hidden relative group">
        <CardContent className="py-8 text-center">
          <div className="text-4xl mb-4">&#x1F9ED;</div>
          <h3 className="text-lg font-bold text-white mb-2">Descubri tu Perfil Civico</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            Completa la evaluacion civica para conocer tu arquetipo, fortalezas y areas de crecimiento.
          </p>
          <Link href="/evaluacion">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 h-11 rounded-xl">
              Empezar Evaluacion
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const archetype = CIVIC_ARCHETYPES.find(a => a.key === profile.archetype);
  if (!archetype) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        <CardContent className="pt-6 pb-6 relative z-10">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Archetype Badge */}
            <div className="flex flex-col items-center md:items-start gap-2 md:min-w-[180px]">
              <span className="text-4xl">{archetype.emoji}</span>
              <h3 className="text-xl font-serif font-bold text-white">{archetype.name}</h3>
              <span className="text-xs text-blue-400 font-medium">{archetype.subtitle}</span>
              <Link href="/evaluacion">
                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-400 text-[10px] mt-1 uppercase tracking-wider">
                  Retomar evaluacion
                </Button>
              </Link>
            </div>

            {/* Dimension Bars */}
            <div className="flex-1 space-y-2.5">
              {CIVIC_DIMENSIONS.map(dim => {
                const score = profile.dimensionScores[dim.key] ?? 0;
                const isStrength = profile.topStrengths.includes(dim.key);
                return (
                  <div key={dim.key} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className={`text-xs ${isStrength ? 'text-slate-200 font-bold' : 'text-slate-400'}`}>
                        {dim.name}
                      </span>
                      <span className="text-xs font-mono text-slate-300">{Math.round(score)}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: dim.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
