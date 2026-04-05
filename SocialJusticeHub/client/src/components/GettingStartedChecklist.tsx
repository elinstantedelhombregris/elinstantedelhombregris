import React, { useContext } from 'react';
import { UserContext } from '@/App';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Circle,
  ClipboardCheck,
  Crosshair,
  CalendarCheck,
  MessageCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  assessmentDone?: boolean;
  hasGoals?: boolean;
  hasCheckin?: boolean;
  hasCoachingSession?: boolean;
  hasMission?: boolean;
}

const GettingStartedChecklist: React.FC<Props> = ({
  assessmentDone = false,
  hasGoals = false,
  hasCheckin = false,
  hasCoachingSession = false,
  hasMission = false,
}) => {
  const userContext = useContext(UserContext);
  const user = userContext?.user;
  if (!user) return null;

  const items = [
    {
      label: 'Completá la evaluación cívica',
      href: '/evaluacion',
      icon: ClipboardCheck,
      done: assessmentDone,
    },
    {
      label: 'Definí tu primera meta',
      href: '/metas',
      icon: Crosshair,
      done: hasGoals,
    },
    {
      label: 'Hacé tu primer check-in semanal',
      href: '/checkin-semanal',
      icon: CalendarCheck,
      done: hasCheckin,
    },
    {
      label: 'Iniciá una sesión de coaching',
      href: '/coaching',
      icon: MessageCircle,
      done: hasCoachingSession,
    },
    {
      label: 'Unite a una misión nacional',
      description: 'Elegí tu rol y sumarte a una misión de reconstrucción',
      href: '/community',
      icon: ShieldCheck,
      done: hasMission,
    },
  ];

  const completedCount = items.filter(i => i.done).length;

  // Hide if everything is done
  if (completedCount === items.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-lg border-l-4 border-l-blue-500 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        <CardHeader className="pb-3 relative z-10">
          <CardTitle className="flex items-center gap-3 text-lg font-bold text-slate-100 uppercase tracking-wider">
            <Sparkles className="h-5 w-5 text-blue-400" />
            Primeros Pasos
          </CardTitle>
          <p className="text-slate-400 text-sm mt-1">
            Bienvenido/a, <span className="text-blue-300 font-medium">{user.name.split(' ')[0]}</span>.
            Tu panel se irá llenando a medida que avances.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / items.length) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              />
            </div>
            <span className="text-xs font-mono text-slate-500">{completedCount}/{items.length}</span>
          </div>
        </CardHeader>
        <CardContent className="pt-2 pb-4 relative z-10">
          <ul className="space-y-1">
            {items.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link key={idx} href={item.href}>
                  <motion.li
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer group transition-all duration-200 ${
                      item.done
                        ? 'opacity-50'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    {item.done ? (
                      <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-600 flex-shrink-0 group-hover:text-blue-400 transition-colors" />
                    )}
                    <Icon className={`h-4 w-4 flex-shrink-0 ${item.done ? 'text-emerald-400/50' : 'text-slate-500 group-hover:text-blue-400'} transition-colors`} />
                    <span className={`text-sm flex-1 ${
                      item.done
                        ? 'text-slate-500 line-through'
                        : 'text-slate-300 group-hover:text-white'
                    } transition-colors`}>
                      {item.label}
                    </span>
                    {!item.done && (
                      <ArrowRight className="h-4 w-4 text-slate-600 opacity-0 group-hover:opacity-100 group-hover:text-blue-400 transition-all" />
                    )}
                  </motion.li>
                </Link>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GettingStartedChecklist;
