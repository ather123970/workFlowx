import { ComprehensiveChapter } from '@/types/learning';
import jsPDF from 'jspdf';

export interface PDFGenerationOptions {
  includeImages: boolean;
  fontSize: number;
  margin: number;
  pageFormat: 'a4' | 'letter';
  orientation: 'portrait' | 'landscape';
  includeTableOfContents: boolean;
  includeHeader: boolean;
  includeFooter: boolean;
}

export interface PDFGenerationResult {
  success: boolean;
  pdfBlob?: Blob;
  downloadUrl?: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  error?: string;
}

export class FreePDFGenerationService {
  private static instance: FreePDFGenerationService;
  
  private constructor() {}

  static getInstance(): FreePDFGenerationService {
    if (!FreePDFGenerationService.instance) {
      FreePDFGenerationService.instance = new FreePDFGenerationService();
    }
    return FreePDFGenerationService.instance;
  }

  // Generate comprehensive PDF from chapter data
  async generateComprehensivePDF(
    chapter: ComprehensiveChapter,
    options: Partial<PDFGenerationOptions> = {}
  ): Promise<PDFGenerationResult> {
    const defaultOptions: PDFGenerationOptions = {
      includeImages: false,
      fontSize: 11,
      margin: 20,
      pageFormat: 'a4',
      orientation: 'portrait',
      includeTableOfContents: true,
      includeHeader: true,
      includeFooter: true
    };

    const finalOptions = { ...defaultOptions, ...options };
    
    try {
      console.log('📄 Generating comprehensive PDF...');
      
      // Create new PDF document
      const pdf = new jsPDF({
        orientation: finalOptions.orientation,
        unit: 'mm',
        format: finalOptions.pageFormat
      });

      let currentY = finalOptions.margin;
      let pageCount = 1;

      // Set font
      pdf.setFont('helvetica');

      // Generate title page
      currentY = this.addTitlePage(pdf, chapter, finalOptions, currentY);

      // Add table of contents if enabled
      if (finalOptions.includeTableOfContents) {
        pdf.addPage();
        pageCount++;
        currentY = finalOptions.margin;
        currentY = this.addTableOfContents(pdf, chapter, finalOptions, currentY);
      }

      // Add introduction
      pdf.addPage();
      pageCount++;
      currentY = finalOptions.margin;
      currentY = this.addIntroduction(pdf, chapter, finalOptions, currentY);

      // Add core concepts
      const coreConceptsPages = this.addCoreConceptsSection(pdf, chapter, finalOptions);
      pageCount += coreConceptsPages;

      // Add applications
      const applicationsPages = this.addApplicationsSection(pdf, chapter, finalOptions);
      pageCount += applicationsPages;

      // Add practice section
      const practicePages = this.addPracticeSection(pdf, chapter, finalOptions);
      pageCount += practicePages;

      // Add mastery section
      const masteryPages = this.addMasterySection(pdf, chapter, finalOptions);
      pageCount += masteryPages;

      // Add connections
      const connectionsPages = this.addConnectionsSection(pdf, chapter, finalOptions);
      pageCount += connectionsPages;

      // Add headers and footers to all pages
      if (finalOptions.includeHeader || finalOptions.includeFooter) {
        this.addHeadersAndFooters(pdf, chapter, finalOptions, pageCount);
      }

      // Generate blob and download URL
      const pdfBlob = pdf.output('blob');
      const downloadUrl = URL.createObjectURL(pdfBlob);
      const fileName = this.generateFileName(chapter);

      console.log(`✅ PDF generated successfully: ${pageCount} pages, ${pdfBlob.size} bytes`);

      return {
        success: true,
        pdfBlob,
        downloadUrl,
        fileName,
        fileSize: pdfBlob.size,
        pageCount,
      };

    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      
      return {
        success: false,
        fileName: this.generateFileName(chapter),
        fileSize: 0,
        pageCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private addTitlePage(
    pdf: jsPDF, 
    chapter: ComprehensiveChapter, 
    options: PDFGenerationOptions, 
    startY: number
  ): number {
    let currentY = startY + 40;

    // Main title
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    const title = `${chapter.subject} - ${chapter.chapter}`;
    const titleWidth = pdf.getTextWidth(title);
    const pageWidth = pdf.internal.pageSize.getWidth();
    pdf.text(title, (pageWidth - titleWidth) / 2, currentY);
    currentY += 20;

    // Subtitle
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    const subtitle = `Class ${chapter.class} - ${chapter.board} Board`;
    const subtitleWidth = pdf.getTextWidth(subtitle);
    pdf.text(subtitle, (pageWidth - subtitleWidth) / 2, currentY);
    currentY += 30;

    // Comprehensive Notes label
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    const notesLabel = 'Comprehensive Study Notes';
    const notesWidth = pdf.getTextWidth(notesLabel);
    pdf.text(notesLabel, (pageWidth - notesWidth) / 2, currentY);
    currentY += 40;

    // Metadata box
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const metadata = [
      `Generated: ${new Date(chapter.metadata.generated_at).toLocaleDateString()}`,
      `Word Count: ${chapter.metadata.word_count.toLocaleString()}`,
      `Reading Time: ${chapter.metadata.estimated_reading_time} minutes`,
      `Difficulty: ${chapter.metadata.difficulty_level}`,
      `Completeness: ${chapter.metadata.completeness_score}%`
    ];

    const boxX = options.margin;
    const boxY = currentY;
    const boxWidth = pageWidth - (2 * options.margin);
    const boxHeight = metadata.length * 8 + 10;

    // Draw metadata box
    pdf.setDrawColor(0, 0, 0);
    pdf.rect(boxX, boxY, boxWidth, boxHeight);
    
    currentY += 8;
    metadata.forEach(item => {
      pdf.text(item, boxX + 5, currentY);
      currentY += 8;
    });

    return currentY;
  }

  private addTableOfContents(
    pdf: jsPDF, 
    chapter: ComprehensiveChapter, 
    options: PDFGenerationOptions, 
    startY: number
  ): number {
    let currentY = startY;

    // TOC Title
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Table of Contents', options.margin, currentY);
    currentY += 15;

    // TOC Items
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    const tocItems = [
      '1. Introduction',
      '2. Core Concepts',
      '   2.1 Types and Classifications',
      '   2.2 Key Formulas',
      '   2.3 Laws and Principles',
      '3. Applications',
      '   3.1 Real-world Examples',
      '   3.2 Practical Applications',
      '4. Practice',
      '   4.1 Numerical Examples',
      '   4.2 Conceptual Questions',
      '5. Mastery',
      '   5.1 Common Mistakes',
      '   5.2 Conceptual Tricks',
      '   5.3 Memory Aids',
      '6. Connections',
      '   6.1 Related Topics',
      '   6.2 Prerequisites'
    ];

    tocItems.forEach(item => {
      pdf.text(item, options.margin, currentY);
      currentY += 7;
    });

    return currentY;
  }

  private addIntroduction(
    pdf: jsPDF, 
    chapter: ComprehensiveChapter, 
    options: PDFGenerationOptions, 
    startY: number
  ): number {
    let currentY = startY;

    // Section title
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('1. Introduction', options.margin, currentY);
    currentY += 12;

    // Definition
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Definition:', options.margin, currentY);
    currentY += 8;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    currentY = this.addWrappedText(pdf, chapter.introduction.definition, options.margin, currentY, options);

    currentY += 5;

    // Importance
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Importance:', options.margin, currentY);
    currentY += 8;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    currentY = this.addWrappedText(pdf, chapter.introduction.importance, options.margin, currentY, options);

    currentY += 5;

    // Overview
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Overview:', options.margin, currentY);
    currentY += 8;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    currentY = this.addWrappedText(pdf, chapter.introduction.overview, options.margin, currentY, options);

    currentY += 5;

    // Learning Objectives
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Learning Objectives:', options.margin, currentY);
    currentY += 8;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    chapter.introduction.learning_objectives.forEach((objective, index) => {
      currentY = this.addWrappedText(pdf, `${index + 1}. ${objective}`, options.margin, currentY, options);
      currentY += 3;
    });

    return currentY;
  }

  private addCoreConceptsSection(
    pdf: jsPDF, 
    chapter: ComprehensiveChapter, 
    options: PDFGenerationOptions
  ): number {
    let pagesAdded = 0;

    // Add new page for core concepts
    pdf.addPage();
    pagesAdded++;
    let currentY = options.margin;

    // Section title
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('2. Core Concepts', options.margin, currentY);
    currentY += 15;

    // Types
    if (chapter.core_concepts.types.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('2.1 Types and Classifications', options.margin, currentY);
      currentY += 10;

      chapter.core_concepts.types.forEach(type => {
        currentY = this.checkPageBreak(pdf, currentY, options, 30);
        if (currentY === options.margin) pagesAdded++;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(type.title, options.margin, currentY);
        currentY += 8;

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        currentY = this.addWrappedText(pdf, type.content, options.margin, currentY, options);
        currentY += 8;
      });
    }

    // Formulas
    if (chapter.core_concepts.formulas.length > 0) {
      currentY = this.checkPageBreak(pdf, currentY, options, 40);
      if (currentY === options.margin) pagesAdded++;

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('2.2 Key Formulas', options.margin, currentY);
      currentY += 10;

      chapter.core_concepts.formulas.forEach(formula => {
        currentY = this.checkPageBreak(pdf, currentY, options, 25);
        if (currentY === options.margin) pagesAdded++;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(formula.name, options.margin, currentY);
        currentY += 8;

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Formula: ${formula.expression}`, options.margin, currentY);
        currentY += 6;

        formula.variables.forEach(variable => {
          pdf.text(`${variable.symbol} = ${variable.name} (${variable.unit})`, options.margin + 5, currentY);
          currentY += 5;
        });
        currentY += 5;
      });
    }

    return pagesAdded;
  }

  private addApplicationsSection(
    pdf: jsPDF, 
    chapter: ComprehensiveChapter, 
    options: PDFGenerationOptions
  ): number {
    let pagesAdded = 0;

    pdf.addPage();
    pagesAdded++;
    let currentY = options.margin;

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('3. Applications', options.margin, currentY);
    currentY += 15;

    // Real-world examples
    if (chapter.applications.real_world_examples.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('3.1 Real-world Examples', options.margin, currentY);
      currentY += 10;

      chapter.applications.real_world_examples.forEach((example, index) => {
        currentY = this.checkPageBreak(pdf, currentY, options, 20);
        if (currentY === options.margin) pagesAdded++;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Example ${index + 1}: ${example.title}`, options.margin, currentY);
        currentY += 8;

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        currentY = this.addWrappedText(pdf, example.description, options.margin, currentY, options);
        
        if (example.solution) {
          currentY += 3;
          pdf.setFont('helvetica', 'bold');
          pdf.text('Solution:', options.margin, currentY);
          currentY += 5;
          pdf.setFont('helvetica', 'normal');
          currentY = this.addWrappedText(pdf, example.solution, options.margin, currentY, options);
        }
        currentY += 8;
      });
    }

    return pagesAdded;
  }

  private addPracticeSection(
    pdf: jsPDF, 
    chapter: ComprehensiveChapter, 
    options: PDFGenerationOptions
  ): number {
    let pagesAdded = 0;

    pdf.addPage();
    pagesAdded++;
    let currentY = options.margin;

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('4. Practice Questions', options.margin, currentY);
    currentY += 15;

    // Numerical examples
    if (chapter.practice.numerical_examples.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('4.1 Numerical Problems', options.margin, currentY);
      currentY += 10;

      chapter.practice.numerical_examples.forEach((problem, index) => {
        currentY = this.checkPageBreak(pdf, currentY, options, 25);
        if (currentY === options.margin) pagesAdded++;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Problem ${index + 1} (${problem.difficulty}):`, options.margin, currentY);
        currentY += 8;

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        currentY = this.addWrappedText(pdf, problem.description, options.margin, currentY, options);
        
        currentY += 3;
        pdf.setFont('helvetica', 'bold');
        pdf.text('Solution:', options.margin, currentY);
        currentY += 5;
        pdf.setFont('helvetica', 'normal');
        currentY = this.addWrappedText(pdf, problem.solution, options.margin, currentY, options);
        currentY += 8;
      });
    }

    // Conceptual questions
    if (chapter.practice.conceptual_questions.length > 0) {
      currentY = this.checkPageBreak(pdf, currentY, options, 20);
      if (currentY === options.margin) pagesAdded++;

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('4.2 Conceptual Questions', options.margin, currentY);
      currentY += 10;

      chapter.practice.conceptual_questions.forEach((question, index) => {
        currentY = this.checkPageBreak(pdf, currentY, options, 20);
        if (currentY === options.margin) pagesAdded++;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Q${index + 1}:`, options.margin, currentY);
        currentY += 6;

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        currentY = this.addWrappedText(pdf, question.description, options.margin, currentY, options);
        
        currentY += 3;
        pdf.setFont('helvetica', 'bold');
        pdf.text('Answer:', options.margin, currentY);
        currentY += 5;
        pdf.setFont('helvetica', 'normal');
        currentY = this.addWrappedText(pdf, question.solution, options.margin, currentY, options);
        currentY += 8;
      });
    }

    return pagesAdded;
  }

  private addMasterySection(
    pdf: jsPDF, 
    chapter: ComprehensiveChapter, 
    options: PDFGenerationOptions
  ): number {
    let pagesAdded = 0;

    pdf.addPage();
    pagesAdded++;
    let currentY = options.margin;

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('5. Mastery Tips', options.margin, currentY);
    currentY += 15;

    // Common mistakes
    if (chapter.mastery.common_mistakes.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('5.1 Common Mistakes to Avoid', options.margin, currentY);
      currentY += 10;

      chapter.mastery.common_mistakes.forEach((mistake, index) => {
        currentY = this.checkPageBreak(pdf, currentY, options, 25);
        if (currentY === options.margin) pagesAdded++;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Mistake ${index + 1}:`, options.margin, currentY);
        currentY += 6;

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        currentY = this.addWrappedText(pdf, `❌ ${mistake.mistake}`, options.margin, currentY, options);
        currentY += 3;
        currentY = this.addWrappedText(pdf, `✅ ${mistake.correction}`, options.margin, currentY, options);
        currentY += 3;
        currentY = this.addWrappedText(pdf, mistake.explanation, options.margin, currentY, options);
        currentY += 8;
      });
    }

    // Memory aids
    if (chapter.mastery.memory_aids.length > 0) {
      currentY = this.checkPageBreak(pdf, currentY, options, 20);
      if (currentY === options.margin) pagesAdded++;

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('5.2 Memory Aids', options.margin, currentY);
      currentY += 10;

      chapter.mastery.memory_aids.forEach((aid, index) => {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        currentY = this.addWrappedText(pdf, `💡 ${aid}`, options.margin, currentY, options);
        currentY += 5;
      });
    }

    return pagesAdded;
  }

  private addConnectionsSection(
    pdf: jsPDF, 
    chapter: ComprehensiveChapter, 
    options: PDFGenerationOptions
  ): number {
    let pagesAdded = 0;

    pdf.addPage();
    pagesAdded++;
    let currentY = options.margin;

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('6. Connections', options.margin, currentY);
    currentY += 15;

    // Prerequisites
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('6.1 Prerequisites', options.margin, currentY);
    currentY += 10;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    chapter.connections.prerequisite_knowledge.forEach(prereq => {
      currentY = this.addWrappedText(pdf, `• ${prereq}`, options.margin, currentY, options);
      currentY += 3;
    });

    currentY += 8;

    // Next topics
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('6.2 Next Topics', options.margin, currentY);
    currentY += 10;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    chapter.connections.next_topics.forEach(topic => {
      currentY = this.addWrappedText(pdf, `• ${topic}`, options.margin, currentY, options);
      currentY += 3;
    });

    return pagesAdded;
  }

  private addWrappedText(
    pdf: jsPDF, 
    text: string, 
    x: number, 
    y: number, 
    options: PDFGenerationOptions
  ): number {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const maxWidth = pageWidth - (2 * options.margin);
    const lines = pdf.splitTextToSize(text, maxWidth);
    
    lines.forEach((line: string) => {
      y = this.checkPageBreak(pdf, y, options, 10);
      pdf.text(line, x, y);
      y += 6;
    });
    
    return y;
  }

  private checkPageBreak(
    pdf: jsPDF, 
    currentY: number, 
    options: PDFGenerationOptions, 
    requiredSpace: number
  ): number {
    const pageHeight = pdf.internal.pageSize.getHeight();
    const bottomMargin = pageHeight - options.margin;
    
    if (currentY + requiredSpace > bottomMargin) {
      pdf.addPage();
      return options.margin;
    }
    
    return currentY;
  }

  private addHeadersAndFooters(
    pdf: jsPDF, 
    chapter: ComprehensiveChapter, 
    options: PDFGenerationOptions, 
    totalPages: number
  ): void {
    const pageCount = pdf.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      
      if (options.includeHeader && i > 1) { // Skip header on title page
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${chapter.subject} - ${chapter.chapter}`, options.margin, 15);
      }
      
      if (options.includeFooter) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const pageHeight = pdf.internal.pageSize.getHeight();
        const pageWidth = pdf.internal.pageSize.getWidth();
        
        // Page number
        const pageText = `Page ${i} of ${pageCount}`;
        const pageTextWidth = pdf.getTextWidth(pageText);
        pdf.text(pageText, pageWidth - options.margin - pageTextWidth, pageHeight - 10);
        
        // Generated by text
        pdf.text('Generated by AI Notes Platform', options.margin, pageHeight - 10);
      }
    }
  }

  private generateFileName(chapter: ComprehensiveChapter): string {
    const sanitized = chapter.chapter.replace(/[^a-zA-Z0-9]/g, '_');
    const date = new Date().toISOString().split('T')[0];
    return `${chapter.subject}_${sanitized}_Class${chapter.class}_${date}.pdf`;
  }

  // Download PDF directly
  downloadPDF(result: PDFGenerationResult): void {
    if (!result.success || !result.downloadUrl) {
      throw new Error('PDF generation failed or download URL not available');
    }

    const link = document.createElement('a');
    link.href = result.downloadUrl;
    link.download = result.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the object URL
    setTimeout(() => {
      URL.revokeObjectURL(result.downloadUrl!);
    }, 1000);
  }

  // Get PDF generation capabilities
  getCapabilities(): {
    formats: string[];
    orientations: string[];
    features: string[];
    maxFileSize: string;
  } {
    return {
      formats: ['A4', 'Letter'],
      orientations: ['Portrait', 'Landscape'],
      features: [
        'Table of Contents',
        'Headers and Footers',
        'Text Wrapping',
        'Multiple Sections',
        'Professional Formatting'
      ],
      maxFileSize: '50 MB'
    };
  }
}

export const freePDFGenerationService = FreePDFGenerationService.getInstance();
