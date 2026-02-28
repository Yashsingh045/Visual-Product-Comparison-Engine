import * as embeddingService from './embeddingService';
import * as indexService from './indexService';
import * as db from '../database/db';

export interface FinalSearchResult {
    id: number;
    imagePath: string;
    title?: string;
    similarity: number;
}

/**
 * Orchestrates the visual search pipeline.
 * @param imagePath The path to the query image.
 * @param topK Number of similar items to return (default 10).
 */
export async function search(imagePath: string, topK: number = 10): Promise<FinalSearchResult[]> {
    try {
        console.log(`Starting search for image: ${imagePath}`);

        // 1. Generate embedding for query image
        const queryVector = await embeddingService.generateEmbedding(imagePath);

        // 2. Query HNSW index for similar vector IDs
        // We get results sorted by distance (transformed to similarity)
        const annResults = await indexService.search(queryVector, topK);

        // 3. Fetch product metadata from database and merge
        const finalResults: FinalSearchResult[] = [];

        for (const res of annResults) {
            const product = db.getProductByVectorId(res.id);
            if (product) {
                finalResults.push({
                    id: product.product_id,
                    imagePath: product.image_path,
                    similarity: parseFloat(res.similarity.toFixed(4))
                });
            } else {
                console.warn(`Warning: Vector ID ${res.id} found in index but no mapping exists in database.`);
            }
        }

        // 4. Return ranked results (already ranked by HNSW index)
        return finalResults;

    } catch (error: any) {
        console.error('Search Service Error:', error);
        throw new Error(`Search Service failed: ${error.message}`);
    }
}
