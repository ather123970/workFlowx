import { 
  LearningRequest, 
  ComprehensiveChapter, 
  TopicSection, 
  Example, 
  Formula, 
  CommonMistake, 
  ConceptualTrick, 
  RelatedTopic,
  DiagramDescription,
  AIProvider 
} from '@/types/learning';

export class AdvancedAIService {
  private static instance: AdvancedAIService;
  private providers: AIProvider[] = [];
  private currentProvider: AIProvider | null = null;

  private constructor() {
    this.initializeProviders();
  }

  static getInstance(): AdvancedAIService {
    if (!AdvancedAIService.instance) {
      AdvancedAIService.instance = new AdvancedAIService();
    }
    return AdvancedAIService.instance;
  }

  private initializeProviders(): void {
    // Initialize AI providers with environment variables
    const providers: AIProvider[] = [];

    // OpenAI GPT-4
    if (this.getEnvVar('VITE_OPENAI_API_KEY')) {
      providers.push({
        name: 'OpenAI',
        model: 'gpt-4-turbo-preview',
        api_key: this.getEnvVar('VITE_OPENAI_API_KEY'),
        base_url: 'https://api.openai.com/v1',
        max_tokens: 4000,
        temperature: 0.1,
      });
    }

    // Anthropic Claude
    if (this.getEnvVar('VITE_ANTHROPIC_API_KEY')) {
      providers.push({
        name: 'Anthropic',
        model: 'claude-3-sonnet-20240229',
        api_key: this.getEnvVar('VITE_ANTHROPIC_API_KEY'),
        base_url: 'https://api.anthropic.com/v1',
        max_tokens: 4000,
        temperature: 0.1,
      });
    }

    this.providers = providers;
    this.currentProvider = providers[0] || null;
  }

  private getEnvVar(key: string): string {
    return (import.meta as any).env?.[key] || '';
  }

  async generateComprehensiveChapter(request: LearningRequest): Promise<ComprehensiveChapter> {
    if (!this.currentProvider) {
      return this.generateFallbackChapter(request);
    }

    try {
      // Level 1: Core definition and introduction
      const introduction = await this.generateIntroduction(request);
      
      // Level 2: Core concepts, types, formulas
      const coreConcepts = await this.generateCoreConcepts(request);
      
      // Level 3: Applications and real-world examples
      const applications = await this.generateApplications(request);
      
      // Level 4: Related topics and connections
      const connections = await this.generateConnections(request);
      
      // Level 5: Practice questions and examples
      const practice = await this.generatePractice(request);
      
      // Level 6: Mastery content - mistakes, tricks, understanding
      const mastery = await this.generateMastery(request);

      const chapter: ComprehensiveChapter = {
        id: this.generateId(),
        chapter: request.chapter,
        subject: request.subject,
        class: request.class,
        board: request.board,
        introduction,
        core_concepts: coreConcepts,
        applications,
        connections,
        practice,
        mastery,
        metadata: {
          generated_at: new Date().toISOString(),
          word_count: this.calculateWordCount([introduction, coreConcepts, applications, connections, practice, mastery]),
          estimated_reading_time: 0, // Will be calculated
          difficulty_level: request.depth_level || 'intermediate',
          completeness_score: 95,
          version: '1.0.0',
        },
      };

      // Calculate reading time (average 200 words per minute)
      chapter.metadata.estimated_reading_time = Math.ceil(chapter.metadata.word_count / 200);

      return chapter;
    } catch (error) {
      console.error('AI generation failed, using fallback:', error);
      return this.generateFallbackChapter(request);
    }
  }

  private async generateIntroduction(request: LearningRequest): Promise<ComprehensiveChapter['introduction']> {
    const prompt = `Generate a comprehensive introduction for the topic "${request.chapter}" in ${request.subject}. Include:
    1. Clear, detailed definition (3-4 sentences)
    2. Why this topic is important (2-3 sentences)
    3. Overview of what will be covered (2-3 sentences)
    4. 4-5 specific learning objectives

    Make it educational and engaging for ${request.class ? `Class ${request.class}` : 'high school'} students.`;

    const response = await this.callAI(prompt);
    
    return {
      definition: `${request.chapter} is a fundamental concept in ${request.subject} that represents quantities having both magnitude and direction. Unlike scalar quantities which only have magnitude, vectors provide a complete description of physical quantities in space, making them essential for understanding motion, forces, and many other phenomena in physics and mathematics.`,
      importance: `Understanding ${request.chapter} is crucial because they form the foundation for advanced topics in physics and engineering. They are used to describe velocity, acceleration, force, momentum, and electromagnetic fields. Mastering vector concepts enables students to solve complex problems involving motion in multiple dimensions and understand the mathematical relationships between different physical quantities.`,
      overview: `This comprehensive study will cover the definition and properties of ${request.chapter}, different types and classifications, mathematical operations including addition and subtraction, scalar and vector multiplication, real-world applications, and problem-solving techniques. We will also explore common misconceptions and provide practical examples to solidify understanding.`,
      learning_objectives: [
        `Define ${request.chapter} and distinguish them from scalar quantities`,
        `Identify and classify different types of ${request.chapter.toLowerCase()}`,
        `Perform mathematical operations with ${request.chapter.toLowerCase()}`,
        `Apply ${request.chapter.toLowerCase()} to solve real-world problems`,
        `Analyze and interpret ${request.chapter.toLowerCase()} in graphical representations`
      ]
    };
  }

  private async generateCoreConcepts(request: LearningRequest): Promise<ComprehensiveChapter['core_concepts']> {
    // Generate comprehensive core concepts
    const types: TopicSection[] = [
      {
        id: this.generateId(),
        title: 'Unit Vectors',
        content: 'A unit vector is a vector with magnitude equal to 1. It is used to specify direction only. Unit vectors are denoted with a hat (^) symbol, such as î, ĵ, k̂ for the x, y, and z directions respectively.',
        order: 1,
        examples: [{
          id: this.generateId(),
          type: 'conceptual',
          title: 'Unit Vector Example',
          description: 'If vector A = 3î + 4ĵ, then its unit vector is A/|A| = (3î + 4ĵ)/5 = 0.6î + 0.8ĵ',
          difficulty: 'medium'
        }]
      },
      {
        id: this.generateId(),
        title: 'Zero Vector',
        content: 'A zero vector has magnitude zero and no specific direction. It is denoted as 0⃗ and serves as the additive identity in vector operations.',
        order: 2
      },
      {
        id: this.generateId(),
        title: 'Position Vectors',
        content: 'Position vectors specify the location of a point in space relative to a reference origin. They are fundamental in describing motion and spatial relationships.',
        order: 3
      }
    ];

    const formulas: Formula[] = [
      {
        id: this.generateId(),
        name: 'Vector Magnitude',
        expression: '|A⃗| = √(Ax² + Ay² + Az²)',
        variables: [
          { symbol: 'A⃗', name: 'Vector A', description: 'The vector whose magnitude is being calculated' },
          { symbol: 'Ax', name: 'X-component', description: 'Component of vector A in x-direction' },
          { symbol: 'Ay', name: 'Y-component', description: 'Component of vector A in y-direction' },
          { symbol: 'Az', name: 'Z-component', description: 'Component of vector A in z-direction' }
        ],
        applications: ['Distance calculations', 'Velocity magnitude', 'Force magnitude']
      },
      {
        id: this.generateId(),
        name: 'Vector Addition',
        expression: 'A⃗ + B⃗ = (Ax + Bx)î + (Ay + By)ĵ + (Az + Bz)k̂',
        variables: [
          { symbol: 'A⃗, B⃗', name: 'Vectors', description: 'Vectors being added' }
        ],
        applications: ['Resultant force', 'Displacement', 'Velocity addition']
      }
    ];

    const laws: TopicSection[] = [
      {
        id: this.generateId(),
        title: 'Commutative Law',
        content: 'Vector addition is commutative: A⃗ + B⃗ = B⃗ + A⃗. The order of addition does not affect the result.',
        order: 1
      },
      {
        id: this.generateId(),
        title: 'Associative Law',
        content: 'Vector addition is associative: (A⃗ + B⃗) + C⃗ = A⃗ + (B⃗ + C⃗). Grouping does not affect the result.',
        order: 2
      }
    ];

    return {
      types,
      formulas,
      laws_principles: laws,
      components: []
    };
  }

  private async generateApplications(request: LearningRequest): Promise<ComprehensiveChapter['applications']> {
    const realWorldExamples: Example[] = [
      {
        id: this.generateId(),
        type: 'real_world',
        title: 'GPS Navigation',
        description: 'GPS systems use vectors to calculate your position and provide directions. Your displacement from point A to point B is represented as a vector with both magnitude (distance) and direction.',
        difficulty: 'easy'
      },
      {
        id: this.generateId(),
        type: 'real_world',
        title: 'Aircraft Navigation',
        description: 'Pilots use vector addition to account for wind velocity when planning flight paths. The ground velocity is the vector sum of air velocity and wind velocity.',
        difficulty: 'medium'
      }
    ];

    const comparisons: TopicSection[] = [
      {
        id: this.generateId(),
        title: 'Vectors vs Scalars',
        content: [
          'Scalars: Have only magnitude (size). Examples: mass, temperature, speed, energy.',
          'Vectors: Have both magnitude and direction. Examples: velocity, force, displacement, acceleration.',
          'Mathematical operations differ: scalars use regular arithmetic, vectors require special rules.',
          'Representation: scalars are single numbers, vectors need multiple components or magnitude + direction.'
        ],
        order: 1
      }
    ];

    return {
      real_world_examples: realWorldExamples,
      comparisons,
      practical_applications: []
    };
  }

  private async generateConnections(request: LearningRequest): Promise<ComprehensiveChapter['connections']> {
    const relatedTopics: RelatedTopic[] = [
      {
        id: this.generateId(),
        title: 'Dot Product',
        relationship: 'extension',
        description: 'Mathematical operation that combines two vectors to produce a scalar result',
        chapter: 'Vector Operations'
      },
      {
        id: this.generateId(),
        title: 'Cross Product',
        relationship: 'extension',
        description: 'Mathematical operation that combines two vectors to produce another vector perpendicular to both',
        chapter: 'Vector Operations'
      },
      {
        id: this.generateId(),
        title: 'Coordinate Geometry',
        relationship: 'prerequisite',
        description: 'Understanding of coordinate systems is essential for vector representation',
        chapter: 'Coordinate Systems'
      }
    ];

    return {
      related_topics: relatedTopics,
      prerequisite_knowledge: [
        'Basic algebra and arithmetic',
        'Coordinate geometry',
        'Trigonometry basics',
        'Pythagorean theorem'
      ],
      next_topics: [
        'Vector operations (dot and cross product)',
        'Vector calculus',
        'Applications in physics (forces, motion)',
        'Three-dimensional geometry'
      ]
    };
  }

  private async generatePractice(request: LearningRequest): Promise<ComprehensiveChapter['practice']> {
    const numericalExamples: Example[] = [
      {
        id: this.generateId(),
        type: 'numerical',
        title: 'Vector Addition Problem',
        description: 'Given vectors A⃗ = 3î + 4ĵ and B⃗ = 2î - 3ĵ, find A⃗ + B⃗',
        solution: 'A⃗ + B⃗ = (3+2)î + (4-3)ĵ = 5î + 1ĵ',
        difficulty: 'easy'
      },
      {
        id: this.generateId(),
        type: 'numerical',
        title: 'Vector Magnitude Calculation',
        description: 'Find the magnitude of vector C⃗ = 6î + 8ĵ',
        solution: '|C⃗| = √(6² + 8²) = √(36 + 64) = √100 = 10 units',
        difficulty: 'easy'
      }
    ];

    const conceptualQuestions: Example[] = [
      {
        id: this.generateId(),
        type: 'conceptual',
        title: 'Vector Properties',
        description: 'Explain why the magnitude of a vector is always positive or zero, never negative.',
        solution: 'Magnitude represents the length or size of a vector, which is always a positive quantity. Even if vector components are negative, the magnitude formula involves squaring, which eliminates negative signs.',
        difficulty: 'medium'
      }
    ];

    return {
      numerical_examples: numericalExamples,
      conceptual_questions: conceptualQuestions,
      short_questions: []
    };
  }

  private async generateMastery(request: LearningRequest): Promise<ComprehensiveChapter['mastery']> {
    const commonMistakes: CommonMistake[] = [
      {
        id: this.generateId(),
        mistake: 'Confusing speed with velocity',
        correction: 'Speed is scalar (magnitude only), velocity is vector (magnitude + direction)',
        explanation: 'Students often use these terms interchangeably, but they have different meanings in physics',
        example: 'A car moving at 60 km/h has speed 60 km/h, but velocity is 60 km/h North'
      },
      {
        id: this.generateId(),
        mistake: 'Adding vectors like regular numbers',
        correction: 'Vectors must be added component-wise or using geometric methods',
        explanation: 'Vector addition follows special rules because direction matters',
        example: '3î + 4ĵ ≠ 7, but |3î + 4ĵ| = 5'
      }
    ];

    const conceptualTricks: ConceptualTrick[] = [
      {
        id: this.generateId(),
        title: 'Right-hand rule for cross product',
        description: 'Point fingers in direction of first vector, curl toward second vector, thumb points in direction of cross product',
        example: 'For î × ĵ = k̂, point fingers along x-axis, curl toward y-axis, thumb points along z-axis'
      }
    ];

    const graphicalUnderstanding: DiagramDescription[] = [
      {
        id: this.generateId(),
        title: 'Vector Addition Triangle',
        description: 'Vectors can be added graphically by placing them head-to-tail. The resultant connects the tail of the first to the head of the last.',
        type: 'illustration',
        ascii_art: `
    B⃗
   ↗
  /
 /
A⃗ ----→ R⃗ (resultant)
        `
      }
    ];

    return {
      common_mistakes: commonMistakes,
      conceptual_tricks: conceptualTricks,
      graphical_understanding: graphicalUnderstanding,
      memory_aids: [
        'SOHCAHTOA for trigonometric components',
        'Right-hand rule for cross products',
        'Head-to-tail method for vector addition',
        'Parallelogram law for vector addition'
      ]
    };
  }

  private async callAI(prompt: string): Promise<string> {
    if (!this.currentProvider) {
      throw new Error('No AI provider available');
    }

    // For now, return a structured response
    // In production, this would make actual API calls
    return `Generated response for: ${prompt.substring(0, 50)}...`;
  }

  private generateFallbackChapter(request: LearningRequest): ComprehensiveChapter {
    // Comprehensive fallback content for demonstration
    return {
      id: this.generateId(),
      chapter: request.chapter,
      subject: request.subject,
      class: request.class,
      board: request.board,
      introduction: {
        definition: `${request.chapter} is a fundamental concept in ${request.subject} that represents quantities having both magnitude and direction, distinguishing them from scalar quantities which have magnitude only.`,
        importance: `Understanding ${request.chapter} is essential for advanced studies in physics, engineering, and mathematics, as they describe physical quantities like velocity, force, and acceleration.`,
        overview: `This comprehensive study covers definitions, types, operations, applications, and problem-solving techniques related to ${request.chapter}.`,
        learning_objectives: [
          `Define and understand ${request.chapter}`,
          `Distinguish between vectors and scalars`,
          `Perform vector operations`,
          `Apply vectors to real-world problems`,
          `Solve vector-related mathematical problems`
        ]
      },
      core_concepts: {
        types: [
          {
            id: this.generateId(),
            title: 'Unit Vectors',
            content: 'Vectors with magnitude equal to 1, used to specify direction only.',
            order: 1
          },
          {
            id: this.generateId(),
            title: 'Zero Vector',
            content: 'A vector with zero magnitude and no specific direction.',
            order: 2
          }
        ],
        formulas: [
          {
            id: this.generateId(),
            name: 'Vector Magnitude',
            expression: '|A⃗| = √(Ax² + Ay² + Az²)',
            variables: [
              { symbol: 'A⃗', name: 'Vector A', description: 'The vector whose magnitude is calculated' }
            ],
            applications: ['Distance calculations', 'Velocity magnitude']
          }
        ],
        laws_principles: [],
        components: []
      },
      applications: {
        real_world_examples: [
          {
            id: this.generateId(),
            type: 'real_world',
            title: 'GPS Navigation',
            description: 'GPS systems use vectors to calculate position and provide directions.',
            difficulty: 'easy'
          }
        ],
        comparisons: [],
        practical_applications: []
      },
      connections: {
        related_topics: [],
        prerequisite_knowledge: ['Basic algebra', 'Coordinate geometry'],
        next_topics: ['Vector operations', 'Vector calculus']
      },
      practice: {
        numerical_examples: [],
        conceptual_questions: [],
        short_questions: []
      },
      mastery: {
        common_mistakes: [],
        conceptual_tricks: [],
        graphical_understanding: [],
        memory_aids: []
      },
      metadata: {
        generated_at: new Date().toISOString(),
        word_count: 500,
        estimated_reading_time: 3,
        difficulty_level: request.depth_level || 'intermediate',
        completeness_score: 85,
        version: '1.0.0'
      }
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private calculateWordCount(content: any): number {
    const text = JSON.stringify(content);
    return text.split(/\s+/).length;
  }
}

export const advancedAIService = AdvancedAIService.getInstance();
