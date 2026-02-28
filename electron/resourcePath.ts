import { app } from "electron";
import path from "path";
import fs from "fs";
import AdmZip from "adm-zip";

const isProd = app.isPackaged;

export function getResourcePath(...segments: string[]): string {
  const basePath = isProd ? process.resourcesPath : app.getAppPath();
  return path.join(basePath, ...segments);
}

export function getDataDir(): string {
  if (isProd) {
    return path.join(app.getPath("userData"), "data");
  }
  return path.join(app.getAppPath(), "data");
}

export function getThumbnailsDir(): string {
  return path.join(getDataDir(), "thumbnails");
}

export function ensureAssetsExtracted(): void {
  const dataDir = getDataDir();

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const assetsToExtract = [
    { zipName: "thumbnails.zip", checkPath: "thumbnails" },
    { zipName: "embeddings.hnsw.zip", checkPath: "embeddings.hnsw" },
    { zipName: "products.db.zip", checkPath: "products.db" },
  ];

  for (const asset of assetsToExtract) {
    const targetPath = path.join(dataDir, asset.checkPath);

    // Check if asset already exists
    if (fs.existsSync(targetPath)) {
      continue;
    }

    const zipPath = getResourcePath("data", asset.zipName);

    if (fs.existsSync(zipPath)) {
      try {
        console.log(`Extracting ${asset.zipName} to ${dataDir}...`);
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(dataDir, true);
      } catch (error) {
        console.error(`Failed to extract ${asset.zipName}:`, error);
      }
    } else {
      console.warn(`Asset zip not found: ${zipPath}`);
    }
  }
}
