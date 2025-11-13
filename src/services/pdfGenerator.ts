import { NotesPackage, TitlePage, TOCPage, TopicPage } from '@/types/notes';
import { logger } from './logger';

// PDF Generation Service using jsPDF
export class PDFGenerator {
  private static instance: PDFGenerator;

  private constructor() {}

  static getInstance(): PDFGenerator {
    if (!PDFGenerator.instance) {
      PDFGenerator.instance = new PDFGenerator();
    }
    return PDFGenerator.instance;
  }

  async generatePDF(notesPackage: NotesPackage): Promise<string> {
    try {
      // Dynamic import to avoid bundling issues
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      let currentPage = 1;

      // Process each page
      for (let i = 0; i < notesPackage.pages.length; i++) {
        const page = notesPackage.pages[i];

        if (i > 0) {
          doc.addPage();
          currentPage++;
        }

        switch (page.page_type) {
          case 'title':
            this.addTitlePage(doc, page as TitlePage, currentPage);
            break;
          case 'toc':
            this.addTOCPage(doc, page as TOCPage, currentPage);
            break;
          case 'topic':
            this.addTopicPage(doc, page as TopicPage, currentPage);
            break;
        }
      }

      // Add footer to all pages
      this.addFooter(doc, notesPackage);

      // Generate blob URL
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);

      logger.info(`Generated PDF for job: ${notesPackage.job_id}`);
      return pdfUrl;
    } catch (error) {
      logger.error('Failed to generate PDF:', error);
      throw new Error('PDF generation failed');
    }
  }

  private addTitlePage(doc: any, page: TitlePage, pageNum: number): void {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    const title = `${page.subject} - Class ${page.class}`;
    doc.text(title, pageWidth / 2, 40, { align: 'center' });

    doc.setFontSize(20);
    doc.text(page.board, pageWidth / 2, 55, { align: 'center' });

    // Chapter title
    doc.setFontSize(28);
    doc.setTextColor(0, 100, 150);
    doc.text(page.chapter, pageWidth / 2, 80, { align: 'center' });

    // Reset color
    doc.setTextColor(0, 0, 0);

    // Introduction section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Introduction', margin, 110);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const introLines = doc.splitTextToSize(page.introduction, pageWidth - 2 * margin);
    doc.text(introLines, margin, 125);

    // Why study section
    const introHeight = introLines.length * 5;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Why Study This Chapter?', margin, 135 + introHeight);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const whyLines = doc.splitTextToSize(page.why_study, pageWidth - 2 * margin);
    doc.text(whyLines, margin, 150 + introHeight);

    // Daily life example
    const whyHeight = whyLines.length * 5;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Daily Life Example', margin, 165 + introHeight + whyHeight);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const exampleLines = doc.splitTextToSize(page.daily_life_example, pageWidth - 2 * margin);
    doc.text(exampleLines, margin, 180 + introHeight + whyHeight);

    // Page number
    this.addPageNumber(doc, pageNum);
  }

  private addTOCPage(doc: any, page: TOCPage, pageNum: number): void {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Table of Contents', pageWidth / 2, 40, { align: 'center' });

    // Topics list
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    
    let yPosition = 70;
    page.topics.forEach((topic, index) => {
      const topicNumber = `${index + 1}.`;
      doc.text(topicNumber, margin, yPosition);
      doc.text(topic, margin + 15, yPosition);
      
      // Add page reference (starting from page 3, since title=1, toc=2)
      const pageRef = `${index + 3}`;
      doc.text(pageRef, pageWidth - margin - 10, yPosition, { align: 'right' });
      
      yPosition += 12;
      
      // Add new page if needed
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 40;
      }
    });

    // Page number
    this.addPageNumber(doc, pageNum);
  }

  private addTopicPage(doc: any, page: TopicPage, pageNum: number): void {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = 40;

    // Topic title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 100, 150);
    doc.text(page.topic_title, pageWidth / 2, yPosition, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    yPosition += 20;

    // Definition
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Definition:', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const defLines = doc.splitTextToSize(page.definition, pageWidth - 2 * margin);
    doc.text(defLines, margin, yPosition);
    yPosition += defLines.length * 5 + 10;

    // Check if we need a new page
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 40;
    }

    // Explanation
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Explanation:', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const explLines = doc.splitTextToSize(page.explanation, pageWidth - 2 * margin);
    
    // Split explanation across pages if needed
    let remainingLines = [...explLines];
    while (remainingLines.length > 0) {
      const availableSpace = pageHeight - yPosition - 60; // Leave space for footer
      const linesPerPage = Math.floor(availableSpace / 5);
      const currentPageLines = remainingLines.splice(0, linesPerPage);
      
      doc.text(currentPageLines, margin, yPosition);
      
      if (remainingLines.length > 0) {
        doc.addPage();
        yPosition = 40;
      } else {
        yPosition += currentPageLines.length * 5 + 10;
      }
    }

    // Comparison (if exists)
    if (page.comparison) {
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = 40;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Comparison:', margin, yPosition);
      yPosition += 8;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const compLines = doc.splitTextToSize(page.comparison, pageWidth - 2 * margin);
      doc.text(compLines, margin, yPosition);
      yPosition += compLines.length * 5 + 10;
    }

    // Examples
    if (yPosition > pageHeight - 120) {
      doc.addPage();
      yPosition = 40;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Example:', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const detailExLines = doc.splitTextToSize(page.example_detailed, pageWidth - 2 * margin);
    doc.text(detailExLines, margin, yPosition);
    yPosition += detailExLines.length * 5 + 8;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Quick Example:', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(page.example_short, margin, yPosition);
    yPosition += 15;

    // Questions
    if (yPosition > pageHeight - 150) {
      doc.addPage();
      yPosition = 40;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Practice Questions:', margin, yPosition);
    yPosition += 10;

    page.questions.forEach((question, index) => {
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 40;
      }

      // Question
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Q${index + 1} (${question.difficulty.toUpperCase()}):`, margin, yPosition);
      yPosition += 6;

      doc.setFont('helvetica', 'normal');
      const qLines = doc.splitTextToSize(question.q, pageWidth - 2 * margin - 10);
      doc.text(qLines, margin + 5, yPosition);
      yPosition += qLines.length * 5 + 3;

      // Answer
      doc.setFont('helvetica', 'bold');
      doc.text('Answer:', margin + 5, yPosition);
      yPosition += 5;

      doc.setFont('helvetica', 'normal');
      const aLines = doc.splitTextToSize(question.a, pageWidth - 2 * margin - 10);
      doc.text(aLines, margin + 10, yPosition);
      yPosition += aLines.length * 5 + 8;
    });

    // Page number
    this.addPageNumber(doc, pageNum);
  }

  private addPageNumber(doc: any, pageNum: number): void {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  private addFooter(doc: any, notesPackage: NotesPackage): void {
    const totalPages = doc.internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Footer text
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      
      const footerText = `AI Notes Maker — Generated on ${new Date(notesPackage.metadata.generated_at).toLocaleDateString()} — Job ID: ${notesPackage.job_id}`;
      doc.text(footerText, pageWidth / 2, pageHeight - 5, { align: 'center' });
      
      // Reset color
      doc.setTextColor(0, 0, 0);
    }
  }

  async downloadPDF(notesPackage: NotesPackage, filename?: string): Promise<void> {
    try {
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Generate the same content as generatePDF
      let currentPage = 1;
      for (let i = 0; i < notesPackage.pages.length; i++) {
        const page = notesPackage.pages[i];

        if (i > 0) {
          doc.addPage();
          currentPage++;
        }

        switch (page.page_type) {
          case 'title':
            this.addTitlePage(doc, page as TitlePage, currentPage);
            break;
          case 'toc':
            this.addTOCPage(doc, page as TOCPage, currentPage);
            break;
          case 'topic':
            this.addTopicPage(doc, page as TopicPage, currentPage);
            break;
        }
      }

      this.addFooter(doc, notesPackage);

      // Download the PDF
      const defaultFilename = `${notesPackage.metadata.subject}_Class${notesPackage.metadata.class}_${notesPackage.metadata.chapter.replace(/\s+/g, '_')}.pdf`;
      doc.save(filename || defaultFilename);

      logger.info(`PDF downloaded: ${filename || defaultFilename}`);
    } catch (error) {
      logger.error('Failed to download PDF:', error);
      throw new Error('PDF download failed');
    }
  }
}
