import Database from "better-sqlite3";
import path from "path";
import { app } from "electron";

export interface Product {
  product_id: number;
  image_path: string;
}

let db: Database.Database;

/**
 * Initializes the SQLite database.
 * Opens the existing products.db from the data/ directory.
 */
export function initDb(): Database.Database {
  const dbPath = path.join(app.getAppPath(), "data", "products.db");

  db = new Database(dbPath, { readonly: true });

  return db;
}

/**
 * Fetches a product by its product_id.
 */
export function getProductById(id: number): Product | null {
  if (!db) initDb();

  const stmt = db.prepare(
    "SELECT product_id, image_path FROM products WHERE product_id = ?",
  );
  const row = stmt.get(id) as Product | undefined;

  return row || null;
}

/**
 * Fetches a product by its HNSW vector ID using the EMBEDDINGS mapping table.
 * @param vectorId The ID returned by the HNSW search.
 * @returns The product or null if not found.
 */
export function getProductByVectorId(vectorId: number): Product | null {
  if (!db) initDb();

  const stmt = db.prepare(`
        SELECT p.product_id, p.image_path 
        FROM products p
        JOIN embeddings e ON p.product_id = e.product_id
        WHERE e.vector_id = ?
    `);

  const row = stmt.get(vectorId) as Product | undefined;
  return row || null;
}

export function closeDb() {
  if (db) {
    db.close();
  }
}
