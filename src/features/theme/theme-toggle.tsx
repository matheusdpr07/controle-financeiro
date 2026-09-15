"use client";

import { useEffect, useSyncExternalStore } from "react";
import { cn } from "cn";
import {
  applyTheme,
  isThemePreference,
  themeStorageKey,
  type ThemePreference,
} from "@/features/theme/theme";

const labels: Record<ThemePreference, string> = {
  system: "Tema automático",
  light: "Tema claro",
  dark: "Tema escuro",
};

const nextPreference: Record<ThemePreference, ThemePreference> = {
  system: "light",
  light: "dark",
  dark: "system",
};

const themeChangeEvent = "controle-financeiro-theme-change";

function readThemePreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(themeStorageKey);
    if (isThemePreference(stored)) return stored;
  } catch {
    const current = document.documentElement.dataset.theme;
    if (isThemePreference(current)) return current;
  }
  return "system";
}

function subscribeTheme(onStoreChange: () => void) {
  const media = matchMedia("(prefers-color-scheme: dark)");
  const syncSystemTheme = () => {
    if (readThemePreference() === "system") {
      applyTheme("system", media.matches);
    }
    onStoreChange();
  };
  const syncStoredTheme = (event: StorageEvent) => {
    if (event.key === themeStorageKey) onStoreChange();
  };
  media.addEventListener("change", syncSystemTheme);
  window.addEventListener(themeChangeEvent, onStoreChange);
  window.addEventListener("storage", syncStoredTheme);
  return () => {
    media.removeEventListener("change", syncSystemTheme);
    window.removeEventListener(themeChangeEvent, onStoreChange);
    window.removeEventListener("storage", syncStoredTheme);
  };
}

function ThemeIcon({ preference }: { preference: ThemePreference }) {
  if (preference === "light") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
        <circle cx="12" cy="12" r="3.5" fill="currentColor" />
        <path
          d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.28 5.28l1.42 1.42M17.3 17.3l1.42 1.42M18.72 5.28 17.3 6.7M6.7 17.3l-1.42 1.42"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.7"
        />
      </svg>
    );
  }

  if (preference === "dark") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
        <path
          d="M19.2 15.1A7.8 7.8 0 0 1 8.9 4.8 7.8 7.8 0 1 0 19.2 15.1Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <circle
        cx="12"
        cy="12"
        r="7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path d="M12 4.5a7.5 7.5 0 0 1 0 15Z" fill="currentColor" />
    </svg>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const preference = useSyncExternalStore<ThemePreference>(
    subscribeTheme,
    readThemePreference,
    (): ThemePreference => "system",
  );

  useEffect(() => {
    applyTheme(preference, matchMedia("(prefers-color-scheme: dark)").matches);
  }, [preference]);

  function cycleTheme() {
    const next = nextPreference[preference];
    try {
      localStorage.setItem(themeStorageKey, next);
    } catch {
      document.documentElement.dataset.theme = next;
    }
    applyTheme(next, matchMedia("(prefers-color-scheme: dark)").matches);
    window.dispatchEvent(new Event(themeChangeEvent));
  }

  return (
    <button
      type="button"
      aria-label={labels[preference]}
      title={labels[preference]}
      onClick={cycleTheme}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm transition-colors outline-none hover:bg-muted hover:text-primary focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
        className,
      )}
    >
      <ThemeIcon preference={preference} />
      <span className="sr-only">{labels[preference]}</span>
    </button>
  );
}
