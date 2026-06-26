import MotionReveal from "@/app/storefront/components/home/MotionReveal";

const POINTS = [
  {
    title: "An undetectable hairline",
    body: "HD lace + hand-bleached knots mean no one can tell. Not in photos, not up close.",
  },
  {
    title: "Comfort that lasts all day",
    body: "A breathable cap and secure straps — no headaches, no slipping, no constant adjusting.",
  },
  {
    title: "Soft, real human hair",
    body: "Wash it, curl it, straighten it. It behaves like hair because it is hair.",
  },
  {
    title: "Built to last",
    body: "Cared for properly, your unit stays full and beautiful season after season — real value, not a one-night look.",
  },
];

const Mark = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#C8A951]" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default function WhyElOlux() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <MotionReveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#6b5a32]">Why El-ROI</p>
          <h2 className="prata-regular mt-4 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.08] tracking-[-0.01em] text-[#1c1714]" style={{ textWrap: "balance" }}>
            Beautiful is the easy part. We perfected the rest.
          </h2>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-[#4b4339] sm:text-base">
            Anyone can sell hair. We obsess over the things you actually live with —
            the fit, the comfort, the finish, the longevity.
          </p>
        </MotionReveal>

        <MotionReveal delay={120}>
          <ul className="divide-y divide-[#1c1714]/10 border-y border-[#1c1714]/10">
            {POINTS.map((p) => (
              <li key={p.title} className="flex items-start gap-4 py-6">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C8A951]/12">
                  <Mark />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-[#1c1714]">{p.title}</h3>
                  <p className="mt-1.5 max-w-md text-[14px] leading-relaxed text-[#4b4339]">{p.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </MotionReveal>
      </div>
    </section>
  );
}
