import { NotesRequest, APIResponse, JobStatusResponse, JobState } from '@/types/notes';

// Mock API service for development without backend dependencies
export class MockAPIService {
  private static instance: MockAPIService;
  private jobs: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): MockAPIService {
    if (!MockAPIService.instance) {
      MockAPIService.instance = new MockAPIService();
    }
    return MockAPIService.instance;
  }

  // Generate simple UUID
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Mock job states progression
  private getJobStates(): JobState[] {
    return [
      'RECEIVED',
      'VALIDATING_INPUT', 
      'FETCH_SYLLABUS',
      'EXTRACT_TOPICS',
      'SCRAPE_RESOURCES',
      'INDEX_EMBED',
      'RETRIEVE_CONTEXT',
      'GENERATE_CONTENT',
      'QC_CHECKS',
      'COMPILE_PDF',
      'COMPLETED'
    ];
  }

  private getProgressForState(state: JobState): number {
    const progressMap: Record<JobState, number> = {
      'RECEIVED': 5,
      'VALIDATING_INPUT': 10,
      'FETCH_SYLLABUS': 20,
      'SYLLABUS_NOT_FOUND': 20,
      'EXTRACT_TOPICS': 30,
      'SCRAPE_RESOURCES': 40,
      'INDEX_EMBED': 50,
      'RETRIEVE_CONTEXT': 60,
      'GENERATE_CONTENT': 80,
      'QC_CHECKS': 90,
      'NEEDS_RETRY': 70,
      'HUMAN_REVIEW': 75,
      'COMPILE_PDF': 95,
      'COMPLETED': 100,
      'FAILED': 0,
    };
    return progressMap[state] || 0;
  }

  async generateNotes(request: NotesRequest): Promise<APIResponse<{ job_id: string }>> {
    try {
      const jobId = this.generateUUID();
      const states = this.getJobStates();
      
      // Create job with initial state
      const job = {
        job_id: jobId,
        request,
        currentStateIndex: 0,
        states,
        startTime: Date.now(),
        completed: false,
        failed: false
      };
      
      this.jobs.set(jobId, job);
      
      // Start mock progression
      this.startJobProgression(jobId);
      
      return {
        success: true,
        data: { job_id: jobId },
        message: 'Notes generation started successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to start notes generation',
      };
    }
  }

  private startJobProgression(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    const progressInterval = setInterval(() => {
      if (job.currentStateIndex >= job.states.length - 1) {
        // Job completed
        job.completed = true;
        job.pdf_url = `mock://pdf/${jobId}.pdf`;
        job.quality_score = 85 + Math.random() * 15; // 85-100
        clearInterval(progressInterval);
        return;
      }

      // Progress to next state
      job.currentStateIndex++;
    }, 2000 + Math.random() * 3000); // 2-5 seconds per state
  }

  async getJobStatus(jobId: string): Promise<APIResponse<JobStatusResponse>> {
    try {
      const job = this.jobs.get(jobId);
      
      if (!job) {
        return {
          success: false,
          error: 'Job not found',
          message: 'Job not found',
        };
      }

      const currentState = job.states[job.currentStateIndex];
      const progress = this.getProgressForState(currentState);
      
      const status: JobStatusResponse = {
        job_id: jobId,
        state: currentState,
        progress_percent: progress,
        message: this.getStateMessage(currentState),
        quality_score: job.quality_score,
        pdf_url: job.pdf_url,
      };

      return {
        success: true,
        data: status,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to get job status',
      };
    }
  }

  private getStateMessage(state: JobState): string {
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

  async getPreview(jobId: string): Promise<APIResponse<any>> {
    try {
      const job = this.jobs.get(jobId);
      
      if (!job || !job.completed) {
        return {
          success: false,
          error: 'Job not completed yet',
          message: 'Preview is only available for completed jobs',
        };
      }

      const preview = {
        job_id: jobId,
        title: `${job.request.subject} - ${job.request.chapter} Notes`,
        content: `
          <h1>${job.request.subject} Notes</h1>
          <h2>Chapter: ${job.request.chapter}</h2>
          <p><strong>Class:</strong> ${job.request.class}</p>
          <p><strong>Board:</strong> ${job.request.board}</p>
          
          <h3>Preview Content</h3>
          <p>This is a mock preview of your generated notes. The actual system would show the complete notes content here with:</p>
          <ul>
            <li>Detailed topic explanations</li>
            <li>Pakistan-relevant examples</li>
            <li>Practice questions with answers</li>
            <li>Professional formatting</li>
          </ul>
        `,
        metadata: {
          total_pages: Math.floor(Math.random() * 20) + 10,
          total_topics: Math.floor(Math.random() * 8) + 4,
          quality_score: job.quality_score,
        },
      };

      return {
        success: true,
        data: preview,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to get preview',
      };
    }
  }

  async getDownloadUrl(jobId: string): Promise<APIResponse<{ pdf_url: string }>> {
    try {
      const job = this.jobs.get(jobId);
      
      if (!job || !job.completed) {
        return {
          success: false,
          error: 'Job not completed yet',
          message: 'Download is only available for completed jobs',
        };
      }

      return {
        success: true,
        data: { pdf_url: job.pdf_url },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to get download URL',
      };
    }
  }

  async getUserJobs(userId: string): Promise<APIResponse<any[]>> {
    try {
      const userJobs = Array.from(this.jobs.values()).filter(job => 
        job.request.user_id === userId
      );

      return {
        success: true,
        data: userJobs,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to get user jobs',
      };
    }
  }

  async getBoards(): Promise<APIResponse<any[]>> {
    const boards = [
      {
        name: 'Federal Board of Intermediate and Secondary Education',
        code: 'FBISE',
        classes: [9, 10, 11, 12],
        subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Urdu', 'Islamiat', 'Pakistan Studies'],
      },
      {
        name: 'Punjab Board of Intermediate and Secondary Education',
        code: 'Punjab',
        classes: [9, 10, 11, 12],
        subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Urdu'],
      },
      {
        name: 'Sindh Board of Intermediate and Secondary Education',
        code: 'Sindh',
        classes: [9, 10, 11, 12],
        subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English'],
      },
    ];

    return {
      success: true,
      data: boards,
    };
  }

  async getStats(): Promise<APIResponse<any>> {
    const stats = {
      total_jobs: this.jobs.size,
      completed_jobs: Array.from(this.jobs.values()).filter(j => j.completed).length,
      system_status: 'operational',
      version: '1.0.0-mock',
    };

    return {
      success: true,
      data: stats,
    };
  }
}

// Export singleton instance
export const mockApiService = MockAPIService.getInstance();
