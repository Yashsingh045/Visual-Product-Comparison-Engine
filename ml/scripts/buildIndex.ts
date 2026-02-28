import { createRequire } from "module";
const require = createRequire(import.meta.url);
const util = require("util");
if (!util.isNullOrUndefined) {
  util.isNullOrUndefined = (val: any) => val === null || val === undefined;
}

import sharp from "sharp";
import * as fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, "../../data/images");
const THUMBNAILS_DIR = path.join(__dirname, "../../data/thumbnails");
const THUMB_SIZE = 200;
const THUMB_QUALITY = 80;

async function main() {
  console.log("Thumbnail Generator\n");

  if (!fs.existsSync(THUMBNAILS_DIR)) {
    fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
  }
  if (!fs.existsSync(IMAGES_DIR)) {
    throw new Error(`Images directory not found: ${IMAGES_DIR}`);
  }

  const files = fs
    .readdirSync(IMAGES_DIR)
    .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
  const totalImages = files.length;
  console.log(`Found ${totalImages} images in ${IMAGES_DIR}`);
  console.log(`   Generating ${THUMB_SIZE}×${THUMB_SIZE} thumbnails...\n`);

  const startTime = Date.now();
  let processed = 0;
  let skipped = 0;

  for (const file of files) {
    const inputPath = path.join(IMAGES_DIR, file);
    const outputPath = path.join(THUMBNAILS_DIR, file);

    if (fs.existsSync(outputPath)) {
      skipped++;
      processed++;
      continue;
    }

    try {
      await sharp(inputPath)
        .resize(THUMB_SIZE, THUMB_SIZE, {
          fit: "cover",
          position: "center",
        })
        .jpeg({ quality: THUMB_QUALITY })
        .toFile(outputPath);

      processed++;

      if (processed % 500 === 0 || processed === totalImages) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const pct = ((processed / totalImages) * 100).toFixed(1);
        console.log(`  [${processed}/${totalImages}]  ${pct}%  ${elapsed}s`);
      }
    } catch (err) {
      console.warn(`Skipping ${file}: ${err}`);
      skipped++;
      processed++;
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  const thumbDirSize = fs.readdirSync(THUMBNAILS_DIR).reduce((total, f) => {
    return total + fs.statSync(path.join(THUMBNAILS_DIR, f)).size;
  }, 0);
  const thumbSizeMB = (thumbDirSize / (1024 * 1024)).toFixed(1);

  console.log(`\nSummary:`);
  console.log(`   • Thumbnails generated: ${processed - skipped}`);
  console.log(`   • Skipped (already existed): ${skipped}`);
  console.log(`   • Total thumbnails directory: ${thumbSizeMB} MB`);
  console.log(`   • Total time: ${totalTime}s`);
  console.log(`\nThumbnails ready in ${THUMBNAILS_DIR}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
