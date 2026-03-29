"use client";

import { useCallback } from "react";

type HapticStyle = "light" | "medium" | "heavy";
type NotificationType = "success" | "warning" | "error";

export function useHaptics() {
  const trigger = useCallback((pattern: number | number[]) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Silent fail if vibration is blocked or not supported
      }
    }
  }, []);

  const impact = useCallback((style: HapticStyle = "medium") => {
    switch (style) {
      case "light":
        trigger(10);
        break;
      case "medium":
        trigger(20);
        break;
      case "heavy":
        trigger([30, 10, 30]);
        break;
    }
  }, [trigger]);

  const notification = useCallback((type: NotificationType) => {
    switch (type) {
      case "success":
        trigger([10, 50, 10]);
        break;
      case "warning":
        trigger([50, 100, 50]);
        break;
      case "error":
        trigger([100, 50, 100]);
        break;
    }
  }, [trigger]);

  const selection = useCallback(() => {
    trigger(5);
  }, [trigger]);

  return { impact, notification, selection };
}
