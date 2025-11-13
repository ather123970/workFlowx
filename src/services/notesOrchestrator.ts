import { 
  NotesRequest, 
  NotesPackage, 
  JobState, 
  SyllabusData,
  ChapterData,
  TitlePage,
  TOCPage,
  TopicPage,
  RetrievedContext,
  JobMetadata
} from '@/types/notes';
import { JobManager } from './jobManager';
import { PDFScraper } from './pdfScraper';
import { VectorDatabase } from './vectorDatabase';
import { LLMService } from './llmService';
import { QualityChecker } from './qualityChecker';
import { PDFGenerator } from './pdfGenerator';
import { logger } from './logger';

// Main orchestrator that manages the entire notes generation pipeline
export class NotesOrchestrator {
  private static instance: NotesOrchestrator;
  private jobManager: JobManager;
  private pdfScraper: PDFScraper;
  private vectorDb: VectorDatabase;
  private llmService: LLMService;
  private qualityChecker: QualityChecker;
  private pdfGenerator: PDFGenerator;

  private constructor() {
    this.jobManager = JobManager.getInstance();
    this.pdfScraper = PDFScraper.getInstance();
    this.vectorDb = VectorDatabase.getInstance();
    this.llmService = LLMService.getInstance();
    this.qualityChecker = QualityChecker.getInstance();
    this.pdfGenerator = PDFGenerator.getInstance();
  }

  static getInstance(): NotesOrchestrator {
    if (!NotesOrchestrator.instance) {
      NotesOrchestrator.instance = new NotesOrchestrator();
    }
    return NotesOrchestrator.instance;
  }

  async generateNotes(request: NotesRequest): Promise<string> {
    const jobId = await this.jobManager.createJob(request);
    
    // Start the pipeline asynchronously
    this.runPipeline(jobId, request).catch(error => {
      logger.error(`Pipeline failed for job ${jobId}:`, error);
      this.jobManager.markJobFailed(jobId, error.message);
    });

    return jobId;
  }

  private async runPipeline(jobId: string, request: NotesRequest): Promise<void> {
    try {
      // State 1: VALIDATING_INPUT
      await this.updateJobState(jobId, 'VALIDATING_INPUT');
      await this.validateInput(request);

      // State 2: FETCH_SYLLABUS
      await this.updateJobState(jobId, 'FETCH_SYLLABUS');
      const syllabusData = await this.fetchSyllabus(request);
      
      if (!syllabusData) {
        await this.updateJobState(jobId, 'SYLLABUS_NOT_FOUND');
        return; // Wait for user confirmation
      }

      // State 3: EXTRACT_TOPICS
      await this.updateJobState(jobId, 'EXTRACT_TOPICS');
      const chapterData = await this.extractTopics(syllabusData, request.chapter);
      
      if (!chapterData) {
        throw new Error(`Chapter "${request.chapter}" not found in syllabus`);
      }

      // State 4: SCRAPE_RESOURCES
      await this.updateJobState(jobId, 'SCRAPE_RESOURCES');
      const scrapedContent = await this.scrapeResources(request.subject, request.chapter, chapterData.topics);

      // State 5: INDEX_EMBED
      await this.updateJobState(jobId, 'INDEX_EMBED');
      await this.indexContent(scrapedContent, request);

      // State 6: RETRIEVE_CONTEXT & GENERATE_CONTENT
      await this.updateJobState(jobId, 'RETRIEVE_CONTEXT');
      const notesPackage = await this.generateContent(jobId, request, chapterData);

      // State 7: QC_CHECKS
      await this.updateJobState(jobId, 'QC_CHECKS');
      const qualityResult = await this.qualityChecker.checkNotesPackage(notesPackage);
      
      if (!qualityResult.passed) {
        logger.warn(`Quality check failed for job ${jobId}:`, qualityResult.issues);
        // Could implement retry logic here
      }

      // State 8: COMPILE_PDF
      await this.updateJobState(jobId, 'COMPILE_PDF');
      const pdfUrl = await this.pdfGenerator.generatePDF(notesPackage);

      // State 9: COMPLETED
      await this.jobManager.markJobCompleted(
        jobId, 
        pdfUrl, 
        qualityResult.score,
        notesPackage.metadata
      );

      logger.info(`Notes generation completed successfully for job: ${jobId}`);
    } catch (error) {
      logger.error(`Pipeline failed for job ${jobId}:`, error);
      await this.jobManager.markJobFailed(jobId, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async updateJobState(jobId: string, state: JobState): Promise<void> {
    const progressMapping = this.jobManager.getProgressMapping();
    const progress = progressMapping[state];
    const message = this.jobManager.getStateMessage(state);
    
    await this.jobManager.updateJobState(jobId, state, progress, message);
    
    // Add artificial delay to make progress visible
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  }

  private async validateInput(request: NotesRequest): Promise<void> {
    const validation = this.pdfScraper.validateInput(request.board, request.subject, request.class);
    
    if (!validation.valid) {
      throw new Error(`Input validation failed: ${validation.errors.join(', ')}`);
    }

    logger.info('Input validation passed', request);
  }

  private async fetchSyllabus(request: NotesRequest): Promise<SyllabusData | null> {
    const syllabusData = await this.pdfScraper.fetchSyllabus(
      request.board, 
      request.subject, 
      request.class
    );

    if (syllabusData) {
      logger.info(`Fetched syllabus for ${request.board} ${request.subject} Class ${request.class}`);
    }

    return syllabusData;
  }

  private async extractTopics(syllabusData: SyllabusData, chapterName: string): Promise<ChapterData | null> {
    // Find the chapter in syllabus data
    const chapter = syllabusData.chapters.find(ch => 
      ch.chapter_name.toLowerCase().includes(chapterName.toLowerCase()) ||
      chapterName.toLowerCase().includes(ch.chapter_name.toLowerCase())
    );

    if (chapter) {
      logger.info(`Extracted ${chapter.topics.length} topics for chapter: ${chapterName}`);
    }

    return chapter || null;
  }

  private async scrapeResources(subject: string, chapter: string, topics: string[]): Promise<string[]> {
    const scrapingResults = await this.pdfScraper.scrapeEducationalResources(subject, chapter, topics);
    
    const successfulContent = scrapingResults
      .filter(result => result.success)
      .map(result => result.content);

    logger.info(`Scraped ${successfulContent.length} educational resources`);
    return successfulContent;
  }

  private async indexContent(content: string[], request: NotesRequest): Promise<void> {
    for (let i = 0; i < content.length; i++) {
      const source = `educational_resource_${i + 1}`;
      await this.vectorDb.indexContent(content[i], source, {
        board: request.board,
        class: request.class,
        subject: request.subject,
        chapter: request.chapter,
        chunk_index: 0, // Will be set by chunkText
      });
    }

    const stats = this.vectorDb.getStats();
    logger.info(`Indexed content: ${stats.totalChunks} chunks from ${stats.sources.length} sources`);
  }

  private async generateContent(
    jobId: string, 
    request: NotesRequest, 
    chapterData: ChapterData
  ): Promise<NotesPackage> {
    const pages: (TitlePage | TOCPage | TopicPage)[] = [];

    // Generate title page
    const syllabusContext = [`Chapter: ${chapterData.chapter_name}`, `Topics: ${chapterData.topics.join(', ')}`];
    const titlePage = await this.llmService.generateTitlePage(
      request.subject,
      request.class,
      request.board,
      request.chapter,
      syllabusContext
    );
    pages.push(titlePage);

    // Generate TOC
    const tocPage = await this.llmService.generateTOC(chapterData.topics);
    pages.push(tocPage);

    // Generate topic pages
    for (const topic of chapterData.topics) {
      await this.updateJobState(jobId, 'GENERATE_CONTENT');
      
      // Retrieve context for this topic
      const retrievedContext = await this.vectorDb.search(topic, 6, 0.7);
      
      // Generate topic page
      const topicPage = await this.llmService.generateTopicPage(topic, retrievedContext);
      pages.push(topicPage);

      logger.info(`Generated content for topic: ${topic}`);
    }

    // Create metadata
    const metadata: JobMetadata = {
      subject: request.subject,
      chapter: request.chapter,
      class: request.class,
      board: request.board,
      generated_at: new Date().toISOString(),
      total_topics: chapterData.topics.length,
      total_words: this.calculateTotalWords(pages),
      quality_score: 0, // Will be set by quality checker
      retrieval_sources: this.vectorDb.getStats().sources,
    };

    const notesPackage: NotesPackage = {
      job_id: jobId,
      metadata,
      pages,
      status: 'ok',
    };

    logger.info(`Generated complete notes package with ${pages.length} pages`);
    return notesPackage;
  }

  private calculateTotalWords(pages: (TitlePage | TOCPage | TopicPage)[]): number {
    let totalWords = 0;

    for (const page of pages) {
      switch (page.page_type) {
        case 'title':
          const titlePage = page as TitlePage;
          totalWords += this.countWords(titlePage.introduction);
          totalWords += this.countWords(titlePage.why_study);
          totalWords += this.countWords(titlePage.daily_life_example);
          break;
        case 'topic':
          const topicPage = page as TopicPage;
          totalWords += this.countWords(topicPage.definition);
          totalWords += this.countWords(topicPage.explanation);
          totalWords += this.countWords(topicPage.example_detailed);
          totalWords += this.countWords(topicPage.example_short);
          if (topicPage.comparison) {
            totalWords += this.countWords(topicPage.comparison);
          }
          topicPage.questions.forEach(q => {
            totalWords += this.countWords(q.q);
            totalWords += this.countWords(q.a);
          });
          break;
      }
    }

    return totalWords;
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  // Public methods for API endpoints
  async getJobStatus(jobId: string) {
    const job = await this.jobManager.getJob(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    return {
      job_id: job.job_id,
      state: job.state,
      progress_percent: job.progress_percent,
      message: job.message,
      quality_score: job.quality_score,
      pdf_url: job.pdf_url,
      error_message: job.error_message,
    };
  }

  async getUserJobs(userId: string) {
    return await this.jobManager.getJobsByUser(userId);
  }

  async downloadNotes(jobId: string) {
    const job = await this.jobManager.getJob(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    if (job.state !== 'COMPLETED') {
      throw new Error('Job not completed yet');
    }

    return job.pdf_url;
  }

  // Utility methods
  getBoardConfigs() {
    return this.pdfScraper.getAllBoards();
  }

  getVectorDbStats() {
    return this.vectorDb.getStats();
  }
}
