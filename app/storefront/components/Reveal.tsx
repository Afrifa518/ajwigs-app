"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
};

export default function Reveal({ children, className = "", delayMs = 0 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  const style = useMemo(() => {
    return delayMs ? ({ transitionDelay: `${delayMs}ms` } as const) : undefined;
  }, [delayMs]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      style={style}
      className={
        `transition-all duration-700 will-change-transform ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        } ` + className
      }
    >
      {children}
    </div>
  );
}
