import { app } from "electron";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";

const isProd = app.isPackaged;

export function getResourcePath(...segments: string[]): string {
  const basePath = isProd ? process.resourcesPath : app.getAppPath();
  return path.join(basePath, ...segments);
}

export function getThumbnailsDir(): string {
  if (isProd) {
    return path.join(app.getPath("userData"), "thumbnails");
  }
  return path.join(app.getAppPath(), "data", "thumbnails");
}

export function ensureThumbnailsExtracted(): void {
  const thumbnailsDir = getThumbnailsDir();

  if (fs.existsSync(thumbnailsDir)) {
    console.log("Thumbnails directory found:", thumbnailsDir);
    return;
  }

  const tarPath = getResourcePath("data", "thumbnails.tar.gz");

  if (!fs.existsSync(tarPath)) {
    console.warn("Thumbnails archive not found:", tarPath);
    return;
  }

  console.log("Extracting thumbnails on first launch...");
  const targetDir = path.dirname(thumbnailsDir);
  fs.mkdirSync(targetDir, { recursive: true });
  execSync(`tar -xzf "${tarPath}" -C "${targetDir}"`);
  console.log("Thumbnails extracted to:", thumbnailsDir);
}
