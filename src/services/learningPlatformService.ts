import { 
  LearningRequest, 
  LearningJob, 
  ComprehensiveChapter,
  LearningPlatformConfig 
} from '@/types/learning';
import { dataGatheringService } from './dataGatheringService';
import { cachingService } from './cachingService';
import { enhancedAIService } from './enhancedAIService';
import { freeNotesGenerationService } from './freeNotesGenerationService';

export class LearningPlatformService {
  private static instance: LearningPlatformService;
  private config: LearningPlatformConfig;

  private constructor() {
    this.config = {
      ai_providers: [],
      cache_duration_hours: 24,
      max_cache_size: 100,
      default_depth_level: 'intermediate',
      enable_caching: true,
      enable_auto_expansion: true,
      min_content_length: 1000,
      max_concurrent_jobs: 5
    };
  }

  static getInstance(): LearningPlatformService {
    if (!LearningPlatformService.instance) {
      LearningPlatformService.instance = new LearningPlatformService();
    }
    return LearningPlatformService.instance;
  }

  // Main method to generate comprehensive notes using FREE resources only
  async generateFreeComprehensiveNotes(request: LearningRequest): Promise<{
    jobId?: string;
    content?: ComprehensiveChapter;
    fromCache: boolean;
    estimatedTime?: number;
    usedFreeResources: boolean;
  }> {
    // Always use free resources - no paid APIs
    console.log('🆓 Using FREE AI and data sources only');
    
    // Check cache first if enabled
    if (this.config.enable_caching) {
      const cachedContent = cachingService.getCachedContent(request);
      if (cachedContent) {
        console.log('📋 Returning cached content for:', request.chapter);
        return {
          content: cachedContent,
          fromCache: true,
          usedFreeResources: true
        };
      }
    }

    // Start free notes generation
    const jobId = await freeNotesGenerationService.generateFreeNotes(request);
    
    return {
      jobId,
      fromCache: false,
      estimatedTime: this.estimateProcessingTime(request),
      usedFreeResources: true
    };
  }

  // Main method to generate comprehensive notes
  async generateComprehensiveNotes(request: LearningRequest): Promise<{
    jobId?: string;
    content?: ComprehensiveChapter;
    fromCache: boolean;
    estimatedTime?: number;
  }> {
    // Validate request
    this.validateRequest(request);

    // Check cache first if enabled
    if (this.config.enable_caching) {
      const cachedContent = cachingService.getCachedContent(request);
      if (cachedContent) {
        console.log('Returning cached content for:', request.chapter);
        return {
          content: cachedContent,
          fromCache: true
        };
      }
    }

    // Check concurrent job limit
    const activeJobs = dataGatheringService.getAllJobs().filter(job => 
      job.status !== 'completed' && job.status !== 'failed'
    );

    if (activeJobs.length >= this.config.max_concurrent_jobs) {
      throw new Error('Maximum concurrent jobs reached. Please try again later.');
    }

    // Start data gathering process
    const jobId = await dataGatheringService.startDataGathering(request);
    
    return {
      jobId,
      fromCache: false,
      estimatedTime: this.estimateProcessingTime(request)
    };
  }

  // Get job status with detailed progress
  getJobStatus(jobId: string): {
    job: LearningJob | null;
    detailedProgress: any;
    isComplete: boolean;
    result?: ComprehensiveChapter;
  } {
    const job = dataGatheringService.getJobStatus(jobId);
    const detailedProgress = dataGatheringService.getDetailedProgress(jobId);
    
    let result: ComprehensiveChapter | undefined;
    
    // If job is completed, cache the result and return it
    if (job?.status === 'completed' && job.result) {
      result = job.result;
      
      // Cache the result if caching is enabled
      if (this.config.enable_caching) {
        cachingService.setCachedContent(job.request, job.result);
      }
    }

    return {
      job,
      detailedProgress,
      isComplete: job?.status === 'completed' || job?.status === 'failed',
      result
    };
  }

  // Get all user jobs
  getUserJobs(userId?: string): LearningJob[] {
    // In a real implementation, this would filter by user ID
    return dataGatheringService.getAllJobs();
  }

  // Validate learning request
  private validateRequest(request: LearningRequest): void {
    if (!request.subject || request.subject.trim().length === 0) {
      throw new Error('Subject is required');
    }

    if (!request.chapter || request.chapter.trim().length === 0) {
      throw new Error('Chapter is required');
    }

    if (request.class && (request.class < 1 || request.class > 12)) {
      throw new Error('Class must be between 1 and 12');
    }

    // Validate depth level
    const validDepthLevels = ['basic', 'intermediate', 'advanced'];
    if (request.depth_level && !validDepthLevels.includes(request.depth_level)) {
      throw new Error('Invalid depth level. Must be basic, intermediate, or advanced');
    }
  }

  // Estimate processing time based on request complexity
  private estimateProcessingTime(request: LearningRequest): number {
    let baseTime = 180; // 3 minutes base time

    // Adjust based on depth level
    switch (request.depth_level) {
      case 'basic':
        baseTime *= 0.7;
        break;
      case 'advanced':
        baseTime *= 1.5;
        break;
      default: // intermediate
        baseTime *= 1.0;
    }

    // Adjust based on subject complexity
    const complexSubjects = ['physics', 'chemistry', 'mathematics', 'calculus'];
    if (complexSubjects.some(subject => 
      request.subject.toLowerCase().includes(subject)
    )) {
      baseTime *= 1.2;
    }

    // Add some randomness for realism
    const variation = 0.2; // ±20%
    const randomFactor = 1 + (Math.random() - 0.5) * 2 * variation;
    
    return Math.round(baseTime * randomFactor);
  }

  // Get platform statistics
  getPlatformStats(): {
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    activeJobs: number;
    cacheStats: any;
    averageProcessingTime: number;
    popularSubjects: { subject: string; count: number }[];
    popularChapters: { chapter: string; count: number }[];
  } {
    const allJobs = dataGatheringService.getAllJobs();
    const cacheStats = cachingService.getCacheStats();

    // Calculate job statistics
    const totalJobs = allJobs.length;
    const completedJobs = allJobs.filter(job => job.status === 'completed').length;
    const failedJobs = allJobs.filter(job => job.status === 'failed').length;
    const activeJobs = allJobs.filter(job => 
      job.status !== 'completed' && job.status !== 'failed'
    ).length;

    // Calculate average processing time
    const completedJobsWithTime = allJobs.filter(job => 
      job.status === 'completed' && job.completed_at
    );
    
    const averageProcessingTime = completedJobsWithTime.length > 0 
      ? completedJobsWithTime.reduce((sum, job) => {
          const startTime = new Date(job.created_at).getTime();
          const endTime = new Date(job.completed_at!).getTime();
          return sum + (endTime - startTime);
        }, 0) / completedJobsWithTime.length / 1000 // Convert to seconds
      : 0;

    // Get popular subjects and chapters
    const subjectCounts = new Map<string, number>();
    const chapterCounts = new Map<string, number>();

    allJobs.forEach(job => {
      const subject = job.request.subject;
      const chapter = job.request.chapter;
      
      subjectCounts.set(subject, (subjectCounts.get(subject) || 0) + 1);
      chapterCounts.set(chapter, (chapterCounts.get(chapter) || 0) + 1);
    });

    const popularSubjects = Array.from(subjectCounts.entries())
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const popularChapters = Array.from(chapterCounts.entries())
      .map(([chapter, count]) => ({ chapter, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalJobs,
      completedJobs,
      failedJobs,
      activeJobs,
      cacheStats,
      averageProcessingTime: Math.round(averageProcessingTime),
      popularSubjects,
      popularChapters
    };
  }

  // Update platform configuration
  updateConfig(newConfig: Partial<LearningPlatformConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Update caching service if cache settings changed
    if (newConfig.max_cache_size !== undefined || newConfig.cache_duration_hours !== undefined) {
      cachingService.updateConfig(newConfig.max_cache_size, newConfig.cache_duration_hours);
    }
    
    console.log('Platform configuration updated:', newConfig);
  }

  // Get current configuration
  getConfig(): LearningPlatformConfig {
    return { ...this.config };
  }

  // Clear all caches and reset
  resetPlatform(): void {
    cachingService.clearCache();
    console.log('Platform reset completed');
  }

  // Health check
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: {
      dataGathering: boolean;
      caching: boolean;
      aiService: boolean;
    };
    metrics: {
      activeJobs: number;
      cacheSize: number;
      memoryUsage: string;
    };
  } {
    const stats = this.getPlatformStats();
    
    // Simple health checks
    const services = {
      dataGathering: true, // Would check actual service health
      caching: true,
      aiService: true
    };

    const allServicesHealthy = Object.values(services).every(Boolean);
    const tooManyActiveJobs = stats.activeJobs > this.config.max_concurrent_jobs * 0.8;
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (!allServicesHealthy) {
      status = 'unhealthy';
    } else if (tooManyActiveJobs) {
      status = 'degraded';
    }

    return {
      status,
      services,
      metrics: {
        activeJobs: stats.activeJobs,
        cacheSize: stats.cacheStats.totalEntries,
        memoryUsage: stats.cacheStats.totalSize
      }
    };
  }

  // Auto-expansion feature: detect subtopics and expand
  async autoExpandTopic(chapter: ComprehensiveChapter): Promise<ComprehensiveChapter> {
    if (!this.config.enable_auto_expansion) {
      return chapter;
    }

    // This would analyze the chapter and identify areas that need expansion
    // For now, return the chapter as-is
    console.log('Auto-expansion feature would analyze and expand:', chapter.chapter);
    return chapter;
  }

  // Cleanup old jobs and cache entries
  performMaintenance(): void {
    dataGatheringService.cleanupOldJobs();
    // Cache cleanup is handled automatically by the caching service
    console.log('Platform maintenance completed');
  }
}

export const learningPlatformService = LearningPlatformService.getInstance();
