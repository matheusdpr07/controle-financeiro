"use client";

import { useEffect } from "react";
import { animate, createScope, stagger, svg } from "animejs";

const sectionScrollQuery =
  "(min-width: 1024px) and (min-height: 650px) and (pointer: fine)";

export function LandingMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-landing-root]");
    if (!root) return;

    const sectionScroll = matchMedia(sectionScrollQuery);
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let locked = false;
    let unlockTimer = 0;

    const unlock = () => {
      locked = false;
      window.clearTimeout(unlockTimer);
    };
    const handleWheel = (event: WheelEvent) => {
      if (
        !sectionScroll.matches ||
        locked ||
        event.ctrlKey ||
        Math.abs(event.deltaY) < 60 ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ) {
        return;
      }

      const panels = Array.from(
        root.querySelectorAll<HTMLElement>("[data-scroll-panel]"),
      );
      if (panels.length < 2) return;

      const headerOffset =
        root.querySelector<HTMLElement>("header")?.getBoundingClientRect()
          .height ?? 0;
      const currentIndex = panels.reduce(
        (closest, panel, index) =>
          Math.abs(panel.getBoundingClientRect().top - headerOffset) <
          Math.abs(panels[closest].getBoundingClientRect().top - headerOffset)
            ? index
            : closest,
        0,
      );
      const nextIndex = currentIndex + (event.deltaY > 0 ? 1 : -1);
      const nextPanel = panels[nextIndex];
      if (!nextPanel) return;

      event.preventDefault();
      locked = true;
      nextPanel.scrollIntoView({
        behavior: reducedMotion.matches ? "auto" : "smooth",
        block: "start",
      });
      unlockTimer = window.setTimeout(unlock, reducedMotion.matches ? 0 : 900);
    };

    root.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scrollend", unlock);

    return () => {
      root.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scrollend", unlock);
      window.clearTimeout(unlockTimer);
    };
  }, []);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.querySelector<HTMLElement>("[data-landing-root]");
    if (!root) return;

    const continuous: ReturnType<typeof animate>[] = [];
    const scope = createScope({ root }).add(() => {
      animate(root.querySelectorAll("[data-reveal]"), {
        opacity: [0, 1],
        translateY: [24, 0],
        delay: stagger(70),
        duration: 800,
        ease: "outExpo",
      });

      animate(svg.createDrawable(root.querySelectorAll("[data-orbit-line]")), {
        draw: ["0 0", "0 1"],
        duration: 1200,
        ease: "inOutQuart",
      });

      root.querySelectorAll("[data-orbit-layer]").forEach((layer, index) => {
        continuous.push(
          animate(layer, {
            translateY: [0, index % 2 === 0 ? -10 : 10],
            rotate: [0, index % 2 === 0 ? 1.2 : -1.2],
            duration: 3600 + index * 400,
            ease: "inOutSine",
            alternate: true,
            loop: true,
          }),
        );
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animate(
            entry.target.querySelectorAll<HTMLElement>("[data-section-reveal]"),
            {
              opacity: [0, 1],
              translateY: [28, 0],
              delay: stagger(80),
              duration: 700,
              ease: "outExpo",
            },
          );
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18 },
    );

    root
      .querySelectorAll("[data-motion-section]")
      .forEach((section) => observer.observe(section));

    const move = (event: PointerEvent) => {
      root.style.setProperty(
        "--pointer-x",
        `${(event.clientX / window.innerWidth - 0.5) * 3}deg`,
      );
      root.style.setProperty(
        "--pointer-y",
        `${(event.clientY / window.innerHeight - 0.5) * -2}deg`,
      );
    };
    const syncVisibility = () => {
      continuous.forEach((animation) => {
        if (document.hidden) animation.pause();
        else animation.play();
      });
    };

    root.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("visibilitychange", syncVisibility);

    return () => {
      observer.disconnect();
      root.removeEventListener("pointermove", move);
      document.removeEventListener("visibilitychange", syncVisibility);
      scope.revert();
    };
  }, []);

  return null;
}
