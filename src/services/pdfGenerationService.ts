import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ComprehensiveChapter } from '@/types/learning';

export class PDFGenerationService {
  private static instance: PDFGenerationService;

  private constructor() {}

  static getInstance(): PDFGenerationService {
    if (!PDFGenerationService.instance) {
      PDFGenerationService.instance = new PDFGenerationService();
    }
    return PDFGenerationService.instance;
  }

  // Generate PDF from comprehensive chapter data
  async generatePDF(chapter: ComprehensiveChapter): Promise<void> {
    try {
      console.log('🔄 Starting PDF generation...');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Set up fonts and colors
      pdf.setFont('helvetica');
      
      let yPosition = 20;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);

      // Helper function to add new page if needed
      const checkPageBreak = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = 20;
        }
      };

      // Helper function to wrap text
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, maxWidth);
        
        for (let i = 0; i < lines.length; i++) {
          checkPageBreak(fontSize * 0.5);
          pdf.text(lines[i], x, y + (i * fontSize * 0.5));
        }
        
        return y + (lines.length * fontSize * 0.5);
      };

      // Simple Header - Only Chapter, Class, and Board
      pdf.setFontSize(24);
      pdf.setTextColor(75, 85, 99); // Gray-600
      pdf.text(chapter.chapter, pageWidth / 2, 30, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setTextColor(107, 114, 128); // Gray-500
      pdf.text(`Class ${chapter.class} • ${chapter.board}`, pageWidth / 2, 45, { align: 'center' });
      
      // Add decorative line
      pdf.setDrawColor(147, 197, 253); // Blue-300
      pdf.setLineWidth(0.5);
      pdf.line(margin, 55, pageWidth - margin, 55);
      
      yPosition = 70;

      // Start new page for content
      pdf.addPage();
      yPosition = 20;

      // Introduction Section
      pdf.setFontSize(18);
      pdf.setTextColor(59, 130, 246); // Blue-500
      pdf.text('1. Introduction & Overview', margin, yPosition);
      yPosition += 15;

      // Definition
      pdf.setFontSize(14);
      pdf.setTextColor(75, 85, 99);
      pdf.text('Definition', margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(11);
      pdf.setTextColor(55, 65, 81);
      yPosition = addWrappedText(chapter.introduction.definition, margin, yPosition, contentWidth, 11) + 10;

      // Importance
      checkPageBreak(20);
      pdf.setFontSize(14);
      pdf.setTextColor(75, 85, 99);
      pdf.text('Importance', margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(11);
      pdf.setTextColor(55, 65, 81);
      yPosition = addWrappedText(chapter.introduction.importance, margin, yPosition, contentWidth, 11) + 10;

      // Learning Objectives
      checkPageBreak(30);
      pdf.setFontSize(14);
      pdf.setTextColor(75, 85, 99);
      pdf.text('Learning Objectives', margin, yPosition);
      yPosition += 8;

      chapter.introduction.learning_objectives.forEach((objective, index) => {
        checkPageBreak(8);
        pdf.setFontSize(11);
        pdf.setTextColor(55, 65, 81);
        yPosition = addWrappedText(`• ${objective}`, margin + 5, yPosition, contentWidth - 5, 11) + 3;
      });

      yPosition += 10;

      // Core Concepts Section
      checkPageBreak(30);
      pdf.setFontSize(18);
      pdf.setTextColor(34, 197, 94); // Green-500
      pdf.text('2. Core Concepts & Formulas', margin, yPosition);
      yPosition += 15;

      // Types
      if (chapter.core_concepts.types.length > 0) {
        pdf.setFontSize(14);
        pdf.setTextColor(75, 85, 99);
        pdf.text('Types & Classifications', margin, yPosition);
        yPosition += 10;

        chapter.core_concepts.types.forEach((type) => {
          checkPageBreak(20);
          pdf.setFontSize(12);
          pdf.setTextColor(59, 130, 246);
          pdf.text(type.title, margin + 5, yPosition);
          yPosition += 8;
          
          pdf.setFontSize(10);
          pdf.setTextColor(55, 65, 81);
          if (Array.isArray(type.content)) {
            type.content.forEach((item) => {
              checkPageBreak(6);
              yPosition = addWrappedText(`• ${item}`, margin + 10, yPosition, contentWidth - 10, 10) + 2;
            });
          } else {
            yPosition = addWrappedText(type.content, margin + 10, yPosition, contentWidth - 10, 10) + 5;
          }
          yPosition += 5;
        });
      }

      // Formulas
      if (chapter.core_concepts.formulas.length > 0) {
        checkPageBreak(30);
        pdf.setFontSize(14);
        pdf.setTextColor(75, 85, 99);
        pdf.text('Key Formulas', margin, yPosition);
        yPosition += 10;

        chapter.core_concepts.formulas.forEach((formula) => {
          checkPageBreak(40);
          
          // Formula name
          pdf.setFontSize(12);
          pdf.setTextColor(34, 197, 94);
          pdf.text(formula.name, margin + 5, yPosition);
          yPosition += 8;
          
          // Formula expression (in a box)
          pdf.setDrawColor(209, 213, 219);
          pdf.setFillColor(249, 250, 251);
          pdf.rect(margin + 5, yPosition - 5, contentWidth - 10, 12, 'FD');
          
          pdf.setFontSize(14);
          pdf.setTextColor(0, 0, 0);
          pdf.text(formula.expression, pageWidth / 2, yPosition + 2, { align: 'center' });
          yPosition += 15;
          
          // Variables
          pdf.setFontSize(10);
          pdf.setTextColor(75, 85, 99);
          pdf.text('Variables:', margin + 10, yPosition);
          yPosition += 6;
          
          formula.variables.forEach((variable) => {
            checkPageBreak(6);
            pdf.setFontSize(9);
            pdf.setTextColor(55, 65, 81);
            const varText = `${variable.symbol} = ${variable.name}${variable.unit ? ` (${variable.unit})` : ''}`;
            pdf.text(varText, margin + 15, yPosition);
            yPosition += 5;
          });
          
          yPosition += 8;
        });
      }

      // Applications Section
      checkPageBreak(30);
      pdf.setFontSize(18);
      pdf.setTextColor(245, 158, 11); // Yellow-500
      pdf.text('3. Real-World Applications', margin, yPosition);
      yPosition += 15;

      if (chapter.applications.real_world_examples.length > 0) {
        chapter.applications.real_world_examples.forEach((example, index) => {
          checkPageBreak(25);
          
          pdf.setFontSize(12);
          pdf.setTextColor(245, 158, 11);
          pdf.text(`Example ${index + 1}: ${example.title}`, margin + 5, yPosition);
          yPosition += 8;
          
          pdf.setFontSize(10);
          pdf.setTextColor(55, 65, 81);
          yPosition = addWrappedText(example.description, margin + 10, yPosition, contentWidth - 10, 10) + 8;
        });
      }

      // Practice Section
      checkPageBreak(30);
      pdf.setFontSize(18);
      pdf.setTextColor(147, 51, 234); // Purple-600
      pdf.text('4. Practice & Examples', margin, yPosition);
      yPosition += 15;

      if (chapter.practice.numerical_examples.length > 0) {
        pdf.setFontSize(14);
        pdf.setTextColor(75, 85, 99);
        pdf.text('Numerical Examples', margin, yPosition);
        yPosition += 10;

        chapter.practice.numerical_examples.forEach((example, index) => {
          checkPageBreak(30);
          
          pdf.setFontSize(12);
          pdf.setTextColor(147, 51, 234);
          pdf.text(`Problem ${index + 1}: ${example.title}`, margin + 5, yPosition);
          yPosition += 8;
          
          pdf.setFontSize(10);
          pdf.setTextColor(55, 65, 81);
          yPosition = addWrappedText(example.description, margin + 10, yPosition, contentWidth - 10, 10) + 5;
          
          if (example.solution) {
            pdf.setFontSize(10);
            pdf.setTextColor(34, 197, 94);
            pdf.text('Solution:', margin + 10, yPosition);
            yPosition += 5;
            
            pdf.setTextColor(55, 65, 81);
            yPosition = addWrappedText(example.solution, margin + 15, yPosition, contentWidth - 15, 10) + 8;
          }
        });
      }

      // Mastery Section
      checkPageBreak(30);
      pdf.setFontSize(18);
      pdf.setTextColor(239, 68, 68); // Red-500
      pdf.text('5. Common Mistakes & Mastery Tips', margin, yPosition);
      yPosition += 15;

      if (chapter.mastery.common_mistakes.length > 0) {
        pdf.setFontSize(14);
        pdf.setTextColor(75, 85, 99);
        pdf.text('Common Mistakes', margin, yPosition);
        yPosition += 10;

        chapter.mastery.common_mistakes.forEach((mistake, index) => {
          checkPageBreak(25);
          
          pdf.setFontSize(11);
          pdf.setTextColor(239, 68, 68);
          pdf.text(`❌ Mistake ${index + 1}:`, margin + 5, yPosition);
          yPosition += 6;
          
          pdf.setFontSize(10);
          pdf.setTextColor(55, 65, 81);
          yPosition = addWrappedText(mistake.mistake, margin + 10, yPosition, contentWidth - 10, 10) + 3;
          
          pdf.setFontSize(10);
          pdf.setTextColor(34, 197, 94);
          pdf.text('✅ Correction:', margin + 10, yPosition);
          yPosition += 5;
          
          pdf.setTextColor(55, 65, 81);
          yPosition = addWrappedText(mistake.correction, margin + 15, yPosition, contentWidth - 15, 10) + 8;
        });
      }

      // Memory Aids
      if (chapter.mastery.memory_aids.length > 0) {
        checkPageBreak(20);
        pdf.setFontSize(14);
        pdf.setTextColor(75, 85, 99);
        pdf.text('Memory Aids', margin, yPosition);
        yPosition += 10;

        chapter.mastery.memory_aids.forEach((aid, index) => {
          checkPageBreak(8);
          pdf.setFontSize(10);
          pdf.setTextColor(147, 51, 234);
          yPosition = addWrappedText(`🧠 ${aid}`, margin + 5, yPosition, contentWidth - 5, 10) + 5;
        });
      }

      // Footer on each page
      const totalPages = pdf.internal.pages.length - 1; // Subtract 1 because pages array includes a null first element
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(156, 163, 175);
        pdf.text(`${chapter.chapter} - ${chapter.subject}`, margin, pageHeight - 10);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        pdf.text('Generated by Syllabus Savvy Scribe - Free AI Notes', pageWidth / 2, pageHeight - 10, { align: 'center' });
      }

      // Save the PDF
      const fileName = `${chapter.subject}_${chapter.chapter.replace(/[^a-zA-Z0-9]/g, '_')}_Notes.pdf`;
      pdf.save(fileName);
      
      console.log('✅ PDF generated successfully:', fileName);
      
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }

  // Generate PDF from HTML element (alternative method)
  async generatePDFFromHTML(elementId: string, fileName: string): Promise<void> {
    try {
      console.log('🔄 Generating PDF from HTML element...');
      
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Element not found');
      }

      // Configure html2canvas options
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(fileName);
      console.log('✅ PDF generated from HTML successfully:', fileName);
      
    } catch (error) {
      console.error('❌ Error generating PDF from HTML:', error);
      throw new Error('Failed to generate PDF from HTML. Please try again.');
    }
  }

  // Quick PDF generation for preview
  async generateQuickPDF(title: string, content: string): Promise<void> {
    try {
      const pdf = new jsPDF();
      
      pdf.setFontSize(20);
      pdf.text(title, 20, 30);
      
      pdf.setFontSize(12);
      const lines = pdf.splitTextToSize(content, 170);
      pdf.text(lines, 20, 50);
      
      pdf.save(`${title.replace(/[^a-zA-Z0-9]/g, '_')}_Preview.pdf`);
      
    } catch (error) {
      console.error('❌ Error generating quick PDF:', error);
      throw new Error('Failed to generate preview PDF.');
    }
  }
}

export const pdfGenerationService = PDFGenerationService.getInstance();
