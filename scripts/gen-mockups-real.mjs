// Composites the El-Roi logo onto REAL plain-garment photos (downloaded into
// scripts/_garments). Output: Desktop/El-Roi-Logo
import sharp from "sharp";
import opentype from "opentype.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const GLYPH = path.join(dir, "../frontend/src/assets/logo-glyph.png");
const FONT = path.join(dir, "fonts/Prata-Regular.ttf");
const G = path.join(dir, "_garments");
const OUT = "C:/Users/user/Desktop/El-Roi-Logo";
fs.mkdirSync(OUT, { recursive: true });

const fb = fs.readFileSync(FONT);
const font = opentype.parse(fb.buffer.slice(fb.byteOffset, fb.byteOffset + fb.byteLength));
const gm = await sharp(GLYPH).metadata();
const gw = gm.width, gh = gm.height;
const glyphAlpha = await sharp(GLYPH).extractChannel(3).raw().toBuffer();

async function coloredMark([r, g, b]) {
  const fill = await sharp({ create: { width: gw, height: gh, channels: 3, background: { r, g, b } } }).raw().toBuffer();
  const colored = await sharp(fill, { raw: { width: gw, height: gh, channels: 3 } })
    .joinChannel(glyphAlpha, { raw: { width: gw, height: gh, channels: 1 } }).png().toBuffer();
  return sharp(colored).trim().png().toBuffer();
}
async function textPng(text, size, [r, g, b]) {
  const scale = size / font.unitsPerEm;
  const ascent = font.ascender * scale, descent = font.descender * scale;
  const pad = Math.round(size * 0.15), baseline = ascent + pad;
  const w = Math.ceil(font.getAdvanceWidth(text, size)) + pad * 2;
  const h = Math.ceil(ascent - descent) + pad * 2;
  const els = font.getPaths(text, pad, baseline, size).map((p) => `<path d="${p.toPathData(4)}" fill="rgb(${r},${g},${b})"/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${els}</svg>`;
  const buf = await sharp(Buffer.from(svg), { density: 96 }).trim().png().toBuffer();
  const m = await sharp(buf).metadata();
  return { buf, w: m.width, h: m.height };
}
async function stackedLockup(markRgb, textRgb, { markH = 300 } = {}) {
  const mark = await sharp(await coloredMark(markRgb)).resize({ height: markH }).png().toBuffer();
  const mm = await sharp(mark).metadata();
  const name = await textPng("El-Roi Lux Hairs", 150, textRgb);
  const tag = await textPng("PREMIUM UK HAIR HOUSE", 40, markRgb);
  const g1 = 56, g2 = 28;
  const W = Math.max(mm.width, name.w, tag.w) + 60;
  const H = 30 + markH + g1 + name.h + g2 + tag.h + 30;
  return sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: mark, left: Math.round((W - mm.width) / 2), top: 30 },
      { input: name.buf, left: Math.round((W - name.w) / 2), top: 30 + markH + g1 },
      { input: tag.buf, left: Math.round((W - tag.w) / 2), top: 30 + markH + g1 + name.h + g2 },
    ]).png().toBuffer();
}

// Place a logo onto a garment photo. cx/cy/printW are fractions of the photo.
async function placeOnGarment(photoPath, outName, logo, { cx, cyTop, printWfrac, blend = "over", opacity = 1 }) {
  const photo = sharp(photoPath);
  const meta = await photo.metadata();
  const targetW = Math.round(meta.width * printWfrac);
  let logoR = await sharp(logo).resize({ width: targetW }).png().toBuffer();
  if (opacity < 1) {
    logoR = await sharp(logoR).composite([{ input: Buffer.from([255, 255, 255, Math.round(255 * opacity)]), raw: { width: 1, height: 1, channels: 4 }, tile: true, blend: "dest-in" }]).png().toBuffer();
  }
  const lMeta = await sharp(logoR).metadata();
  const left = Math.round(meta.width * cx - lMeta.width / 2);
  const top = Math.round(meta.height * cyTop);
  await photo.composite([{ input: logoR, left, top, blend }]).jpeg({ quality: 90 }).toFile(path.join(OUT, outName));
  console.log(outName, `${meta.width}x${meta.height} logo ${lMeta.width}x${lMeta.height} @ ${left},${top}`);
}

const goldLogo = await stackedLockup([201, 162, 75], [201, 162, 75]);
const inkLogo = await stackedLockup([28, 23, 20], [28, 23, 20]);

// Black tee + gold logo
await placeOnGarment(path.join(G, "tee_8532616.jpg"), "real-tshirt-black.png", goldLogo, { cx: 0.5, cyTop: 0.34, printWfrac: 0.2, blend: "over" });
// Taupe hoodie + ink logo (multiply -> printed look)
await placeOnGarment(path.join(G, "hoodie_6786666.jpg"), "real-hoodie-taupe.png", inkLogo, { cx: 0.47, cyTop: 0.5, printWfrac: 0.24, blend: "over", opacity: 0.92 });
