import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'wouter';

interface Goal {
  id: number;
  title: string;
  category: string;
  progress: number;
  status: string;
}

interface Props {
  goals: Goal[];
}

const categoryLabels: Record<string, string> = {
  civic_participation: 'Participacion',
  personal_growth: 'Crecimiento',
  community_building: 'Comunidad',
  accountability: 'Rendicion',
  learning: 'Aprendizaje',
};

export default function GoalStrip({ goals }: Props) {
  const activeGoals = goals.filter(g => g.status === 'active').slice(0, 3);

  if (activeGoals.length === 0) {
    return (
      <Card className="bg-white/5 backdrop-blur-md border-white/10 border-dashed">
        <CardContent className="py-6 text-center">
          <Target className="h-8 w-8 text-purple-500/40 mx-auto mb-3" />
          <p className="text-slate-400 text-sm mb-3">Todavia no tenes metas definidas</p>
          <Link href="/metas">
            <Button variant="outline" size="sm" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 text-xs uppercase tracking-wider">
              <Plus className="h-3 w-3 mr-1" />
              Crear mi primera meta
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-200 uppercase tracking-wider">
            <Target className="h-4 w-4 text-purple-400" />
            Mis Metas
          </CardTitle>
          <Link href="/metas">
            <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 text-[10px] uppercase tracking-wider">
              Ver todas <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeGoals.map(goal => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5"
          >
            {goal.progress >= 100 ? (
              <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <Target className="h-5 w-5 text-purple-400 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200 truncate">{goal.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={goal.progress} className="h-1 flex-1 bg-white/5" />
                <span className="text-[10px] font-mono text-slate-500">{goal.progress}%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
