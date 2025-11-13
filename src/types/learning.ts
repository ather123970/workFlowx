// Deep Learning Platform Types

export interface LearningRequest {
  subject: string;
  chapter: string;
  class?: number;
  board?: string;
  depth_level?: 'basic' | 'intermediate' | 'advanced';
}

export interface TopicSection {
  id: string;
  title: string;
  content: string | string[];
  subtopics?: TopicSubsection[];
  examples?: Example[];
  formulas?: Formula[];
  diagrams?: DiagramDescription[];
  order: number;
}

export interface TopicSubsection {
  id: string;
  title: string;
  content: string;
  examples?: Example[];
  order: number;
}

export interface Example {
  id: string;
  type: 'numerical' | 'conceptual' | 'real_world' | 'comparison';
  title: string;
  description: string;
  solution?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Formula {
  id: string;
  name: string;
  expression: string;
  variables: Variable[];
  units?: string;
  applications: string[];
}

export interface Variable {
  symbol: string;
  name: string;
  unit?: string;
  description: string;
}

export interface DiagramDescription {
  id: string;
  title: string;
  description: string;
  type: 'flowchart' | 'graph' | 'illustration' | 'table';
  ascii_art?: string;
}

export interface CommonMistake {
  id: string;
  mistake: string;
  correction: string;
  explanation: string;
  example?: string;
}

export interface ConceptualTrick {
  id: string;
  title: string;
  description: string;
  mnemonic?: string;
  example: string;
}

export interface RelatedTopic {
  id: string;
  title: string;
  relationship: 'prerequisite' | 'extension' | 'application' | 'comparison';
  description: string;
  chapter?: string;
}

export interface ComprehensiveChapter {
  id: string;
  chapter: string;
  subject: string;
  class?: number;
  board?: string;
  
  // Level 1: Core definition and introduction
  introduction: {
    definition: string;
    importance: string;
    overview: string;
    learning_objectives: string[];
  };
  
  // Level 2: All types, formulas, laws, or components
  core_concepts: {
    types: TopicSection[];
    formulas: Formula[];
    laws_principles: TopicSection[];
    components: TopicSection[];
  };
  
  // Level 3: Real-world examples and differences
  applications: {
    real_world_examples: Example[];
    comparisons: TopicSection[];
    practical_applications: TopicSection[];
  };
  
  // Level 4: Related chapters or connected topics
  connections: {
    related_topics: RelatedTopic[];
    prerequisite_knowledge: string[];
    next_topics: string[];
  };
  
  // Level 5: Numerical examples or short questions
  practice: {
    numerical_examples: Example[];
    conceptual_questions: Example[];
    short_questions: Example[];
  };
  
  // Level 6: Common mistakes, conceptual tricks, and graphical understanding
  mastery: {
    common_mistakes: CommonMistake[];
    conceptual_tricks: ConceptualTrick[];
    graphical_understanding: DiagramDescription[];
    memory_aids: string[];
  };
  
  // Metadata
  metadata: {
    generated_at: string;
    word_count: number;
    estimated_reading_time: number;
    difficulty_level: 'basic' | 'intermediate' | 'advanced';
    completeness_score: number;
    version: string;
  };
}

export interface DataGatheringStatus {
  level: number;
  description: string;
  progress: number;
  completed: boolean;
  data_points_collected: number;
  estimated_remaining_time: number;
}

export interface LearningJob {
  id: string;
  request: LearningRequest;
  status: 'gathering' | 'processing' | 'structuring' | 'finalizing' | 'completed' | 'failed';
  current_level: number;
  total_levels: number;
  progress: number;
  gathering_status: DataGatheringStatus[];
  result?: ComprehensiveChapter;
  error?: string;
  created_at: string;
  completed_at?: string;
}

export interface AIProvider {
  name: string;
  model: string;
  api_key: string;
  base_url?: string;
  max_tokens: number;
  temperature: number;
}

export interface ContentCache {
  id: string;
  key: string;
  content: ComprehensiveChapter;
  created_at: string;
  access_count: number;
  last_accessed: string;
  expires_at: string;
}

export interface LearningPlatformConfig {
  ai_providers: AIProvider[];
  cache_duration_hours: number;
  max_cache_size: number;
  default_depth_level: 'basic' | 'intermediate' | 'advanced';
  enable_caching: boolean;
  enable_auto_expansion: boolean;
  min_content_length: number;
  max_concurrent_jobs: number;
}
