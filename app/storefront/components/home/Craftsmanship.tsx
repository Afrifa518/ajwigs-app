import Image from "next/image";
import { assets } from "@/app/storefront/assets";
import MotionReveal from "@/app/storefront/components/home/MotionReveal";
import Parallax from "@/app/storefront/components/home/Parallax";

const DETAILS = [
  {
    title: "Transparent HD lace",
    body: "A whisper-thin lace that melts into your skin tone — no visible grid, no shine. The hairline reads as your own.",
  },
  {
    title: "Hand-bleached knots",
    body: "Knots lightened by hand so each strand looks like it grows from the scalp. The detail that separates luxury from costume.",
  },
  {
    title: "Secure, adjustable fit",
    body: "Adjustable straps and combs hold through long days, dancing, weather — without pinching. Set it and forget it.",
  },
  {
    title: "100% human hair",
    body: "Soft, full density that you can wash, style and heat like your own. Cared for well, it lasts season after season.",
  },
];

export default function Craftsmanship() {
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#1c1714] text-[#F1E9D9]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_85%_10%,rgba(200,169,81,0.18),transparent_55%)]" />
      <div className="relative mx-auto max-w-[1400px] px-4 py-20 sm:px-[5vw] sm:py-28 md:px-[7vw] lg:px-[9vw]">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          <MotionReveal className="relative">
            <div className="overflow-hidden rounded-[1.6rem] border border-[#C8A951]/25 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)]">
              <Parallax strength={26}>
                <Image
                  src={assets.about_img}
                  alt="Close-up of an El-ROI lace-front wig showing the transparent lace and natural parting"
                  className="h-full w-full scale-[1.07] object-cover"
                />
              </Parallax>
            </div>
          </MotionReveal>

          <MotionReveal delay={120}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#C8A951]">The craft · finished in the UK</p>
            <h2 className="prata-regular mt-4 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.08] tracking-[-0.01em] text-[#F6F2EA]" style={{ textWrap: "balance" }}>
              Luxury is in the lace.
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-[#cfc3ac] sm:text-base">
              Every unit is finished by hand in the UK — plucked, bleached and shaped
              until it disappears into you. This is the difference you feel the moment
              it&apos;s on.
            </p>

            <dl className="mt-9 grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {DETAILS.map((d, i) => (
                <div key={d.title} className="relative pl-9">
                  <span className="prata-regular absolute left-0 top-0 text-lg text-[#C8A951]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <dt className="text-sm font-semibold tracking-wide text-[#F6F2EA]">{d.title}</dt>
                  <dd className="mt-1.5 text-[13.5px] leading-relaxed text-[#bdb098]">{d.body}</dd>
                </div>
              ))}
            </dl>
          </MotionReveal>
        </div>
      </div>
    </section>
  );
}
