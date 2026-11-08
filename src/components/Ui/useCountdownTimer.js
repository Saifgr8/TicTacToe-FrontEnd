import { useEffect, useState } from "react";

const useCountdownTimer = ({
  initialTime,
  resetSignal,
  onTimeUp,
  gameWinner,
  enabled,
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    setTimeLeft(initialTime);
  }, [resetSignal, initialTime]);

  useEffect(() => {
    if (!enabled || gameWinner) return;

    const interval = setInterval(() => {
      setTimeLeft((previous) => Math.max(previous - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled, gameWinner, resetSignal, initialTime]);

  useEffect(() => {
    if (enabled && timeLeft === 0 && !gameWinner) {
      onTimeUp();
    }
  }, [enabled, timeLeft, onTimeUp, gameWinner]);

  return timeLeft;
};

export default useCountdownTimer;
