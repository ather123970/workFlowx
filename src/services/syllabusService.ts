import { LearningRequest } from '@/types/learning';

export interface SyllabusData {
  board: string;
  class: number;
  subject: string;
  chapters: ChapterInfo[];
  totalChapters: number;
  syllabusPdfUrl?: string;
  lastUpdated: string;
}

export interface ChapterInfo {
  chapterNumber: number;
  chapterName: string;
  topics: string[];
  estimatedHours: number;
  difficulty: 'easy' | 'medium' | 'hard';
  prerequisites?: string[];
}

export interface SubjectInfo {
  name: string;
  code: string;
  totalMarks: number;
  practicalMarks?: number;
  theoryMarks: number;
  chapters: ChapterInfo[];
}

export class SyllabusService {
  private static instance: SyllabusService;
  private syllabusCache: Map<string, SyllabusData> = new Map();

  private constructor() {}

  static getInstance(): SyllabusService {
    if (!SyllabusService.instance) {
      SyllabusService.instance = new SyllabusService();
    }
    return SyllabusService.instance;
  }

  // Real Pakistani syllabus data for Class 11
  private getRealSyllabusData(): Record<string, Record<number, Record<string, SubjectInfo>>> {
    return {
      'FBISE': {
        11: {
          'Physics': {
            name: 'Physics',
            code: 'PHY-11',
            totalMarks: 100,
            practicalMarks: 20,
            theoryMarks: 80,
            chapters: [
              {
                chapterNumber: 1,
                chapterName: 'Measurements',
                topics: [
                  'Introduction to Physics',
                  'Physical Quantities and SI Units',
                  'Scalars and Vectors',
                  'Addition of Vectors',
                  'Resolution of Vectors',
                  'Multiplication of Vectors',
                  'Significant Figures',
                  'Precision and Accuracy',
                  'Assessment of Total Uncertainty in Final Result'
                ],
                estimatedHours: 12,
                difficulty: 'easy'
              },
              {
                chapterNumber: 2,
                chapterName: 'Vectors and Equilibrium',
                topics: [
                  'Introduction to Vectors',
                  'Addition of Vectors by Head to Tail Rule',
                  'Addition of Vectors by Rectangular Components',
                  'Dot Product or Scalar Product',
                  'Cross Product or Vector Product',
                  'Equilibrium of Forces',
                  'First Condition of Equilibrium',
                  'Second Condition of Equilibrium',
                  'Centre of Mass and Centre of Gravity',
                  'Couples and Torque'
                ],
                estimatedHours: 15,
                difficulty: 'medium',
                prerequisites: ['Basic Mathematics', 'Trigonometry']
              },
              {
                chapterNumber: 3,
                chapterName: 'Motion and Force',
                topics: [
                  'Linear Motion and Equations of Motion',
                  'Motion Under Gravity',
                  'Projectile Motion',
                  'Uniform Circular Motion',
                  'Newton\'s Laws of Motion',
                  'Law of Conservation of Momentum',
                  'Rocket Propulsion',
                  'Force of Friction'
                ],
                estimatedHours: 18,
                difficulty: 'medium'
              },
              {
                chapterNumber: 4,
                chapterName: 'Work and Energy',
                topics: [
                  'Work Done by a Constant Force',
                  'Work Done by a Variable Force',
                  'Kinetic Energy',
                  'Work-Energy Theorem',
                  'Potential Energy',
                  'Conservation of Mechanical Energy',
                  'Power',
                  'Collision',
                  'Types of Collisions'
                ],
                estimatedHours: 16,
                difficulty: 'medium'
              },
              {
                chapterNumber: 5,
                chapterName: 'Circular Motion',
                topics: [
                  'Angular Displacement and Angular Velocity',
                  'Angular Acceleration',
                  'Equations of Rotational Motion',
                  'Frequency and Time Period',
                  'Centripetal Acceleration',
                  'Centripetal Force',
                  'Banking of Roads',
                  'Artificial Gravity'
                ],
                estimatedHours: 14,
                difficulty: 'medium'
              },
              {
                chapterNumber: 6,
                chapterName: 'Fluid Dynamics',
                topics: [
                  'Fluid Flow',
                  'Equation of Continuity',
                  'Bernoulli\'s Principle',
                  'Applications of Bernoulli\'s Principle',
                  'Viscosity',
                  'Poiseuille\'s Formula',
                  'Stoke\'s Law',
                  'Terminal Velocity'
                ],
                estimatedHours: 12,
                difficulty: 'hard'
              },
              {
                chapterNumber: 7,
                chapterName: 'Oscillations',
                topics: [
                  'Simple Harmonic Motion',
                  'SHM and Uniform Circular Motion',
                  'Phase Relationship',
                  'Simple Pendulum',
                  'Energy Conservation in SHM',
                  'Damped Oscillations',
                  'Forced Oscillations and Resonance'
                ],
                estimatedHours: 14,
                difficulty: 'hard'
              },
              {
                chapterNumber: 8,
                chapterName: 'Waves',
                topics: [
                  'Wave Motion',
                  'Types of Waves',
                  'Transverse and Longitudinal Waves',
                  'Mathematical Representation of Wave',
                  'Principle of Superposition',
                  'Interference of Waves',
                  'Standing Waves',
                  'Vibration of Air Columns',
                  'Doppler Effect'
                ],
                estimatedHours: 16,
                difficulty: 'hard'
              },
              {
                chapterNumber: 9,
                chapterName: 'Optical Instruments',
                topics: [
                  'Lenses',
                  'Human Eye',
                  'Defects of Vision',
                  'Simple Microscope',
                  'Compound Microscope',
                  'Astronomical Telescope',
                  'Terrestrial Telescope',
                  'Resolving Power'
                ],
                estimatedHours: 12,
                difficulty: 'medium'
              },
              {
                chapterNumber: 10,
                chapterName: 'Heat and Thermodynamics',
                topics: [
                  'Temperature and Heat',
                  'Thermal Equilibrium',
                  'Thermal Expansion',
                  'Heat Capacity and Specific Heat',
                  'Latent Heat of Fusion and Vaporization',
                  'First Law of Thermodynamics',
                  'Thermodynamic Processes',
                  'Heat Engines',
                  'Second Law of Thermodynamics'
                ],
                estimatedHours: 18,
                difficulty: 'hard'
              }
            ]
          },
          'Mathematics': {
            name: 'Mathematics',
            code: 'MATH-11',
            totalMarks: 100,
            theoryMarks: 100,
            chapters: [
              {
                chapterNumber: 1,
                chapterName: 'Number Systems',
                topics: [
                  'Real Numbers',
                  'Rational and Irrational Numbers',
                  'Complex Numbers',
                  'Algebra of Complex Numbers',
                  'Argand Diagram',
                  'Modulus and Argument',
                  'De Moivre\'s Theorem',
                  'Cube Roots of Unity',
                  'Mathematical Induction'
                ],
                estimatedHours: 16,
                difficulty: 'medium'
              },
              {
                chapterNumber: 2,
                chapterName: 'Sets, Functions and Groups',
                topics: [
                  'Introduction to Sets',
                  'Subsets',
                  'Union, Intersection and Complement',
                  'Laws of Algebra of Sets',
                  'Duality',
                  'Cartesian Product',
                  'Relations',
                  'Functions',
                  'Composition of Functions',
                  'Binary Operations',
                  'Introduction to Groups'
                ],
                estimatedHours: 18,
                difficulty: 'medium'
              },
              {
                chapterNumber: 3,
                chapterName: 'Matrices and Determinants',
                topics: [
                  'Introduction to Matrices',
                  'Types of Matrices',
                  'Addition and Scalar Multiplication',
                  'Matrix Multiplication',
                  'Multiplicative Inverse',
                  'Solution of Simultaneous Linear Equations',
                  'Determinants',
                  'Properties of Determinants',
                  'Minors and Cofactors',
                  'Adjoint and Inverse of Matrix',
                  'Cramer\'s Rule'
                ],
                estimatedHours: 20,
                difficulty: 'hard'
              },
              {
                chapterNumber: 4,
                chapterName: 'Quadratic Equations',
                topics: [
                  'Introduction to Quadratic Equations',
                  'Solution of Quadratic Equations',
                  'Nature of Roots',
                  'Sum and Product of Roots',
                  'Formation of Quadratic Equations',
                  'Equations Reducible to Quadratic Form',
                  'Quadratic Inequalities'
                ],
                estimatedHours: 14,
                difficulty: 'medium'
              },
              {
                chapterNumber: 5,
                chapterName: 'Partial Fractions',
                topics: [
                  'Introduction to Partial Fractions',
                  'Partial Fractions with Linear Factors',
                  'Partial Fractions with Repeated Linear Factors',
                  'Partial Fractions with Quadratic Factors',
                  'Partial Fractions with Repeated Quadratic Factors'
                ],
                estimatedHours: 12,
                difficulty: 'medium'
              },
              {
                chapterNumber: 6,
                chapterName: 'Sequences and Series',
                topics: [
                  'Introduction to Sequences',
                  'Arithmetic Progression (A.P.)',
                  'Geometric Progression (G.P.)',
                  'Harmonic Progression (H.P.)',
                  'Arithmetic Mean',
                  'Geometric Mean',
                  'Harmonic Mean',
                  'Sum of Infinite G.P.',
                  'Binomial Theorem',
                  'Binomial Series'
                ],
                estimatedHours: 16,
                difficulty: 'medium'
              },
              {
                chapterNumber: 7,
                chapterName: 'Permutations, Combinations and Probability',
                topics: [
                  'Fundamental Principle of Counting',
                  'Factorial Notation',
                  'Permutations',
                  'Combinations',
                  'Binomial Coefficients',
                  'Introduction to Probability',
                  'Addition and Multiplication Theorems',
                  'Conditional Probability',
                  'Independent Events'
                ],
                estimatedHours: 18,
                difficulty: 'hard'
              },
              {
                chapterNumber: 8,
                chapterName: 'Mathematical Induction and Binomial Theorem',
                topics: [
                  'Mathematical Induction',
                  'Binomial Theorem for Positive Integral Index',
                  'General Term',
                  'Middle Terms',
                  'Binomial Coefficients',
                  'Binomial Theorem for Any Index'
                ],
                estimatedHours: 14,
                difficulty: 'medium'
              },
              {
                chapterNumber: 9,
                chapterName: 'Fundamentals of Trigonometry',
                topics: [
                  'Angles and Their Measures',
                  'Trigonometric Functions',
                  'Signs of Trigonometric Functions',
                  'Trigonometric Identities',
                  'Sum and Difference Formulas',
                  'Double Angle Formulas',
                  'Half Angle Formulas',
                  'Sum to Product Formulas'
                ],
                estimatedHours: 16,
                difficulty: 'medium'
              },
              {
                chapterNumber: 10,
                chapterName: 'Trigonometric Identities and Equations',
                topics: [
                  'Trigonometric Identities',
                  'Conditional Trigonometric Identities',
                  'Trigonometric Equations',
                  'General Solutions',
                  'Principal Solutions'
                ],
                estimatedHours: 14,
                difficulty: 'hard'
              },
              {
                chapterNumber: 11,
                chapterName: 'Functions and Limits',
                topics: [
                  'Introduction to Functions',
                  'Domain and Range',
                  'Composition of Functions',
                  'Types of Functions',
                  'Inverse Functions',
                  'Introduction to Limits',
                  'Theorems on Limits',
                  'Limits of Trigonometric Functions',
                  'Continuity of Functions'
                ],
                estimatedHours: 18,
                difficulty: 'hard'
              },
              {
                chapterNumber: 12,
                chapterName: 'Differentiation',
                topics: [
                  'Introduction to Derivatives',
                  'Differentiation by First Principle',
                  'Rules of Differentiation',
                  'Derivatives of Trigonometric Functions',
                  'Derivatives of Inverse Trigonometric Functions',
                  'Derivatives of Exponential and Logarithmic Functions',
                  'Chain Rule',
                  'Implicit Differentiation',
                  'Logarithmic Differentiation',
                  'Higher Order Derivatives'
                ],
                estimatedHours: 20,
                difficulty: 'hard'
              }
            ]
          },
          'Chemistry': {
            name: 'Chemistry',
            code: 'CHEM-11',
            totalMarks: 100,
            practicalMarks: 20,
            theoryMarks: 80,
            chapters: [
              {
                chapterNumber: 1,
                chapterName: 'Stoichiometry',
                topics: [
                  'Introduction to Chemistry',
                  'Branches of Chemistry',
                  'Atomic Mass Unit',
                  'Molecular Mass and Formula Mass',
                  'Mole Concept',
                  'Molar Mass',
                  'Percentage Composition',
                  'Empirical and Molecular Formula',
                  'Chemical Equations and Balancing',
                  'Limiting Reagent',
                  'Theoretical and Percentage Yield'
                ],
                estimatedHours: 16,
                difficulty: 'medium'
              },
              {
                chapterNumber: 2,
                chapterName: 'Atomic Structure',
                topics: [
                  'Discovery of Fundamental Particles',
                  'Atomic Models',
                  'Bohr\'s Atomic Model',
                  'X-rays and Atomic Number',
                  'Moseley\'s Law',
                  'Atomic Spectrum of Hydrogen',
                  'Defects in Bohr\'s Theory',
                  'Quantum Mechanical Model',
                  'Quantum Numbers',
                  'Shapes of Orbitals',
                  'Aufbau Principle',
                  'Electronic Configuration'
                ],
                estimatedHours: 18,
                difficulty: 'hard'
              },
              {
                chapterNumber: 3,
                chapterName: 'Theories of Covalent Bonding',
                topics: [
                  'Lewis Theory of Covalent Bonding',
                  'Formal Charge',
                  'Limitations of Lewis Theory',
                  'Valence Shell Electron Pair Repulsion Theory',
                  'Shapes of Molecules',
                  'Valence Bond Theory',
                  'Hybridization',
                  'Types of Hybridization',
                  'Molecular Orbital Theory',
                  'Bonding and Antibonding Orbitals'
                ],
                estimatedHours: 16,
                difficulty: 'hard'
              },
              {
                chapterNumber: 4,
                chapterName: 'States of Matter',
                topics: [
                  'Kinetic Molecular Theory of Gases',
                  'Deviation from Ideal Behavior',
                  'Liquefaction of Gases',
                  'Liquid State',
                  'Vapor Pressure',
                  'Surface Tension',
                  'Viscosity',
                  'Solid State',
                  'Types of Solids',
                  'Crystal Lattice',
                  'Unit Cell'
                ],
                estimatedHours: 14,
                difficulty: 'medium'
              },
              {
                chapterNumber: 5,
                chapterName: 'Atomic Structure',
                topics: [
                  'Dual Nature of Matter',
                  'De Broglie Equation',
                  'Heisenberg Uncertainty Principle',
                  'Quantum Mechanical Model of Atom',
                  'Quantum Numbers',
                  'Electronic Configuration',
                  'Periodic Trends'
                ],
                estimatedHours: 12,
                difficulty: 'hard'
              }
            ]
          },
          'Biology': {
            name: 'Biology',
            code: 'BIO-11',
            totalMarks: 100,
            practicalMarks: 20,
            theoryMarks: 80,
            chapters: [
              {
                chapterNumber: 1,
                chapterName: 'Introduction to Biology',
                topics: [
                  'Biology and Its Branches',
                  'Characteristics of Life',
                  'Levels of Organization',
                  'Classification of Living Organisms',
                  'Binomial Nomenclature',
                  'Five Kingdom System',
                  'Three Domain System'
                ],
                estimatedHours: 10,
                difficulty: 'easy'
              },
              {
                chapterNumber: 2,
                chapterName: 'Biological Molecules',
                topics: [
                  'Introduction to Biochemistry',
                  'Carbohydrates',
                  'Lipids',
                  'Proteins',
                  'Nucleic Acids',
                  'Enzymes',
                  'Factors Affecting Enzyme Activity',
                  'Enzyme Inhibition'
                ],
                estimatedHours: 16,
                difficulty: 'medium'
              },
              {
                chapterNumber: 3,
                chapterName: 'Enzymes',
                topics: [
                  'Introduction to Enzymes',
                  'Mechanism of Enzyme Action',
                  'Factors Affecting Enzyme Activity',
                  'Enzyme Inhibition',
                  'Commercial Uses of Enzymes'
                ],
                estimatedHours: 12,
                difficulty: 'medium'
              },
              {
                chapterNumber: 4,
                chapterName: 'The Cell',
                topics: [
                  'Discovery of Cell',
                  'Cell Theory',
                  'Types of Cells',
                  'Cell Membrane',
                  'Cell Wall',
                  'Cytoplasm',
                  'Cell Organelles',
                  'Nucleus',
                  'Cell Division'
                ],
                estimatedHours: 18,
                difficulty: 'medium'
              }
            ]
          }
        }
      }
    };
  }

  // Get syllabus for specific class, subject, and board
  async getSyllabus(request: LearningRequest): Promise<SyllabusData> {
    const cacheKey = `${request.board}_${request.class}_${request.subject}`;
    
    // Check cache first
    if (this.syllabusCache.has(cacheKey)) {
      console.log(`📋 Using cached syllabus for ${cacheKey}`);
      return this.syllabusCache.get(cacheKey)!;
    }

    console.log(`🔍 Fetching syllabus for ${request.subject} Class ${request.class} (${request.board})`);

    try {
      // Get real syllabus data
      const syllabusData = this.getRealSyllabusData();
      const boardData = syllabusData[request.board];
      
      if (!boardData || !boardData[request.class]) {
        throw new Error(`No syllabus data found for ${request.board} Class ${request.class}`);
      }

      const classData = boardData[request.class];
      const subjectData = classData[request.subject];
      
      if (!subjectData) {
        throw new Error(`Subject ${request.subject} not found for ${request.board} Class ${request.class}`);
      }

      const syllabus: SyllabusData = {
        board: request.board,
        class: request.class,
        subject: request.subject,
        chapters: subjectData.chapters,
        totalChapters: subjectData.chapters.length,
        lastUpdated: new Date().toISOString()
      };

      // Cache the result
      this.syllabusCache.set(cacheKey, syllabus);
      
      console.log(`✅ Syllabus fetched: ${syllabus.totalChapters} chapters for ${request.subject}`);
      return syllabus;

    } catch (error) {
      console.error('❌ Error fetching syllabus:', error);
      throw new Error(`Failed to fetch syllabus: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get all available subjects for a class and board
  getAvailableSubjects(board: string, classNumber: number): string[] {
    const syllabusData = this.getRealSyllabusData();
    const boardData = syllabusData[board];
    
    if (!boardData || !boardData[classNumber]) {
      return [];
    }

    return Object.keys(boardData[classNumber]);
  }

  // Get all chapters for a subject
  getChapters(board: string, classNumber: number, subject: string): ChapterInfo[] {
    const syllabusData = this.getRealSyllabusData();
    const boardData = syllabusData[board];
    
    if (!boardData || !boardData[classNumber] || !boardData[classNumber][subject]) {
      return [];
    }

    return boardData[classNumber][subject].chapters;
  }

  // Validate if a chapter exists in the syllabus
  validateChapter(request: LearningRequest): boolean {
    try {
      const chapters = this.getChapters(request.board, request.class, request.subject);
      return chapters.some(chapter => 
        chapter.chapterName.toLowerCase().includes(request.chapter.toLowerCase()) ||
        request.chapter.toLowerCase().includes(chapter.chapterName.toLowerCase())
      );
    } catch (error) {
      return false;
    }
  }

  // Get chapter details by name
  getChapterByName(board: string, classNumber: number, subject: string, chapterName: string): ChapterInfo | null {
    const chapters = this.getChapters(board, classNumber, subject);
    return chapters.find(chapter => 
      chapter.chapterName.toLowerCase().includes(chapterName.toLowerCase()) ||
      chapterName.toLowerCase().includes(chapter.chapterName.toLowerCase())
    ) || null;
  }

  // Clear cache
  clearCache(): void {
    this.syllabusCache.clear();
    console.log('🗑️ Syllabus cache cleared');
  }
}

export const syllabusService = SyllabusService.getInstance();
