import { useEffect, useState } from "react";

const formatTime = (ms: number) => {
  if (ms <= 0) return "Expired";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

export function useCountdown(target: Date | number | undefined) {
  const [display, setDisplay] = useState("...");
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!target) return;
    const targetTime = target instanceof Date ? target.getTime() : target;
    const tick = () => {
      const diff = targetTime - Date.now();
      setExpired(diff <= 0);
      setDisplay(formatTime(diff));
    };
    tick();
    const interval = setInterval(tick, 1_000);
    return () => clearInterval(interval);
  }, [target]);

  return { display, expired };
}

