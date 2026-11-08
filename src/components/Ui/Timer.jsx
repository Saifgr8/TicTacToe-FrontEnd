import React from "react";

const CountdownTimer = ({ timeLeft }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" + secs : secs}`;
  };

  return (
    <div
      className="
        flex flex-col items-center justify-center rounded-xl
        bg-indigo-50 px-5 py-3 dark:bg-indigo-950
      "
    >
      <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
        Timer
      </span>
      <div
        className={`text-2xl font-bold tabular-nums ${
          timeLeft <= 5
            ? "text-red-600 motion-safe:animate-pulse"
            : "text-indigo-900 dark:text-indigo-100"
        }`}
      >
        {formatTime(timeLeft)}
      </div>
    </div>
  );
};

export default CountdownTimer;
