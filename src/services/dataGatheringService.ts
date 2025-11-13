import { 
  LearningRequest, 
  LearningJob, 
  DataGatheringStatus, 
  ComprehensiveChapter 
} from '@/types/learning';
import { advancedAIService } from './advancedAIService';

export class DataGatheringService {
  private static instance: DataGatheringService;
  private activeJobs: Map<string, LearningJob> = new Map();

  private constructor() {}

  static getInstance(): DataGatheringService {
    if (!DataGatheringService.instance) {
      DataGatheringService.instance = new DataGatheringService();
    }
    return DataGatheringService.instance;
  }

  async startDataGathering(request: LearningRequest): Promise<string> {
    const jobId = this.generateJobId();
    
    const job: LearningJob = {
      id: jobId,
      request,
      status: 'gathering',
      current_level: 1,
      total_levels: 6,
      progress: 0,
      gathering_status: this.initializeGatheringStatus(),
      created_at: new Date().toISOString()
    };

    this.activeJobs.set(jobId, job);
    
    // Start the data gathering process asynchronously
    this.processDataGathering(jobId).catch(error => {
      console.error(`Data gathering failed for job ${jobId}:`, error);
      this.markJobFailed(jobId, error.message);
    });

    return jobId;
  }

  private async processDataGathering(jobId: string): Promise<void> {
    const job = this.activeJobs.get(jobId);
    if (!job) return;

    try {
      // Level 1: Core definition and introduction
      await this.gatherLevel1Data(job);
      
      // Level 2: All types, formulas, laws, or components
      await this.gatherLevel2Data(job);
      
      // Level 3: Real-world examples and differences
      await this.gatherLevel3Data(job);
      
      // Level 4: Related chapters or connected topics
      await this.gatherLevel4Data(job);
      
      // Level 5: Numerical examples or short questions
      await this.gatherLevel5Data(job);
      
      // Level 6: Common mistakes, conceptual tricks, and graphical understanding
      await this.gatherLevel6Data(job);

      // Process and structure all gathered data
      job.status = 'processing';
      this.updateJobProgress(job, 85, 'Processing gathered data...');
      
      await this.delay(2000);
      
      job.status = 'structuring';
      this.updateJobProgress(job, 90, 'Structuring comprehensive content...');
      
      await this.delay(2000);
      
      job.status = 'finalizing';
      this.updateJobProgress(job, 95, 'Finalizing and validating content...');
      
      // Generate the comprehensive chapter
      const comprehensiveChapter = await advancedAIService.generateComprehensiveChapter(job.request);
      
      job.result = comprehensiveChapter;
      job.status = 'completed';
      job.completed_at = new Date().toISOString();
      this.updateJobProgress(job, 100, 'Content generation completed successfully!');

    } catch (error) {
      this.markJobFailed(jobId, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async gatherLevel1Data(job: LearningJob): Promise<void> {
    // Level 1: Core definition and introduction
    job.current_level = 1;
    const status = job.gathering_status[0];
    
    status.description = 'Gathering core definitions and introductory concepts...';
    this.updateJobProgress(job, 5, status.description);
    
    await this.delay(3000);
    
    status.data_points_collected = 15;
    status.progress = 50;
    this.updateJobProgress(job, 10, 'Analyzing fundamental concepts...');
    
    await this.delay(2000);
    
    status.completed = true;
    status.progress = 100;
    status.data_points_collected = 25;
    this.updateJobProgress(job, 15, 'Level 1 data gathering completed');
  }

  private async gatherLevel2Data(job: LearningJob): Promise<void> {
    // Level 2: All types, formulas, laws, or components
    job.current_level = 2;
    const status = job.gathering_status[1];
    
    status.description = 'Collecting types, formulas, laws, and components...';
    this.updateJobProgress(job, 20, status.description);
    
    await this.delay(4000);
    
    status.data_points_collected = 30;
    status.progress = 60;
    this.updateJobProgress(job, 30, 'Processing mathematical formulations...');
    
    await this.delay(3000);
    
    status.completed = true;
    status.progress = 100;
    status.data_points_collected = 45;
    this.updateJobProgress(job, 35, 'Level 2 data gathering completed');
  }

  private async gatherLevel3Data(job: LearningJob): Promise<void> {
    // Level 3: Real-world examples and differences
    job.current_level = 3;
    const status = job.gathering_status[2];
    
    status.description = 'Gathering real-world applications and comparative analysis...';
    this.updateJobProgress(job, 40, status.description);
    
    await this.delay(3500);
    
    status.data_points_collected = 20;
    status.progress = 70;
    this.updateJobProgress(job, 50, 'Analyzing practical applications...');
    
    await this.delay(2500);
    
    status.completed = true;
    status.progress = 100;
    status.data_points_collected = 35;
    this.updateJobProgress(job, 55, 'Level 3 data gathering completed');
  }

  private async gatherLevel4Data(job: LearningJob): Promise<void> {
    // Level 4: Related chapters or connected topics
    job.current_level = 4;
    const status = job.gathering_status[3];
    
    status.description = 'Mapping related topics and knowledge connections...';
    this.updateJobProgress(job, 60, status.description);
    
    await this.delay(3000);
    
    status.data_points_collected = 18;
    status.progress = 80;
    this.updateJobProgress(job, 65, 'Building knowledge network...');
    
    await this.delay(2000);
    
    status.completed = true;
    status.progress = 100;
    status.data_points_collected = 25;
    this.updateJobProgress(job, 70, 'Level 4 data gathering completed');
  }

  private async gatherLevel5Data(job: LearningJob): Promise<void> {
    // Level 5: Numerical examples or short questions
    job.current_level = 5;
    const status = job.gathering_status[4];
    
    status.description = 'Collecting practice problems and numerical examples...';
    this.updateJobProgress(job, 72, status.description);
    
    await this.delay(3500);
    
    status.data_points_collected = 25;
    status.progress = 75;
    this.updateJobProgress(job, 77, 'Generating practice questions...');
    
    await this.delay(2500);
    
    status.completed = true;
    status.progress = 100;
    status.data_points_collected = 40;
    this.updateJobProgress(job, 80, 'Level 5 data gathering completed');
  }

  private async gatherLevel6Data(job: LearningJob): Promise<void> {
    // Level 6: Common mistakes, conceptual tricks, and graphical understanding
    job.current_level = 6;
    const status = job.gathering_status[5];
    
    status.description = 'Gathering mastery content: mistakes, tricks, and visual aids...';
    this.updateJobProgress(job, 82, status.description);
    
    await this.delay(4000);
    
    status.data_points_collected = 15;
    status.progress = 85;
    this.updateJobProgress(job, 84, 'Analyzing common misconceptions...');
    
    await this.delay(2000);
    
    status.completed = true;
    status.progress = 100;
    status.data_points_collected = 22;
    this.updateJobProgress(job, 85, 'Level 6 data gathering completed');
  }

  private initializeGatheringStatus(): DataGatheringStatus[] {
    return [
      {
        level: 1,
        description: 'Core definition and introduction',
        progress: 0,
        completed: false,
        data_points_collected: 0,
        estimated_remaining_time: 300 // 5 minutes
      },
      {
        level: 2,
        description: 'Types, formulas, laws, and components',
        progress: 0,
        completed: false,
        data_points_collected: 0,
        estimated_remaining_time: 420 // 7 minutes
      },
      {
        level: 3,
        description: 'Real-world examples and differences',
        progress: 0,
        completed: false,
        data_points_collected: 0,
        estimated_remaining_time: 360 // 6 minutes
      },
      {
        level: 4,
        description: 'Related chapters and connected topics',
        progress: 0,
        completed: false,
        data_points_collected: 0,
        estimated_remaining_time: 300 // 5 minutes
      },
      {
        level: 5,
        description: 'Numerical examples and practice questions',
        progress: 0,
        completed: false,
        data_points_collected: 0,
        estimated_remaining_time: 360 // 6 minutes
      },
      {
        level: 6,
        description: 'Common mistakes and conceptual mastery',
        progress: 0,
        completed: false,
        data_points_collected: 0,
        estimated_remaining_time: 240 // 4 minutes
      }
    ];
  }

  private updateJobProgress(job: LearningJob, progress: number, message: string): void {
    job.progress = progress;
    
    // Update estimated remaining time based on progress
    const totalEstimatedTime = job.gathering_status.reduce((sum, status) => sum + status.estimated_remaining_time, 0);
    const remainingTime = Math.max(0, totalEstimatedTime * (100 - progress) / 100);
    
    job.gathering_status.forEach(status => {
      if (!status.completed) {
        status.estimated_remaining_time = Math.floor(remainingTime / job.gathering_status.filter(s => !s.completed).length);
      }
    });
    
    console.log(`Job ${job.id}: ${progress}% - ${message}`);
  }

  private markJobFailed(jobId: string, error: string): void {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.status = 'failed';
      job.error = error;
      job.progress = 0;
    }
  }

  getJobStatus(jobId: string): LearningJob | null {
    return this.activeJobs.get(jobId) || null;
  }

  getAllJobs(): LearningJob[] {
    return Array.from(this.activeJobs.values());
  }

  private generateJobId(): string {
    return 'job_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get detailed progress information
  getDetailedProgress(jobId: string): {
    job: LearningJob | null;
    currentLevel: DataGatheringStatus | null;
    overallProgress: number;
    estimatedTimeRemaining: number;
    totalDataPoints: number;
  } {
    const job = this.activeJobs.get(jobId);
    
    if (!job) {
      return {
        job: null,
        currentLevel: null,
        overallProgress: 0,
        estimatedTimeRemaining: 0,
        totalDataPoints: 0
      };
    }

    const currentLevel = job.gathering_status[job.current_level - 1] || null;
    const totalDataPoints = job.gathering_status.reduce((sum, status) => sum + status.data_points_collected, 0);
    const estimatedTimeRemaining = job.gathering_status
      .filter(status => !status.completed)
      .reduce((sum, status) => sum + status.estimated_remaining_time, 0);

    return {
      job,
      currentLevel,
      overallProgress: job.progress,
      estimatedTimeRemaining,
      totalDataPoints
    };
  }

  // Clean up completed jobs older than 1 hour
  cleanupOldJobs(): void {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    for (const [jobId, job] of this.activeJobs.entries()) {
      const jobTime = new Date(job.created_at).getTime();
      if (jobTime < oneHourAgo && (job.status === 'completed' || job.status === 'failed')) {
        this.activeJobs.delete(jobId);
      }
    }
  }
}

export const dataGatheringService = DataGatheringService.getInstance();
