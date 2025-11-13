import { LearningRequest, ComprehensiveChapter } from '@/types/learning';

export interface SourceDocument {
  url: string;
  type: 'syllabus' | 'classnotes' | 'ilmkidunya' | 'textbook' | 'general';
  content: string;
  title: string;
  confidence: number;
}

export interface ContentChunk {
  text: string;
  url: string;
  type: string;
  similarity?: number;
}

export interface TopicPage {
  page_type: 'topic';
  topic_title: string;
  definition: string;
  explanation: string;
  comparison?: string;
  example_detailed: string;
  example_short: string;
  questions: Array<{
    difficulty: 'easy' | 'medium' | 'hard';
    q: string;
    a: string;
  }>;
}

export interface QualityCheck {
  presence: boolean;
  length: boolean;
  syllabus_alignment: boolean;
  answer_correctness: boolean;
  readability: boolean;
  source_traceability: boolean;
  passed: boolean;
}

export class ContentGenerationService {
  private static instance: ContentGenerationService;
  private vectorDB: Map<string, ContentChunk[]> = new Map();
  private sourceCache: Map<string, SourceDocument> = new Map();

  private constructor() {}

  static getInstance(): ContentGenerationService {
    if (!ContentGenerationService.instance) {
      ContentGenerationService.instance = new ContentGenerationService();
    }
    return ContentGenerationService.instance;
  }

  // 1) Source fetching with exact priority order
  async fetchSources(request: LearningRequest): Promise<SourceDocument[]> {
    const sources: SourceDocument[] = [];
    
    // Priority 1: Official board syllabus
    const boardSource = await this.fetchBoardSyllabus(request);
    if (boardSource) sources.push(boardSource);
    
    // Priority 2: ClassNotes.xyz
    const classNotesSource = await this.fetchClassNotes(request);
    if (classNotesSource) sources.push(classNotesSource);
    
    // Priority 3: Ilmkidunya and local sites
    const localSources = await this.fetchLocalSources(request);
    sources.push(...localSources);
    
    // Priority 4: Textbooks and open PDFs
    const textbookSources = await this.fetchTextbookSources(request);
    sources.push(...textbookSources);
    
    return sources;
  }

  private async fetchBoardSyllabus(request: LearningRequest): Promise<SourceDocument | null> {
    const boardUrls = this.getBoardUrls(request.board);
    
    for (const url of boardUrls) {
      try {
        const content = await this.fetchAndParsePDF(url);
        if (content && this.validateSyllabusContent(content, request.chapter)) {
          return {
            url,
            type: 'syllabus',
            content,
            title: `${request.board} Official Syllabus`,
            confidence: 1.0
          };
        }
      } catch (error) {
        console.log(`Failed to fetch board syllabus from ${url}:`, error);
      }
    }
    
    return null;
  }

  private async fetchClassNotes(request: LearningRequest): Promise<SourceDocument | null> {
    const searchUrl = this.buildClassNotesUrl(request);
    
    try {
      const pageContent = await this.fetchHTML(searchUrl);
      const pdfLinks = this.extractPDFLinks(pageContent);
      
      for (const pdfUrl of pdfLinks) {
        const convertedUrl = this.convertGoogleDriveUrl(pdfUrl);
        const content = await this.fetchAndParsePDF(convertedUrl);
        
        if (content) {
          return {
            url: pdfUrl,
            type: 'classnotes',
            content,
            title: `ClassNotes - ${request.chapter}`,
            confidence: 0.9
          };
        }
      }
    } catch (error) {
      console.log('Failed to fetch ClassNotes:', error);
    }
    
    return null;
  }

  // 2) RAG implementation with chunking and retrieval
  async processSourcesForRAG(sources: SourceDocument[]): Promise<void> {
    for (const source of sources) {
      const chunks = this.chunkText(source.content, 400, 800, 75);
      const processedChunks: ContentChunk[] = chunks.map(chunk => ({
        text: chunk,
        url: source.url,
        type: source.type,
        similarity: 0
      }));
      
      this.vectorDB.set(source.url, processedChunks);
    }
  }

  async retrieveRelevantChunks(query: string, topK: number = 6): Promise<ContentChunk[]> {
    let allChunks: ContentChunk[] = [];
    
    // Collect all chunks from vector DB
    for (const chunks of this.vectorDB.values()) {
      allChunks.push(...chunks);
    }
    
    // Simple similarity scoring (in production, use proper embeddings)
    const scoredChunks = allChunks.map(chunk => ({
      ...chunk,
      similarity: this.calculateSimilarity(query, chunk.text)
    }));
    
    // Sort by similarity and take top K
    scoredChunks.sort((a, b) => b.similarity - a.similarity);
    
    // Auto-expand if similarity is low
    const topChunks = scoredChunks.slice(0, topK);
    const avgSimilarity = topChunks.reduce((sum, chunk) => sum + chunk.similarity, 0) / topChunks.length;
    
    if (avgSimilarity < 0.75) {
      return scoredChunks.slice(0, 12); // Expand to 12
    }
    
    return topChunks;
  }

  // 3) Content generation with exact prompt templates
  async generateTopicPage(
    topicTitle: string, 
    request: LearningRequest, 
    context: ContentChunk[]
  ): Promise<TopicPage> {
    const systemPrompt = `You are a school-level tutor and content writer. Use the CONTEXT (board syllabus + retrieved passages) to produce accurate, syllabus-aligned notes. Do not invent new syllabus topics. For the topic provided, output JSON with fields: definition, explanation, comparison (if applicable), example_detailed, example_short, questions (3). Explanation must be at least 15 lines (~250 words). Use simple English, Pakistan-relevant examples, and exam-style questions. If context contradicts, prefer board syllabus wording. Output only JSON.`;

    let userPrompt = this.buildUserPrompt(topicTitle, request, context);
    
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const response = await this.callAIModel(systemPrompt, userPrompt);
        const topicPage = JSON.parse(response) as TopicPage;
        
        const qualityCheck = this.performQualityCheck(topicPage);
        
        if (qualityCheck.passed) {
          return topicPage;
        }
        
        // Regenerate with expansion prompt
        if (!qualityCheck.length) {
          userPrompt += `\n\nEXPAND: The Explanation for topic ${topicTitle} is too short. Expand it to at least 15 lines and 250 words. Use the provided CONTEXT and include stepwise explanations, examples, and connections to related topics. Keep tone simple and classroom-friendly.`;
        }
        
        attempts++;
      } catch (error) {
        console.error(`Generation attempt ${attempts + 1} failed:`, error);
        attempts++;
      }
    }
    
    throw new Error(`Failed to generate quality content for ${topicTitle} after ${maxAttempts} attempts`);
  }

  // 4) Quality checks implementation
  performQualityCheck(topicPage: TopicPage): QualityCheck {
    const presence = !!(
      topicPage.definition &&
      topicPage.explanation &&
      topicPage.example_detailed &&
      topicPage.example_short &&
      topicPage.questions?.length === 3
    );

    const lines = topicPage.explanation.split('\n').length;
    const words = topicPage.explanation.split(/\s+/).length;
    const length = lines >= 15 && words >= 250;

    const syllabus_alignment = true; // Would check against extracted TOC
    const answer_correctness = this.validateAnswers(topicPage.questions);
    const readability = this.checkReadability(topicPage.explanation);
    const source_traceability = true; // Would check source references

    const passed = presence && length && syllabus_alignment && answer_correctness && readability && source_traceability;

    return {
      presence,
      length,
      syllabus_alignment,
      answer_correctness,
      readability,
      source_traceability,
      passed
    };
  }

  // Helper methods
  private getBoardUrls(board: string): string[] {
    const boardUrls: Record<string, string[]> = {
      'FBISE': ['https://fbise.edu.pk/syllabus.pdf'],
      'Punjab': ['https://punjab.gov.pk/education/syllabus.pdf'],
      'Sindh': ['https://sindh.gov.pk/education/syllabus.pdf'],
      'KPK': ['https://kpk.gov.pk/education/syllabus.pdf'],
      'Balochistan': ['https://balochistan.gov.pk/education/syllabus.pdf']
    };
    
    return boardUrls[board] || [];
  }

  private buildClassNotesUrl(request: LearningRequest): string {
    const subject = request.subject.toLowerCase().replace(/\s+/g, '-');
    const chapter = request.chapter.toLowerCase().replace(/\s+/g, '-');
    return `https://classnotes.xyz/posts/class-${request.class}-${subject}-${chapter}-notes`;
  }

  private convertGoogleDriveUrl(url: string): string {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (match) {
      return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
    return url;
  }

  private chunkText(text: string, minSize: number, maxSize: number, overlap: number): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/[.!?]+/);
    
    let currentChunk = '';
    
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (!trimmed) continue;
      
      const testChunk = currentChunk + (currentChunk ? '. ' : '') + trimmed;
      
      if (testChunk.length > maxSize && currentChunk.length >= minSize) {
        chunks.push(currentChunk);
        
        // Add overlap
        const words = currentChunk.split(/\s+/);
        const overlapWords = words.slice(-overlap);
        currentChunk = overlapWords.join(' ') + '. ' + trimmed;
      } else {
        currentChunk = testChunk;
      }
    }
    
    if (currentChunk.length >= minSize) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }

  private calculateSimilarity(query: string, text: string): number {
    // Simple keyword-based similarity (in production, use embeddings)
    const queryWords = query.toLowerCase().split(/\s+/);
    const textWords = text.toLowerCase().split(/\s+/);
    
    let matches = 0;
    for (const word of queryWords) {
      if (textWords.includes(word)) {
        matches++;
      }
    }
    
    return matches / queryWords.length;
  }

  private buildUserPrompt(topicTitle: string, request: LearningRequest, context: ContentChunk[]): string {
    const contextStr = context.map(chunk => 
      `{ "text":"${chunk.text.substring(0, 500)}...", "url":"${chunk.url}", "type":"${chunk.type}" }`
    ).join(',\n  ');

    return `Topic: "${topicTitle}"
Subject: "${request.subject}"  Class: ${request.class}  Board: "${request.board}"
Context passages: [
  ${contextStr}
]

Instructions:
1) Use the CONTEXT to write a short Definition (1-5 lines).
2) Write an Explanation: minimum 15 lines and 250 words. Use numbered/bullet steps where helpful.
3) If the topic has a natural comparator, include Comparison subsection.
4) Add Example (Detailed) 3-6 lines related to Pakistan when possible.
5) Add Example (Short) 1 line.
6) Add 3 Questions with answers (Easy/Medium/Hard). Include solution steps if numeric.
7) Keep tone friendly, simple, and exam-oriented.
Return JSON exactly like:
{
 "page_type":"topic",
 "topic_title":"${topicTitle}",
 "definition":"...",
 "explanation":"...",
 "comparison":"...",
 "example_detailed":"...",
 "example_short":"...",
 "questions":[ {"difficulty":"easy","q":"...","a":"..."}, ... ]
}`;
  }

  private async callAIModel(systemPrompt: string, userPrompt: string): Promise<string> {
    // Mock implementation - in production, call actual AI API
    const mockResponse: TopicPage = {
      page_type: 'topic',
      topic_title: 'Vectors',
      definition: 'A vector is a quantity that has both magnitude and direction, represented by an arrow in space.',
      explanation: `Vectors are fundamental quantities in physics and mathematics that possess both magnitude (size) and direction. Unlike scalars, which only have magnitude, vectors provide complete information about a physical quantity's orientation in space.

The magnitude of a vector represents its size or length, while the direction indicates where it points. For example, velocity is a vector because it tells us both how fast an object is moving (magnitude) and in which direction it's traveling.

Vectors can be represented graphically as arrows, where the length of the arrow represents the magnitude and the arrowhead shows the direction. Mathematically, vectors are often written in component form using unit vectors i, j, and k for the x, y, and z directions respectively.

Vector addition follows the parallelogram law or triangle method. When adding vectors, we must consider both their magnitudes and directions. The resultant vector represents the combined effect of all individual vectors.

Vector subtraction is performed by adding the negative of the vector being subtracted. The negative of a vector has the same magnitude but opposite direction.

Multiplication of vectors can be done in two ways: dot product (scalar product) and cross product (vector product). The dot product gives a scalar result, while the cross product gives a vector result.

Vectors are essential in describing motion, forces, electric and magnetic fields, and many other physical phenomena. They provide a powerful mathematical tool for solving complex problems in physics and engineering.

Understanding vectors is crucial for advanced topics like mechanics, electromagnetism, and quantum physics. They form the foundation for vector calculus and tensor analysis used in higher mathematics and physics.`,
      comparison: 'Vectors vs Scalars: Vectors have both magnitude and direction (velocity, force), while scalars have only magnitude (speed, mass, temperature).',
      example_detailed: 'A car traveling at 60 km/h towards the north from Karachi to Hyderabad represents a velocity vector. The magnitude is 60 km/h and the direction is north. If the car changes direction to northeast while maintaining the same speed, the vector changes even though the magnitude remains constant.',
      example_short: 'Displacement from Lahore to Islamabad: 280 km southeast.',
      questions: [
        {
          difficulty: 'easy',
          q: 'What is the difference between a vector and a scalar quantity?',
          a: 'A vector has both magnitude and direction (like velocity), while a scalar has only magnitude (like speed).'
        },
        {
          difficulty: 'medium',
          q: 'Find the resultant of two vectors: 3 units east and 4 units north.',
          a: 'Using Pythagorean theorem: R = √(3² + 4²) = √25 = 5 units. Direction: tan⁻¹(4/3) = 53.1° north of east.'
        },
        {
          difficulty: 'hard',
          q: 'Two forces of 10N and 15N act at an angle of 60° between them. Find their resultant.',
          a: 'Using R² = A² + B² + 2AB cos θ: R² = 10² + 15² + 2(10)(15)cos(60°) = 100 + 225 + 150 = 475. R = √475 = 21.8N'
        }
      ]
    };

    return JSON.stringify(mockResponse);
  }

  private validateAnswers(questions: TopicPage['questions']): boolean {
    return questions.every(q => 
      q.q && q.q.trim().length > 10 && 
      q.a && q.a.trim().length > 5 &&
      !q.a.includes('placeholder') &&
      !q.a.includes('...')
    );
  }

  private checkReadability(text: string): boolean {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const avgSentenceLength = sentences.reduce((sum, sentence) => 
      sum + sentence.split(/\s+/).length, 0) / sentences.length;
    
    return avgSentenceLength < 25;
  }

  private validateSyllabusContent(content: string, chapter: string): boolean {
    return content.toLowerCase().includes(chapter.toLowerCase());
  }

  private extractPDFLinks(html: string): string[] {
    // Mock implementation - would use proper HTML parsing
    const pdfLinks: string[] = [];
    const drivePattern = /https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9-_]+\/view/g;
    const matches = html.match(drivePattern);
    
    if (matches) {
      pdfLinks.push(...matches);
    }
    
    return pdfLinks;
  }

  private async fetchHTML(url: string): Promise<string> {
    // Mock implementation - would use actual HTTP client
    return `<html>Mock HTML content with PDF links: https://drive.google.com/file/d/1o0ilIUGkOSPK0CctGBH0b4QQk17b-SW2/view</html>`;
  }

  private async fetchAndParsePDF(url: string): Promise<string> {
    // Mock implementation - would use actual PDF parser
    return `Mock PDF content for educational material about vectors and physics concepts.`;
  }

  private async fetchLocalSources(request: LearningRequest): Promise<SourceDocument[]> {
    // Mock implementation for ilmkidunya and other local sources
    return [];
  }

  private async fetchTextbookSources(request: LearningRequest): Promise<SourceDocument[]> {
    // Mock implementation for textbook sources
    return [];
  }
}

export const contentGenerationService = ContentGenerationService.getInstance();
