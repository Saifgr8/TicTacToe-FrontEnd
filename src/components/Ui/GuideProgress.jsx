const GuideProgress = ({ label, viewed, total }) => {
  const percentage = Math.round((viewed / total) * 100);

  return (
    <div className="mt-4 w-full max-w-xl px-1">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
        <span>{label} progress</span>
        <span>{viewed} of {total} viewed</span>
      </div>
      <div
        role="progressbar"
        aria-label={`${label} progress`}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={viewed}
        aria-valuetext={`${viewed} of ${total} viewed`}
        className="h-2.5 overflow-hidden rounded-full bg-slate-300 dark:bg-slate-700"
      >
        <div
          className="h-full rounded-full bg-indigo-600 transition-[width] duration-300 motion-reduce:transition-none dark:bg-indigo-400"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default GuideProgress;
