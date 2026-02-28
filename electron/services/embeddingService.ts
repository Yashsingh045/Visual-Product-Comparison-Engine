import * as tf from '@tensorflow/tfjs-node';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

let model: tf.GraphModel | null = null;

/**
 * Loads the ResNet50 model from the local filesystem.
 */
export async function loadModel(modelPath: string): Promise<void> {
    if (model) return;

    try {
        // Assuming model exists in the provided path (e.g., appData or project root)
        // For development, it might be in ./ml/model
        const modelUrl = `file://${modelPath}`;
        model = await tf.loadGraphModel(modelUrl);
        console.log('Model loaded successfully');
    } catch (error) {
        console.error('Failed to load model:', error);
        throw new Error(`Embedding Service Error: Failed to load model at ${modelPath}`);
    }
}

/**
 * Preprocesses an image and generates its embedding vector.
 * @param imagePath Path to the image file.
 * @returns Normalized Float32Array embedding.
 */
export async function generateEmbedding(imagePath: string): Promise<Float32Array> {
    if (!model) {
        throw new Error('Embedding Service Error: Model not loaded. Call loadModel() first.');
    }

    try {
        if (!fs.existsSync(imagePath)) {
            throw new Error(`File not found: ${imagePath}`);
        }

        // 1. Preprocess image using Sharp
        // ResNet50 expects 224x224 RGB
        const buffer = await sharp(imagePath)
            .resize(224, 224)
            .removeAlpha()
            .toFormat('raw')
            .toBuffer();

        // 2. Convert to Tensor
        const tensor = tf.tensor3d(new Uint8Array(buffer), [224, 224, 3], 'float32');

        // 3. Normalize input (ImageNet mean/std or simple [0, 1] / [-1, 1])
        // ResNet50 often expects preprocessing. For now, simple normalization:
        const normalizedInput = tensor.div(255).expandDims(0); // [1, 224, 224, 3]

        // 4. Inference
        const prediction = model.predict(normalizedInput) as tf.Tensor;

        // 5. Post-process (Flatten and Normalize vector to unit length for Cosine Similarity)
        const embedding = prediction.flatten();
        const norm = embedding.norm();
        const normalizedEmbedding = embedding.div(norm);

        // 6. Convert to Float32Array
        const result = (await normalizedEmbedding.data()) as Float32Array;

        // Cleanup Tensors
        tensor.dispose();
        normalizedInput.dispose();
        prediction.dispose();
        embedding.dispose();

        return result;
    } catch (error: any) {
        console.error('Embedding generation failed:', error);
        throw new Error(`Embedding Service Error: ${error.message}`);
    }
}
