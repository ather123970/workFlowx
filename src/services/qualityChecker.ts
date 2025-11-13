import { TopicPage, QualityCheckResult, NotesPackage } from '@/types/notes';
import { logger } from './logger';

export class QualityChecker {
  private static instance: QualityChecker;

  private constructor() {}

  static getInstance(): QualityChecker {
    if (!QualityChecker.instance) {
      QualityChecker.instance = new QualityChecker();
    }
    return QualityChecker.instance;
  }

  async checkTopicPage(page: TopicPage, expectedTopic: string): Promise<QualityCheckResult> {
    const checks = {
      presence_check: this.checkPresence(page),
      length_check: this.checkLength(page),
      syllabus_alignment: this.checkSyllabusAlignment(page, expectedTopic),
      answer_check: this.checkAnswers(page),
      safety_check: this.checkSafety(page),
      readability_score: this.calculateReadabilityScore(page.explanation),
    };

    const passed = Object.values(checks).every(check => 
      typeof check === 'boolean' ? check : check >= 6.0
    );

    const score = this.calculateOverallScore(checks);

    const result: QualityCheckResult = {
      passed,
      score,
      checks,
      missing_sections: this.getMissingSections(page),
      issues: this.getIssues(checks),
    };

    logger.info(`Quality check for ${page.topic_title}: ${passed ? 'PASSED' : 'FAILED'} (Score: ${score})`);
    return result;
  }

  async checkNotesPackage(notesPackage: NotesPackage): Promise<QualityCheckResult> {
    const allChecks: QualityCheckResult[] = [];
    
    // Check each topic page
    for (const page of notesPackage.pages) {
      if (page.page_type === 'topic') {
        const topicPage = page as TopicPage;
        const check = await this.checkTopicPage(topicPage, topicPage.topic_title);
        allChecks.push(check);
      }
    }

    // Calculate overall package quality
    const overallScore = allChecks.length > 0 
      ? allChecks.reduce((sum, check) => sum + check.score, 0) / allChecks.length
      : 0;

    const allPassed = allChecks.every(check => check.passed);

    const packageCheck: QualityCheckResult = {
      passed: allPassed,
      score: overallScore,
      checks: {
        presence_check: allChecks.every(c => c.checks.presence_check),
        length_check: allChecks.every(c => c.checks.length_check),
        syllabus_alignment: allChecks.every(c => c.checks.syllabus_alignment),
        answer_check: allChecks.every(c => c.checks.answer_check),
        safety_check: allChecks.every(c => c.checks.safety_check),
        readability_score: allChecks.length > 0 
          ? allChecks.reduce((sum, c) => sum + c.checks.readability_score, 0) / allChecks.length
          : 0,
      },
      issues: allChecks.flatMap(c => c.issues || []),
    };

    logger.info(`Package quality check: ${allPassed ? 'PASSED' : 'FAILED'} (Score: ${overallScore.toFixed(2)})`);
    return packageCheck;
  }

  private checkPresence(page: TopicPage): boolean {
    const requiredFields = [
      'topic_title',
      'definition',
      'explanation',
      'example_detailed',
      'example_short',
      'questions'
    ];

    for (const field of requiredFields) {
      const value = (page as any)[field];
      if (!value || (typeof value === 'string' && value.trim().length === 0)) {
        return false;
      }
    }

    // Check questions array
    if (!Array.isArray(page.questions) || page.questions.length !== 3) {
      return false;
    }

    // Check each question
    for (const question of page.questions) {
      if (!question.difficulty || !question.q || !question.a) {
        return false;
      }
    }

    return true;
  }

  private checkLength(page: TopicPage): boolean {
    // Definition: 1-5 lines (approximately 20-100 words)
    const definitionWords = page.definition.split(/\s+/).length;
    if (definitionWords < 10 || definitionWords > 150) {
      return false;
    }

    // Explanation: minimum 150-200 words (10-50+ lines)
    const explanationWords = page.explanation.split(/\s+/).length;
    if (explanationWords < 150) {
      return false;
    }

    // Example detailed: 3-6 lines (approximately 50-120 words)
    const exampleWords = page.example_detailed.split(/\s+/).length;
    if (exampleWords < 30 || exampleWords > 200) {
      return false;
    }

    // Example short: 1 line (approximately 5-20 words)
    const shortExampleWords = page.example_short.split(/\s+/).length;
    if (shortExampleWords < 5 || shortExampleWords > 30) {
      return false;
    }

    return true;
  }

  private checkSyllabusAlignment(page: TopicPage, expectedTopic: string): boolean {
    // Check if topic title matches expected topic (fuzzy match)
    const similarity = this.calculateStringSimilarity(
      page.topic_title.toLowerCase(),
      expectedTopic.toLowerCase()
    );
    
    return similarity >= 0.7; // 70% similarity threshold
  }

  private checkAnswers(page: TopicPage): boolean {
    for (const question of page.questions) {
      // Check if answer is not empty and has reasonable length
      if (!question.a || question.a.trim().length < 10) {
        return false;
      }

      // Check if answer is not just a repeat of the question
      const similarity = this.calculateStringSimilarity(
        question.q.toLowerCase(),
        question.a.toLowerCase()
      );
      if (similarity > 0.8) {
        return false;
      }

      // Check difficulty levels are valid
      if (!['easy', 'medium', 'hard'].includes(question.difficulty)) {
        return false;
      }
    }

    return true;
  }

  private checkSafety(page: TopicPage): boolean {
    const content = [
      page.definition,
      page.explanation,
      page.example_detailed,
      page.example_short,
      ...page.questions.map(q => q.q + ' ' + q.a)
    ].join(' ').toLowerCase();

    // List of inappropriate content indicators
    const inappropriateWords = [
      'hate', 'violence', 'discrimination', 'inappropriate',
      'offensive', 'harmful', 'dangerous', 'illegal'
    ];

    for (const word of inappropriateWords) {
      if (content.includes(word)) {
        return false;
      }
    }

    return true;
  }

  private calculateReadabilityScore(text: string): number {
    // Simplified Flesch-Kincaid readability score
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((count, word) => count + this.countSyllables(word), 0);

    if (sentences.length === 0 || words.length === 0) {
      return 0;
    }

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    // Flesch-Kincaid Grade Level
    const gradeLevel = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;

    // Convert to 0-10 scale (target grade 6-9 for school students)
    const targetGrade = 7.5; // Middle of 6-9 range
    const deviation = Math.abs(gradeLevel - targetGrade);
    const score = Math.max(0, 10 - deviation);

    return Math.min(10, Math.max(0, score));
  }

  private countSyllables(word: string): number {
    // Simple syllable counting algorithm
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    const vowels = 'aeiouy';
    let count = 0;
    let previousWasVowel = false;

    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        count++;
      }
      previousWasVowel = isVowel;
    }

    // Handle silent 'e'
    if (word.endsWith('e')) {
      count--;
    }

    return Math.max(1, count);
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    // Simple Levenshtein distance-based similarity
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) {
      return 1.0;
    }

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private calculateOverallScore(checks: QualityCheckResult['checks']): number {
    const weights = {
      presence_check: 0.3,
      length_check: 0.2,
      syllabus_alignment: 0.2,
      answer_check: 0.15,
      safety_check: 0.05,
      readability_score: 0.1,
    };

    let score = 0;
    let totalWeight = 0;

    for (const [check, weight] of Object.entries(weights)) {
      const value = (checks as any)[check];
      if (typeof value === 'boolean') {
        score += (value ? 10 : 0) * weight;
      } else {
        score += value * weight;
      }
      totalWeight += weight;
    }

    return score / totalWeight;
  }

  private getMissingSections(page: TopicPage): string[] {
    const missing: string[] = [];
    const requiredFields = [
      'topic_title',
      'definition',
      'explanation',
      'example_detailed',
      'example_short',
      'questions'
    ];

    for (const field of requiredFields) {
      const value = (page as any)[field];
      if (!value || (typeof value === 'string' && value.trim().length === 0)) {
        missing.push(field);
      }
    }

    return missing;
  }

  private getIssues(checks: QualityCheckResult['checks']): string[] {
    const issues: string[] = [];

    if (!checks.presence_check) {
      issues.push('Missing required sections');
    }
    if (!checks.length_check) {
      issues.push('Content length does not meet requirements');
    }
    if (!checks.syllabus_alignment) {
      issues.push('Topic does not align with syllabus');
    }
    if (!checks.answer_check) {
      issues.push('Question answers are inadequate');
    }
    if (!checks.safety_check) {
      issues.push('Content contains inappropriate material');
    }
    if (checks.readability_score < 6.0) {
      issues.push('Content readability is not suitable for target grade level');
    }

    return issues;
  }
}
