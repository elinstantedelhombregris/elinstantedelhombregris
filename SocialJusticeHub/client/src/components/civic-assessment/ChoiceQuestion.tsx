import { motion } from 'framer-motion';

interface Option {
  value: string;
  label: string;
}

interface Props {
  text: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
}

export default function ChoiceQuestion({ text, options, value, onChange }: Props) {
  return (
    <div className="space-y-5">
      <p className="text-lg text-slate-100 font-medium leading-relaxed">{text}</p>
      <div className="space-y-3">
        {options.map((option, idx) => (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onChange(option.value)}
            className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 ${
              value === option.value
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                value === option.value ? 'border-blue-400' : 'border-slate-600'
              }`}>
                {value === option.value && (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                )}
              </div>
              <span className="text-sm">{option.label}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
