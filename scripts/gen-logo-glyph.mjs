// Generates a transparent, recolourable silhouette from the (white-background)
// logo so it can be tinted to any colour via CSS mask + currentColor.
// Run: node scripts/gen-logo-glyph.mjs
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(dir, "../frontend/src/assets/logo.png");
const out = path.join(dir, "../frontend/src/assets/logo-glyph.png");

const meta = await sharp(src).metadata();
const width = meta.width;
const height = meta.height;

// Raw RGB pixels (drop any alpha).
const rgb = await sharp(src).removeAlpha().raw().toBuffer();

// Alpha = how far each pixel is from white, measured on the channel that drops
// most (min channel). The warm terracotta mark drops hard; white stays 0.
// A gentle boost makes the line-art read as solid while keeping soft edges.
const px = width * height;
const alpha = Buffer.alloc(px);
for (let i = 0; i < px; i++) {
  const r = rgb[i * 3];
  const g = rgb[i * 3 + 1];
  const b = rgb[i * 3 + 2];
  const minC = Math.min(r, g, b);
  let a = (255 - minC) * 1.45;
  if (a > 255) a = 255;
  alpha[i] = a;
}

// White silhouette + computed alpha -> recolourable transparent glyph.
const whiteRGB = Buffer.alloc(px * 3, 255);
await sharp(whiteRGB, { raw: { width, height, channels: 3 } })
  .joinChannel(alpha, { raw: { width, height, channels: 1 } })
  .png()
  .toFile(out);

console.log("wrote", out, `${width}x${height}`);
