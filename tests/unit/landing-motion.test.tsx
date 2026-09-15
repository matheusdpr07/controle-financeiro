import { fireEvent, render, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { LandingMotion } from "@/features/landing/landing-motion";

const anime = vi.hoisted(() => ({
  animate: vi.fn(),
  createScope: vi.fn(),
  stagger: vi.fn(),
  createDrawable: vi.fn(),
}));

vi.mock("animejs", () => ({
  animate: anime.animate,
  createScope: anime.createScope,
  stagger: anime.stagger,
  svg: { createDrawable: anime.createDrawable },
}));

test("não inicia movimento quando o usuário prefere redução", async () => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  document.body.innerHTML = "<main data-landing-root></main>";

  render(<LandingMotion />);

  await waitFor(() => {
    expect(anime.createScope).not.toHaveBeenCalled();
    expect(anime.animate).not.toHaveBeenCalled();
  });
});

test("um gesto da roda avança para a próxima seção no desktop", async () => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  document.body.innerHTML = `
    <main data-landing-root>
      <section data-scroll-panel></section>
      <section data-scroll-panel></section>
    </main>
  `;
  const root = document.querySelector<HTMLElement>("[data-landing-root]")!;
  const panels = root.querySelectorAll<HTMLElement>("[data-scroll-panel]");
  panels[0].getBoundingClientRect = vi.fn(() => ({
    ...new DOMRect(),
    top: 72,
  }));
  panels[1].getBoundingClientRect = vi.fn(() => ({
    ...new DOMRect(),
    top: 1000,
  }));
  panels[1].scrollIntoView = vi.fn();

  render(<LandingMotion />);
  fireEvent.wheel(root, { deltaY: 100, deltaMode: WheelEvent.DOM_DELTA_LINE });

  await waitFor(() =>
    expect(panels[1].scrollIntoView).toHaveBeenCalledWith({
      behavior: "auto",
      block: "start",
    }),
  );
});
