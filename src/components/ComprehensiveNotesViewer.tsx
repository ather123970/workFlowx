import React, { useState, useEffect } from 'react';
import { ComprehensiveChapter, TopicSection, Example, Formula } from '@/types/learning';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronDown, 
  ChevronRight, 
  BookOpen, 
  Lightbulb, 
  Target, 
  Calculator, 
  AlertTriangle,
  TrendingUp,
  Clock,
  Award,
  Download,
  Share2
} from 'lucide-react';

interface ComprehensiveNotesViewerProps {
  chapter: ComprehensiveChapter;
  onDownload?: () => void;
  onShare?: () => void;
}

export const ComprehensiveNotesViewer: React.FC<ComprehensiveNotesViewerProps> = ({
  chapter,
  onDownload,
  onShare
}) => {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['introduction']));
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

  const toggleSection = (sectionId: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId);
    } else {
      newOpenSections.add(sectionId);
    }
    setOpenSections(newOpenSections);
  };

  const renderExample = (example: Example) => (
    <div key={example.id} className="bg-blue-50 border-l-4 border-blue-400 p-4 my-3">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant={example.difficulty === 'easy' ? 'secondary' : example.difficulty === 'medium' ? 'default' : 'destructive'}>
          {example.difficulty}
        </Badge>
        <span className="font-medium text-blue-800">{example.title}</span>
      </div>
      <p className="text-blue-700 mb-2">{example.description}</p>
      {example.solution && (
        <div className="bg-blue-100 p-3 rounded mt-2">
          <strong className="text-blue-800">Solution:</strong>
          <p className="text-blue-700 mt-1">{example.solution}</p>
        </div>
      )}
    </div>
  );

  const renderFormula = (formula: Formula) => (
    <div key={formula.id} className="bg-green-50 border border-green-200 rounded-lg p-4 my-3">
      <h4 className="font-semibold text-green-800 mb-2">{formula.name}</h4>
      <div className="bg-white p-3 rounded border font-mono text-lg text-center mb-3">
        {formula.expression}
      </div>
      <div className="space-y-2">
        <h5 className="font-medium text-green-700">Variables:</h5>
        {formula.variables.map((variable, index) => (
          <div key={index} className="flex items-start gap-2 text-sm">
            <code className="bg-green-100 px-2 py-1 rounded font-mono">{variable.symbol}</code>
            <div>
              <span className="font-medium">{variable.name}</span>
              {variable.unit && <span className="text-gray-600"> ({variable.unit})</span>}
              <p className="text-gray-600 text-xs">{variable.description}</p>
            </div>
          </div>
        ))}
      </div>
      {formula.applications.length > 0 && (
        <div className="mt-3">
          <h5 className="font-medium text-green-700 mb-1">Applications:</h5>
          <div className="flex flex-wrap gap-1">
            {formula.applications.map((app, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {app}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderTopicSection = (section: TopicSection) => (
    <div key={section.id} className="mb-4">
      <h4 className="font-semibold text-gray-800 mb-2">{section.title}</h4>
      {Array.isArray(section.content) ? (
        <ul className="space-y-2">
          {section.content.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-700 leading-relaxed">{section.content}</p>
      )}
      
      {section.examples && section.examples.length > 0 && (
        <div className="mt-3">
          {section.examples.map(renderExample)}
        </div>
      )}
      
      {section.subtopics && section.subtopics.length > 0 && (
        <div className="mt-4 ml-4 border-l-2 border-gray-200 pl-4">
          {section.subtopics.map(subtopic => (
            <div key={subtopic.id} className="mb-3">
              <h5 className="font-medium text-gray-700 mb-1">{subtopic.title}</h5>
              <p className="text-gray-600 text-sm">{subtopic.content}</p>
              {subtopic.examples && subtopic.examples.map(renderExample)}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div id="comprehensive-notes-content" className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Success Animation */}
      {showSuccessAnimation && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-500">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="flex items-center gap-3 p-4">
              <Award className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800">✅ Ready to View Notes</p>
                <p className="text-sm text-green-600">Complete content generated successfully! PDF download available.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
                {chapter.chapter}
              </CardTitle>
              <CardDescription className="text-lg">
                {chapter.subject} {chapter.class && `• Class ${chapter.class}`} {chapter.board && `• ${chapter.board}`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {onShare && (
                <Button variant="outline" onClick={onShare} className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              )}
              {onDownload && (
                <Button onClick={onDownload} className="gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
              )}
            </div>
          </div>
          
          {/* Metadata */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {chapter.metadata.estimated_reading_time} min read
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {chapter.metadata.word_count.toLocaleString()} words
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {chapter.metadata.completeness_score}% complete
            </div>
            <Badge variant="secondary">
              {chapter.metadata.difficulty_level}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Introduction Section */}
      <Card>
        <Collapsible 
          open={openSections.has('introduction')} 
          onOpenChange={() => toggleSection('introduction')}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  <CardTitle>Introduction & Overview</CardTitle>
                </div>
                {openSections.has('introduction') ? 
                  <ChevronDown className="w-5 h-5" /> : 
                  <ChevronRight className="w-5 h-5" />
                }
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Definition</h4>
                <p className="text-gray-700 leading-relaxed">{chapter.introduction.definition}</p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Why Study This?</h4>
                <p className="text-gray-700 leading-relaxed">{chapter.introduction.importance}</p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">What You'll Learn</h4>
                <ul className="space-y-2">
                  {chapter.introduction.learning_objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Core Concepts Section */}
      <Card>
        <Collapsible 
          open={openSections.has('core_concepts')} 
          onOpenChange={() => toggleSection('core_concepts')}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calculator className="w-6 h-6 text-green-600" />
                  <CardTitle>Core Concepts & Formulas</CardTitle>
                </div>
                {openSections.has('core_concepts') ? 
                  <ChevronDown className="w-5 h-5" /> : 
                  <ChevronRight className="w-5 h-5" />
                }
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Types */}
              {chapter.core_concepts.types.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Types & Classifications</h3>
                  {chapter.core_concepts.types.map(renderTopicSection)}
                </div>
              )}
              
              {/* Formulas */}
              {chapter.core_concepts.formulas.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Formulas</h3>
                  {chapter.core_concepts.formulas.map(renderFormula)}
                </div>
              )}
              
              {/* Laws & Principles */}
              {chapter.core_concepts.laws_principles.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Laws & Principles</h3>
                  {chapter.core_concepts.laws_principles.map(renderTopicSection)}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Applications Section */}
      <Card>
        <Collapsible 
          open={openSections.has('applications')} 
          onOpenChange={() => toggleSection('applications')}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lightbulb className="w-6 h-6 text-yellow-600" />
                  <CardTitle>Real-World Applications</CardTitle>
                </div>
                {openSections.has('applications') ? 
                  <ChevronDown className="w-5 h-5" /> : 
                  <ChevronRight className="w-5 h-5" />
                }
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Real-world Examples */}
              {chapter.applications.real_world_examples.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Real-World Examples</h3>
                  {chapter.applications.real_world_examples.map(renderExample)}
                </div>
              )}
              
              {/* Comparisons */}
              {chapter.applications.comparisons.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Comparisons</h3>
                  {chapter.applications.comparisons.map(renderTopicSection)}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Practice Section */}
      <Card>
        <Collapsible 
          open={openSections.has('practice')} 
          onOpenChange={() => toggleSection('practice')}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-purple-600" />
                  <CardTitle>Practice & Examples</CardTitle>
                </div>
                {openSections.has('practice') ? 
                  <ChevronDown className="w-5 h-5" /> : 
                  <ChevronRight className="w-5 h-5" />
                }
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Numerical Examples */}
              {chapter.practice.numerical_examples.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Numerical Examples</h3>
                  {chapter.practice.numerical_examples.map(renderExample)}
                </div>
              )}
              
              {/* Conceptual Questions */}
              {chapter.practice.conceptual_questions.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Conceptual Questions</h3>
                  {chapter.practice.conceptual_questions.map(renderExample)}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Mastery Section */}
      <Card>
        <Collapsible 
          open={openSections.has('mastery')} 
          onOpenChange={() => toggleSection('mastery')}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <CardTitle>Common Mistakes & Mastery Tips</CardTitle>
                </div>
                {openSections.has('mastery') ? 
                  <ChevronDown className="w-5 h-5" /> : 
                  <ChevronRight className="w-5 h-5" />
                }
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Common Mistakes */}
              {chapter.mastery.common_mistakes.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Common Mistakes</h3>
                  {chapter.mastery.common_mistakes.map(mistake => (
                    <div key={mistake.id} className="bg-red-50 border-l-4 border-red-400 p-4 my-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-red-800 mb-1">❌ {mistake.mistake}</h4>
                          <p className="text-red-700 mb-2">✅ <strong>Correction:</strong> {mistake.correction}</p>
                          <p className="text-red-600 text-sm mb-2">{mistake.explanation}</p>
                          {mistake.example && (
                            <div className="bg-red-100 p-2 rounded text-sm">
                              <strong>Example:</strong> {mistake.example}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Conceptual Tricks */}
              {chapter.mastery.conceptual_tricks.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Conceptual Tricks</h3>
                  {chapter.mastery.conceptual_tricks.map(trick => (
                    <div key={trick.id} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-3">
                      <h4 className="font-semibold text-yellow-800 mb-2">💡 {trick.title}</h4>
                      <p className="text-yellow-700 mb-2">{trick.description}</p>
                      {trick.mnemonic && (
                        <p className="text-yellow-600 text-sm mb-2">
                          <strong>Memory Aid:</strong> {trick.mnemonic}
                        </p>
                      )}
                      <div className="bg-yellow-100 p-2 rounded text-sm">
                        <strong>Example:</strong> {trick.example}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Memory Aids */}
              {chapter.mastery.memory_aids.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Memory Aids</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {chapter.mastery.memory_aids.map((aid, index) => (
                      <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-purple-600">🧠</span>
                          <span className="text-purple-800 font-medium">{aid}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};
