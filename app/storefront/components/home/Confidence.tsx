import Image from "next/image";
import Link from "next/link";
import { assets } from "@/app/storefront/assets";
import MotionReveal from "@/app/storefront/components/home/MotionReveal";
import Parallax from "@/app/storefront/components/home/Parallax";

export default function Confidence() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <MotionReveal className="relative order-1">
          <div className="relative">
            <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_30%_20%,rgba(200,169,81,0.35),transparent_60%)] blur-2xl" />
            <div className="overflow-hidden rounded-[1.6rem] border border-[#1c1714]/10 bg-white shadow-[0_30px_80px_-30px_rgba(28,23,20,0.4)]">
              <Parallax strength={22}>
                <Image
                  src={assets.hero_img}
                  alt="Model wearing a honey-toned bob wig with a gold pendant"
                  className="h-full w-full scale-[1.06] object-cover"
                  priority
                />
              </Parallax>
            </div>
            <div className="absolute -bottom-5 -left-3 rounded-2xl border border-[#1c1714]/10 bg-[#F6F2EA]/95 px-5 py-3 shadow-lg backdrop-blur">
              <p className="prata-regular text-lg leading-none text-[#1c1714]">5.0★</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[#6b5a32]">Loved by clients</p>
            </div>
          </div>
        </MotionReveal>

        <MotionReveal delay={120} className="order-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#6b5a32]">The feeling</p>
          <h2 className="prata-regular mt-4 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.08] tracking-[-0.01em] text-[#1c1714]" style={{ textWrap: "balance" }}>
            Walk in like the room was waiting.
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#4b4339] sm:text-base">
            A cheap wig announces itself — shiny fibre, a stiff cap, a hairline that
            never quite lands. You feel it all day, so you never fully relax.
          </p>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#4b4339] sm:text-base">
            El-ROI is the opposite. An undetectable lace, soft movement, a fit that
            holds — so you stop thinking about your hair and simply carry the room.
            Expensive on the outside, effortless on the inside.
          </p>
          <Link
            href="/collection"
            className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#1c1714]"
          >
            <span className="border-b border-[#C8A951] pb-1">Find your look</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </MotionReveal>
      </div>
    </section>
  );
}
