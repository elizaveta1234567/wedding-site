/**
 * Сжимает тяжёлые ассеты в WebP (sharp). Запуск: node scripts/webp-optimize.mjs
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, "..", "images");

/** [входной файл, webp-файл, quality] */
const jobs = [
  ["IMG_0119.PNG", "IMG_0119.webp", 82],
  ["dresscodecolor.png", "dresscodecolor.webp", 82],
  ["f243f7ee_9fee3126.png", "f243f7ee_9fee3126.webp", 85],
  ["lenta.PNG", "lenta.webp", 78],
  ["big_image.jpg", "big_image.webp", 82],
];

for (const [srcName, destName, quality] of jobs) {
  const inPath = path.join(imagesDir, srcName);
  const outPath = path.join(imagesDir, destName);
  if (!fs.existsSync(inPath)) {
    console.warn("skip (нет файла):", srcName);
    continue;
  }
  await sharp(inPath)
    .webp({ quality, effort: 5, smartSubsample: true })
    .toFile(outPath);
  const inSz = fs.statSync(inPath).size;
  const outSz = fs.statSync(outPath).size;
  console.log(
    `${destName}: ${(inSz / 1024).toFixed(0)} KB → ${(outSz / 1024).toFixed(0)} KB`,
  );
}

console.log("done");
