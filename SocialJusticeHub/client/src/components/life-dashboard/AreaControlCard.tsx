import { useMemo } from "react";
import { motion } from "framer-motion";
import { LifeAreaModel } from "./types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Activity, Lock, Unlock } from "lucide-react";

interface AreaControlCardProps {
  area: LifeAreaModel;
  onValueChange?: (value: number) => void;
  onTargetChange?: (value: number) => void;
  onNoteChange?: (note: string) => void;
  onHoverChange?: (hovering: boolean) => void;
  isActive?: boolean;
  actions?: React.ReactNode;
}

const STATUS_CONFIG = [
  { label: "Critico", threshold: 40, className: "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(220,38,38,0.1)]" },
  { label: "Inestable", threshold: 70, className: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]" },
  { label: "Estable", threshold: 86, className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]" },
  { label: "Optimizado", threshold: 101, className: "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]" },
];

const badgeForValue = (value: number) =>
  STATUS_CONFIG.find(({ threshold }) => value < threshold) ?? STATUS_CONFIG[STATUS_CONFIG.length - 1];

const historyPath = (history: number[], width = 128, height = 36) => {
  if (!history.length) return "";
  const step = width / (history.length - 1 || 1);
  const clampValue = (val: number) => Math.max(0, Math.min(100, val));
  return history
    .map((val, index) => {
      const x = index * step;
      const y = height - (clampValue(val) / 100) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
};

export function AreaControlCard({
  area,
  onHoverChange,
  isActive = false,
  actions,
}: AreaControlCardProps) {
  const Icon = area.icon;
  const status = useMemo(() => badgeForValue(area.value), [area.value]);
  const delta = area.target - area.value;
  const sparkline = useMemo(() => historyPath(area.history), [area.history]);

  return (
    <motion.div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/10 bg-[#0f1115] p-6 transition-all duration-500",
        "hover:bg-[#161b22] hover:border-white/20 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]",
        isActive && "border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)] bg-[#13161c]"
      )}
      onHoverStart={() => onHoverChange?.(true)}
      onHoverEnd={() => onHoverChange?.(false)}
      onFocus={() => onHoverChange?.(true)}
      onBlur={() => onHoverChange?.(false)}
      layout
    >
      {/* Holographic Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Tech Corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 rounded-tl-md opacity-50 group-hover:border-blue-400 group-hover:opacity-100 transition-all" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 rounded-tr-md opacity-50 group-hover:border-blue-400 group-hover:opacity-100 transition-all" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 rounded-bl-md opacity-50 group-hover:border-blue-400 group-hover:opacity-100 transition-all" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 rounded-br-md opacity-50 group-hover:border-blue-400 group-hover:opacity-100 transition-all" />

      <div className="flex items-start justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-all duration-300",
            "group-hover:bg-blue-500/10 group-hover:text-blue-400 group-hover:border-blue-500/30 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
          )}>
            <Icon className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-200 font-sans tracking-wide group-hover:text-white transition-colors">{area.name}</h3>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 group-hover:text-blue-400/70 transition-colors">
              <Activity className="w-3 h-3" />
              <span>OPERATIVO: {area.value}%</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {typeof area.level === "number" && (
            <Badge variant="outline" className="rounded border-white/10 text-[10px] uppercase tracking-wider text-slate-500 font-mono bg-black/20">
              NV. {area.level}
            </Badge>
          )}
          <Badge className={cn("rounded text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 backdrop-blur-sm", status?.className)}>
            {status?.label}
          </Badge>
        </div>
      </div>

      <div className="space-y-5 relative z-10">
        {/* Read-only Score Bars */}
        <div className="space-y-4">
          {/* Current score bar */}
          <div className="bg-black/20 p-4 rounded-lg border border-white/5 group-hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-3 font-bold">
              <span>Realidad</span>
              <span className="font-mono text-blue-400 text-sm">{area.value}</span>
            </div>
            <div className="relative h-2.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 h-full rounded-full bg-blue-500"
                style={{
                  width: `${area.value}%`,
                  boxShadow: '0 0 10px rgba(59,130,246,0.4)',
                }}
                initial={false}
                animate={{ width: `${area.value}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Target score bar with marker */}
          <div className="bg-black/20 p-4 rounded-lg border border-white/5 group-hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-3 font-bold">
              <span>Objetivo</span>
              <span className="font-mono text-purple-400 text-sm">{area.target}</span>
            </div>
            <div className="relative h-2.5 rounded-full bg-white/5 overflow-hidden">
              {/* Current fill for context */}
              <motion.div
                className="absolute left-0 top-0 h-full rounded-full bg-blue-500/30"
                style={{ width: `${area.value}%` }}
                initial={false}
                animate={{ width: `${area.value}%` }}
                transition={{ duration: 0.5 }}
              />
              {/* Target marker */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-purple-400"
                style={{
                  left: `${area.target}%`,
                  boxShadow: '0 0 6px rgba(168,85,247,0.5)',
                }}
                initial={false}
                animate={{ left: `${area.target}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs border-t border-white/5 pt-2">
              <span className={cn(
                "font-mono flex items-center gap-1.5 text-[10px] uppercase tracking-wider",
                delta > 0 ? "text-amber-500" : "text-emerald-500"
              )}>
                {delta > 0 ? (
                  <><Unlock className="w-3 h-3" /> Potencial: +{delta}</>
                ) : (
                  <><Lock className="w-3 h-3" /> Optimizado</>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Footer & History */}
        <div className="flex items-end justify-between pt-3 border-t border-white/5">
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-slate-600 mb-1 group-hover:text-slate-500 transition-colors">Historial</p>
            <svg width="128" height="36" viewBox="0 0 128 36" fill="none" className="text-slate-700">
              <path d="M 0 35 L 128 35" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
              {sparkline && (
                <path d={sparkline} stroke="#3b82f6" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 4px rgba(59,130,246,0.5))" }} />
              )}
              {area.history.map((val, idx) => {
                const step = 128 / (area.history.length - 1 || 1);
                const x = idx * step;
                const y = 36 - (Math.max(0, Math.min(100, val)) / 100) * 36;
                return <circle key={idx} cx={x} cy={y} r={1.5} fill="#60a5fa" />;
              })}
            </svg>
          </div>
          {actions ?? (
            <Button variant="outline" size="sm" className="rounded border-white/10 text-slate-400 hover:bg-white/5 hover:text-white hover:border-white/20 text-[10px] uppercase tracking-widest font-bold h-7">
              Evaluar
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
