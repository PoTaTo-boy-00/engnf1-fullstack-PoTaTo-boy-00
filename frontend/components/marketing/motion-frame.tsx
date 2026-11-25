"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

export function MotionFrame({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const heroItems = root.querySelectorAll<HTMLElement>("[data-motion='hero']");
      gsap.fromTo(heroItems, { y: 18, autoAlpha: 0 }, {
        y: 0,
        autoAlpha: 1,
        duration: 0.8,
        stagger: 0.13,
        ease: "power3.out",
        clearProps: "all",
      });

      const reveals = Array.from(root.querySelectorAll<HTMLElement>("[data-motion='reveal']"));
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          gsap.fromTo(entry.target, { y: 16, autoAlpha: 0 }, {
            y: 0,
            autoAlpha: 1,
            duration: 0.65,
            ease: "power2.out",
            clearProps: "all",
          });
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.12 });

      reveals.forEach((element) => observer.observe(element));
      return () => observer.disconnect();
    });

    return () => media.revert();
  }, []);

  return <div ref={rootRef}>{children}</div>;
}
