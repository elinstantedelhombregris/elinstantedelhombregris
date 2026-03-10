import { Slider } from '@/components/ui/slider';

interface Props {
  questionKey: string;
  text: string;
  minLabel: string;
  maxLabel: string;
  value: number;
  onChange: (value: number) => void;
}

export default function ScaleQuestion({ text, minLabel, maxLabel, value, onChange }: Props) {
  return (
    <div className="space-y-6">
      <p className="text-lg text-slate-100 font-medium leading-relaxed">{text}</p>
      <div className="px-2">
        <Slider
          value={[value]}
          onValueChange={(v) => onChange(v[0])}
          min={1}
          max={10}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between mt-3">
          <span className="text-xs text-slate-400 max-w-[40%]">{minLabel}</span>
          <span className="text-2xl font-bold text-blue-400 font-mono">{value}</span>
          <span className="text-xs text-slate-400 max-w-[40%] text-right">{maxLabel}</span>
        </div>
      </div>
    </div>
  );
}
