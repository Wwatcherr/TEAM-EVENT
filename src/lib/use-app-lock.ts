"use client";

import { useEffect, useState } from "react";

export type LockStatus = "checking" | "locked" | "unlocked";

export function useAppLock() {
  const [status, setStatus] = useState<LockStatus>("checking");

  useEffect(() => {
    fetch("/api/auth")
      .then((res) => res.json())
      .then((data) => setStatus(data.ok ? "unlocked" : "locked"))
      .catch(() => setStatus("locked"));
  }, []);

  const unlock = async (
    password: string
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("unlocked");
        return { ok: true };
      }
      return { ok: false, error: data.error || "Mot de passe incorrect." };
    } catch {
      return { ok: false, error: "Erreur réseau, réessayez." };
    }
  };

  return { status, unlock };
}
