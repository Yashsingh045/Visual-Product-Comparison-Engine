import { createRequire } from "module";
const require = createRequire(import.meta.url);
const util = require("util");

if (!util.isNullOrUndefined) {
  util.isNullOrUndefined = (val: any) => val === null || val === undefined;
}

import * as tf from "@tensorflow/tfjs-node";
import sharp from "sharp";
import * as fs from "fs";
import Database from "better-sqlite3";
import path from "path";
import hnswlib from "hnswlib-node";
const { HierarchicalNSW } = hnswlib;
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, "../../data/images");
const MODEL_DIR = path.join(__dirname, "../../ml/models/resnet50/model.json");
const DB_PATH = path.join(__dirname, "../../data/products.db");
const INDEX_PATH = path.join(__dirname, "../../data/embeddings.hnsw");
const BATCH_SIZE = 32;
const IMAGE_SIZE = 224;
const DIM = 2048;

function initDatabase(): Database.Database {
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(DB_PATH);

  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      product_id  INTEGER PRIMARY KEY,
      image_path  TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS embeddings (
      vector_id   INTEGER PRIMARY KEY,
      product_id  INTEGER NOT NULL UNIQUE,
      FOREIGN KEY (product_id) REFERENCES products(product_id)
    );
  `);

  return db;
}

async function preprocessImage(imagePath: string): Promise<tf.Tensor3D> {
  const rawPixels = await sharp(imagePath)
    .resize(IMAGE_SIZE, IMAGE_SIZE, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer();

  const tensor = tf.tensor3d(new Float32Array(rawPixels), [
    IMAGE_SIZE,
    IMAGE_SIZE,
    3,
  ]);

  const normalized = tf.tidy(() => {
    return tensor.div(255.0) as tf.Tensor3D;
  });

  tensor.dispose();
  return normalized;
}

async function processImageBatch(
  model: tf.GraphModel,
  imagePaths: string[],
): Promise<Float32Array[]> {
  const tensors: tf.Tensor3D[] = [];
  for (const imgPath of imagePaths) {
    try {
      const tensor = await preprocessImage(imgPath);
      tensors.push(tensor);
    } catch (err) {
      console.warn(`  ⚠ Skipping ${path.basename(imgPath)}: ${err}`);
    }
  }

  if (tensors.length === 0) return [];

  const batchTensor = tf.stack(tensors) as tf.Tensor4D;
  tensors.forEach((t) => t.dispose());

  const predictions = model.predict(batchTensor) as tf.Tensor;
  batchTensor.dispose();

  const normalized = tf.tidy(() => {
    const norms = predictions.norm("euclidean", -1, true);
    return predictions.div(norms);
  });
  predictions.dispose();

  const data = await normalized.data();
  normalized.dispose();

  const embeddings: Float32Array[] = [];
  for (let i = 0; i < tensors.length; i++) {
    embeddings.push(
      new Float32Array(data.slice(i * DIM, (i + 1) * DIM) as Float32Array),
    );
  }

  return embeddings;
}

function getImageFiles(): { productId: number; filePath: string }[] {
  if (!fs.existsSync(IMAGES_DIR)) {
    throw new Error(`Images directory not found: ${IMAGES_DIR}`);
  }

  const files = fs.readdirSync(IMAGES_DIR);
  const imageFiles = files
    .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .map((f) => {
      const match = f.match(/^(\d+)\./);
      if (!match) return null;
      return {
        productId: parseInt(match[1], 10),
        filePath: path.join(IMAGES_DIR, f),
      };
    })
    .filter(Boolean) as { productId: number; filePath: string }[];

  return imageFiles.sort((a, b) => a.productId - b.productId);
}

async function main() {
  console.log("Visual Product Comparison Engine — Embedding Generator\n");

  console.log(`Loading ResNet-50 model from ${MODEL_DIR}...`);
  const model = await tf.loadGraphModel(`file://${MODEL_DIR}`);
  console.log("Model loaded successfully\n");

  console.log("Initializing SQLite database...");
  const db = initDatabase();
  const insertProduct = db.prepare(
    `INSERT OR IGNORE INTO products (product_id, image_path) VALUES (?, ?)`,
  );
  const insertEmbedding = db.prepare(
    `INSERT OR IGNORE INTO embeddings (vector_id, product_id) VALUES (?, ?)`,
  );
  console.log("Database ready\n");

  const imageFiles = getImageFiles();
  const totalImages = imageFiles.length;
  console.log(`Found ${totalImages} images in ${IMAGES_DIR}`);
  console.log(`Processing in batches of ${BATCH_SIZE}...\n`);

  const index = new HierarchicalNSW("cosine", DIM);
  index.initIndex(totalImages, 16, 200, 100);

  const startTime = Date.now();
  let processedCount = 0;
  let vectorId = 0;
  const totalBatches = Math.ceil(totalImages / BATCH_SIZE);

  const insertMany = db.transaction(
    (
      items: {
        productId: number;
        filePath: string;
        vectorId: number;
      }[],
    ) => {
      for (const item of items) {
        insertProduct.run(item.productId, item.filePath);
        insertEmbedding.run(item.vectorId, item.productId);
      }
    },
  );

  for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
    const batchStart = batchIdx * BATCH_SIZE;
    const batchEnd = Math.min(batchStart + BATCH_SIZE, totalImages);
    const batchFiles = imageFiles.slice(batchStart, batchEnd);
    const batchPaths = batchFiles.map((f) => f.filePath);

    const embeddings = await processImageBatch(model, batchPaths);

    const dbItems: {
      productId: number;
      filePath: string;
      vectorId: number;
    }[] = [];

    for (let i = 0; i < embeddings.length; i++) {
      const currentVectorId = vectorId++;
      index.addPoint(Array.from(embeddings[i]), currentVectorId);
      dbItems.push({
        productId: batchFiles[i].productId,
        filePath: batchFiles[i].filePath,
        vectorId: currentVectorId,
      });
    }

    insertMany(dbItems);
    processedCount += embeddings.length;

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const pct = ((processedCount / totalImages) * 100).toFixed(1);
    const bar =
      "█".repeat(Math.floor((processedCount / totalImages) * 20)) +
      "░".repeat(20 - Math.floor((processedCount / totalImages) * 20));
    console.log(
      `  [Batch ${String(batchIdx + 1).padStart(String(totalBatches).length)}/${totalBatches}]  ${bar}  ${processedCount}/${totalImages} (${pct}%)  ${elapsed}s`,
    );
  }

  console.log(`\nSaving HNSWLib index to ${INDEX_PATH}...`);
  const indexDir = path.dirname(INDEX_PATH);
  if (!fs.existsSync(indexDir)) {
    fs.mkdirSync(indexDir, { recursive: true });
  }
  index.writeIndexSync(INDEX_PATH);

  db.close();

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  const indexSize = (fs.statSync(INDEX_PATH).size / (1024 * 1024)).toFixed(1);
  const dbSize = (fs.statSync(DB_PATH).size / (1024 * 1024)).toFixed(2);

  console.log(`\nSummary:`);
  console.log(`   Products processed: ${processedCount}`);
  console.log(`   Embeddings generated: ${vectorId}`);
  console.log(`   Index size: ${indexSize} MB`);
  console.log(`   Database size: ${dbSize} MB`);
  console.log(`   Total time: ${totalTime}s`);
  console.log(`\nDone! Catalog is ready for visual search.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
