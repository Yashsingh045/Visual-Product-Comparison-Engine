import * as fs from "fs";
import * as https from "https";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOWNLOAD_URL =
  "https://www.kaggle.com/api/v1/models/google/resnet-v2/tfJs/50-feature-vector/1/download";
const OUTPUT_DIR = path.join(__dirname, "../models/resnet50");
const TEMP_FILE = path.join(__dirname, "../models/resnet50.tar.gz");

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const request = (reqUrl: string) => {
      https
        .get(reqUrl, (response) => {
          if (
            response.statusCode &&
            response.statusCode >= 300 &&
            response.statusCode < 400 &&
            response.headers.location
          ) {
            request(response.headers.location);
            return;
          }

          if (response.statusCode !== 200) {
            reject(
              new Error(`Download failed with status ${response.statusCode}`),
            );
            return;
          }

          const totalBytes = parseInt(
            response.headers["content-length"] || "0",
            10,
          );
          let downloaded = 0;

          response.on("data", (chunk: Buffer) => {
            downloaded += chunk.length;
            if (totalBytes > 0) {
              const pct = ((downloaded / totalBytes) * 100).toFixed(1);
              const mb = (downloaded / 1024 / 1024).toFixed(1);
              process.stdout.write(
                `\r  Downloading: ${mb} MB / ${(totalBytes / 1024 / 1024).toFixed(1)} MB (${pct}%)`,
              );
            }
          });

          response.pipe(file);
          file.on("finish", () => {
            file.close();
            console.log("\n");
            resolve();
          });
        })
        .on("error", (err) => {
          fs.unlinkSync(dest);
          reject(err);
        });
    };
    request(url);
  });
}

async function main() {
  console.log("ResNet-50 v2 Feature Extractor - Model Downloader\n");
  console.log(
    "Source: Kaggle Models (google/resnet-v2/tfJs/50-feature-vector)",
  );
  console.log(`Output: ${OUTPUT_DIR}\n`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log("Downloading model (~88 MB)...");
  await downloadFile(DOWNLOAD_URL, TEMP_FILE);
  console.log("Extracting model files...");
  execSync(`tar -xzf "${TEMP_FILE}" -C "${OUTPUT_DIR}"`);
  fs.unlinkSync(TEMP_FILE);

  console.log("Model files:");
  const files = fs.readdirSync(OUTPUT_DIR).sort();
  let totalSize = 0;
  for (const f of files) {
    const size = fs.statSync(path.join(OUTPUT_DIR, f)).size;
    totalSize += size;
    console.log(`  ${f} (${(size / 1024 / 1024).toFixed(1)} MB)`);
  }
  console.log(`\nTotal: ${(totalSize / 1024 / 1024).toFixed(1)} MB`);
  console.log("Done! Model is ready.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  if (fs.existsSync(TEMP_FILE)) fs.unlinkSync(TEMP_FILE);
  process.exit(1);
});
