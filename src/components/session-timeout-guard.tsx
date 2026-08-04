"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const DEFAULT_TIMEOUT_MINUTES = 10080;

export function SessionTimeoutGuard() {
  const router = useRouter();
  const timeoutMinutesRef = useRef(DEFAULT_TIMEOUT_MINUTES);
  const timerRef = useRef<number | null>(null);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors during forced logout.
    }

    toast.message("Session expired due to inactivity. Please sign in again.");
    router.push("/login");
    router.refresh();
  }, [router]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(
      () => {
        void logout();
      },
      timeoutMinutesRef.current * 60_000,
    );
  }, [logout]);

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const response = await fetch("/api/settings/public");
        const json = (await response.json()) as {
          success?: boolean;
          data?: { sessionTimeoutMinutes?: number };
        };

        if (
          active &&
          json.success &&
          json.data?.sessionTimeoutMinutes &&
          json.data.sessionTimeoutMinutes >= 60
        ) {
          timeoutMinutesRef.current = json.data.sessionTimeoutMinutes;
          resetTimer();
        }
      } catch {
        // Keep default timeout.
      }
    }

    void loadSettings();

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((eventName) =>
      window.addEventListener(eventName, resetTimer, { passive: true }),
    );
    resetTimer();

    return () => {
      active = false;
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      events.forEach((eventName) =>
        window.removeEventListener(eventName, resetTimer),
      );
    };
  }, [resetTimer]);

  return null;
}
