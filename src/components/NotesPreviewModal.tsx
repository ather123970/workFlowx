import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  Download, 
  BookOpen, 
  Calculator, 
  Lightbulb, 
  Target, 
  AlertTriangle,
  X,
  Maximize2,
  Minimize2,
  FileText,
  Clock,
  Award
} from 'lucide-react';

interface NotesPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentJob: any;
  onDownloadPDF?: () => void;
}

export const NotesPreviewModal: React.FC<NotesPreviewModalProps> = ({
  isOpen,
  onClose,
  currentJob,
  onDownloadPDF
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSection, setActiveSection] = useState('introduction');

  if (!currentJob) return null;

  const isCompleted = currentJob.status === 'completed';
  const canPreview = currentJob.progress > 30 || isCompleted;

  // Mock preview content based on the current job
  const generatePreviewContent = () => {
    const subject = currentJob.request?.subject || 'Subject';
    const chapter = currentJob.request?.chapter || 'Chapter';
    const progress = currentJob.progress || 0;

    return {
      introduction: {
        title: 'Introduction & Overview',
        content: `This chapter provides comprehensive coverage of ${chapter} in ${subject}. Students will learn fundamental concepts, practical applications, and problem-solving techniques essential for academic success in Pakistani educational system.

The study of ${chapter} is crucial for understanding advanced topics and forms the foundation for higher-level concepts. This chapter aligns with ${currentJob.request?.board || 'FBISE'} curriculum requirements and includes Pakistani context examples.

Key learning objectives include:
• Understanding basic definitions and terminology
• Mastering fundamental principles and laws
• Applying mathematical formulations
• Solving real-world problems with Pakistani context
• Developing critical thinking and analytical skills`,
        progress: Math.min(100, Math.max(0, progress - 0))
      },
      concepts: {
        title: 'Core Concepts & Formulas',
        content: `FUNDAMENTAL DEFINITIONS:
${chapter} refers to the systematic study of [core concept] and its applications in ${subject}. This involves understanding the underlying principles, mathematical relationships, and practical implementations.

KEY FORMULAS:
1. Primary Formula: [Mathematical expression]
   Variables: Define each symbol and unit
   Applications: Where and how to use this formula

2. Secondary Formula: [Related mathematical expression]
   Derivation: Step-by-step mathematical derivation
   Limitations: When this formula applies

TYPES AND CLASSIFICATIONS:
• Type A: [Description with characteristics]
• Type B: [Description with differences]
• Type C: [Advanced applications]

MATHEMATICAL FRAMEWORK:
The mathematical foundation includes several key relationships that help quantify and predict various phenomena related to ${chapter.toLowerCase()}.`,
        progress: Math.min(100, Math.max(0, progress - 20))
      },
      applications: {
        title: 'Real-World Applications',
        content: `PAKISTANI CONTEXT EXAMPLES:

1. Transportation Sector:
Application in calculating distances between major Pakistani cities like Karachi to Lahore (1200 km), considering factors such as route optimization and fuel efficiency.

2. Industrial Applications:
Usage in Pakistani textile mills for quality control, production optimization, and resource management. The textile industry, being a major contributor to Pakistan's economy, relies heavily on these principles.

3. Agricultural Sector:
Implementation in Pakistani farming for crop yield optimization, irrigation management, and soil analysis. Given Pakistan's agricultural economy, these applications are particularly relevant.

4. Technology and Telecommunications:
Application in Pakistani telecommunications for signal processing, data transmission, and network optimization across the country's diverse geographical regions.

COMPARATIVE ANALYSIS:
• Traditional vs Modern approaches
• Local vs International standards
• Cost-effective solutions for Pakistani context`,
        progress: Math.min(100, Math.max(0, progress - 40))
      },
      practice: {
        title: 'Practice Problems & Solutions',
        content: `NUMERICAL EXAMPLES:

Problem 1 (Easy Level):
Calculate [specific calculation] for a typical Pakistani scenario.
Given: [relevant data]
Solution: 
Step 1: [detailed explanation]
Step 2: [calculation process]
Final Answer: [result with units]

Problem 2 (Medium Level):
Solve a complex problem involving ${chapter.toLowerCase()} with multiple variables.
Given: [complex scenario]
Solution: [step-by-step detailed solution]

Problem 3 (Advanced Level):
Real-world application problem based on Pakistani industrial context.
Scenario: [detailed problem statement]
Analysis: [comprehensive solution approach]

CONCEPTUAL QUESTIONS:
1. Define ${chapter.toLowerCase()} and explain its importance in ${subject}.
2. Compare different types and their applications.
3. Analyze the role in Pakistani industries.`,
        progress: Math.min(100, Math.max(0, progress - 60))
      },
      mastery: {
        title: 'Common Mistakes & Tips',
        content: `COMMON MISTAKES TO AVOID:

❌ Mistake 1: Confusing ${chapter.toLowerCase()} with related concepts
✅ Correction: Understand the key differences and unique characteristics
📝 Explanation: [Detailed explanation of the distinction]

❌ Mistake 2: Incorrect application of formulas
✅ Correction: Always check units and applicability conditions
📝 Explanation: [Common formula misapplications and how to avoid them]

❌ Mistake 3: Misinterpretation of problem statements
✅ Correction: Read carefully and identify given information
📝 Explanation: [Problem-solving strategy]

MEMORY AIDS & TRICKS:
🧠 Remember the key formula using: [mnemonic device]
🧠 Visual representation: [description of helpful diagram]
🧠 Real-world analogy: [relatable comparison]

EXAM PREPARATION TIPS:
• Practice numerical problems daily (15-20 minutes)
• Understand derivations of key formulas
• Solve past paper questions from ${currentJob.request?.board || 'FBISE'}
• Focus on Pakistani context examples
• Review common mistakes before exams`,
        progress: Math.min(100, Math.max(0, progress - 80))
      }
    };
  };

  const previewContent = generatePreviewContent();
  const sections = Object.entries(previewContent);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isFullscreen ? 'max-w-[95vw] max-h-[95vh]' : 'max-w-5xl max-h-[90vh]'} overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 border-0 shadow-2xl`}>
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Eye className="w-6 h-6 text-purple-500" />
            Notes Preview
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8 p-0"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {currentJob.request?.chapter} - {currentJob.request?.subject}
                </h3>
                <p className="text-gray-600">
                  Class {currentJob.request?.class} • {currentJob.request?.board || 'FBISE'} Board
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">{currentJob.progress}%</div>
                <div className="text-sm text-gray-500">Generated</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <Badge className="bg-green-100 text-green-800">
                <Clock className="w-3 h-3 mr-1" />
                Est. 15-20 min read
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                <FileText className="w-3 h-3 mr-1" />
                Comprehensive Notes
              </Badge>
              <Badge className="bg-purple-100 text-purple-800">
                <Award className="w-3 h-3 mr-1" />
                Pakistani Context
              </Badge>
            </div>
          </div>

          {/* Preview Status */}
          {!canPreview && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-6 text-center">
                <div className="text-yellow-600 text-4xl mb-4">⏳</div>
                <h3 className="text-xl font-semibold text-yellow-800 mb-2">Preview Not Ready</h3>
                <p className="text-yellow-700 mb-4">
                  Preview will be available once generation reaches 30%. Current progress: {currentJob.progress}%
                </p>
                <Progress value={currentJob.progress} className="max-w-md mx-auto" />
              </CardContent>
            </Card>
          )}

          {/* Preview Content */}
          {canPreview && (
            <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm shadow-md">
                <TabsTrigger value="introduction" className="flex items-center gap-1 text-xs">
                  <BookOpen className="w-3 h-3" />
                  Intro
                </TabsTrigger>
                <TabsTrigger value="concepts" className="flex items-center gap-1 text-xs">
                  <Calculator className="w-3 h-3" />
                  Concepts
                </TabsTrigger>
                <TabsTrigger value="applications" className="flex items-center gap-1 text-xs">
                  <Lightbulb className="w-3 h-3" />
                  Apps
                </TabsTrigger>
                <TabsTrigger value="practice" className="flex items-center gap-1 text-xs">
                  <Target className="w-3 h-3" />
                  Practice
                </TabsTrigger>
                <TabsTrigger value="mastery" className="flex items-center gap-1 text-xs">
                  <AlertTriangle className="w-3 h-3" />
                  Tips
                </TabsTrigger>
              </TabsList>

              {sections.map(([key, section]) => (
                <TabsContent key={key} value={key} className="mt-6">
                  <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl text-gray-900">{section.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Progress value={section.progress} className="w-20 h-2" />
                          <span className="text-sm font-medium text-gray-600">
                            {Math.round(section.progress)}%
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className={`${isFullscreen ? 'h-[60vh]' : 'h-[40vh]'} pr-4`}>
                        <div className="space-y-4">
                          {section.content.split('\n\n').map((paragraph, index) => {
                            if (paragraph.trim().startsWith('•')) {
                              return (
                                <ul key={index} className="space-y-2 ml-4">
                                  {paragraph.split('\n').map((item, itemIndex) => (
                                    <li key={itemIndex} className="flex items-start gap-2 text-gray-700">
                                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                                      <span>{item.replace('•', '').trim()}</span>
                                    </li>
                                  ))}
                                </ul>
                              );
                            } else if (paragraph.includes(':') && paragraph.length < 100) {
                              return (
                                <h4 key={index} className="text-lg font-semibold text-gray-800 mt-6 mb-2 border-b border-gray-200 pb-2">
                                  {paragraph}
                                </h4>
                              );
                            } else {
                              return (
                                <p key={index} className="text-gray-700 leading-relaxed">
                                  {paragraph}
                                </p>
                              );
                            }
                          })}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <Button 
              onClick={onClose}
              variant="outline" 
              className="flex-1"
            >
              Close Preview
            </Button>
            {isCompleted && onDownloadPDF && (
              <Button 
                onClick={onDownloadPDF}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Full PDF
              </Button>
            )}
            {!isCompleted && (
              <Button 
                disabled
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF Available When Complete
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
