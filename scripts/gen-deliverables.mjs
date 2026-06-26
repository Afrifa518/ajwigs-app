// Generates shareable logo deliverables (mark + full lockup with the name)
// from the recolourable glyph + Prata. Output: Desktop/El-Roi-Logo
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

const fontBuf = fs.readFileSync(FONT);
const font = opentype.parse(
  fontBuf.buffer.slice(fontBuf.byteOffset, fontBuf.byteOffset + fontBuf.byteLength)
);
const COLORS = {
  gold: [201, 162, 75],
  black: [28, 23, 20],
  white: [255, 255, 255],
};

const meta = await sharp(GLYPH).metadata();
const gw = meta.width;
const gh = meta.height;
const glyphAlpha = await sharp(GLYPH).extractChannel(3).raw().toBuffer();

// Recolour the silhouette to a target colour, trimmed tight.
async function coloredMark([r, g, b]) {
  const fill = await sharp({ create: { width: gw, height: gh, channels: 3, background: { r, g, b } } })
    .raw()
    .toBuffer();
  const colored = await sharp(fill, { raw: { width: gw, height: gh, channels: 3 } })
    .joinChannel(glyphAlpha, { raw: { width: gw, height: gh, channels: 1 } })
    .png()
    .toBuffer();
  return sharp(colored).trim().png().toBuffer();
}

// Render a line of Prata text to a tight transparent PNG. One <path> per glyph
// (so librsvg never truncates a long combined path) at high precision (so the
// rounding self-intersection that nibbled the "r" disappears). Rendered large
// for crisp strokes, with explicit density so sharp doesn't down-raster it.
async function textPng(text, size, [r, g, b]) {
  const scale = size / font.unitsPerEm;
  const ascent = font.ascender * scale;
  const descent = font.descender * scale; // negative
  const pad = Math.round(size * 0.15);
  const baseline = ascent + pad;
  const w = Math.ceil(font.getAdvanceWidth(text, size)) + pad * 2;
  const h = Math.ceil(ascent - descent) + pad * 2;
  const glyphs = font.getPaths(text, pad, baseline, size);
  const els = glyphs
    .map((p) => `<path d="${p.toPathData(4)}" fill="rgb(${r},${g},${b})" fill-rule="nonzero"/>`)
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${els}</svg>`;
  const buf = await sharp(Buffer.from(svg), { density: 96 }).trim().png().toBuffer();
  const m = await sharp(buf).metadata();
  return { buf, w: m.width, h: m.height };
}

async function squareMark(name, rgb) {
  const mark = await coloredMark(rgb);
  const S = 1000;
  const inner = Math.round(S * 0.78);
  const resized = await sharp(mark).resize({ width: inner, height: inner, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  await sharp({ create: { width: S, height: S, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: resized, gravity: "center" }])
    .png()
    .toFile(path.join(OUT, `mark-${name}.png`));
}

async function lockup(name, rgb, { bg = null, sub = "" } = {}) {
  const markH = 230;
  const mark = await sharp(await coloredMark(rgb)).resize({ height: markH }).png().toBuffer();
  const markMeta = await sharp(mark).metadata();
  const markW = markMeta.width;

  const textColor = rgb;
  const t1 = await textPng("El-Roi Lux Hairs", 150, textColor);
  const subImg = sub ? await textPng(sub, 46, textColor) : null;

  const gap = 48;
  const padX = 90;
  const padY = 80;
  const textBlockH = t1.h + (subImg ? 26 + subImg.h : 0);
  const contentH = Math.max(markH, textBlockH);
  const W = padX + markW + gap + Math.max(t1.w, subImg ? subImg.w : 0) + padX;
  const H = padY + contentH + padY;

  const layers = [];
  layers.push({ input: mark, left: padX, top: Math.round((H - markH) / 2) });
  const textLeft = padX + markW + gap;
  const textTop = Math.round((H - textBlockH) / 2);
  layers.push({ input: t1.buf, left: textLeft, top: textTop });
  if (subImg) {
    // letter-spacing feel: center the sub under the wordmark start
    layers.push({ input: subImg.buf, left: textLeft + 2, top: textTop + t1.h + 26 });
  }

  let base;
  if (bg) {
    base = sharp({ create: { width: W, height: H, channels: 4, background: bg } });
  } else {
    base = sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } });
  }
  await base.composite(layers).png().toFile(path.join(OUT, `lockup-${name}.png`));
}

// Social card: centred mark + name on a brand background (no tagline).
async function socialCard(name, markRgb, textRgb, bg) {
  const W = 1600, H = 900;
  const markH = 330;
  const mark = await sharp(await coloredMark(markRgb)).resize({ height: markH }).png().toBuffer();
  const t1 = await textPng("El-Roi Lux Hairs", 142, textRgb);
  const blockH = markH + 58 + t1.h;
  const top = Math.round((H - blockH) / 2);
  const mm = await sharp(mark).metadata();
  const layers = [
    { input: mark, left: Math.round((W - mm.width) / 2), top },
    { input: t1.buf, left: Math.round((W - t1.w) / 2), top: top + markH + 58 },
  ];
  await sharp({ create: { width: W, height: H, channels: 4, background: bg } })
    .composite(layers)
    .png()
    .toFile(path.join(OUT, `social-${name}.png`));
}

for (const [name, rgb] of Object.entries(COLORS)) {
  await squareMark(name, rgb);
  await lockup(name, rgb);
}
await socialCard("dark", [201, 162, 75], [246, 242, 234], { r: 28, g: 23, b: 20, alpha: 1 });
await socialCard("ivory", [28, 23, 20], [28, 23, 20], { r: 246, g: 242, b: 234, alpha: 1 });

console.log("Deliverables written to", OUT);
console.log(fs.readdirSync(OUT).join("\n"));
