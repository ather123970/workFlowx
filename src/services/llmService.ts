import { 
  TitlePage, 
  TOCPage, 
  TopicPage, 
  RetrievedContext, 
  PromptTemplate,
  ExamQuestion 
} from '@/types/notes';
import { logger } from './logger';

// LLM Service for generating content using Claude/Sonnet-4
export class LLMService {
  private static instance: LLMService;
  private apiKey: string = '';
  private baseUrl: string = 'https://api.anthropic.com/v1/messages';

  private constructor() {
    // In production, get API key from environment variables
    this.apiKey = (import.meta as any).env?.VITE_ANTHROPIC_API_KEY || '';
  }

  static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    return LLMService.instance;
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  async generateTitlePage(
    subject: string,
    classGrade: number,
    board: string,
    chapterName: string,
    syllabusContext: string[]
  ): Promise<TitlePage> {
    const prompt = this.getTitlePagePrompt();
    
    const userMessage = `Task: Create Title Page and Chapter Introduction for:
${subject}, Class ${classGrade}, Board ${board}, Chapter "${chapterName}"

Context: ${syllabusContext.join('\n\n')}

Produce JSON:
{
  "page_type":"title",
  "subject":"${subject}",
  "class":${classGrade},
  "board":"${board}",
  "chapter":"${chapterName}",
  "introduction": "...",
  "why_study": "...",
  "daily_life_example":"..."
}`;

    try {
      const response = await this.callLLM(prompt.system, userMessage, {
        temperature: 0.1,
        max_tokens: 2000,
      });

      const parsed = JSON.parse(response);
      logger.info(`Generated title page for ${subject} - ${chapterName}`);
      return parsed as TitlePage;
    } catch (error) {
      logger.error('Failed to generate title page:', error);
      throw new Error('Failed to generate title page');
    }
  }

  async generateTOC(topics: string[]): Promise<TOCPage> {
    const prompt = this.getTOCPrompt();
    
    const userMessage = `Task: Output the exact topic list for the chapter as found in the syllabus passages.
Input: ${JSON.stringify(topics)}
Output JSON:
{ "page_type":"toc", "topics":${JSON.stringify(topics)} }`;

    try {
      const response = await this.callLLM(prompt.system, userMessage, {
        temperature: 0.0,
        max_tokens: 1000,
      });

      const parsed = JSON.parse(response);
      logger.info(`Generated TOC with ${topics.length} topics`);
      return parsed as TOCPage;
    } catch (error) {
      logger.error('Failed to generate TOC:', error);
      // Fallback to simple TOC
      return {
        page_type: 'toc',
        topics,
      };
    }
  }

  async generateTopicPage(
    topicTitle: string,
    retrievedContext: RetrievedContext[]
  ): Promise<TopicPage> {
    const prompt = this.getTopicPagePrompt();
    
    const contextText = retrievedContext
      .map(ctx => `Source: ${ctx.source}\nContent: ${ctx.content}`)
      .join('\n\n---\n\n');

    const userMessage = `Task: For Topic "${topicTitle}" produce a full topic page. Use Context: ${contextText}

Produce JSON:
{
  "page_type":"topic",
  "topic_title":"${topicTitle}",
  "definition":"...",
  "explanation":"...",
  "comparison":"...",
  "example_detailed":"...",
  "example_short":"...",
  "questions":[
    {"difficulty":"easy","q":"...","a":"..."},
    {"difficulty":"medium","q":"...","a":"..."},
    {"difficulty":"hard","q":"...","a":"..."}
  ]
}`;

    try {
      const response = await this.callLLM(prompt.system, userMessage, {
        temperature: 0.1,
        max_tokens: 3000,
      });

      const parsed = JSON.parse(response);
      
      // Validate the response
      if (!this.validateTopicPage(parsed)) {
        throw new Error('Generated topic page failed validation');
      }

      logger.info(`Generated topic page for: ${topicTitle}`);
      return parsed as TopicPage;
    } catch (error) {
      logger.error(`Failed to generate topic page for ${topicTitle}:`, error);
      
      // Fallback to mock content
      return this.generateFallbackTopicPage(topicTitle);
    }
  }

  private async callLLM(
    systemPrompt: string, 
    userMessage: string, 
    options: { temperature: number; max_tokens: number }
  ): Promise<string> {
    // Mock LLM response for development
    // In production, this would call the actual Anthropic API
    
    if (!this.apiKey) {
      logger.warn('No API key provided, using mock responses');
      return this.generateMockResponse(userMessage);
    }

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // For now, return mock responses
      return this.generateMockResponse(userMessage);
      
      // Actual API call would look like this:
      /*
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: options.max_tokens,
          temperature: options.temperature,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userMessage,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.content[0].text;
      */
    } catch (error) {
      logger.error('LLM API call failed:', error);
      throw error;
    }
  }

  private generateMockResponse(userMessage: string): string {
    if (userMessage.includes('Title Page')) {
      return JSON.stringify({
        page_type: "title",
        subject: "Physics",
        class: 11,
        board: "FBISE",
        chapter: "Vectors and Equilibrium",
        introduction: "This chapter introduces the fundamental concepts of vectors and their applications in physics. Students will learn to distinguish between scalar and vector quantities, understand vector operations, and apply these concepts to solve equilibrium problems. The chapter forms the foundation for understanding more complex physics concepts in mechanics and other branches of physics.",
        why_study: "Understanding vectors is crucial for success in physics and engineering. Vectors are used to describe physical quantities that have both magnitude and direction, such as force, velocity, and acceleration. This knowledge is essential for analyzing motion, forces, and equilibrium in real-world situations. Students will find these concepts applicable in fields like engineering, architecture, navigation, and computer graphics.",
        daily_life_example: "When you push a heavy box across the floor, you apply force in a specific direction. The effectiveness of your push depends not only on how hard you push (magnitude) but also in which direction you push (direction). This is a perfect example of a vector quantity in everyday life."
      });
    }

    if (userMessage.includes('topic list')) {
      return JSON.stringify({
        page_type: "toc",
        topics: [
          "Introduction to Vectors",
          "Vectors vs Scalars",
          "Vector Addition and Subtraction",
          "Scalar Multiplication",
          "Unit Vectors",
          "Vector Components"
        ]
      });
    }

    // Generate mock topic page
    const topicMatch = userMessage.match(/For Topic "([^"]+)"/);
    const topicTitle = topicMatch ? topicMatch[1] : 'Sample Topic';

    return JSON.stringify({
      page_type: "topic",
      topic_title: topicTitle,
      definition: `${topicTitle} refers to a fundamental concept in physics that describes quantities having both magnitude and direction. It is essential for understanding various physical phenomena and mathematical operations in vector algebra.`,
      explanation: `${topicTitle} is a crucial concept that students must master to succeed in physics. \n\nKey aspects include:\n• Understanding the basic definition and properties\n• Learning mathematical operations and representations\n• Applying concepts to solve real-world problems\n• Recognizing the difference from scalar quantities\n\nThe concept builds upon previous mathematical knowledge and extends into practical applications. Students should focus on understanding both the theoretical foundations and practical problem-solving techniques.\n\nMathematical representation involves using arrows or ordered pairs to show both magnitude and direction. This visual approach helps students grasp the concept more effectively.\n\nPractical applications include analyzing forces in engineering, describing motion in physics, and solving navigation problems in geography.`,
      comparison: topicTitle.includes('vs') ? `Key differences between the compared concepts:\n• Definition and basic properties\n• Mathematical representation methods\n• Practical applications and use cases\n• Problem-solving approaches` : undefined,
      example_detailed: `Consider a student walking from their home to school in Lahore. If they walk 500 meters north and then 300 meters east, their displacement can be represented as a vector. The magnitude would be approximately 583 meters (using Pythagorean theorem), and the direction would be about 31° east of north. This real-world example demonstrates how ${topicTitle} applies to everyday situations in Pakistan.`,
      example_short: `A car traveling 60 km/h towards Islamabad represents a vector quantity.`,
      questions: [
        {
          difficulty: "easy",
          q: `What is the basic definition of ${topicTitle}?`,
          a: `${topicTitle} is a quantity that has both magnitude and direction, distinguishing it from scalar quantities which have only magnitude.`
        },
        {
          difficulty: "medium",
          q: `How do you calculate the magnitude of a vector with components (3, 4)?`,
          a: `Using the Pythagorean theorem: magnitude = √(3² + 4²) = √(9 + 16) = √25 = 5 units.`
        },
        {
          difficulty: "hard",
          q: `A force of 10 N acts at 30° above the horizontal. Find its horizontal and vertical components.`,
          a: `Horizontal component = 10 × cos(30°) = 10 × 0.866 = 8.66 N. Vertical component = 10 × sin(30°) = 10 × 0.5 = 5 N.`
        }
      ]
    });
  }

  private generateFallbackTopicPage(topicTitle: string): TopicPage {
    return {
      page_type: 'topic',
      topic_title: topicTitle,
      definition: `${topicTitle} is an important concept in this subject that students need to understand thoroughly.`,
      explanation: `This topic covers the fundamental principles and applications of ${topicTitle}. Students should focus on understanding the core concepts, mathematical relationships, and practical applications. The topic builds upon previous knowledge and prepares students for more advanced concepts in the subject.`,
      example_detailed: `A practical example of ${topicTitle} can be seen in everyday life situations. For instance, when students in Pakistan encounter this concept in their daily activities, they can observe how the principles apply to real-world scenarios.`,
      example_short: `${topicTitle} is commonly observed in daily life situations.`,
      questions: [
        {
          difficulty: 'easy',
          q: `What is ${topicTitle}?`,
          a: `${topicTitle} is a fundamental concept that students need to understand for their examinations.`,
        },
        {
          difficulty: 'medium',
          q: `How is ${topicTitle} applied in practical situations?`,
          a: `${topicTitle} has various practical applications that can be observed in real-world scenarios.`,
        },
        {
          difficulty: 'hard',
          q: `Analyze the mathematical relationship in ${topicTitle}.`,
          a: `The mathematical relationship involves understanding the underlying principles and applying appropriate formulas.`,
        },
      ],
    };
  }

  private validateTopicPage(page: any): boolean {
    const required = ['page_type', 'topic_title', 'definition', 'explanation', 'example_detailed', 'example_short', 'questions'];
    
    for (const field of required) {
      if (!page[field]) {
        logger.warn(`Missing required field: ${field}`);
        return false;
      }
    }

    if (!Array.isArray(page.questions) || page.questions.length !== 3) {
      logger.warn('Invalid questions array');
      return false;
    }

    for (const question of page.questions) {
      if (!question.difficulty || !question.q || !question.a) {
        logger.warn('Invalid question format');
        return false;
      }
    }

    return true;
  }

  private getTitlePagePrompt(): PromptTemplate {
    return {
      system: `You are a precise, school-level tutor and education content writer. Use the provided CONTEXT (official syllabus excerpts and supporting passages) to create accurate, syllabus-aligned notes. Do not invent new syllabus topics. Create engaging title pages with clear introductions that explain why students should study the chapter and provide relevant daily life examples from Pakistan. Output must be JSON following the given schema. Use simple, clear English suitable for Class 9–12 students.`,
      user: '',
      temperature: 0.1,
      max_tokens: 2000,
    };
  }

  private getTOCPrompt(): PromptTemplate {
    return {
      system: `You are a precise education content organizer. Output the exact topic list as provided, maintaining the original order and phrasing from the official syllabus. Do not add, remove, or modify topic names.`,
      user: '',
      temperature: 0.0,
      max_tokens: 1000,
    };
  }

  private getTopicPagePrompt(): PromptTemplate {
    return {
      system: `You are a precise, school-level tutor and education content writer. Use the provided CONTEXT (official syllabus excerpts and supporting passages) to create accurate, syllabus-aligned notes. Do not invent new syllabus topics. For every topic produce: Definition (1–5 lines), Detailed Explanation (10–50+ lines), Real-life Example (3–6 lines, Pakistan-relevant when possible), Micro Example (1 line), and 3 Exam Questions (easy/medium/hard) with answers and brief solutions. Output must be JSON following the given schema. Use simple, clear English suitable for Class 9–12 students. If asked to compare (e.g., Vectors vs Scalars), include a "Comparison" subsection. Avoid filler, repetition, or "I don't know". If context contradicts, prefer board syllabus/exact phrasing.`,
      user: '',
      temperature: 0.1,
      max_tokens: 3000,
    };
  }
}
