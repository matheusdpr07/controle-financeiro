import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { ThemeToggle } from "@/features/theme/theme-toggle";
import { resolveTheme } from "@/features/theme/theme";

function installMatchMedia(initialDark: boolean) {
  let dark = initialDark;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const media = {
    get matches() {
      return dark;
    },
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(
      (_type: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.add(listener);
      },
    ),
    removeEventListener: vi.fn(
      (_type: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.delete(listener);
      },
    ),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList;

  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => media),
  );

  return {
    setDark(value: boolean) {
      dark = value;
      const event = { matches: value } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    },
  };
}

afterEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
  delete document.documentElement.dataset.theme;
  document.documentElement.style.colorScheme = "";
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test("resolve o tema automático e preserva escolhas explícitas", () => {
  expect(resolveTheme("system", true)).toBe("dark");
  expect(resolveTheme("system", false)).toBe("light");
  expect(resolveTheme("light", true)).toBe("light");
  expect(resolveTheme("dark", false)).toBe("dark");
});

test("alterna e persiste as três preferências", async () => {
  installMatchMedia(true);
  render(<ThemeToggle />);

  const toggle = await screen.findByRole("button", {
    name: "Tema automático",
  });
  expect(document.documentElement).toHaveClass("dark");

  fireEvent.click(toggle);
  expect(localStorage.getItem("controle-financeiro-theme")).toBe("light");
  expect(document.documentElement).not.toHaveClass("dark");
  expect(toggle).toHaveAccessibleName("Tema claro");

  fireEvent.click(toggle);
  expect(localStorage.getItem("controle-financeiro-theme")).toBe("dark");
  expect(document.documentElement).toHaveClass("dark");
  expect(toggle).toHaveAccessibleName("Tema escuro");

  fireEvent.click(toggle);
  expect(localStorage.getItem("controle-financeiro-theme")).toBe("system");
  expect(toggle).toHaveAccessibleName("Tema automático");
});

test("acompanha o sistema somente na preferência automática", async () => {
  const media = installMatchMedia(false);
  render(<ThemeToggle />);

  await waitFor(() =>
    expect(document.documentElement.dataset.theme).toBe("system"),
  );
  media.setDark(true);
  expect(document.documentElement).toHaveClass("dark");

  fireEvent.click(screen.getByRole("button", { name: "Tema automático" }));
  media.setDark(false);
  expect(document.documentElement).not.toHaveClass("dark");
  media.setDark(true);
  expect(document.documentElement).not.toHaveClass("dark");
});
