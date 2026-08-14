import MotionReveal from "@/app/storefront/components/home/MotionReveal";
import { buildWhatsappLink } from "@/lib/whatsapp";

// The four cap constructions we offer for medical / comfort wigs. This doubles
// as customer education — most medical clients choose by scalp comfort, not length.
const CAP_TYPES = [
  { name: "Silk Top", body: "Hair appears to grow from the scalp — the most natural, skin-like parting." },
  { name: "Monofilament", body: "A soft mesh top that's gentle on a sensitive scalp and lets it breathe." },
  { name: "Full Lace", body: "Lace throughout for total styling freedom and an undetectable hairline all round." },
  { name: "Vacuum / Suction", body: "A custom silicone cap that grips a smooth, hair-free scalp securely — no glue, no tape." },
];

export default function MedicalCare() {
  const consult = buildWhatsappLink(
    "Hi El-Roi Lux Hairs, I'd like to book a free consultation about a medical / comfort wig."
  );

  return (
    <section className="relative py-20 sm:py-28">
      <MotionReveal>
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#6b5a32]">
          Medical &amp; Comfort Wigs
        </p>
        <h2
          className="prata-regular mt-4 max-w-2xl text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.08] tracking-[-0.01em] text-[#1c1714]"
          style={{ textWrap: "balance" }}
        >
          Hair loss is personal. Your wig should be too.
        </h2>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[#4b4339] sm:text-base">
          For clients living with alopecia, going through chemotherapy, or with a sensitive scalp,
          we craft soft-cap, comfort-first wigs that look and feel like your own hair — natural,
          secure, and completely discreet.
        </p>
      </MotionReveal>

      <MotionReveal delay={120}>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CAP_TYPES.map((c) => (
            <div key={c.name} className="rounded-2xl border border-[#1c1714]/10 bg-white/50 p-5">
              <h3 className="prata-regular text-lg text-[#1c1714]">{c.name}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[#4b4339]">{c.body}</p>
            </div>
          ))}
        </div>
      </MotionReveal>

      <MotionReveal delay={200}>
        <div className="mt-12 flex flex-col items-start gap-5 rounded-2xl border border-[#C8A951]/30 bg-[#C8A951]/[0.08] p-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="prata-regular text-xl text-[#1c1714]">Free, private consultation</h3>
            <p className="mt-1.5 max-w-lg text-[14px] leading-relaxed text-[#4b4339]">
              Not sure which cap or fit is right? We'll guide you gently through every option —
              no pressure, complete discretion, whenever you're ready.
            </p>
          </div>
          <a
            href={consult}
            target="_blank"
            rel="noopener noreferrer"
            className="press inline-flex shrink-0 items-center gap-2 rounded-full bg-[#1c1714] px-6 py-3 text-sm font-semibold text-[#f6f2ea]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
              <path d="M12 2a10 10 0 0 0-8.7 14.9L2 22l5.3-1.4A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .3-3.3-.7-2.8-1.2-4.5-4-4.6-4.2-.1-.2-1.1-1.4-1.1-2.7 0-1.3.7-1.9 1-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.4.5c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.2 1.3 1.1 2 1.2 2.3 1.1.2-.1.5-.5.7-.8.2-.3.4-.2.6-.1l1.8.9c.2.1.4.2.5.3.1.3.1.6-.1 1.1Z" />
            </svg>
            Book a consultation
          </a>
        </div>
      </MotionReveal>
    </section>
  );
}
