import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Brain, 
  Database, 
  FileText, 
  CheckCircle, 
  Loader2, 
  Clock,
  Zap,
  BookOpen,
  Download,
  Sparkles
} from 'lucide-react';

interface EnhancedProgressModalProps {
  isOpen: boolean;
  currentJob: any;
  detailedProgress: any;
}

export const EnhancedProgressModal: React.FC<EnhancedProgressModalProps> = ({
  isOpen,
  currentJob,
  detailedProgress
}) => {
  if (!currentJob) return null;

  const getStepIcon = (step: string, isActive: boolean, isCompleted: boolean) => {
    if (isCompleted) return <CheckCircle className="w-6 h-6 text-green-500" />;
    if (isActive) return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
    
    switch (step) {
      case 'scraping': return <Database className="w-6 h-6 text-gray-400" />;
      case 'processing': return <Brain className="w-6 h-6 text-gray-400" />;
      case 'generating': return <FileText className="w-6 h-6 text-gray-400" />;
      case 'finalizing': return <Sparkles className="w-6 h-6 text-gray-400" />;
      default: return <Loader2 className="w-6 h-6 text-gray-400" />;
    }
  };

  const steps = [
    { 
      key: 'scraping', 
      title: 'Gathering Educational Content', 
      description: 'Scraping Pakistani board websites and educational resources',
      progress: currentJob.status === 'scraping' ? currentJob.progress : currentJob.status === 'initializing' ? 0 : 100
    },
    { 
      key: 'processing', 
      title: 'Processing Content', 
      description: 'Analyzing and structuring educational material',
      progress: currentJob.status === 'processing' ? currentJob.progress : ['generating', 'finalizing', 'completed'].includes(currentJob.status) ? 100 : 0
    },
    { 
      key: 'generating', 
      title: 'AI Content Generation', 
      description: 'Creating comprehensive notes with free AI models',
      progress: currentJob.status === 'generating' ? currentJob.progress : currentJob.status === 'completed' ? 100 : 0
    },
    { 
      key: 'finalizing', 
      title: 'Finalizing Notes', 
      description: 'Formatting and preparing downloadable content',
      progress: currentJob.status === 'finalizing' ? currentJob.progress : currentJob.status === 'completed' ? 100 : 0
    }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentJob.status);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50 border-0 shadow-2xl">
        <div className="space-y-8 p-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Generating Your FREE AI Notes
            </h2>
            <p className="text-lg text-gray-600">
              Creating comprehensive study notes for {currentJob.request?.subject} - {currentJob.request?.chapter}
            </p>
            <Badge className="bg-green-100 text-green-800 border-green-300 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              100% FREE • No API Keys Required
            </Badge>
          </div>

          {/* Overall Progress */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Overall Progress</h3>
                <span className="text-2xl font-bold text-purple-600">{currentJob.progress}%</span>
              </div>
              <Progress value={currentJob.progress} className="h-3 mb-4" />
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{currentJob.currentStep}</span>
              </div>
            </CardContent>
          </Card>

          {/* Step Progress */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Generation Steps</h3>
            {steps.map((step, index) => {
              const isActive = currentJob.status === step.key;
              const isCompleted = index < currentStepIndex || currentJob.status === 'completed';
              
              return (
                <Card 
                  key={step.key}
                  className={`transition-all duration-300 ${
                    isActive 
                      ? 'bg-blue-50 border-blue-200 shadow-lg scale-105' 
                      : isCompleted 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-white/60 border-gray-200'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {getStepIcon(step.key, isActive, isCompleted)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">{step.title}</h4>
                        <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                        <div className="flex items-center gap-3">
                          <Progress value={step.progress} className="flex-1 h-2" />
                          <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
                            {Math.round(step.progress)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Statistics */}
          {(currentJob.scrapedSources > 0 || currentJob.generatedTopics > 0) && (
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-500" />
                  Generation Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {currentJob.scrapedSources || 0}
                    </div>
                    <div className="text-sm text-gray-600">Sources Found</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {currentJob.generatedTopics || 0}
                    </div>
                    <div className="text-sm text-gray-600">Topics Generated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {currentJob.totalTopics || 8}
                    </div>
                    <div className="text-sm text-gray-600">Total Topics</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      FREE
                    </div>
                    <div className="text-sm text-gray-600">AI Model</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Model Info */}
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-500" />
                FREE AI Model Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">AI Provider:</span>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                    Free AI (Ollama/Transformers.js/HuggingFace)
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cost:</span>
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    $0.00 - Completely FREE
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Content Quality:</span>
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                    Comprehensive (15-50+ lines per topic)
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What's Being Generated */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-500" />
                What's Being Generated
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Comprehensive definitions</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Detailed explanations (15-50+ lines)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Pakistani context examples</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Practice questions with solutions</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Common mistakes and corrections</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Memory aids and tricks</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Professional PDF format</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Board curriculum alignment</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completion Message */}
          {currentJob.status === 'completed' && (
            <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-xl">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Notes Generated Successfully! 🎉</h3>
                <p className="text-green-100 mb-4">
                  Your comprehensive study notes are ready to view and download
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  <span>Professional PDF available for download</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Message */}
          {currentJob.status === 'failed' && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-6 text-center">
                <div className="text-red-500 text-4xl mb-4">❌</div>
                <h3 className="text-xl font-semibold text-red-800 mb-2">Generation Failed</h3>
                <p className="text-red-600 mb-4">
                  {currentJob.error || 'An error occurred during notes generation'}
                </p>
                <p className="text-red-500 text-sm">
                  Please try again or contact support if the issue persists
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
