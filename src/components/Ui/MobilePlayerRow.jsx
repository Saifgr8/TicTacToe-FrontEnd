const MobilePlayerRow = ({ name, symbol, points, color, active, previewTwist }) => (
  <div className={`flex min-w-0 items-center gap-3 rounded-xl border px-3 py-2 ${
    active
      ? "border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950"
      : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
  }`}>
    <span aria-hidden="true" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl font-black text-white ${color || "bg-slate-700"}`}>
      {symbol || "—"}
    </span>
    <div className="min-w-0 flex-1">
      <p className="truncate font-bold" title={name}>{name}</p>
      <p className="text-xs text-slate-600 dark:text-slate-300">
        Symbol: {symbol || "—"}{previewTwist ? " (preview)" : ""}{active ? " · Current turn" : ""}
      </p>
    </div>
    <p className="shrink-0 text-sm font-bold tabular-nums">{points ?? 0} pts</p>
  </div>
);

export default MobilePlayerRow;
