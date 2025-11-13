// Job States as per specification
export type JobState = 
  | 'RECEIVED'
  | 'VALIDATING_INPUT'
  | 'FETCH_SYLLABUS'
  | 'SYLLABUS_NOT_FOUND'
  | 'EXTRACT_TOPICS'
  | 'SCRAPE_RESOURCES'
  | 'INDEX_EMBED'
  | 'RETRIEVE_CONTEXT'
  | 'GENERATE_CONTENT'
  | 'QC_CHECKS'
  | 'NEEDS_RETRY'
  | 'HUMAN_REVIEW'
  | 'COMPILE_PDF'
  | 'COMPLETED'
  | 'FAILED';

// Job interface
export interface NotesJob {
  job_id: string;
  user_id?: string;
  class_grade: number;
  board: string;
  subject: string;
  chapter: string;
  state: JobState;
  progress_percent: number;
  message: string;
  quality_score?: number;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
  error_message?: string;
  metadata?: JobMetadata;
}

// Job metadata
export interface JobMetadata {
  subject: string;
  chapter: string;
  class: number;
  board: string;
  generated_at: string;
  total_topics: number;
  total_words: number;
  quality_score: number;
  syllabus_source?: string;
  retrieval_sources: string[];
}

// Page types for JSON schema
export type PageType = 'title' | 'toc' | 'topic';

// Base page interface
export interface BasePage {
  page_type: PageType;
}

// Title page
export interface TitlePage extends BasePage {
  page_type: 'title';
  subject: string;
  class: number;
  board: string;
  chapter: string;
  introduction: string;
  why_study: string;
  daily_life_example: string;
}

// Table of Contents page
export interface TOCPage extends BasePage {
  page_type: 'toc';
  topics: string[];
}

// Question interface
export interface ExamQuestion {
  difficulty: 'easy' | 'medium' | 'hard';
  q: string;
  a: string;
}

// Topic page
export interface TopicPage extends BasePage {
  page_type: 'topic';
  topic_title: string;
  definition: string;
  explanation: string;
  comparison?: string;
  example_detailed: string;
  example_short: string;
  questions: ExamQuestion[];
}

// Complete notes package
export interface NotesPackage {
  job_id: string;
  metadata: JobMetadata;
  pages: (TitlePage | TOCPage | TopicPage)[];
  pdf_path?: string;
  status: 'ok' | 'error';
  missing?: string[];
}

// Input validation
export interface NotesRequest {
  class: number;
  board: string;
  subject: string;
  chapter: string;
  user_id?: string;
}

// Syllabus data
export interface SyllabusData {
  board: string;
  class: number;
  subject: string;
  chapters: ChapterData[];
  source_url: string;
  extracted_at: string;
}

export interface ChapterData {
  chapter_name: string;
  topics: string[];
  page_reference?: string;
}

// RAG and retrieval
export interface RetrievedContext {
  content: string;
  source: string;
  similarity_score: number;
  chunk_id: string;
}

export interface EmbeddingChunk {
  id: string;
  content: string;
  source: string;
  metadata: {
    board?: string;
    class?: number;
    subject?: string;
    chapter?: string;
    page?: number;
    chunk_index: number;
  };
  embedding?: number[];
}

// Quality check results
export interface QualityCheckResult {
  passed: boolean;
  score: number;
  checks: {
    presence_check: boolean;
    length_check: boolean;
    syllabus_alignment: boolean;
    answer_check: boolean;
    safety_check: boolean;
    readability_score: number;
  };
  missing_sections?: string[];
  issues?: string[];
}

// LLM prompt templates
export interface PromptTemplate {
  system: string;
  user: string;
  temperature: number;
  max_tokens: number;
}

// Board configurations
export interface BoardConfig {
  name: string;
  code: string;
  syllabus_urls: {
    [key: string]: string; // subject -> URL mapping
  };
  classes: number[];
  subjects: string[];
}

// API responses
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface JobStatusResponse {
  job_id: string;
  state: JobState;
  progress_percent: number;
  message: string;
  quality_score?: number;
  pdf_url?: string;
  error_message?: string;
}

// Fuzzy match result
export interface FuzzyMatchResult {
  item: string;
  score: number;
  matches: any[];
}

// Scraping result
export interface ScrapingResult {
  url: string;
  content: string;
  title: string;
  extracted_at: string;
  success: boolean;
  error?: string;
}
