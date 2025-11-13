import { NotesRequest, APIResponse, JobStatusResponse } from '@/types/notes';
import { NotesOrchestrator } from './notesOrchestrator';
import { logger } from './logger';

// API Service that provides endpoints for the frontend
export class APIService {
  private static instance: APIService;
  private orchestrator: NotesOrchestrator;

  private constructor() {
    this.orchestrator = NotesOrchestrator.getInstance();
  }

  static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  // POST /api/generate_notes
  async generateNotes(request: NotesRequest): Promise<APIResponse<{ job_id: string }>> {
    try {
      logger.info('Generating notes request received:', request);
      
      const jobId = await this.orchestrator.generateNotes(request);
      
      return {
        success: true,
        data: { job_id: jobId },
        message: 'Notes generation started successfully',
      };
    } catch (error) {
      logger.error('Failed to start notes generation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to start notes generation',
      };
    }
  }

  // GET /api/job_status?job_id=...
  async getJobStatus(jobId: string): Promise<APIResponse<JobStatusResponse>> {
    try {
      const status = await this.orchestrator.getJobStatus(jobId);
      
      return {
        success: true,
        data: status,
      };
    } catch (error) {
      logger.error(`Failed to get job status for ${jobId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to get job status',
      };
    }
  }

  // GET /api/preview?job_id=...
  async getPreview(jobId: string): Promise<APIResponse<any>> {
    try {
      const job = await this.orchestrator.getJobStatus(jobId);
      
      if (job.state !== 'COMPLETED') {
        return {
          success: false,
          error: 'Job not completed yet',
          message: 'Preview is only available for completed jobs',
        };
      }

      // In a real implementation, this would return the generated content
      // For now, we'll return a mock preview
      const preview = {
        job_id: jobId,
        title: 'Generated Notes Preview',
        content: 'Preview content will be available here...',
        metadata: {
          total_pages: 10,
          total_topics: 6,
          quality_score: job.quality_score,
        },
      };

      return {
        success: true,
        data: preview,
      };
    } catch (error) {
      logger.error(`Failed to get preview for ${jobId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to get preview',
      };
    }
  }

  // GET /api/download?job_id=...
  async getDownloadUrl(jobId: string): Promise<APIResponse<{ pdf_url: string }>> {
    try {
      const pdfUrl = await this.orchestrator.downloadNotes(jobId);
      
      return {
        success: true,
        data: { pdf_url: pdfUrl },
      };
    } catch (error) {
      logger.error(`Failed to get download URL for ${jobId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to get download URL',
      };
    }
  }

  // GET /api/user_jobs?user_id=...
  async getUserJobs(userId: string): Promise<APIResponse<any[]>> {
    try {
      const jobs = await this.orchestrator.getUserJobs(userId);
      
      return {
        success: true,
        data: jobs,
      };
    } catch (error) {
      logger.error(`Failed to get user jobs for ${userId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to get user jobs',
      };
    }
  }

  // GET /api/boards
  async getBoards(): Promise<APIResponse<any[]>> {
    try {
      const boards = this.orchestrator.getBoardConfigs();
      
      return {
        success: true,
        data: boards,
      };
    } catch (error) {
      logger.error('Failed to get board configurations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to get board configurations',
      };
    }
  }

  // GET /api/stats
  async getStats(): Promise<APIResponse<any>> {
    try {
      const vectorDbStats = this.orchestrator.getVectorDbStats();
      
      const stats = {
        vector_database: vectorDbStats,
        system_status: 'operational',
        version: '1.0.0',
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      logger.error('Failed to get system stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to get system stats',
      };
    }
  }

  // Utility method to validate request
  validateNotesRequest(request: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.class || typeof request.class !== 'number') {
      errors.push('Class is required and must be a number');
    }

    if (!request.board || typeof request.board !== 'string') {
      errors.push('Board is required and must be a string');
    }

    if (!request.subject || typeof request.subject !== 'string') {
      errors.push('Subject is required and must be a string');
    }

    if (!request.chapter || typeof request.chapter !== 'string') {
      errors.push('Chapter is required and must be a string');
    }

    if (request.class && (request.class < 9 || request.class > 12)) {
      errors.push('Class must be between 9 and 12');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const apiService = APIService.getInstance();
