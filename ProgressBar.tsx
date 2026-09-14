interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = (current / total) * 100;
  return (
    <div className="h-1.5 bg-neutral-800/80 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-neutral-400 to-neutral-100 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
