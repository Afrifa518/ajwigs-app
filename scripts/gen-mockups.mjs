// Generates flat brand mockups (t-shirt, hoodie, cap) + extra logo designs
// (stacked + badge) using the recolourable glyph + Prata.
// Output: Desktop/El-Roi-Logo
import sharp from "sharp";
import opentype from "opentype.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const GLYPH = path.join(dir, "../frontend/src/assets/logo-glyph.png");
const FONT = path.join(dir, "fonts/Prata-Regular.ttf");
const OUT = "C:/Users/user/Desktop/El-Roi-Logo";
fs.mkdirSync(OUT, { recursive: true });

const fb = fs.readFileSync(FONT);
const font = opentype.parse(fb.buffer.slice(fb.byteOffset, fb.byteOffset + fb.byteLength));

const GOLD = [201, 162, 75];
const INK = [28, 23, 20];
const IVORY = [246, 242, 234];

const gm = await sharp(GLYPH).metadata();
const gw = gm.width, gh = gm.height;
const glyphAlpha = await sharp(GLYPH).extractChannel(3).raw().toBuffer();

async function coloredMark([r, g, b]) {
  const fill = await sharp({ create: { width: gw, height: gh, channels: 3, background: { r, g, b } } }).raw().toBuffer();
  const colored = await sharp(fill, { raw: { width: gw, height: gh, channels: 3 } })
    .joinChannel(glyphAlpha, { raw: { width: gw, height: gh, channels: 1 } })
    .png().toBuffer();
  return sharp(colored).trim().png().toBuffer();
}

async function textPng(text, size, [r, g, b]) {
  const scale = size / font.unitsPerEm;
  const ascent = font.ascender * scale;
  const descent = font.descender * scale;
  const pad = Math.round(size * 0.15);
  const baseline = ascent + pad;
  const w = Math.ceil(font.getAdvanceWidth(text, size)) + pad * 2;
  const h = Math.ceil(ascent - descent) + pad * 2;
  const glyphs = font.getPaths(text, pad, baseline, size);
  const els = glyphs.map((p) => `<path d="${p.toPathData(4)}" fill="rgb(${r},${g},${b})"/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${els}</svg>`;
  const buf = await sharp(Buffer.from(svg), { density: 96 }).trim().png().toBuffer();
  const m = await sharp(buf).metadata();
  return { buf, w: m.width, h: m.height };
}

// Stacked lockup: mark centred over the name (+ optional tagline). Transparent.
async function stackedLockup(markRgb, textRgb, { markH = 360, withTag = true } = {}) {
  const mark = await sharp(await coloredMark(markRgb)).resize({ height: markH }).png().toBuffer();
  const mm = await sharp(mark).metadata();
  const name = await textPng("El-Roi Lux Hairs", 150, textRgb);
  const tag = withTag ? await textPng("PREMIUM UK HAIR HOUSE", 40, markRgb) : null;
  const g1 = 56, g2 = 28;
  const W = Math.max(mm.width, name.w, tag ? tag.w : 0) + 80;
  const H = 40 + markH + g1 + name.h + (tag ? g2 + tag.h : 0) + 40;
  const layers = [
    { input: mark, left: Math.round((W - mm.width) / 2), top: 40 },
    { input: name.buf, left: Math.round((W - name.w) / 2), top: 40 + markH + g1 },
  ];
  if (tag) layers.push({ input: tag.buf, left: Math.round((W - tag.w) / 2), top: 40 + markH + g1 + name.h + g2 });
  return sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(layers).png().toBuffer();
}

// Circular badge: mark over name inside a ring. Transparent.
async function badge(markRgb, textRgb) {
  const S = 1500;
  const [mr, mg, mb] = markRgb;
  const ring = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
    <circle cx="${S/2}" cy="${S/2}" r="${S/2-18}" fill="none" stroke="rgb(${mr},${mg},${mb})" stroke-width="7"/>
    <circle cx="${S/2}" cy="${S/2}" r="${S/2-46}" fill="none" stroke="rgb(${mr},${mg},${mb})" stroke-width="2.5"/>
  </svg>`;
  const ringPng = await sharp(Buffer.from(ring)).png().toBuffer();
  const markH = 360;
  const mark = await sharp(await coloredMark(markRgb)).resize({ height: markH }).png().toBuffer();
  const mm = await sharp(mark).metadata();
  const name = await textPng("El-Roi Lux Hairs", 138, textRgb);
  const tag = await textPng("PREMIUM UK HAIR HOUSE", 40, markRgb);
  const g1 = 44, g2 = 24;
  const blockH = markH + g1 + name.h + g2 + tag.h;
  const top = Math.round((S - blockH) / 2);
  return sharp(ringPng).composite([
    { input: mark, left: Math.round((S - mm.width) / 2), top },
    { input: name.buf, left: Math.round((S - name.w) / 2), top: top + markH + g1 },
    { input: tag.buf, left: Math.round((S - tag.w) / 2), top: top + markH + g1 + name.h + g2 },
  ]).png().toBuffer();
}

// ── Garment silhouettes (flat, soft fabric gradient) ──
function fabricDefs(id, light, dark) {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0.3" y2="1">
    <stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></linearGradient>`;
}

function tshirtSvg(W, H, light, dark, seam) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 1000 880">
    <defs>${fabricDefs("f", light, dark)}</defs>
    <path d="M352 182 Q340 160 305 168 L172 250 Q146 268 159 300 L226 414 Q237 433 264 427 L322 392 L322 786 Q322 804 340 804 L660 804 Q678 804 678 786 L678 392 L736 427 Q763 433 774 414 L841 300 Q854 268 828 250 L695 168 Q660 160 648 182 Q576 244 500 244 Q424 244 352 182 Z"
      fill="url(#f)" stroke="${seam}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M380 192 Q440 250 500 250 Q560 250 620 192" fill="none" stroke="${seam}" stroke-width="5" opacity="0.55"/>
    <path d="M398 208 Q448 258 500 258 Q552 258 602 208" fill="none" stroke="${light}" stroke-width="8" opacity="0.45"/>
  </svg>`;
}

function hoodieSvg(W, H, light, dark, seam) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 1000 980">
    <defs>${fabricDefs("f", light, dark)}</defs>
    <!-- body + long sleeves -->
    <path d="M338 252 L150 318 Q120 332 130 366 L196 612 Q205 636 232 632 L300 612 L300 858 Q300 876 318 876 L682 876 Q700 876 700 858 L700 612 L768 632 Q795 636 804 612 L870 366 Q880 332 850 318 L662 252 Z"
      fill="url(#f)" stroke="${seam}" stroke-width="3" stroke-linejoin="round"/>
    <!-- hood -->
    <path d="M338 252 Q366 150 500 150 Q634 150 662 252 Q586 300 500 300 Q414 300 338 252 Z" fill="${dark}" stroke="${seam}" stroke-width="3"/>
    <path d="M402 250 Q434 174 500 174 Q566 174 598 250 Q552 280 500 280 Q448 280 402 250 Z" fill="${light}" opacity="0.3"/>
    <!-- pocket -->
    <path d="M352 690 L648 690 Q662 690 662 706 L662 812 L338 812 L338 706 Q338 690 352 690 Z" fill="none" stroke="${seam}" stroke-width="4" opacity="0.5"/>
    <!-- drawstrings -->
    <line x1="472" y1="296" x2="472" y2="468" stroke="${seam}" stroke-width="7" opacity="0.7"/>
    <line x1="528" y1="296" x2="528" y2="468" stroke="${seam}" stroke-width="7" opacity="0.7"/>
    <circle cx="472" cy="476" r="9" fill="${seam}"/><circle cx="528" cy="476" r="9" fill="${seam}"/>
  </svg>`;
}

function capSvg(W, H, light, dark, seam) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 1000 620">
    <defs>${fabricDefs("f", light, dark)}</defs>
    <!-- brim (behind crown, curving toward viewer) -->
    <path d="M250 430 Q500 392 758 430 Q806 470 716 512 Q500 560 286 512 Q198 470 250 430 Z"
      fill="${dark}" stroke="${seam}" stroke-width="3"/>
    <!-- crown -->
    <path d="M214 446 Q204 196 500 182 Q796 196 786 446 Q648 410 500 410 Q352 410 214 446 Z"
      fill="url(#f)" stroke="${seam}" stroke-width="3"/>
    <!-- panel seams (kept inside the crown) -->
    <path d="M500 188 L500 408" stroke="${seam}" stroke-width="2.5" opacity="0.3"/>
    <path d="M360 214 Q352 320 366 408" fill="none" stroke="${seam}" stroke-width="2.5" opacity="0.25"/>
    <path d="M640 214 Q648 320 634 408" fill="none" stroke="${seam}" stroke-width="2.5" opacity="0.25"/>
    <circle cx="500" cy="190" r="12" fill="${dark}" stroke="${seam}" stroke-width="2"/>
  </svg>`;
}

async function mockup(filename, garmentSvg, gW, gH, logo, logoTop, logoTargetW, bg) {
  const garment = await sharp(Buffer.from(garmentSvg)).png().toBuffer();
  const gMeta = await sharp(garment).metadata();
  const logoR = await sharp(logo).resize({ width: logoTargetW }).png().toBuffer();
  const lMeta = await sharp(logoR).metadata();
  // place garment centred on bg, logo centred on chest
  const left = Math.round((gW - gMeta.width) / 2);
  const top = Math.round((gH - gMeta.height) / 2);
  await sharp({ create: { width: gW, height: gH, channels: 4, background: bg } })
    .composite([
      { input: garment, left, top },
      { input: logoR, left: Math.round((gW - lMeta.width) / 2), top: logoTop },
    ])
    .png()
    .toFile(path.join(OUT, filename));
}

// ── Build extra logo designs ──
await sharp(await stackedLockup(GOLD, IVORY)).toFile(path.join(OUT, "stacked-gold-on-dark.png")); // transparent (use on dark)
await sharp(await stackedLockup(INK, INK)).toFile(path.join(OUT, "stacked-ink.png"));
await sharp(await badge(GOLD, IVORY)).toFile(path.join(OUT, "badge-gold.png"));
await sharp(await badge(INK, INK)).toFile(path.join(OUT, "badge-ink.png"));

// ── Build apparel mockups ──
const studio = { r: 238, g: 233, b: 224, alpha: 1 };
const goldLogo = await stackedLockup(GOLD, GOLD, { markH: 300, withTag: true });
const inkLogo = await stackedLockup(INK, INK, { markH: 300, withTag: true });
const goldMark = await coloredMark(GOLD);

// charcoal garments + gold logo
await mockup("mockup-tshirt-charcoal.png", tshirtSvg(1300, 1300, "#2c2622", "#1a1613", "#100d0a"), 1300, 1300, goldLogo, 470, 360, studio);
await mockup("mockup-hoodie-charcoal.png", hoodieSvg(1300, 1400, "#2c2622", "#1a1613", "#100d0a"), 1300, 1400, goldLogo, 560, 360, studio);
await mockup("mockup-cap-charcoal.png", capSvg(1300, 1000, "#2c2622", "#1a1613", "#100d0a"), 1300, 1000, goldMark, 430, 175, studio);
// ivory tee + ink logo
await mockup("mockup-tshirt-ivory.png", tshirtSvg(1300, 1300, "#f4efe6", "#e2daccc".slice(0,7), "#cfc6b5"), 1300, 1300, inkLogo, 470, 360, { r: 32, g: 28, b: 24, alpha: 1 });

console.log("done:\n" + fs.readdirSync(OUT).filter((f) => f.startsWith("mockup") || f.startsWith("stacked") || f.startsWith("badge")).join("\n"));
