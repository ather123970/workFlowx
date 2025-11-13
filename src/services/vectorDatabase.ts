import { EmbeddingChunk, RetrievedContext } from '@/types/notes';
import { logger } from './logger';

// Simple in-memory vector database for browser environment
// In production, this would use ChromaDB or similar
export class VectorDatabase {
  private static instance: VectorDatabase;
  private chunks: Map<string, EmbeddingChunk> = new Map();
  private embeddings: Map<string, number[]> = new Map();

  private constructor() {}

  static getInstance(): VectorDatabase {
    if (!VectorDatabase.instance) {
      VectorDatabase.instance = new VectorDatabase();
    }
    return VectorDatabase.instance;
  }

  async addChunk(chunk: EmbeddingChunk): Promise<void> {
    try {
      // Generate embedding for the chunk
      const embedding = await this.generateEmbedding(chunk.content);
      
      // Store chunk and embedding
      this.chunks.set(chunk.id, chunk);
      this.embeddings.set(chunk.id, embedding);
      
      logger.debug(`Added chunk to vector database: ${chunk.id}`);
    } catch (error) {
      logger.error(`Failed to add chunk to vector database:`, error);
      throw error;
    }
  }

  async addChunks(chunks: EmbeddingChunk[]): Promise<void> {
    for (const chunk of chunks) {
      await this.addChunk(chunk);
    }
    logger.info(`Added ${chunks.length} chunks to vector database`);
  }

  async search(query: string, topK: number = 6, threshold: number = 0.75): Promise<RetrievedContext[]> {
    try {
      // Generate embedding for query
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Calculate similarities
      const similarities: Array<{ id: string; score: number }> = [];
      
      for (const [chunkId, embedding] of this.embeddings.entries()) {
        const similarity = this.cosineSimilarity(queryEmbedding, embedding);
        if (similarity >= threshold) {
          similarities.push({ id: chunkId, score: similarity });
        }
      }
      
      // Sort by similarity and take top K
      similarities.sort((a, b) => b.score - a.score);
      const topResults = similarities.slice(0, topK);
      
      // Convert to RetrievedContext
      const results: RetrievedContext[] = [];
      for (const result of topResults) {
        const chunk = this.chunks.get(result.id);
        if (chunk) {
          results.push({
            content: chunk.content,
            source: chunk.source,
            similarity_score: result.score,
            chunk_id: chunk.id,
          });
        }
      }
      
      logger.debug(`Vector search returned ${results.length} results for query: ${query.substring(0, 50)}...`);
      return results;
    } catch (error) {
      logger.error(`Vector search failed:`, error);
      return [];
    }
  }

  async searchByMetadata(
    metadata: Partial<EmbeddingChunk['metadata']>,
    query?: string,
    topK: number = 10
  ): Promise<RetrievedContext[]> {
    try {
      // Filter chunks by metadata
      const filteredChunks: EmbeddingChunk[] = [];
      
      for (const chunk of this.chunks.values()) {
        let matches = true;
        
        if (metadata.board && chunk.metadata.board !== metadata.board) matches = false;
        if (metadata.class && chunk.metadata.class !== metadata.class) matches = false;
        if (metadata.subject && chunk.metadata.subject !== metadata.subject) matches = false;
        if (metadata.chapter && chunk.metadata.chapter !== metadata.chapter) matches = false;
        
        if (matches) {
          filteredChunks.push(chunk);
        }
      }
      
      if (!query) {
        // Return filtered chunks without similarity scoring
        return filteredChunks.slice(0, topK).map(chunk => ({
          content: chunk.content,
          source: chunk.source,
          similarity_score: 1.0,
          chunk_id: chunk.id,
        }));
      }
      
      // Search within filtered chunks
      const queryEmbedding = await this.generateEmbedding(query);
      const similarities: Array<{ chunk: EmbeddingChunk; score: number }> = [];
      
      for (const chunk of filteredChunks) {
        const embedding = this.embeddings.get(chunk.id);
        if (embedding) {
          const similarity = this.cosineSimilarity(queryEmbedding, embedding);
          similarities.push({ chunk, score: similarity });
        }
      }
      
      // Sort and return top results
      similarities.sort((a, b) => b.score - a.score);
      
      return similarities.slice(0, topK).map(result => ({
        content: result.chunk.content,
        source: result.chunk.source,
        similarity_score: result.score,
        chunk_id: result.chunk.id,
      }));
    } catch (error) {
      logger.error(`Metadata search failed:`, error);
      return [];
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // Simple mock embedding generation
    // In production, this would use OpenAI embeddings or similar
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(384).fill(0); // 384-dimensional embedding
    
    // Simple hash-based embedding generation
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const hash = this.simpleHash(word);
      
      for (let j = 0; j < embedding.length; j++) {
        embedding[j] += Math.sin(hash + j) * 0.1;
      }
    }
    
    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async chunkText(
    text: string, 
    source: string, 
    metadata: EmbeddingChunk['metadata'],
    chunkSize: number = 600,
    overlap: number = 100
  ): Promise<EmbeddingChunk[]> {
    const chunks: EmbeddingChunk[] = [];
    const words = text.split(/\s+/);
    
    let chunkIndex = 0;
    let startIndex = 0;
    
    while (startIndex < words.length) {
      const endIndex = Math.min(startIndex + chunkSize, words.length);
      const chunkWords = words.slice(startIndex, endIndex);
      const chunkContent = chunkWords.join(' ');
      
      if (chunkContent.trim().length > 0) {
        const chunkId = `${source}_${metadata.subject || 'unknown'}_${chunkIndex}`;
        
        chunks.push({
          id: chunkId,
          content: chunkContent,
          source,
          metadata: {
            ...metadata,
            chunk_index: chunkIndex,
          },
        });
        
        chunkIndex++;
      }
      
      // Move start index with overlap
      startIndex = endIndex - overlap;
      if (startIndex >= endIndex) break;
    }
    
    logger.info(`Created ${chunks.length} chunks from ${source}`);
    return chunks;
  }

  async indexContent(
    content: string,
    source: string,
    metadata: EmbeddingChunk['metadata']
  ): Promise<void> {
    try {
      // Chunk the content
      const chunks = await this.chunkText(content, source, metadata);
      
      // Add chunks to vector database
      await this.addChunks(chunks);
      
      logger.info(`Indexed content from ${source}: ${chunks.length} chunks`);
    } catch (error) {
      logger.error(`Failed to index content from ${source}:`, error);
      throw error;
    }
  }

  getStats(): {
    totalChunks: number;
    totalEmbeddings: number;
    sources: string[];
  } {
    const sources = new Set<string>();
    for (const chunk of this.chunks.values()) {
      sources.add(chunk.source);
    }
    
    return {
      totalChunks: this.chunks.size,
      totalEmbeddings: this.embeddings.size,
      sources: Array.from(sources),
    };
  }

  clear(): void {
    this.chunks.clear();
    this.embeddings.clear();
    logger.info('Vector database cleared');
  }
}
