import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';

interface Props {
  hasProfile: boolean;
}

export default function CoachingCard({ hasProfile }: Props) {
  return (
    <Card className="bg-gradient-to-br from-indigo-950/50 to-purple-950/50 border-indigo-500/20 overflow-hidden relative">
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
      <CardContent className="py-6 relative z-10">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-indigo-200 uppercase tracking-wider mb-1">Coaching Civico</h3>
            <p className="text-slate-400 text-sm mb-4">
              {hasProfile
                ? 'Inicia una sesion de coaching personalizada basada en tu perfil civico.'
                : 'Completa la evaluacion primero para desbloquear coaching personalizado.'}
            </p>
            <Link href={hasProfile ? '/coaching' : '/evaluacion'}>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider">
                {hasProfile ? 'Iniciar sesion' : 'Hacer evaluacion'}
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
