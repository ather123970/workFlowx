// Simple UUID generator for browser environment
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
import { supabase } from '@/integrations/supabase/client';
import { NotesJob, JobState, NotesRequest, JobMetadata } from '@/types/notes';
import { logger } from './logger';

export class JobManager {
  private static instance: JobManager;
  private jobs: Map<string, NotesJob> = new Map();

  private constructor() {}

  static getInstance(): JobManager {
    if (!JobManager.instance) {
      JobManager.instance = new JobManager();
    }
    return JobManager.instance;
  }

  async createJob(request: NotesRequest): Promise<string> {
    const jobId = generateUUID();
    const now = new Date().toISOString();

    const job: NotesJob = {
      job_id: jobId,
      user_id: request.user_id,
      class_grade: request.class,
      board: request.board,
      subject: request.subject,
      chapter: request.chapter,
      state: 'RECEIVED',
      progress_percent: 0,
      message: 'Job created and queued',
      created_at: now,
      updated_at: now,
    };

    // Store in memory
    this.jobs.set(jobId, job);

    // Store in database
    try {
      const { error } = await supabase
        .from('notes_jobs')
        .insert({
          id: jobId,
          user_id: request.user_id,
          class_grade: request.class,
          board: request.board,
          subject: request.subject,
          chapter: request.chapter,
          state: 'RECEIVED',
          progress_percent: 0,
          message: 'Job created and queued',
          created_at: now,
          updated_at: now,
        });

      if (error) {
        logger.error('Failed to store job in database:', error);
        throw error;
      }

      logger.info(`Job created: ${jobId}`, { request });
      return jobId;
    } catch (error) {
      this.jobs.delete(jobId);
      throw error;
    }
  }

  async updateJobState(
    jobId: string, 
    state: JobState, 
    progress: number, 
    message: string,
    metadata?: Partial<JobMetadata>,
    errorMessage?: string
  ): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    const now = new Date().toISOString();
    
    // Update in memory
    job.state = state;
    job.progress_percent = progress;
    job.message = message;
    job.updated_at = now;
    
    if (metadata) {
      job.metadata = { ...job.metadata, ...metadata };
    }
    
    if (errorMessage) {
      job.error_message = errorMessage;
    }

    // Update in database
    try {
      const updateData: any = {
        state,
        progress_percent: progress,
        message,
        updated_at: now,
      };

      if (metadata) {
        updateData.metadata = job.metadata;
      }

      if (errorMessage) {
        updateData.error_message = errorMessage;
      }

      const { error } = await supabase
        .from('notes_jobs')
        .update(updateData)
        .eq('id', jobId);

      if (error) {
        logger.error('Failed to update job in database:', error);
        throw error;
      }

      logger.info(`Job updated: ${jobId}`, { state, progress, message });
    } catch (error) {
      logger.error(`Failed to update job ${jobId}:`, error);
      throw error;
    }
  }

  async getJob(jobId: string): Promise<NotesJob | null> {
    // Try memory first
    let job = this.jobs.get(jobId);
    
    if (!job) {
      // Try database
      try {
        const { data, error } = await supabase
          .from('notes_jobs')
          .select('*')
          .eq('id', jobId)
          .single();

        if (error || !data) {
          return null;
        }

        job = {
          job_id: data.id,
          user_id: data.user_id,
          class_grade: data.class_grade,
          board: data.board,
          subject: data.subject,
          chapter: data.chapter,
          state: data.state,
          progress_percent: data.progress_percent,
          message: data.message,
          quality_score: data.quality_score,
          pdf_url: data.pdf_url,
          created_at: data.created_at,
          updated_at: data.updated_at,
          error_message: data.error_message,
          metadata: data.metadata,
        };

        // Cache in memory
        this.jobs.set(jobId, job);
      } catch (error) {
        logger.error(`Failed to fetch job ${jobId}:`, error);
        return null;
      }
    }

    return job;
  }

  async getJobsByUser(userId: string): Promise<NotesJob[]> {
    try {
      const { data, error } = await supabase
        .from('notes_jobs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to fetch user jobs:', error);
        return [];
      }

      return data.map(row => ({
        job_id: row.id,
        user_id: row.user_id,
        class_grade: row.class_grade,
        board: row.board,
        subject: row.subject,
        chapter: row.chapter,
        state: row.state,
        progress_percent: row.progress_percent,
        message: row.message,
        quality_score: row.quality_score,
        pdf_url: row.pdf_url,
        created_at: row.created_at,
        updated_at: row.updated_at,
        error_message: row.error_message,
        metadata: row.metadata,
      }));
    } catch (error) {
      logger.error('Failed to fetch user jobs:', error);
      return [];
    }
  }

  async markJobCompleted(
    jobId: string, 
    pdfUrl: string, 
    qualityScore: number,
    metadata: JobMetadata
  ): Promise<void> {
    await this.updateJobState(
      jobId, 
      'COMPLETED', 
      100, 
      'Notes generation completed successfully',
      { ...metadata, quality_score: qualityScore }
    );

    const job = this.jobs.get(jobId);
    if (job) {
      job.pdf_url = pdfUrl;
      job.quality_score = qualityScore;
    }

    // Update database with PDF URL and quality score
    try {
      const { error } = await supabase
        .from('notes_jobs')
        .update({
          pdf_url: pdfUrl,
          quality_score: qualityScore,
          metadata,
        })
        .eq('id', jobId);

      if (error) {
        logger.error('Failed to update completed job:', error);
        throw error;
      }
    } catch (error) {
      logger.error(`Failed to mark job completed ${jobId}:`, error);
      throw error;
    }
  }

  async markJobFailed(jobId: string, errorMessage: string): Promise<void> {
    await this.updateJobState(
      jobId, 
      'FAILED', 
      0, 
      'Job failed',
      undefined,
      errorMessage
    );
  }

  getProgressMapping(): Record<JobState, number> {
    return {
      'RECEIVED': 5,
      'VALIDATING_INPUT': 10,
      'FETCH_SYLLABUS': 15,
      'SYLLABUS_NOT_FOUND': 15,
      'EXTRACT_TOPICS': 25,
      'SCRAPE_RESOURCES': 35,
      'INDEX_EMBED': 45,
      'RETRIEVE_CONTEXT': 55,
      'GENERATE_CONTENT': 75,
      'QC_CHECKS': 85,
      'NEEDS_RETRY': 60,
      'HUMAN_REVIEW': 50,
      'COMPILE_PDF': 95,
      'COMPLETED': 100,
      'FAILED': 0,
    };
  }

  getStateMessage(state: JobState): string {
    const messages: Record<JobState, string> = {
      'RECEIVED': 'Job received and queued for processing',
      'VALIDATING_INPUT': 'Validating input parameters',
      'FETCH_SYLLABUS': 'Fetching official syllabus documents',
      'SYLLABUS_NOT_FOUND': 'Syllabus not found - awaiting user confirmation',
      'EXTRACT_TOPICS': 'Extracting topics from syllabus',
      'SCRAPE_RESOURCES': 'Gathering educational resources',
      'INDEX_EMBED': 'Processing and indexing content',
      'RETRIEVE_CONTEXT': 'Retrieving relevant context for topics',
      'GENERATE_CONTENT': 'Generating comprehensive notes content',
      'QC_CHECKS': 'Performing quality checks',
      'NEEDS_RETRY': 'Retrying content generation',
      'HUMAN_REVIEW': 'Awaiting human review',
      'COMPILE_PDF': 'Compiling final PDF document',
      'COMPLETED': 'Notes generation completed successfully',
      'FAILED': 'Job failed - please try again',
    };
    return messages[state];
  }

  async cleanupOldJobs(olderThanDays: number = 7): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    try {
      const { error } = await supabase
        .from('notes_jobs')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .in('state', ['COMPLETED', 'FAILED']);

      if (error) {
        logger.error('Failed to cleanup old jobs:', error);
        throw error;
      }

      // Clean memory cache
      for (const [jobId, job] of this.jobs.entries()) {
        if (new Date(job.created_at) < cutoffDate && 
            (job.state === 'COMPLETED' || job.state === 'FAILED')) {
          this.jobs.delete(jobId);
        }
      }

      logger.info(`Cleaned up jobs older than ${olderThanDays} days`);
    } catch (error) {
      logger.error('Failed to cleanup old jobs:', error);
    }
  }
}
