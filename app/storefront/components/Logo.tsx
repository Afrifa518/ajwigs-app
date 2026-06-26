import glyph from "@/frontend/src/assets/logo-glyph.png";

/**
 * El-Roi Lux Hairs logo lockup. The mark is a recolourable silhouette painted
 * with `currentColor` via a CSS mask, so the whole logo adapts to ANY
 * background — set the text colour on a parent (e.g. text-[#1c1714] on light,
 * text-[#F6F2EA] or text-[#C8A951] on dark) and the mark follows.
 */
export default function Logo({
  withName = true,
  markClassName = "h-9 w-9",
  className = "",
}: {
  withName?: boolean;
  markClassName?: string;
  className?: string;
}) {
  return (
    <span className={"inline-flex items-center gap-2.5 " + className}>
      <span
        aria-hidden
        className={"inline-block shrink-0 " + markClassName}
        style={{
          WebkitMaskImage: `url(${glyph.src})`,
          maskImage: `url(${glyph.src})`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          backgroundColor: "currentColor",
        }}
      />
      {withName ? (
        <span className="flex flex-col leading-none">
          <span className="font-serif text-[17px] leading-none tracking-tight">El-Roi</span>
          <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.34em] opacity-80">
            Lux Hairs
          </span>
        </span>
      ) : null}
      <span className="sr-only">El-Roi Lux Hairs</span>
    </span>
  );
}
