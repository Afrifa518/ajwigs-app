import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { assets } from "@/app/storefront/assets";
import { buildWhatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Medical & Comfort Wigs | El-Roi Lux Hairs",
  description:
    "Soft-cap, comfort-first wigs for alopecia, chemotherapy and sensitive scalps — natural, secure and discreet. Book a free, private consultation.",
};

// Apostrophes are kept inside these JS strings (rendered via {expressions}) so
// they never appear as raw JSX text (which the build's lint rule rejects).
const WHO = [
  "Alopecia",
  "Chemotherapy & medical hair loss",
  "A sensitive or tender scalp",
  "Thinning hair",
];

const CAP_TYPES = [
  { name: "Silk Top", body: "Hair is knotted under a fine silk layer so it looks like it grows from the scalp — the most natural parting.", best: "A realistic part" },
  { name: "Monofilament", body: "A soft, breathable mesh crown that's gentle on a tender scalp and lets hair be parted in any direction.", best: "Sensitive scalps" },
  { name: "Full Lace", body: "Sheer lace across the whole cap — style it up, back or to either side with an undetectable hairline all round.", best: "Styling freedom" },
  { name: "Vacuum / Suction", body: "A custom-moulded silicone cap that holds securely to a smooth, hair-free scalp by suction — no glue, no tape.", best: "Total hair loss" },
];

const STEPS = [
  { n: "01", t: "Reach out", b: "Message us on WhatsApp. Share as much or as little as you feel comfortable with — there's no pressure." },
  { n: "02", t: "Private consultation", b: "We talk through cap type, fit, length and colour together, gently and at your pace." },
  { n: "03", t: "Fitted & delivered", b: "Your wig is prepared, finished and delivered discreetly, anywhere in the UK." },
];

export default function MedicalPage() {
  const consult = buildWhatsappLink(
    "Hi El-Roi Lux Hairs, I'd like to book a free consultation about a medical / comfort wig."
  );

  return (
    <div className="py-14 sm:py-20">
      {/* Hero */}
      <section className="border-t border-[#1c1714]/10 pt-12">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#6b5a32]">
          Medical &amp; Comfort Wigs
        </p>
        <h1
          className="prata-regular mt-4 max-w-3xl text-[clamp(2.2rem,5.5vw,4rem)] leading-[1.05] tracking-[-0.01em] text-[#1c1714]"
          style={{ textWrap: "balance" }}
        >
          Hair loss is personal. Your wig should be too.
        </h1>
        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-[#4b4339] sm:text-lg">
          For anyone living with hair loss, the right wig is about so much more than looks. It is
          about comfort, confidence, and feeling like yourself again. We craft soft-cap,
          comfort-first wigs that look and feel like your own hair — natural, secure, and
          completely discreet.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href={consult}
            target="_blank"
            rel="noopener noreferrer"
            className="press inline-flex items-center gap-2 rounded-full bg-[#1c1714] px-7 py-3.5 text-sm font-semibold text-[#f6f2ea]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
              <path d="M12 2a10 10 0 0 0-8.7 14.9L2 22l5.3-1.4A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .3-3.3-.7-2.8-1.2-4.5-4-4.6-4.2-.1-.2-1.1-1.4-1.1-2.7 0-1.3.7-1.9 1-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.4.5c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.2 1.3 1.1 2 1.2 2.3 1.1.2-.1.5-.5.7-.8.2-.3.4-.2.6-.1l1.8.9c.2.1.4.2.5.3.1.3.1.6-.1 1.1Z" />
            </svg>
            Book a free consultation
          </a>
          <Link
            href="/collection"
            className="press inline-flex items-center gap-2 rounded-full border border-[#1c1714]/20 px-7 py-3.5 text-sm font-semibold text-[#1c1714] transition-colors hover:border-[#C8A951]"
          >
            Browse the collection
          </Link>
        </div>
        </div>
          <div className="relative">
            <Image
              src={assets.medical_silk}
              alt="A woman wearing a natural, comfortable medical wig with a realistic parting"
              className="h-auto w-full rounded-3xl object-cover ring-1 ring-[#C8A951]/20"
              sizes="(max-width: 1024px) 100vw, 45vw"
              priority
            />
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="mt-16 sm:mt-24">
        <h2 className="prata-regular text-[clamp(1.6rem,3.5vw,2.4rem)] leading-tight text-[#1c1714]">
          Made with care, for real needs
        </h2>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {WHO.map((w) => (
            <div
              key={w}
              className="flex items-center gap-3 rounded-2xl border border-[#1c1714]/10 bg-white/50 px-5 py-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C8A951]/15">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#8a6a1f]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <span className="text-[14px] font-medium text-[#1c1714]">{w}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Cap types */}
      <section className="mt-16 sm:mt-24">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#6b5a32]">Choose by comfort</p>
        <h2 className="prata-regular mt-3 text-[clamp(1.6rem,3.5vw,2.4rem)] leading-tight text-[#1c1714]">
          The four cap types we make
        </h2>
        <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-[#4b4339]">
          Medical wigs are chosen by how they feel against the scalp, not just by length. Here is
          how each construction differs.
        </p>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CAP_TYPES.map((c) => (
            <div key={c.name} className="flex flex-col rounded-2xl border border-[#1c1714]/10 bg-white/50 p-6">
              <h3 className="prata-regular text-xl text-[#1c1714]">{c.name}</h3>
              <p className="mt-2.5 flex-1 text-[13.5px] leading-relaxed text-[#4b4339]">{c.body}</p>
              <span className="mt-4 inline-flex w-fit rounded-full border border-[#C8A951]/40 bg-[#C8A951]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#8a6a1f]">
                Best for: {c.best}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Reassurance with photo */}
      <section className="mt-16 sm:mt-24">
        <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2">
          <Image
            src={assets.medical_curls}
            alt="A woman smiling warmly, wearing a natural curly wig"
            className="h-auto w-full rounded-3xl object-cover ring-1 ring-[#C8A951]/20"
            sizes="(max-width: 1024px) 100vw, 45vw"
          />
          <div>
            <h2 className="prata-regular text-[clamp(1.6rem,3.5vw,2.4rem)] leading-tight text-[#1c1714]">
              You, still you.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#4b4339]">
              Our medical wigs are made from soft, real human hair on breathable, comfort-first caps
              — so what you see in the mirror feels like home. Wear it to work, to appointments, to
              celebrations, with total confidence.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mt-16 sm:mt-24">
        <h2 className="prata-regular text-[clamp(1.6rem,3.5vw,2.4rem)] leading-tight text-[#1c1714]">
          How your consultation works
        </h2>
        <div className="mt-9 grid gap-8 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n}>
              <span className="prata-regular text-4xl text-[#C8A951]">{s.n}</span>
              <h3 className="mt-3 text-base font-semibold text-[#1c1714]">{s.t}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-[#4b4339]">{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mt-16 sm:mt-24">
        <div className="flex flex-col items-start gap-6 rounded-3xl border border-[#C8A951]/30 bg-[#C8A951]/[0.08] p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <h2 className="prata-regular text-[clamp(1.5rem,3vw,2.1rem)] leading-tight text-[#1c1714]">
              Confidence, restored — whenever you are ready.
            </h2>
            <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-[#4b4339]">
              A free, private consultation with no pressure and complete discretion. We are here to
              help you feel like yourself again.
            </p>
          </div>
          <a
            href={consult}
            target="_blank"
            rel="noopener noreferrer"
            className="press inline-flex shrink-0 items-center gap-2 rounded-full bg-[#1c1714] px-7 py-3.5 text-sm font-semibold text-[#f6f2ea]"
          >
            Book a consultation
          </a>
        </div>
      </section>
    </div>
  );
}
