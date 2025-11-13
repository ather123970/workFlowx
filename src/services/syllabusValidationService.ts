import { LearningRequest } from '@/types/learning';

export interface SyllabusMatch {
  chapter: string;
  similarity: number;
  source: string;
}

export interface SyllabusValidationResult {
  found: boolean;
  exactMatch: boolean;
  suggestions: SyllabusMatch[];
  tocItems: string[];
  source: string;
}

export class SyllabusValidationService {
  private static instance: SyllabusValidationService;
  private syllabusCache: Map<string, string[]> = new Map();

  private constructor() {}

  static getInstance(): SyllabusValidationService {
    if (!SyllabusValidationService.instance) {
      SyllabusValidationService.instance = new SyllabusValidationService();
    }
    return SyllabusValidationService.instance;
  }

  async validateChapterInSyllabus(request: LearningRequest): Promise<SyllabusValidationResult> {
    const cacheKey = `${request.board}_${request.class}_${request.subject}`;
    
    // Check cache first
    let tocItems = this.syllabusCache.get(cacheKey);
    
    if (!tocItems) {
      // Fetch syllabus TOC
      tocItems = await this.fetchSyllabusTOC(request);
      if (tocItems) {
        this.syllabusCache.set(cacheKey, tocItems);
      }
    }

    if (!tocItems || tocItems.length === 0) {
      return {
        found: false,
        exactMatch: false,
        suggestions: [],
        tocItems: [],
        source: 'none'
      };
    }

    // Check for exact match
    const exactMatch = this.findExactMatch(request.chapter, tocItems);
    
    if (exactMatch) {
      return {
        found: true,
        exactMatch: true,
        suggestions: [],
        tocItems,
        source: 'board_syllabus'
      };
    }

    // Find fuzzy matches
    const suggestions = this.findFuzzyMatches(request.chapter, tocItems);
    
    return {
      found: suggestions.length > 0,
      exactMatch: false,
      suggestions: suggestions.slice(0, 5), // Top 5 matches
      tocItems,
      source: 'board_syllabus'
    };
  }

  private async fetchSyllabusTOC(request: LearningRequest): Promise<string[]> {
    try {
      // Mock implementation - in production, would fetch actual syllabus PDFs
      const mockTOCs = this.getMockSyllabusTOC(request);
      return mockTOCs;
    } catch (error) {
      console.error('Failed to fetch syllabus TOC:', error);
      return [];
    }
  }

  private getMockSyllabusTOC(request: LearningRequest): string[] {
    // Mock syllabus data for different subjects and classes
    const syllabusData: Record<string, Record<string, string[]>> = {
      'Physics': {
        '11': [
          'Physical World and Measurement',
          'Kinematics',
          'Laws of Motion',
          'Work, Energy and Power',
          'Motion of System of Particles and Rigid Body',
          'Gravitation',
          'Properties of Bulk Matter',
          'Thermodynamics',
          'Behaviour of Perfect Gas and Kinetic Theory',
          'Oscillations and Waves'
        ],
        '12': [
          'Electric Charges and Fields',
          'Electrostatic Potential and Capacitance',
          'Current Electricity',
          'Moving Charges and Magnetism',
          'Magnetism and Matter',
          'Electromagnetic Induction',
          'Alternating Current',
          'Electromagnetic Waves',
          'Ray Optics and Optical Instruments',
          'Wave Optics'
        ]
      },
      'Mathematics': {
        '11': [
          'Sets',
          'Relations and Functions',
          'Trigonometric Functions',
          'Principle of Mathematical Induction',
          'Complex Numbers and Quadratic Equations',
          'Linear Inequalities',
          'Permutations and Combinations',
          'Binomial Theorem',
          'Sequences and Series',
          'Straight Lines'
        ],
        '12': [
          'Relations and Functions',
          'Inverse Trigonometric Functions',
          'Matrices',
          'Determinants',
          'Continuity and Differentiability',
          'Applications of Derivatives',
          'Integrals',
          'Applications of Integrals',
          'Differential Equations',
          'Vector Algebra'
        ]
      },
      'Chemistry': {
        '11': [
          'Some Basic Concepts of Chemistry',
          'Structure of Atom',
          'Classification of Elements and Periodicity in Properties',
          'Chemical Bonding and Molecular Structure',
          'States of Matter',
          'Thermodynamics',
          'Equilibrium',
          'Redox Reactions',
          'Hydrogen',
          'The s-Block Elements'
        ],
        '12': [
          'The Solid State',
          'Solutions',
          'Electrochemistry',
          'Chemical Kinetics',
          'Surface Chemistry',
          'General Principles and Processes of Isolation of Elements',
          'The p-Block Elements',
          'The d and f Block Elements',
          'Coordination Compounds',
          'Haloalkanes and Haloarenes'
        ]
      }
    };

    const subjectData = syllabusData[request.subject];
    if (!subjectData) return [];

    const classData = subjectData[request.class.toString()];
    return classData || [];
  }

  private findExactMatch(chapter: string, tocItems: string[]): boolean {
    const normalizedChapter = this.normalizeText(chapter);
    
    return tocItems.some(item => {
      const normalizedItem = this.normalizeText(item);
      return normalizedItem === normalizedChapter;
    });
  }

  private findFuzzyMatches(chapter: string, tocItems: string[]): SyllabusMatch[] {
    const normalizedChapter = this.normalizeText(chapter);
    const matches: SyllabusMatch[] = [];

    for (const item of tocItems) {
      const normalizedItem = this.normalizeText(item);
      const similarity = this.calculateSimilarity(normalizedChapter, normalizedItem);
      
      if (similarity > 0.3) { // Threshold for considering a match
        matches.push({
          chapter: item,
          similarity,
          source: 'board_syllabus'
        });
      }
    }

    // Sort by similarity (highest first)
    matches.sort((a, b) => b.similarity - a.similarity);
    
    return matches;
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim();
  }

  private calculateSimilarity(text1: string, text2: string): number {
    // Simple word-based similarity
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  // Additional methods for enhanced matching
  calculateLevenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  findBestMatches(chapter: string, tocItems: string[], maxResults: number = 5): SyllabusMatch[] {
    const matches: SyllabusMatch[] = [];
    
    for (const item of tocItems) {
      // Combine multiple similarity measures
      const wordSimilarity = this.calculateSimilarity(
        this.normalizeText(chapter), 
        this.normalizeText(item)
      );
      
      const distance = this.calculateLevenshteinDistance(
        this.normalizeText(chapter),
        this.normalizeText(item)
      );
      
      const maxLength = Math.max(chapter.length, item.length);
      const levenshteinSimilarity = 1 - (distance / maxLength);
      
      // Weighted combination
      const combinedSimilarity = (wordSimilarity * 0.7) + (levenshteinSimilarity * 0.3);
      
      if (combinedSimilarity > 0.2) {
        matches.push({
          chapter: item,
          similarity: combinedSimilarity,
          source: 'board_syllabus'
        });
      }
    }
    
    return matches
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxResults);
  }

  // Cache management
  clearCache(): void {
    this.syllabusCache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.syllabusCache.size,
      keys: Array.from(this.syllabusCache.keys())
    };
  }

  // Preload common syllabi
  async preloadSyllabi(requests: LearningRequest[]): Promise<void> {
    for (const request of requests) {
      await this.validateChapterInSyllabus(request);
    }
  }
}

export const syllabusValidationService = SyllabusValidationService.getInstance();
