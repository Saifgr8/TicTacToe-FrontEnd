import React, { useEffect, useState, useRef } from "react";

const CountdownTimer = ({
  initialTime = 30,
  onTimeUp,
  resetSignal,
  gameWinner,
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const intervalRef = useRef(null);

  // ✅ RESET timer when resetSignal changes
  useEffect(() => {
    setTimeLeft(initialTime);
  }, [resetSignal, initialTime]);

  useEffect(() => {
    if (gameWinner && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [gameWinner]);

  // ✅ Restart interval on reset
  useEffect(() => {
    if (gameWinner) return;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [resetSignal, initialTime, onTimeUp, gameWinner]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" + secs : secs}`;
  };

  return (
    <div
      className="
        flex flex-col items-center justify-center
        bg-gradient-to-br from-indigo-100 via-white to-indigo-200
        dark:from-gray-800 dark:via-gray-900 dark:to-black
        text-gray-900 dark:text-gray-100
        rounded-2xl shadow-md border border-gray-300 dark:border-gray-700
        w-32 h-32 sm:w-40 sm:h-40
        transition-all duration-300
      "
    >
      <span className="text-lg font-medium text-indigo-700 dark:text-indigo-300 mb-2">
        ⏳ Timer
      </span>
      <div
        className={`text-3xl sm:text-4xl font-bold ${
          timeLeft <= 5
            ? "text-red-600 animate-pulse"
            : "text-indigo-900 dark:text-indigo-100"
        }`}
      >
        {formatTime(timeLeft)}
      </div>
    </div>
  );
};

export default CountdownTimer;
