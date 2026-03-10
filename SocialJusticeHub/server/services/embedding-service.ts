import { db } from '../db';
import { textEmbeddings } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

// Cache for the transformer pipeline to avoid reloading
let embeddingPipeline: any = null;

/**
 * Initialize the embedding pipeline (lazy loading)
 */
async function getEmbeddingPipeline() {
  if (!embeddingPipeline) {
    try {
      const { pipeline } = await import('@xenova/transformers');
      embeddingPipeline = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2'
      );
    } catch (error) {
      console.error('Failed to load embedding model:', error);
      throw new Error('Embedding model initialization failed');
    }
  }
  return embeddingPipeline;
}

/**
 * Generate embedding for a text using the transformer model
 */
async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty');
  }

  try {
    const extractor = await getEmbeddingPipeline();
    const output = await extractor(text, {
      pooling: 'mean',
      normalize: true,
    });

    // Convert tensor to array
    const embedding = Array.from(output.data as Iterable<number>);
    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Get or create embedding for a contribution
 * Checks database cache first, then generates if needed
 */
export async function getOrCreateEmbedding(
  contentId: number,
  text: string,
  contentType: string
): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty for embedding');
  }

  try {
    // Check if embedding exists in database
    const existing = await db
      .select()
      .from(textEmbeddings)
      .where(
        and(
          eq(textEmbeddings.contentId, contentId),
          eq(textEmbeddings.contentType, contentType)
        )
      )
      .limit(1);

    if (existing.length > 0 && existing[0].embedding) {
      try {
        const embedding = JSON.parse(existing[0].embedding);
        if (Array.isArray(embedding) && embedding.length > 0) {
          return embedding;
        }
      } catch (parseError) {
        console.warn('Failed to parse cached embedding, regenerating:', parseError);
      }
    }

    // Generate new embedding
    const embedding = await generateEmbedding(text);

    // Store in database as JSON string
    const embeddingJson = JSON.stringify(embedding);

    // Insert or update
    if (existing.length > 0) {
      await db
        .update(textEmbeddings)
        .set({
          embedding: embeddingJson,
          model: 'Xenova/all-MiniLM-L6-v2',
        })
        .where(
          and(
            eq(textEmbeddings.contentId, contentId),
            eq(textEmbeddings.contentType, contentType)
          )
        );
    } else {
      await db.insert(textEmbeddings).values({
        contentId,
        contentType,
        embedding: embeddingJson,
        model: 'Xenova/all-MiniLM-L6-v2',
      });
    }

    return embedding;
  } catch (error) {
    console.error('Error in getOrCreateEmbedding:', error);
    throw error;
  }
}

/**
 * Calculate cosine similarity between two vectors
 * Returns a value between 0 and 1 (1 = identical, 0 = orthogonal)
 */
export function calculateCosineSimilarity(
  vecA: number[],
  vecB: number[]
): number {
  if (vecA.length !== vecB.length) {
    console.warn('Vector length mismatch, padding with zeros');
    const maxLen = Math.max(vecA.length, vecB.length);
    while (vecA.length < maxLen) vecA.push(0);
    while (vecB.length < maxLen) vecB.push(0);
  }

  // Calculate dot product
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * (vecB[i] || 0), 0);

  // Calculate magnitudes
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  if (normA === 0 || normB === 0) {
    return 0;
  }

  // Cosine similarity
  const similarity = dotProduct / (normA * normB);

  // Clamp to [0, 1] range
  return Math.max(0, Math.min(1, similarity));
}

/**
 * Batch generate embeddings for multiple contributions
 * Processes in batches to avoid memory issues
 */
export async function batchGenerateEmbeddings(
  contributions: Array<{ id: number; text: string; type: string }>,
  batchSize: number = 10
): Promise<Map<number, number[]>> {
  const results = new Map<number, number[]>();
  const batches: Array<typeof contributions> = [];

  // Split into batches
  for (let i = 0; i < contributions.length; i += batchSize) {
    batches.push(contributions.slice(i, i + batchSize));
  }

  // Process each batch
  for (const batch of batches) {
    const batchPromises = batch.map(async (contrib) => {
      try {
        const embedding = await getOrCreateEmbedding(
          contrib.id,
          contrib.text,
          contrib.type
        );
        return { id: contrib.id, embedding };
      } catch (error) {
        console.error(`Failed to generate embedding for contribution ${contrib.id}:`, error);
        return null;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach((result) => {
      if (result) {
        results.set(result.id, result.embedding);
      }
    });
  }

  return results;
}
