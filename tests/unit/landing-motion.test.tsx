import { render, waitFor } from "@testing-library/react";
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
