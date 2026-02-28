import { createRequire } from 'module';
const _require = createRequire(import.meta.url);
const { HierarchicalNSW } = _require('hnswlib-node');
import path from 'path';
import fs from 'fs';

export interface SearchResult {
    id: number;
    distance: number;
    similarity: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let index: any = null;
const DIMENSION = 2048; // ResNet50 embedding size

/**
 * Loads the HNSW index from disk.
 */
export async function loadIndex(indexPath: string): Promise<void> {
    if (index) return;

    try {
        if (!fs.existsSync(indexPath)) {
            console.warn(`HNSW Index file not found at ${indexPath}. Initializing empty index.`);
            // If the file doesn't exist, we might need to create it later or throw error.
            // For now, let's assume it should exist for the demo.
            index = new HierarchicalNSW('cosine', DIMENSION);
            index.initIndex(1); // Smallest possible since it's just a fallback
            return;
        }

        index = new HierarchicalNSW('cosine', DIMENSION);
        index.readIndex(indexPath);
        console.log(`HNSW Index loaded: ${indexPath}`);
    } catch (error) {
        console.error('Failed to load HNSW index:', error);
        throw new Error(`Index Service Error: Failed to load index at ${indexPath}`,);
    }
}

/**
 * Searches the index for the nearest neighbors of the query vector.
 * @param queryVector The query embedding vector.
 * @param k Number of results to return.
 * @returns Array of results with IDs and similarity scores.
 */
export async function search(queryVector: Float32Array, k: number = 10): Promise<SearchResult[]> {
    if (!index) {
        throw new Error('Index Service Error: Index not loaded. Call loadIndex() first.');
    }

    try {
        // HNSWLib v3 TS types expect number[], though it's often faster to use Float32Array
        // We'll convert it to satisfy the compiler if it complains.
        const queryArray = Array.from(queryVector);
        const result = index.searchKnn(queryArray, k);

        const searchResults: SearchResult[] = result.neighbors.map((id: number, i: number) => {
            const distance = result.distances[i];
            // For cosine space in hnswlib-node: similarity = 1 - distance
            const similarity = Math.max(0, 1 - distance);

            return {
                id,
                distance,
                similarity
            };
        });

        return searchResults;
    } catch (error: any) {
        console.error('Search failed:', error);
        throw new Error(`Index Service Error: ${error.message}`);
    }
}
