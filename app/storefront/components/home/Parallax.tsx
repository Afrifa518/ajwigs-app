"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Subtle scroll parallax. Desktop + motion-OK only; rAF-throttled; translates
 * a small amount so it can never reveal a frame edge (pair with a slightly
 * oversized child). No-op on touch/reduced-motion for performance + comfort.
 */
export default function Parallax({
  children,
  strength = 28,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(max-width: 1023px)").matches) return;

    let raf = 0;
    let ticking = false;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh; // ~[-1,1]
      el.style.transform = `translate3d(0, ${(-progress * strength).toFixed(1)}px, 0)`;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        raf = requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [strength]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
