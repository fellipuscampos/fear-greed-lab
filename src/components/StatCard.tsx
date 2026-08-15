export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
      <p className="text-xs uppercase tracking-wide text-neutral-400">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
      {hint && <p className="text-xs text-neutral-500 mt-1">{hint}</p>}
    </div>
  );
}

const CLASSIFICATION_COLORS: Record<string, string> = {
  "Extreme Fear": "bg-red-500/20 text-red-400 border-red-500/30",
  Fear: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Neutral: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Greed: "bg-lime-500/20 text-lime-400 border-lime-500/30",
  "Extreme Greed": "bg-green-500/20 text-green-400 border-green-500/30",
};

export function FearGreedBadge({
  value,
  classification,
}: {
  value: number;
  classification: string;
}) {
  const colorClass =
    CLASSIFICATION_COLORS[classification] ??
    "bg-neutral-500/20 text-neutral-300 border-neutral-500/30";

  return (
    <div className={`inline-flex items-center gap-3 rounded-2xl border px-5 py-3 ${colorClass}`}>
      <span className="text-4xl font-bold">{value}</span>
      <span className="text-sm font-medium">{classification}</span>
    </div>
  );
}
