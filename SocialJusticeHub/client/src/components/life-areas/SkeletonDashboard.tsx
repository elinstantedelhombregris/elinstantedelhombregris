export function SkeletonPulse({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-white/5 ${className}`} />
  );
}

function SkeletonConstellation() {
  const nodes = Array.from({ length: 12 });
  const cx = 150;
  const cy = 150;
  const r = 105;

  return (
    <div className="flex items-center justify-center py-10">
      <svg width="300" height="300" viewBox="0 0 300 300" className="opacity-30">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="white" strokeWidth="0.5" opacity="0.1" />
        {nodes.map((_, i) => {
          const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={8}
              fill="white"
              opacity="0.08"
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          );
        })}
        <circle cx={cx} cy={cy} r={20} fill="white" opacity="0.05" className="animate-pulse" />
      </svg>
    </div>
  );
}

function SkeletonTile() {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4 space-y-3">
      <div className="flex items-center gap-3">
        <SkeletonPulse className="h-9 w-9 rounded-lg" />
        <SkeletonPulse className="h-4 w-20 flex-1" />
        <SkeletonPulse className="h-4 w-8" />
      </div>
      <SkeletonPulse className="h-1.5 w-full rounded-full" />
    </div>
  );
}

function SkeletonInsightStrip() {
  return (
    <div className="flex gap-3 max-w-3xl mx-auto px-4">
      <SkeletonPulse className="h-14 flex-1 rounded-lg" />
      <SkeletonPulse className="h-14 flex-1 rounded-lg" />
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <SkeletonPulse className="h-7 w-40 mx-auto" />
        <SkeletonPulse className="h-4 w-56 mx-auto" />
      </div>

      {/* Constellation */}
      <SkeletonConstellation />

      {/* Insight strip */}
      <SkeletonInsightStrip />

      {/* Area grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonTile key={i} />
        ))}
      </div>
    </div>
  );
}
