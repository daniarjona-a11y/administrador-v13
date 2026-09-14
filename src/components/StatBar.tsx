interface StatBarProps {
  label: string;
  value: string | number;
  max?: number;
  color?: string;
}

export function StatBar({ label, value, max = 100, color = 'bg-neutral-200' }: StatBarProps) {
  const numValue = typeof value === 'number' ? value : 0;
  const pct = Math.max(0, Math.min(100, (numValue / max) * 100));

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-2.5 sm:p-3">
      <div className="text-[8px] tracking-wider text-neutral-500 font-bold uppercase">{label}</div>
      <div className="text-base font-bold mt-0.5">{value}</div>
      <div className="h-1 bg-neutral-800 rounded-full mt-1.5 overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
