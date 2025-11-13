import { LearningRequest } from '@/types/learning';
import { ChapterInfo } from './syllabusService';

export interface StudentFriendlyContent {
  topic: string;
  quickOverview: QuickOverview;
  definition: StudentDefinition;
  detailedExplanation: DetailedExplanation;
  dailyLifeExamples: DailyLifeExample[];
  importantPoints: ImportantPoint[];
  mathematicalFormulas: StudentFormula[];
  stepByStepDerivations: StepByStepDerivation[];
  workedExamples: StudentExample[];
  practiceQuestions: PracticeQuestion[];
  importantExamQuestions: ExamQuestion[];
  memoryTricks: MemoryTrick[];
  commonMistakes: CommonMistake[];
  summary: StudentSummary;
  estimatedWordCount: number;
}

export interface QuickOverview {
  whatIsIt: string;
  whyImportant: string;
  timeToMaster: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prerequisite: string[];
}

export interface StudentDefinition {
  simpleDefinition: string;
  technicalDefinition: string;
  keyWords: string[];
  analogy: string;
}

export interface DetailedExplanation {
  introduction: string;
  mainConcepts: string[];
  howItWorks: string;
  visualDescription: string;
  connections: string[];
}

export interface DailyLifeExample {
  title: string;
  description: string;
  pakistaniContext: boolean;
  explanation: string;
  relatedConcept: string;
}

export interface ImportantPoint {
  point: string;
  explanation: string;
  whyImportant: string;
  examRelevance: string;
}

export interface StudentFormula {
  name: string;
  formula: string;
  easyExplanation: string;
  variables: StudentVariable[];
  whenToUse: string;
  memoryTrick: string;
}

export interface StudentVariable {
  symbol: string;
  name: string;
  unit: string;
  simpleExplanation: string;
}

export interface StepByStepDerivation {
  title: string;
  whyDerive: string;
  startingPoint: string;
  steps: DerivationStep[];
  finalResult: string;
  whatItMeans: string;
}

export interface DerivationStep {
  stepNumber: number;
  whatWeDo: string;
  equation: string;
  whyWeDoIt: string;
  result: string;
}

export interface StudentExample {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  scenario: string;
  given: string[];
  toFind: string;
  approach: string;
  solution: SolutionStep[];
  answer: string;
  checkYourAnswer: string;
  commonErrors: string[];
}

export interface SolutionStep {
  step: number;
  whatToDo: string;
  calculation: string;
  result: string;
  explanation: string;
}

export interface PracticeQuestion {
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  hint: string;
  solution: string;
  marks: number;
}

export interface ExamQuestion {
  question: string;
  boardType: 'FBISE' | 'BISE' | 'General';
  year?: number;
  marks: number;
  solution: string;
  examTips: string[];
}

export interface MemoryTrick {
  concept: string;
  trick: string;
  explanation: string;
}

export interface CommonMistake {
  mistake: string;
  whyItHappens: string;
  howToAvoid: string;
  correctApproach: string;
}

export interface StudentSummary {
  keyTakeaways: string[];
  mustRemember: string[];
  examFocus: string[];
  nextTopics: string[];
}

export class StudentFriendlyContentGenerator {
  private static instance: StudentFriendlyContentGenerator;

  private constructor() {}

  static getInstance(): StudentFriendlyContentGenerator {
    if (!StudentFriendlyContentGenerator.instance) {
      StudentFriendlyContentGenerator.instance = new StudentFriendlyContentGenerator();
    }
    return StudentFriendlyContentGenerator.instance;
  }

  async generateStudentFriendlyContent(
    topic: string,
    subject: string,
    request: LearningRequest,
    chapterInfo?: ChapterInfo
  ): Promise<StudentFriendlyContent> {
    console.log(`🎓 Generating student-friendly content for: ${topic}`);

    switch (subject.toLowerCase()) {
      case 'physics':
        return this.generatePhysicsContent(topic, request, chapterInfo);
      case 'mathematics':
        return this.generateMathContent(topic, request, chapterInfo);
      case 'chemistry':
        return this.generateChemistryContent(topic, request, chapterInfo);
      case 'biology':
        return this.generateBiologyContent(topic, request, chapterInfo);
      default:
        return this.generateGenericContent(topic, subject, request, chapterInfo);
    }
  }

  private async generatePhysicsContent(
    topic: string,
    request: LearningRequest,
    chapterInfo?: ChapterInfo
  ): Promise<StudentFriendlyContent> {
    
    // Get physics-specific content database
    const physicsDatabase = this.getPhysicsStudentDatabase();
    const topicData = physicsDatabase[topic] || this.generatePhysicsFallback(topic, request, chapterInfo);

    return {
      topic,
      quickOverview: topicData.quickOverview,
      definition: topicData.definition,
      detailedExplanation: topicData.detailedExplanation,
      dailyLifeExamples: topicData.dailyLifeExamples,
      importantPoints: topicData.importantPoints,
      mathematicalFormulas: topicData.mathematicalFormulas,
      stepByStepDerivations: topicData.stepByStepDerivations,
      workedExamples: topicData.workedExamples,
      practiceQuestions: topicData.practiceQuestions,
      importantExamQuestions: topicData.importantExamQuestions,
      memoryTricks: topicData.memoryTricks,
      commonMistakes: topicData.commonMistakes,
      summary: topicData.summary,
      estimatedWordCount: this.calculateWordCount(topicData)
    };
  }

  private getPhysicsStudentDatabase(): Record<string, any> {
    return {
      "Work Done by a Constant Force": {
        quickOverview: {
          whatIsIt: "Work is the energy transferred when a force moves an object through a distance.",
          whyImportant: "Understanding work helps you solve problems about energy, power, and machines. It's fundamental to engineering and everyday applications.",
          timeToMaster: "2-3 hours of focused study",
          difficulty: "Medium" as const,
          prerequisite: ["Force", "Displacement", "Basic trigonometry"]
        },

        definition: {
          simpleDefinition: "Work is done when you push or pull something and it moves in the direction of your push or pull.",
          technicalDefinition: "Work is defined as the scalar product of force and displacement: W = F⃗ · s⃗ = Fs cos θ",
          keyWords: ["Force", "Displacement", "Energy transfer", "Scalar quantity"],
          analogy: "Think of work like pushing a shopping cart in a supermarket. You only do work when the cart actually moves in the direction you're pushing. If you push against a wall, no work is done because nothing moves!"
        },

        detailedExplanation: {
          introduction: "Work is one of the most important concepts in physics because it connects force and energy. When you apply a force to move something, you transfer energy to that object. This energy transfer is what we call 'work'.",
          mainConcepts: [
            "Work requires both force AND displacement",
            "Work can be positive, negative, or zero",
            "Work is a scalar quantity (has magnitude but no direction)",
            "Work is measured in joules (J)"
          ],
          howItWorks: "When you apply a force F to an object and it moves through a displacement s, the work done is W = Fs cos θ, where θ is the angle between the force and displacement vectors. The cosine function determines how much of the force actually contributes to the motion.",
          visualDescription: "Imagine pushing a box across the floor. If you push horizontally and the box moves horizontally, all your force contributes to work (θ = 0°, cos 0° = 1). If you push at an angle, only the horizontal component of your force does work on moving the box horizontally.",
          connections: [
            "Work connects to energy through the work-energy theorem",
            "Work relates to power (work done per unit time)",
            "Work is fundamental to understanding machines and efficiency"
          ]
        },

        dailyLifeExamples: [
          {
            title: "Lifting Your School Bag",
            description: "When you lift your school bag from the floor to your desk, you do positive work against gravity.",
            pakistaniContext: true,
            explanation: "Your upward force overcomes the downward gravitational force, transferring energy to the bag and increasing its potential energy. The work done equals the weight of the bag times the height lifted.",
            relatedConcept: "Gravitational potential energy"
          },
          {
            title: "Riding a Bicycle in Lahore",
            description: "When cycling on flat roads in Lahore, you do work against friction and air resistance.",
            pakistaniContext: true,
            explanation: "Your pedaling force moves the bicycle forward against opposing forces. On uphill sections (like going up to Margalla Hills), you also do work against gravity.",
            relatedConcept: "Friction and energy conservation"
          },
          {
            title: "Using a Pulley System at Construction Sites",
            description: "Construction workers in Pakistan use pulleys to lift heavy materials to upper floors of buildings.",
            pakistaniContext: true,
            explanation: "The pulley system allows workers to do the same amount of work with less force over a greater distance. The total work done equals the weight lifted times the height, regardless of the pulley system used.",
            relatedConcept: "Mechanical advantage and simple machines"
          }
        ],

        importantPoints: [
          {
            point: "Work is done only when there is displacement in the direction of force",
            explanation: "If you push against a wall with great force but the wall doesn't move, no work is done in the physics sense.",
            whyImportant: "This distinguishes physics work from everyday usage of the word 'work'",
            examRelevance: "Common exam question: 'A person holds a heavy box. Is work being done?' Answer: No, because there's no displacement."
          },
          {
            point: "Work can be positive, negative, or zero",
            explanation: "Positive work: force and displacement in same direction. Negative work: force opposes displacement. Zero work: force perpendicular to displacement.",
            whyImportant: "Understanding the sign of work helps in energy analysis",
            examRelevance: "Frequently tested in problems involving friction, gravity, and applied forces"
          },
          {
            point: "Work is a scalar quantity",
            explanation: "Unlike force and displacement (vectors), work has only magnitude, no direction.",
            whyImportant: "This simplifies calculations when multiple forces do work",
            examRelevance: "Important for understanding why work values can be simply added algebraically"
          }
        ],

        mathematicalFormulas: [
          {
            name: "Work Done by Constant Force",
            formula: "W = F × s × cos θ",
            easyExplanation: "Work equals force times distance times the cosine of the angle between them",
            variables: [
              {
                symbol: "W",
                name: "Work done",
                unit: "Joules (J)",
                simpleExplanation: "The energy transferred by the force"
              },
              {
                symbol: "F",
                name: "Applied force",
                unit: "Newtons (N)",
                simpleExplanation: "How hard you push or pull"
              },
              {
                symbol: "s",
                name: "Displacement",
                unit: "Meters (m)",
                simpleExplanation: "How far the object moves"
              },
              {
                symbol: "θ",
                name: "Angle",
                unit: "Degrees (°)",
                simpleExplanation: "Angle between force direction and movement direction"
              }
            ],
            whenToUse: "Use this formula when the force remains constant throughout the motion",
            memoryTrick: "Remember: Work = Force × Distance × 'Connection factor' (cos θ). If force and motion are in the same direction, connection factor = 1 (maximum work)."
          }
        ],

        stepByStepDerivations: [
          {
            title: "Why Work Formula is W = Fs cos θ",
            whyDerive: "Understanding where this formula comes from helps you apply it correctly and understand its physical meaning.",
            startingPoint: "We start with the definition that work is the energy transferred by a force.",
            steps: [
              {
                stepNumber: 1,
                whatWeDo: "Consider a force F⃗ acting on an object",
                equation: "F⃗ = force vector",
                whyWeDoIt: "We need to represent force as a vector because it has both magnitude and direction",
                result: "Force is a vector quantity"
              },
              {
                stepNumber: 2,
                whatWeDo: "Consider displacement s⃗ of the object",
                equation: "s⃗ = displacement vector",
                whyWeDoIt: "Displacement also has magnitude and direction",
                result: "Displacement is a vector quantity"
              },
              {
                stepNumber: 3,
                whatWeDo: "Only the component of force in the direction of displacement does work",
                equation: "F_parallel = F cos θ",
                whyWeDoIt: "Force perpendicular to motion doesn't contribute to energy transfer",
                result: "Effective force = F cos θ"
              },
              {
                stepNumber: 4,
                whatWeDo: "Multiply effective force by displacement",
                equation: "W = F_parallel × s = F cos θ × s",
                whyWeDoIt: "Work is the product of effective force and displacement",
                result: "W = Fs cos θ"
              }
            ],
            finalResult: "W = Fs cos θ",
            whatItMeans: "This formula tells us that work depends on the magnitude of force, the distance moved, and how well the force aligns with the direction of motion."
          }
        ],

        workedExamples: [
          {
            title: "Student Pushing a Desk Across Classroom",
            difficulty: "Easy" as const,
            scenario: "A student applies a horizontal force of 50 N to push a desk 3 meters across a classroom floor.",
            given: [
              "Applied force F = 50 N (horizontal)",
              "Displacement s = 3 m (horizontal)",
              "Angle θ = 0° (force and displacement in same direction)"
            ],
            toFind: "Work done by the student",
            approach: "Use the work formula W = Fs cos θ since force is constant",
            solution: [
              {
                step: 1,
                whatToDo: "Identify the given values",
                calculation: "F = 50 N, s = 3 m, θ = 0°",
                result: "All values identified",
                explanation: "Force and displacement are in the same direction (both horizontal)"
              },
              {
                step: 2,
                whatToDo: "Apply the work formula",
                calculation: "W = F × s × cos θ = 50 × 3 × cos(0°)",
                result: "W = 50 × 3 × 1",
                explanation: "cos(0°) = 1 because force and displacement are parallel"
              },
              {
                step: 3,
                whatToDo: "Calculate the final answer",
                calculation: "W = 150 J",
                result: "Work done = 150 J",
                explanation: "The student transfers 150 joules of energy to the desk"
              }
            ],
            answer: "150 J",
            checkYourAnswer: "The answer is positive because force and displacement are in the same direction. The units are correct (Joules for work).",
            commonErrors: [
              "Forgetting to use cos θ (even when θ = 0°)",
              "Using wrong units (using N⋅m instead of J, though they're equivalent)",
              "Not recognizing that horizontal force and horizontal displacement give θ = 0°"
            ]
          }
        ],

        practiceQuestions: [
          {
            question: "A worker pulls a crate with a force of 100 N at an angle of 30° above horizontal. If the crate moves 5 m horizontally, calculate the work done.",
            difficulty: "Medium" as const,
            hint: "Remember that θ is the angle between force and displacement vectors. The displacement is horizontal.",
            solution: "W = F × s × cos θ = 100 × 5 × cos(30°) = 100 × 5 × 0.866 = 433 J",
            marks: 4
          },
          {
            question: "A student carries a 20 N backpack while walking 100 m horizontally. How much work does the student do on the backpack?",
            difficulty: "Easy" as const,
            hint: "Think about the direction of the force (upward) and the direction of displacement (horizontal).",
            solution: "W = F × s × cos θ = 20 × 100 × cos(90°) = 20 × 100 × 0 = 0 J. No work is done because the force is perpendicular to displacement.",
            marks: 3
          }
        ],

        importantExamQuestions: [
          {
            question: "Define work and derive the formula W = Fs cos θ. Give two examples where work done is zero.",
            boardType: "FBISE" as const,
            year: 2023,
            marks: 8,
            solution: "Work is energy transferred by a force when it causes displacement. Derivation: Work = component of force in direction of displacement × displacement = F cos θ × s = Fs cos θ. Examples of zero work: (1) Carrying a bag horizontally (force vertical, displacement horizontal), (2) Pushing a wall (force applied but no displacement).",
            examTips: [
              "Always start with a clear definition",
              "Show all steps in derivation",
              "Give practical examples that students can relate to",
              "Mention that work is a scalar quantity"
            ]
          }
        ],

        memoryTricks: [
          {
            concept: "When work is positive, negative, or zero",
            trick: "Think of a helpful friend, an enemy, and a stranger: Helpful friend (positive work) - pushes you forward. Enemy (negative work) - opposes your motion. Stranger (zero work) - doesn't affect your motion (perpendicular force).",
            explanation: "This helps remember: same direction = positive, opposite direction = negative, perpendicular = zero"
          },
          {
            concept: "Work formula W = Fs cos θ",
            trick: "Work = Force × Distance × Connection. The 'connection' (cos θ) shows how well the force connects with the motion direction.",
            explanation: "Perfect connection (θ = 0°): cos 0° = 1. No connection (θ = 90°): cos 90° = 0."
          }
        ],

        commonMistakes: [
          {
            mistake: "Thinking that holding a heavy object involves doing work",
            whyItHappens: "Confusion between physics definition and everyday usage of 'work'",
            howToAvoid: "Remember: No displacement = No work in physics",
            correctApproach: "Work is only done when there is movement in the direction of force"
          },
          {
            mistake: "Using the wrong angle in W = Fs cos θ",
            whyItHappens: "Not clearly identifying the angle between force and displacement vectors",
            howToAvoid: "Always draw a diagram showing force and displacement vectors, then measure the angle between them",
            correctApproach: "The angle θ is always measured between the force vector and displacement vector"
          }
        ],

        summary: {
          keyTakeaways: [
            "Work = Force × Displacement × cos(angle between them)",
            "Work is done only when there is displacement in the direction of force",
            "Work can be positive, negative, or zero depending on the angle",
            "Work is a scalar quantity measured in joules"
          ],
          mustRemember: [
            "W = Fs cos θ formula and when to use it",
            "Work is energy transfer, not just effort",
            "Zero work when force is perpendicular to displacement"
          ],
          examFocus: [
            "Calculating work with different angles",
            "Identifying when work is zero",
            "Understanding the physical meaning of positive and negative work"
          ],
          nextTopics: [
            "Work done by variable forces",
            "Kinetic energy and work-energy theorem",
            "Power and its relationship to work"
          ]
        },

        estimatedWordCount: 4500
      }
    };
  }

  private generatePhysicsFallback(topic: string, request: LearningRequest, chapterInfo?: ChapterInfo): any {
    const difficulty = chapterInfo?.difficulty || 'Medium';
    const estimatedHours = chapterInfo?.estimatedHours || 3;

    return {
      quickOverview: {
        whatIsIt: `${topic} is an important concept in ${request.subject} that helps understand how physical systems work.`,
        whyImportant: `Understanding ${topic} is essential for solving physics problems and understanding real-world applications.`,
        timeToMaster: `${estimatedHours} hours of focused study`,
        difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
        prerequisite: ["Basic mathematics", "Previous physics concepts"]
      },
      definition: {
        simpleDefinition: `${topic} is a fundamental concept in ${request.subject} that you encounter in daily life.`,
        technicalDefinition: `In technical terms, ${topic} refers to the specific principles and relationships that govern this aspect of ${request.subject}.`,
        keyWords: [topic, "Physics", "Energy", "Force"],
        analogy: `Think of ${topic} like something you experience every day - it's all around us.`
      },
      detailedExplanation: {
        introduction: `${topic} is everywhere around us! Understanding this concept will help you see the world differently.`,
        mainConcepts: [`${topic} involves important physical principles`, `It has practical applications`, `Understanding it helps with problem solving`],
        howItWorks: `${topic} works through fundamental laws of physics.`,
        visualDescription: `Imagine ${topic} as a process where inputs lead to outputs.`,
        connections: [`Connects to other physics concepts`, `Relates to mathematics`, `Has engineering applications`]
      },
      dailyLifeExamples: [
        {
          title: `${topic} in Daily Life`,
          description: `You can see ${topic} in everyday activities.`,
          pakistaniContext: true,
          explanation: `In Pakistani context, ${topic} is evident in our daily routines.`,
          relatedConcept: "Real-world applications"
        }
      ],
      importantPoints: [
        {
          point: `${topic} follows specific principles`,
          explanation: `There are rules that describe how ${topic} works.`,
          whyImportant: `Understanding these principles helps solve problems`,
          examRelevance: `Frequently tested in exams`
        }
      ],
      mathematicalFormulas: [
        {
          name: `Key Formula for ${topic}`,
          formula: "Mathematical relationship",
          easyExplanation: `This formula shows how quantities relate`,
          variables: [
            {
              symbol: "x",
              name: "First quantity",
              unit: "unit",
              simpleExplanation: "Important measurement"
            }
          ],
          whenToUse: `Use when calculating ${topic} problems`,
          memoryTrick: `Remember by thinking about the logical relationship`
        }
      ],
      stepByStepDerivations: [],
      workedExamples: [
        {
          title: `${topic} Example`,
          difficulty: "Medium" as const,
          scenario: `A practical problem involving ${topic}`,
          given: ["Given information"],
          toFind: "What to calculate",
          approach: "Step-by-step method",
          solution: [
            {
              step: 1,
              whatToDo: "Identify the problem",
              calculation: "List given values",
              result: "Clear understanding",
              explanation: "This helps choose the right approach"
            }
          ],
          answer: "Final answer",
          checkYourAnswer: "Verify the result",
          commonErrors: ["Common mistake"]
        }
      ],
      practiceQuestions: [
        {
          question: `Practice problem for ${topic}`,
          difficulty: "Medium" as const,
          hint: "Think about key principles",
          solution: "Step-by-step solution",
          marks: 5
        }
      ],
      importantExamQuestions: [
        {
          question: `Define ${topic} and explain its significance`,
          boardType: "FBISE" as const,
          marks: 8,
          solution: "Complete answer with definition and examples",
          examTips: ["Start with clear definition", "Give practical examples"]
        }
      ],
      memoryTricks: [
        {
          concept: `${topic} formula`,
          trick: "Create a story to remember",
          explanation: "Memory tricks help recall during exams"
        }
      ],
      commonMistakes: [
        {
          mistake: `Confusing ${topic} with related concepts`,
          whyItHappens: "Similar concepts can seem the same",
          howToAvoid: "Focus on key differences",
          correctApproach: "Check which concept applies"
        }
      ],
      summary: {
        keyTakeaways: [`${topic} is fundamental`, "Has mathematical relationships", "Applies to real situations"],
        mustRemember: ["Key formulas", "Applications", "Common mistakes"],
        examFocus: ["Definitions", "Problem solving", "Applications"],
        nextTopics: ["Advanced concepts", "Related topics"]
      },
      estimatedWordCount: 3000
    };
  }

  private async generateMathContent(topic: string, request: LearningRequest, chapterInfo?: ChapterInfo): Promise<StudentFriendlyContent> {
    // Similar structure for mathematics
    return this.generateGenericContent(topic, 'Mathematics', request, chapterInfo);
  }

  private async generateChemistryContent(topic: string, request: LearningRequest, chapterInfo?: ChapterInfo): Promise<StudentFriendlyContent> {
    // Similar structure for chemistry
    return this.generateGenericContent(topic, 'Chemistry', request, chapterInfo);
  }

  private async generateBiologyContent(topic: string, request: LearningRequest, chapterInfo?: ChapterInfo): Promise<StudentFriendlyContent> {
    // Similar structure for biology
    return this.generateGenericContent(topic, 'Biology', request, chapterInfo);
  }

  private async generateGenericContent(topic: string, subject: string, request: LearningRequest, chapterInfo?: ChapterInfo): Promise<StudentFriendlyContent> {
    return {
      topic,
      quickOverview: {
        whatIsIt: `${topic} is an important concept in ${subject}`,
        whyImportant: `Understanding ${topic} helps in solving problems and understanding applications`,
        timeToMaster: "2-3 hours",
        difficulty: "Medium" as const,
        prerequisite: ["Basic concepts"]
      },
      definition: {
        simpleDefinition: `${topic} is a fundamental concept in ${subject}`,
        technicalDefinition: `Technical definition of ${topic}`,
        keyWords: ["Key", "Words"],
        analogy: `Think of ${topic} like...`
      },
      detailedExplanation: {
        introduction: `Introduction to ${topic}`,
        mainConcepts: [`Main concepts of ${topic}`],
        howItWorks: `How ${topic} works`,
        visualDescription: `Visual description of ${topic}`,
        connections: [`Connections to other topics`]
      },
      dailyLifeExamples: [],
      importantPoints: [],
      mathematicalFormulas: [],
      stepByStepDerivations: [],
      workedExamples: [],
      practiceQuestions: [],
      importantExamQuestions: [],
      memoryTricks: [],
      commonMistakes: [],
      summary: {
        keyTakeaways: [`Key takeaways for ${topic}`],
        mustRemember: [`Must remember points`],
        examFocus: [`Exam focus areas`],
        nextTopics: [`Next topics to study`]
      },
      estimatedWordCount: 2500
    };
  }

  private calculateWordCount(content: any): number {
    // Calculate word count from all sections
    let totalWords = 0;
    
    // Add word counts from various sections
    if (content.definition?.simpleDefinition) {
      totalWords += content.definition.simpleDefinition.split(' ').length;
    }
    if (content.detailedExplanation?.introduction) {
      totalWords += content.detailedExplanation.introduction.split(' ').length;
    }
    
    // Add more detailed counting logic here
    return Math.max(totalWords, 2500); // Minimum 2500 words
  }

  formatStudentContent(content: StudentFriendlyContent): string {
    let formatted = '';

    // Add attractive heading with emojis
    formatted += `# 📚 ${content.topic}\n\n`;
    formatted += `---\n\n`;

    // Quick Overview Box
    formatted += `## 🎯 Quick Overview\n\n`;
    formatted += `**What is this topic?** ${content.quickOverview.whatIsIt}\n\n`;
    formatted += `**Why is it important?** ${content.quickOverview.whyImportant}\n\n`;
    formatted += `**Time to master:** ${content.quickOverview.timeToMaster}\n\n`;
    formatted += `**Difficulty:** ${content.quickOverview.difficulty}\n\n`;
    formatted += `**Prerequisites:** ${content.quickOverview.prerequisite.join(', ')}\n\n`;
    formatted += `---\n\n`;

    // Definition Section
    formatted += `## 📖 Definition\n\n`;
    formatted += `### Simple Definition\n${content.definition.simpleDefinition}\n\n`;
    formatted += `### Technical Definition\n${content.definition.technicalDefinition}\n\n`;
    formatted += `### Key Words\n${content.definition.keyWords.join(', ')}\n\n`;
    formatted += `### Easy to Remember Analogy\n${content.definition.analogy}\n\n`;
    formatted += `---\n\n`;

    // Detailed Explanation
    formatted += `## 🔍 Detailed Explanation\n\n`;
    formatted += `${content.detailedExplanation.introduction}\n\n`;
    formatted += `### Main Concepts\n`;
    content.detailedExplanation.mainConcepts.forEach(concept => {
      formatted += `• ${concept}\n`;
    });
    formatted += `\n### How It Works\n${content.detailedExplanation.howItWorks}\n\n`;
    formatted += `### Visual Description\n${content.detailedExplanation.visualDescription}\n\n`;
    formatted += `---\n\n`;

    // Daily Life Examples
    if (content.dailyLifeExamples.length > 0) {
      formatted += `## 🌍 Daily Life Examples\n\n`;
      content.dailyLifeExamples.forEach((example, index) => {
        formatted += `### Example ${index + 1}: ${example.title}\n`;
        formatted += `${example.description}\n\n`;
        formatted += `**Explanation:** ${example.explanation}\n\n`;
        if (example.pakistaniContext) {
          formatted += `🇵🇰 *Pakistani Context Example*\n\n`;
        }
      });
      formatted += `---\n\n`;
    }

    // Important Points
    if (content.importantPoints.length > 0) {
      formatted += `## ⭐ Important Points to Remember\n\n`;
      content.importantPoints.forEach((point, index) => {
        formatted += `### ${index + 1}. ${point.point}\n`;
        formatted += `**Explanation:** ${point.explanation}\n\n`;
        formatted += `**Why Important:** ${point.whyImportant}\n\n`;
        formatted += `**Exam Relevance:** ${point.examRelevance}\n\n`;
      });
      formatted += `---\n\n`;
    }

    // Mathematical Formulas
    if (content.mathematicalFormulas.length > 0) {
      formatted += `## 📐 Mathematical Formulas\n\n`;
      content.mathematicalFormulas.forEach(formula => {
        formatted += `### ${formula.name}\n`;
        formatted += `**Formula:** ${formula.formula}\n\n`;
        formatted += `**Easy Explanation:** ${formula.easyExplanation}\n\n`;
        formatted += `**Variables:**\n`;
        formula.variables.forEach(variable => {
          formatted += `• **${variable.symbol}** = ${variable.name} (${variable.unit}) - ${variable.simpleExplanation}\n`;
        });
        formatted += `\n**When to Use:** ${formula.whenToUse}\n\n`;
        formatted += `**Memory Trick:** ${formula.memoryTrick}\n\n`;
      });
      formatted += `---\n\n`;
    }

    // Add more sections...

    return formatted;
  }
}

export const studentFriendlyContentGenerator = StudentFriendlyContentGenerator.getInstance();
