import type { WindowInfo, WindowStatus } from "@/types/dashboard";

/**
 * Calculate the window status for a lead based on wa_window_expires_at.
 */
export function getWindowInfo(expiresAt: string | null): WindowInfo {
  if (!expiresAt) {
    return {
      status: "closed",
      expires_at: null,
      remaining_ms: 0,
      label: "Sin ventana",
      color: "red",
    };
  }

  const now = Date.now();
  const expires = new Date(expiresAt).getTime();
  const remaining = expires - now;

  if (remaining <= 0) {
    return {
      status: "closed",
      expires_at: expiresAt,
      remaining_ms: 0,
      label: "Ventana cerrada — solo plantillas",
      color: "red",
    };
  }

  const hours = remaining / (1000 * 60 * 60);

  let status: WindowStatus;
  let color: WindowInfo["color"];
  if (hours > 4) {
    status = "open";
    color = "green";
  } else if (hours > 1) {
    status = "closing_soon";
    color = "yellow";
  } else {
    status = "expiring";
    color = "orange";
  }

  const h = Math.floor(hours);
  const m = Math.floor((remaining / (1000 * 60)) % 60);
  const s = Math.floor((remaining / 1000) % 60);
  const label = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")} restante`;

  return { status, expires_at: expiresAt, remaining_ms: remaining, label, color };
}

/**
 * Check if a message can be sent as free-form (within window).
 */
export function isWithinWindow(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() > Date.now();
}
