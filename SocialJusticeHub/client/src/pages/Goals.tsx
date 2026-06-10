import { useState, useContext } from 'react';
import { UserContext } from '@/App';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Plus, Target, CheckCircle, Trash2, Edit2, ArrowLeft } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import {
  ACCENT_BUTTON,
  DISPLAY_GRADIENT,
  GLASS_CARD,
  GLASS_CARD_HOVER,
} from '@/lib/design-tokens';

// Category colors are identity data: they encode meaningful category distinctions
// consistently rendered across the UI (rule 6 exception — kept muted)
const CATEGORIES = [
  { value: 'civic_participation', label: 'Participación Cívica', dotColor: '#9D85E8' },
  { value: 'personal_growth', label: 'Crecimiento Personal', dotColor: '#a78bfa' },
  { value: 'community_building', label: 'Comunidad', dotColor: '#6ee7b7' },
  { value: 'accountability', label: 'Rendición de Cuentas', dotColor: '#fcd34d' },
  { value: 'learning', label: 'Aprendizaje', dotColor: '#93c5fd' },
];

interface Goal {
  id: number;
  title: string;
  description: string | null;
  category: string;
  targetDate: string | null;
  status: string;
  progress: number;
  milestones: Array<{ title: string; done: boolean; doneAt?: string }>;
}

const Goals = () => {
  const userContext = useContext(UserContext);
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('civic_participation');
  const [formTargetDate, setFormTargetDate] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['/api/goals'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/goals');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: !!userContext?.isLoggedIn,
  });

  const createGoal = useMutation({
    mutationFn: async (goalData: any) => {
      const res = await apiRequest('POST', '/api/goals', goalData);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      setShowForm(false);
      setFormTitle('');
      setFormDescription('');
      setFormCategory('civic_participation');
      setFormTargetDate('');
    },
  });

  const updateGoal = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await apiRequest('PUT', `/api/goals/${id}`, data);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/goals'] }),
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/goals/${id}`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/goals'] }),
  });

  if (!userContext?.isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-xl font-serif text-slate-100">Iniciá sesión para ver tus metas</h2>
            <Button className={cn('mt-4', ACCENT_BUTTON)} onClick={() => window.location.href = '/login'}>Iniciar sesión</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const goals: Goal[] = data?.goals || [];
  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  const getCategoryInfo = (cat: string) => CATEGORIES.find(c => c.value === cat) || CATEGORIES[0];

  const handleSubmit = () => {
    if (!formTitle.trim()) return;
    createGoal.mutate({
      title: formTitle,
      description: formDescription || null,
      category: formCategory,
      targetDate: formTargetDate || null,
      milestones: [],
    });
  };

  const toggleComplete = (goal: Goal) => {
    updateGoal.mutate({
      id: goal.id,
      status: goal.status === 'completed' ? 'active' : 'completed',
      progress: goal.status === 'completed' ? goal.progress : 100,
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
      <Header />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className={cn('text-3xl font-serif font-bold', DISPLAY_GRADIENT)}>Mis Metas</h1>
              <p className="text-slate-500 text-sm mt-1">Definí y seguí tus objetivos cívicos y personales</p>
            </div>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className={cn('font-bold', ACCENT_BUTTON)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Meta
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#111] border-white/10 text-slate-200">
              <DialogHeader>
                <DialogTitle className="text-white font-serif">Nueva Meta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Título de la meta"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus:border-violet-500/50"
                />
                <Textarea
                  placeholder="Descripción (opcional)"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus:border-violet-500/50"
                  rows={3}
                />
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Categoría</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => setFormCategory(cat.value)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs border transition-all duration-300 flex items-center gap-1.5',
                          formCategory === cat.value
                            ? 'bg-violet-500/20 border-violet-500/40 text-violet-200'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                        )}
                      >
                        {/* category dot = identity encoding (rule 6) */}
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.dotColor }} />
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Fecha objetivo (opcional)</label>
                  <Input
                    type="date"
                    value={formTargetDate}
                    onChange={(e) => setFormTargetDate(e.target.value)}
                    className="bg-white/5 border-white/10 text-white focus:border-violet-500/50"
                  />
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={!formTitle.trim() || createGoal.isPending}
                  className={cn('w-full font-bold', ACCENT_BUTTON)}
                >
                  Crear Meta
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Goals */}
        <div className="space-y-4">
          {activeGoals.length === 0 && !isLoading && (
            <Card className={cn(GLASS_CARD, 'border-dashed')}>
              <CardContent className="py-12 text-center">
                <Target className="h-10 w-10 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg text-slate-300 mb-2">Todavía no tenés metas</h3>
                <p className="text-slate-500 text-sm mb-4">Definí tu primera meta para empezar a construir tu camino cívico.</p>
              </CardContent>
            </Card>
          )}

          {activeGoals.map(goal => {
            const catInfo = getCategoryInfo(goal.category);
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={cn(GLASS_CARD, GLASS_CARD_HOVER)}>
                  <CardContent className="py-5">
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleComplete(goal)}
                        className="mt-1 w-6 h-6 rounded-full border-2 border-slate-600 hover:border-violet-400 flex items-center justify-center flex-shrink-0 transition-colors duration-300"
                      >
                        {/* completed check = success semantic (rule 6) */}
                        {goal.progress >= 100 && <CheckCircle className="h-5 w-5 text-emerald-400" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-bold text-slate-200">{goal.title}</h3>
                          {/* category badge = identity data encoding (rule 6) — muted dot */}
                          <Badge variant="outline" className="text-[9px] bg-white/5 border-white/10 text-slate-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: catInfo.dotColor }} />
                            {catInfo.label}
                          </Badge>
                        </div>
                        {goal.description && (
                          <p className="text-sm text-slate-400 mb-3">{goal.description}</p>
                        )}
                        <div className="flex items-center gap-3">
                          <Progress value={goal.progress} className="h-1.5 flex-1 bg-white/5" indicatorClassName="bg-violet-500" />
                          <span className="text-xs font-mono text-slate-500">{goal.progress}%</span>
                        </div>
                        {goal.targetDate && (
                          <p className="text-[10px] text-slate-600 mt-2">
                            Objetivo: {new Date(goal.targetDate).toLocaleDateString('es-AR')}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteGoal.mutate(goal.id)}
                        /* destructive action = red (rule 6) */
                        className="p-1.5 text-slate-600 hover:text-red-400 transition-colors duration-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div className="mt-10">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
              Completadas ({completedGoals.length})
            </h2>
            <div className="space-y-3">
              {completedGoals.map(goal => (
                <Card key={goal.id} className={cn(GLASS_CARD, 'opacity-60')}>
                  <CardContent className="py-3">
                    <div className="flex items-center gap-3">
                      {/* completed = success semantic (rule 6) */}
                      <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-sm text-slate-400 line-through">{goal.title}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Goals;
