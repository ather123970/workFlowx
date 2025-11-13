import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Download,
  Share2,
  Award,
  ArrowLeft,
  Clock,
  Target,
  Brain,
  CheckCircle
} from 'lucide-react';

interface StudentFriendlyNotesViewerProps {
  chapter: any; // Our comprehensive chapter data
  onDownload?: () => void;
  onShare?: () => void;
  onBack?: () => void;
}

export const StudentFriendlyNotesViewer: React.FC<StudentFriendlyNotesViewerProps> = ({
  chapter,
  onDownload,
  onShare,
  onBack
}) => {
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(true);

  useEffect(() => {
    // Auto-scroll to top and show success animation
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Hide success animation after 3 seconds
    const timer = setTimeout(() => {
      setShowSuccessAnimation(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!chapter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">No Content Available</h2>
          <p className="text-gray-500 mb-4">Please generate notes first.</p>
          {onBack && (
            <Button onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Generate Notes
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Add error boundary for rendering issues
  try {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-50/50">
      {/* Success Animation */}
      {showSuccessAnimation && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-500">
          <Card className="bg-green-50 border-green-200 shadow-xl">
            <CardContent className="flex items-center gap-3 p-6">
              <Award className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-bold text-green-800 text-lg">🎉 Your Notes Are Ready!</p>
                <p className="text-sm text-green-600">Student-friendly content with examples and practice questions!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div id="comprehensive-notes-content" className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200 shadow-xl mb-6 md:mb-8">
          <CardHeader className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="text-center md:text-left flex-1">
                <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">
                  {chapter.chapter || 'Study Notes'}
                </CardTitle>
                <div className="text-base md:text-lg text-gray-600">
                  Class {chapter.class} • {chapter.board}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-row md:flex-col gap-2 md:gap-3 justify-center md:justify-start">
                {onBack && (
                  <Button variant="outline" onClick={onBack} className="gap-1 md:gap-2 text-xs md:text-sm px-3 md:px-4 py-2 md:min-w-[140px]">
                    <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Generate New</span>
                    <span className="sm:hidden">New</span>
                  </Button>
                )}
                {onShare && (
                  <Button variant="outline" onClick={onShare} className="gap-1 md:gap-2 text-xs md:text-sm px-3 md:px-4 py-2 md:min-w-[140px]">
                    <Share2 className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Share Notes</span>
                    <span className="sm:hidden">Share</span>
                  </Button>
                )}
                {onDownload && (
                  <Button onClick={onDownload} className="gap-1 md:gap-2 text-xs md:text-sm px-3 md:px-4 py-2 md:min-w-[140px] bg-blue-600 hover:bg-blue-700">
                    <Download className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Download PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Content Display */}
        <div className="space-y-8">
          {/* Introduction */}
          {chapter.introduction && (
            <Card className="shadow-lg border-blue-100">
              <CardHeader className="bg-blue-50/50">
                <CardTitle className="text-2xl font-bold text-blue-800 flex items-center gap-2">
                  🌟 Introduction
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose prose-lg max-w-none">
                  <div className="space-y-4">
                    {chapter.introduction.definition && (
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-2">Definition</h4>
                        <p className="text-gray-700 leading-relaxed">{chapter.introduction.definition}</p>
                      </div>
                    )}
                    {chapter.introduction.importance && (
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-2">Importance</h4>
                        <p className="text-gray-700 leading-relaxed">{chapter.introduction.importance}</p>
                      </div>
                    )}
                    {chapter.introduction.overview && (
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-2">Overview</h4>
                        <p className="text-gray-700 leading-relaxed">{chapter.introduction.overview}</p>
                      </div>
                    )}
                    {chapter.introduction.learning_objectives && chapter.introduction.learning_objectives.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-2">Learning Objectives</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          {chapter.introduction.learning_objectives.map((objective, index) => (
                            <li key={index}>{objective}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Core Concepts */}
          {chapter.core_concepts?.types && chapter.core_concepts.types.length > 0 && (
            <Card className="shadow-lg border-green-100">
              <CardHeader className="bg-green-50/50">
                <CardTitle className="text-2xl font-bold text-green-800 flex items-center gap-2">
                  📖 Core Concepts & Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-8">
                  {chapter.core_concepts.types.map((topic: any, index: number) => (
                    <div key={topic.id || index} className="border-l-4 border-blue-400 pl-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        📚 {topic.title}
                      </h3>
                      <div className="prose prose-lg max-w-none">
                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">
                          {topic.content}
                        </div>
                      </div>
                      
                      {/* Examples */}
                      {topic.examples && topic.examples.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
                            📝 Worked Examples
                          </h4>
                          <div className="space-y-4">
                            {topic.examples.map((example: any, exIndex: number) => (
                              <Card key={example.id || exIndex} className="bg-blue-50/30 border-blue-200">
                                <CardContent className="p-4">
                                  <h5 className="font-semibold text-blue-800 mb-2">{example.title}</h5>
                                  <p className="text-gray-700 mb-3">{example.description}</p>
                                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                                    <h6 className="font-medium text-gray-800 mb-2">Solution:</h6>
                                    <div className="text-gray-700 whitespace-pre-wrap text-sm">
                                      {example.solution}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {index < chapter.core_concepts.types.length - 1 && (
                        <Separator className="mt-8" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Formulas */}
          {chapter.core_concepts?.formulas && chapter.core_concepts.formulas.length > 0 && (
            <Card className="shadow-lg border-purple-100">
              <CardHeader className="bg-purple-50/50">
                <CardTitle className="text-2xl font-bold text-purple-800 flex items-center gap-2">
                  📐 Key Formulas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-6">
                  {chapter.core_concepts.formulas.map((formula: any, index: number) => (
                    <Card key={formula.id || index} className="bg-purple-50/30 border-purple-200">
                      <CardContent className="p-6">
                        <h4 className="text-lg font-bold text-purple-800 mb-3">{formula.name}</h4>
                        <div className="bg-white rounded-lg p-4 border border-purple-200 mb-4">
                          <code className="text-lg font-mono text-purple-700">{formula.expression}</code>
                        </div>
                        {formula.variables && formula.variables.length > 0 && (
                          <div>
                            <h5 className="font-semibold text-gray-800 mb-2">Variables:</h5>
                            <div className="space-y-2">
                              {formula.variables.map((variable: any, vIndex: number) => (
                                <div key={vIndex} className="flex items-start gap-3">
                                  <code className="bg-purple-100 px-2 py-1 rounded text-purple-700 font-mono">
                                    {variable.symbol}
                                  </code>
                                  <div>
                                    <span className="font-medium">{variable.name}</span>
                                    {variable.unit && <span className="text-gray-600"> ({variable.unit})</span>}
                                    {variable.description && (
                                      <p className="text-sm text-gray-600 mt-1">{variable.description}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Applications */}
          {chapter.applications?.real_world_examples && chapter.applications.real_world_examples.length > 0 && (
            <Card className="shadow-lg border-orange-100">
              <CardHeader className="bg-orange-50/50">
                <CardTitle className="text-2xl font-bold text-orange-800 flex items-center gap-2">
                  🌍 Real-World Applications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-6">
                  {chapter.applications.real_world_examples.map((app: any, index: number) => (
                    <Card key={app.id || index} className="bg-orange-50/30 border-orange-200">
                      <CardContent className="p-6">
                        <h4 className="text-lg font-bold text-orange-800 mb-3">{app.title}</h4>
                        <p className="text-gray-700 leading-relaxed">{app.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          {chapter.summary && (
            <Card className="shadow-lg border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  📚 Chapter Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose prose-lg max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {chapter.summary}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-12 text-center">
          <div className="flex justify-center gap-4">
            {onDownload && (
              <Button onClick={onDownload} size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700 px-8">
                <Download className="w-5 h-5" />
                Download PDF
              </Button>
            )}
            {onShare && (
              <Button variant="outline" onClick={onShare} size="lg" className="gap-2 px-8">
                <Share2 className="w-5 h-5" />
                Share Notes
              </Button>
            )}
          </div>
          <p className="text-gray-500 mt-4">
            🎉 Great job! You've completed your study notes. Keep practicing and reviewing for best results!
          </p>
        </div>
      </div>
    </div>
  );
  } catch (error) {
    console.error('Error rendering StudentFriendlyNotesViewer:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Display Error</h2>
          <p className="text-gray-500 mb-4">There was an issue displaying your notes.</p>
          {onBack && (
            <Button onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }
};

export default StudentFriendlyNotesViewer;
