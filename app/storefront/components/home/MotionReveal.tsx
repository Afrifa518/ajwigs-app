"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Gentle on-scroll reveal. Content is never gated away permanently: a fallback
 * timer and reduced-motion check guarantee it always becomes visible.
 */
export default function MotionReveal({
  children,
  delay = 0,
  y = 24,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    // Safety: never leave content hidden.
    const t = setTimeout(() => setShown(true), 1400);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, []);

  const Comp = Tag as "div";
  return (
    <Comp
      ref={ref as never}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : `translateY(${y}px)`,
        transition: `opacity 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Comp>
  );
}
