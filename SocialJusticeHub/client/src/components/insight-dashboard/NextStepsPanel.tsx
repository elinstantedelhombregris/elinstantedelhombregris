import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface Props {
  actions: string[];
}

export default function NextStepsPanel({ actions }: Props) {
  if (!actions || actions.length === 0) return null;

  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-200 uppercase tracking-wider">
          <Lightbulb className="h-4 w-4 text-amber-400" />
          Proximos Pasos Sugeridos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.slice(0, 3).map((action, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-white/5 border border-white/5"
          >
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
              {idx + 1}
            </span>
            <span className="text-sm text-slate-300">{action}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
