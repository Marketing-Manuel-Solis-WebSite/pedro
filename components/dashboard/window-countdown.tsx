"use client";

import { useState, useEffect } from "react";
import { getWindowInfo } from "@/lib/whatsapp/window-checker";

interface WindowCountdownProps {
  expiresAt: string | null;
}

const colorClasses = {
  green: "bg-green-100 text-green-800",
  yellow: "bg-yellow-100 text-yellow-800",
  orange: "bg-orange-100 text-orange-800",
  red: "bg-red-100 text-red-800",
};

export function WindowCountdown({ expiresAt }: WindowCountdownProps) {
  const [info, setInfo] = useState(() => getWindowInfo(expiresAt));

  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      setInfo(getWindowInfo(expiresAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${colorClasses[info.color]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${
        info.color === "green" ? "bg-green-500" :
        info.color === "yellow" ? "bg-yellow-500" :
        info.color === "orange" ? "bg-orange-500" : "bg-red-500"
      }`} />
      {info.label}
    </span>
  );
}
