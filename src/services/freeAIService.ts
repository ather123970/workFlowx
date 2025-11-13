import { LearningRequest, ComprehensiveChapter } from '@/types/learning';

export interface LocalLLMConfig {
  model: 'ollama' | 'gpt4all' | 'transformers' | 'huggingface';
  endpoint?: string;
  modelName: string;
  maxTokens: number;
  temperature: number;
}

export interface FreeAIResponse {
  success: boolean;
  content?: string;
  error?: string;
  processingTime: number;
}

export class FreeAIService {
  private static instance: FreeAIService;
  private config: LocalLLMConfig;
  private isModelLoaded: boolean = false;

  private constructor() {
    // Default to Ollama with Mistral (completely free)
    this.config = {
      model: 'ollama',
      endpoint: 'http://localhost:11434',
      modelName: 'mistral:7b',
      maxTokens: 2048,
      temperature: 0.3
    };
  }

  static getInstance(): FreeAIService {
    if (!FreeAIService.instance) {
      FreeAIService.instance = new FreeAIService();
    }
    return FreeAIService.instance;
  }

  // Initialize and check available free LLMs
  async initializeFreeModels(): Promise<void> {
    console.log('🔍 Detecting available free AI models...');
    
    // Try Ollama first (best option)
    if (await this.checkOllamaAvailability()) {
      this.config.model = 'ollama';
      console.log('✅ Ollama detected - using Mistral 7B');
      return;
    }

    // Try GPT4All
    if (await this.checkGPT4AllAvailability()) {
      this.config.model = 'gpt4all';
      console.log('✅ GPT4All detected');
      return;
    }

    // Try Transformers.js (browser-based)
    if (await this.checkTransformersAvailability()) {
      this.config.model = 'transformers';
      console.log('✅ Transformers.js detected - using browser-based model');
      return;
    }

    // Fallback to HuggingFace Inference API (free tier)
    this.config.model = 'huggingface';
    this.config.endpoint = 'https://api-inference.huggingface.co';
    this.config.modelName = 'microsoft/DialoGPT-medium';
    console.log('✅ Using HuggingFace Inference API (free tier)');
  }

  // Check if Ollama is running locally
  private async checkOllamaAvailability(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        const data = await response.json();
        console.log('Available Ollama models:', data.models?.map((m: any) => m.name));
        return true;
      }
    } catch (error) {
      console.log('Ollama not available:', error);
    }
    return false;
  }

  // Check GPT4All availability
  private async checkGPT4AllAvailability(): Promise<boolean> {
    try {
      // GPT4All would need to be integrated via Python bridge or native bindings
      // For now, return false - can be implemented later
      return false;
    } catch (error) {
      return false;
    }
  }

  // Check Transformers.js availability
  private async checkTransformersAvailability(): Promise<boolean> {
    try {
      // Check if @xenova/transformers is available
      const transformers = await import('@xenova/transformers');
      return !!transformers;
    } catch (error) {
      return false;
    }
  }

  // Generate content using the selected free model
  async generateContent(prompt: string, context?: string): Promise<FreeAIResponse> {
    const startTime = Date.now();
    
    try {
      let content: string;
      
      switch (this.config.model) {
        case 'ollama':
          content = await this.generateWithOllama(prompt, context);
          break;
        case 'gpt4all':
          content = await this.generateWithGPT4All(prompt, context);
          break;
        case 'transformers':
          content = await this.generateWithTransformers(prompt, context);
          break;
        case 'huggingface':
          content = await this.generateWithHuggingFace(prompt, context);
          break;
        default:
          throw new Error('No free AI model available');
      }

      return {
        success: true,
        content,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime
      };
    }
  }

  // Ollama implementation (best free option)
  private async generateWithOllama(prompt: string, context?: string): Promise<string> {
    const fullPrompt = context ? `Context: ${context}\n\nTask: ${prompt}` : prompt;
    
    const response = await fetch(`${this.config.endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.modelName,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: this.config.temperature,
          num_predict: this.config.maxTokens
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || '';
  }

  // GPT4All implementation (local model)
  private async generateWithGPT4All(prompt: string, context?: string): Promise<string> {
    // This would require GPT4All Python bindings or native integration
    // For now, return a placeholder - can be implemented with Python bridge
    throw new Error('GPT4All integration not yet implemented');
  }

  // Transformers.js implementation (browser-based)
  private async generateWithTransformers(prompt: string, context?: string): Promise<string> {
    try {
      const { pipeline } = await import('@xenova/transformers');
      
      // Use a small text generation model that runs in browser
      const generator = await pipeline('text-generation', 'Xenova/gpt2');
      
      const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
      const result = await generator(fullPrompt, {
        max_length: 512,
        temperature: this.config.temperature,
        do_sample: true
      });

      return result[0]?.generated_text || '';
    } catch (error) {
      throw new Error(`Transformers.js error: ${error}`);
    }
  }

  // HuggingFace Inference API (free tier)
  private async generateWithHuggingFace(prompt: string, context?: string): Promise<string> {
    const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
    
    const response = await fetch(`${this.config.endpoint}/models/${this.config.modelName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputs: fullPrompt,
        parameters: {
          max_length: this.config.maxTokens,
          temperature: this.config.temperature,
          return_full_text: false
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data[0]?.generated_text || data.generated_text || '';
  }

  // Generate structured educational content
  async generateTopicContent(
    topic: string, 
    subject: string, 
    context: string,
    request: LearningRequest
  ): Promise<{
    definition: string;
    explanation: string;
    comparison?: string;
    examples: string[];
    questions: Array<{ difficulty: string; question: string; answer: string }>;
  }> {
    const prompt = `You are an expert ${subject} teacher for Class ${request.class} students in Pakistan (${request.board} board).

Topic: ${topic}

Using the provided context, create comprehensive educational content with:

1. DEFINITION (2-3 lines): Clear, simple definition
2. EXPLANATION (minimum 15 lines, up to 50 lines): Detailed explanation with:
   - Step-by-step breakdown
   - Key concepts and principles
   - How it works or applies
   - Connections to other topics
   - Real-world relevance
3. COMPARISON (if applicable): Compare with similar concepts
4. EXAMPLES: 
   - 2-3 detailed examples with Pakistan context (cities, industries, daily life)
   - Include numerical examples where applicable
5. PRACTICE QUESTIONS:
   - 1 Easy question with answer
   - 1 Medium question with detailed solution
   - 1 Hard question with step-by-step solution

Format as JSON:
{
  "definition": "...",
  "explanation": "...",
  "comparison": "...",
  "examples": ["example1", "example2", "example3"],
  "questions": [
    {"difficulty": "easy", "question": "...", "answer": "..."},
    {"difficulty": "medium", "question": "...", "answer": "..."},
    {"difficulty": "hard", "question": "...", "answer": "..."}
  ]
}

Use simple English suitable for Pakistani students. Include local examples (Karachi, Lahore, Islamabad, etc.).`;

    const response = await this.generateContent(prompt, context);
    
    if (!response.success || !response.content) {
      throw new Error('Failed to generate topic content');
    }

    try {
      // Try to parse JSON response
      const parsed = JSON.parse(response.content);
      return parsed;
    } catch (error) {
      // If JSON parsing fails, create structured content from text
      return this.parseTextToStructuredContent(response.content, topic);
    }
  }

  // Parse text response into structured format if JSON parsing fails
  private parseTextToStructuredContent(text: string, topic: string): any {
    const lines = text.split('\n').filter(line => line.trim());
    
    return {
      definition: `${topic} is a fundamental concept that requires detailed study and understanding.`,
      explanation: lines.slice(0, Math.max(15, Math.min(50, lines.length - 10))).join('\n'),
      comparison: `${topic} can be compared with related concepts in the same field.`,
      examples: [
        `Example 1: Application of ${topic} in Pakistani context`,
        `Example 2: Real-world usage of ${topic}`,
        `Example 3: Practical demonstration of ${topic}`
      ],
      questions: [
        {
          difficulty: 'easy',
          question: `What is ${topic}?`,
          answer: `${topic} is a key concept that students should understand thoroughly.`
        },
        {
          difficulty: 'medium',
          question: `Explain the applications of ${topic}.`,
          answer: `${topic} has various applications in different fields and real-world scenarios.`
        },
        {
          difficulty: 'hard',
          question: `Analyze the importance of ${topic} in advanced studies.`,
          answer: `${topic} forms the foundation for advanced concepts and has significant importance in higher education.`
        }
      ]
    };
  }

  // Get model status and information
  getModelStatus(): {
    model: string;
    endpoint?: string;
    modelName: string;
    isLoaded: boolean;
    capabilities: string[];
  } {
    return {
      model: this.config.model,
      endpoint: this.config.endpoint,
      modelName: this.config.modelName,
      isLoaded: this.isModelLoaded,
      capabilities: this.getModelCapabilities()
    };
  }

  private getModelCapabilities(): string[] {
    const capabilities = ['text-generation', 'educational-content'];
    
    switch (this.config.model) {
      case 'ollama':
        capabilities.push('local-processing', 'offline-capable', 'high-quality');
        break;
      case 'transformers':
        capabilities.push('browser-based', 'no-server-required', 'privacy-focused');
        break;
      case 'huggingface':
        capabilities.push('cloud-based', 'free-tier', 'multiple-models');
        break;
    }
    
    return capabilities;
  }

  // Update model configuration
  updateConfig(newConfig: Partial<LocalLLMConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.isModelLoaded = false;
  }

  // Test model availability and performance
  async testModel(): Promise<{
    available: boolean;
    responseTime: number;
    quality: 'good' | 'fair' | 'poor';
    error?: string;
  }> {
    const testPrompt = 'Explain photosynthesis in 2 sentences.';
    const startTime = Date.now();
    
    try {
      const response = await this.generateContent(testPrompt);
      const responseTime = Date.now() - startTime;
      
      if (!response.success) {
        return {
          available: false,
          responseTime,
          quality: 'poor',
          error: response.error
        };
      }

      // Evaluate response quality
      const content = response.content || '';
      const quality = content.length > 50 && content.includes('plant') ? 'good' : 
                     content.length > 20 ? 'fair' : 'poor';

      return {
        available: true,
        responseTime,
        quality
      };
    } catch (error) {
      return {
        available: false,
        responseTime: Date.now() - startTime,
        quality: 'poor',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const freeAIService = FreeAIService.getInstance();
