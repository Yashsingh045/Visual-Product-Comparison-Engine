import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

export interface Product {
    id: number;
    image_path: string;
    title?: string;
}

let db: Database.Database;

/**
 * Initializes the SQLite database.
 * Creates the products table if it doesn't exist.
 */
export function initDb(): Database.Database {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'products.db');

    // Ensure directory exists (though userData usually does)
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(dbPath);

    // Performance optimizations
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');

    // Create schema based on README.md and prompt requirements
    // Note: README mentions product_id and image_path. Prompt mentions id, image_path, title.
    // We'll use id as the primary key and image_path.
    db.exec(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY,
            image_path TEXT NOT NULL,
            title TEXT
        )
    `);

    // Add mapping table as per ER diagram in README
    db.exec(`
        CREATE TABLE IF NOT EXISTS embeddings (
            vector_id INTEGER PRIMARY KEY,
            product_id INTEGER UNIQUE,
            FOREIGN KEY(product_id) REFERENCES products(id)
        )
    `);

    return db;
}

/**
 * Fetches a product by its ID.
 * @param id The product ID.
 * @returns The product or null if not found.
 */
export function getProductById(id: number): Product | null {
    if (!db) initDb();

    const stmt = db.prepare('SELECT id, image_path, title FROM products WHERE id = ?');
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

    // Join products with embeddings to resolve vector_id -> product_id -> metadata
    const stmt = db.prepare(`
        SELECT p.id, p.image_path, p.title 
        FROM products p
        JOIN embeddings e ON p.id = e.product_id
        WHERE e.vector_id = ?
    `);

    const row = stmt.get(vectorId) as Product | undefined;
    return row || null;
}

/**
 * Close database connection
 */
export function closeDb() {
    if (db) {
        db.close();
    }
}
