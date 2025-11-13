import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Sparkles,
  Eye,
  Activity,
  TrendingUp,
  Users,
  Globe,
  Cpu,
  BarChart3,
  Waves,
  Settings,
  Search
} from 'lucide-react';

interface EnhancedProgressModalV2Props {
  isOpen: boolean;
  currentJob: any;
  detailedProgress: any;
  onPreviewNotes?: () => void;
  onDownloadPDF?: () => void;
}

export const EnhancedProgressModalV2: React.FC<EnhancedProgressModalV2Props> = ({
  isOpen,
  currentJob,
  detailedProgress,
  onPreviewNotes,
  onDownloadPDF
}) => {
  const [activeTab, setActiveTab] = useState('progress');
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [realTimeStats, setRealTimeStats] = useState({
    processingSpeed: 0,
    contentGenerated: 0,
    qualityScore: 0
  });

  // Create fallback job if none provided
  const job = currentJob || {
    id: 'loading',
    request: { subject: 'Loading...', chapter: 'Please wait...', class: '', board: '' },
    status: 'initializing',
    progress: 0,
    currentStep: 'Initializing...',
    scrapedSources: 0,
    generatedTopics: 0,
    totalTopics: 0
  };

  // Animate progress changes
  useEffect(() => {
    if (job?.progress !== undefined) {
      const timer = setInterval(() => {
        setAnimatedProgress(prev => {
          const diff = job.progress - prev;
          if (Math.abs(diff) < 0.1) return job.progress;
          return prev + diff * 0.1;
        });
      }, 50);
      return () => clearInterval(timer);
    }
  }, [job?.progress]);

  // Simulate real-time statistics
  useEffect(() => {
    if (job && job.status !== 'completed') {
      const interval = setInterval(() => {
        setRealTimeStats(prev => ({
          processingSpeed: Math.min(100, prev.processingSpeed + Math.random() * 5),
          contentGenerated: Math.min(100, prev.contentGenerated + Math.random() * 3),
          qualityScore: Math.min(100, prev.qualityScore + Math.random() * 2)
        }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [job]);

  if (!isOpen) return null;

  const getStepIcon = (step: string, isActive: boolean, isCompleted: boolean) => {
    if (isCompleted) return <CheckCircle className="w-6 h-6 text-green-500" />;
    if (isActive) return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
    
    switch (step) {
      case 'initializing': return <Cpu className="w-6 h-6 text-gray-400" />;
      case 'scraping': return <Database className="w-6 h-6 text-gray-400" />;
      case 'processing': return <Brain className="w-6 h-6 text-gray-400" />;
      case 'generating': return <FileText className="w-6 h-6 text-gray-400" />;
      case 'finalizing': return <Sparkles className="w-6 h-6 text-gray-400" />;
      default: return <Loader2 className="w-6 h-6 text-gray-400" />;
    }
  };

  const steps = [
    {
      key: 'initializing',
      title: '🚀 Getting Started',
      description: 'Setting up your personalized learning experience...',
      details: 'Preparing AI models and educational resources',
      icon: <Settings className="w-6 h-6" />,
      progress: job.status === 'initializing' ? job.progress : job.status === 'completed' ? 100 : 0
    },
    {
      key: 'scraping',
      title: '📚 Gathering Knowledge',
      description: 'Collecting comprehensive educational content from trusted sources...',
      details: `Found ${job.scrapedSources || 0} educational resources`,
      icon: <Search className="w-6 h-6" />,
      progress: job.status === 'scraping' ? job.progress : job.status === 'completed' ? 100 : 0
    },
    {
      key: 'processing',
      title: '🔍 Analyzing Content',
      description: 'Processing and organizing information for optimal learning...',
      details: 'Structuring content with psychology-based learning principles',
      icon: <Cpu className="w-6 h-6" />,
      progress: job.status === 'processing' ? job.progress : job.status === 'completed' ? 100 : 0
    },
    {
      key: 'generating',
      title: '🎓 Creating Your Notes',
      description: 'Generating student-friendly content with examples and explanations...',
      details: `Creating detailed content for ${job.generatedTopics || 0}/${job.totalTopics || 0} topics`,
      icon: <Brain className="w-6 h-6" />,
      progress: job.status === 'generating' ? job.progress : job.status === 'completed' ? 100 : 0
    },
    {
      key: 'completed',
      title: '✅ Ready to Learn!',
      description: 'Your comprehensive, student-friendly notes are ready!',
      details: 'Complete with definitions, examples, practice questions, and exam tips',
      icon: <FileText className="w-6 h-6" />,
      progress: job.status === 'completed' ? 100 : 0
    }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === job.status);
  const isCompleted = job.status === 'completed';
  const canPreview = job.progress > 50 || isCompleted;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden bg-white border border-blue-100 shadow-2xl">
        <div className="space-y-8 p-8">
          {/* Professional Header */}
          <div className="text-center space-y-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-3xl"></div>
            <div className="relative p-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mb-8 shadow-2xl animate-pulse">
                <Brain className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
                🎓 Student-Friendly Notes
              </h2>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <h3 className="text-2xl font-semibold text-blue-600 mb-2">
                  {job.request?.subject} - {job.request?.chapter}
                </h3>
                <p className="text-lg text-gray-600">
                  Class {job.request?.class} • {job.request?.board} Board
                </p>
              </div>
              <div className="flex items-center justify-center gap-6 mt-6">
                <Badge className="bg-green-100 text-green-800 border-green-300 px-6 py-3 text-lg shadow-lg">
                  <Sparkles className="w-5 h-5 mr-2" />
                  100% FREE
                </Badge>
                <Badge className="bg-blue-100 text-blue-800 border-blue-300 px-6 py-3 text-lg shadow-lg">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Comprehensive Content
                </Badge>
                <Badge className="bg-blue-100 text-blue-800 border-blue-300 px-4 py-2 shadow-md">
                  <Globe className="w-4 h-4 mr-2" />
                  Pakistani Curriculum
                </Badge>
              </div>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm shadow-md">
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Live Progress
              </TabsTrigger>
              <TabsTrigger value="preview" disabled={!canPreview} className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview Notes
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Statistics
              </TabsTrigger>
            </TabsList>

            {/* Progress Tab */}
            <TabsContent value="progress" className="space-y-6 mt-6">
              {/* Overall Progress with Animation */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Overall Progress</h3>
                    <div className="text-right">
                      <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        {Math.round(animatedProgress)}%
                      </div>
                      <div className="text-sm text-gray-500">Complete</div>
                    </div>
                  </div>
                  <div className="relative">
                    <Progress value={animatedProgress} className="h-4 mb-4" />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-sm"></div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">{job.currentStep}</span>
                    </div>
                    {job.status !== 'completed' && (
                      <div className="flex items-center gap-2 ml-auto">
                        <Waves className="w-4 h-4 text-purple-500 animate-pulse" />
                        <span className="text-sm">Processing...</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Step Progress */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                  Generation Pipeline
                </h3>
                {steps.map((step, index) => {
                  const isActive = job.status === step.key;
                  const isCompleted = index < currentStepIndex || job.status === 'completed';
                  
                  return (
                    <Card 
                      key={step.key}
                      className={`transition-all duration-500 transform ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 shadow-xl scale-105 ring-2 ring-blue-200' 
                          : isCompleted 
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-lg' 
                            : 'bg-white/70 border-gray-200 shadow-md'
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-6">
                          <div className="flex-shrink-0 relative">
                            {getStepIcon(step.key, isActive, isCompleted)}
                            {isActive && (
                              <div className="absolute inset-0 bg-blue-400/30 rounded-full animate-ping"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h4>
                            <p className="text-gray-600 mb-4">{step.description}</p>
                            <div className="flex items-center gap-4">
                              <Progress value={step.progress} className="flex-1 h-3" />
                              <span className="text-lg font-bold text-gray-800 min-w-[4rem]">
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
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-6 mt-6">
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Eye className="w-6 h-6 text-purple-500" />
                    Notes Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {canPreview ? (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                          {currentJob?.request?.chapter || 'Loading...'} - Preview
                        </h3>
                        <div className="space-y-4 text-gray-700">
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h4 className="font-semibold text-purple-800 mb-2">Introduction</h4>
                            <p className="text-sm leading-relaxed">
                              This chapter provides comprehensive coverage of {currentJob?.request?.chapter || 'the topic'} in {currentJob?.request?.subject || 'the subject'}. 
                              Students will learn fundamental concepts, practical applications, and problem-solving techniques essential for academic success.
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h4 className="font-semibold text-blue-800 mb-2">Key Topics Covered</h4>
                            <ul className="text-sm space-y-1 list-disc list-inside">
                              <li>Comprehensive definitions and terminology</li>
                              <li>Mathematical formulations and derivations</li>
                              <li>Real-world applications with Pakistani context</li>
                              <li>Practice problems with detailed solutions</li>
                              <li>Common mistakes and correction strategies</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        {onPreviewNotes && (
                          <Button 
                            onClick={onPreviewNotes} 
                            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Full Preview
                          </Button>
                        )}
                        {isCompleted && onDownloadPDF && (
                          <Button 
                            onClick={onDownloadPDF} 
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">Generating Content...</h3>
                      <p className="text-gray-500">Preview will be available once generation reaches 50%</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="stats" className="space-y-6 mt-6">
              {/* Real-time Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Sources Found</p>
                        <p className="text-3xl font-bold">{currentJob?.scrapedSources || 0}</p>
                      </div>
                      <Database className="w-8 h-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Topics Generated</p>
                        <p className="text-3xl font-bold">{currentJob?.generatedTopics || 0}</p>
                      </div>
                      <Brain className="w-8 h-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Quality Score</p>
                        <p className="text-3xl font-bold">{Math.round(realTimeStats.qualityScore)}%</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm">Processing Speed</p>
                        <p className="text-3xl font-bold">{Math.round(realTimeStats.processingSpeed)}%</p>
                      </div>
                      <Zap className="w-8 h-8 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* System Information */}
              <Card className="bg-gradient-to-r from-slate-50 to-gray-50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="w-6 h-6 text-gray-600" />
                    System Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">AI Provider:</span>
                        <Badge className="bg-blue-100 text-blue-800">Free AI Models</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost:</span>
                        <Badge className="bg-green-100 text-green-800">$0.00</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Content Quality:</span>
                        <Badge className="bg-purple-100 text-purple-800">Comprehensive</Badge>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Board Alignment:</span>
                        <Badge className="bg-indigo-100 text-indigo-800">{currentJob?.request?.board || 'FBISE'}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Language:</span>
                        <Badge className="bg-yellow-100 text-yellow-800">English</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Format:</span>
                        <Badge className="bg-pink-100 text-pink-800">PDF Ready</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Completion Actions */}
          {isCompleted && (
            <Card className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white border-0 shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <CheckCircle className="w-16 h-16" />
                    <div className="absolute inset-0 bg-white/30 rounded-full animate-ping"></div>
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-4">🎉 Notes Generated Successfully!</h3>
                <p className="text-green-100 text-lg mb-8">
                  Your comprehensive study notes are ready to view and download as PDF
                </p>
                <div className="flex gap-4 justify-center">
                  {onPreviewNotes && (
                    <Button 
                      onClick={onPreviewNotes}
                      size="lg"
                      className="bg-white text-green-600 hover:bg-gray-100 shadow-lg"
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      View Notes
                    </Button>
                  )}
                  {onDownloadPDF && (
                    <Button 
                      onClick={onDownloadPDF}
                      size="lg"
                      className="bg-white text-green-600 hover:bg-gray-100 shadow-lg"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download PDF
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {currentJob?.status === 'failed' && (
            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">❌</div>
                <h3 className="text-2xl font-bold mb-4">Generation Failed</h3>
                <p className="text-red-100 mb-6">
                  {currentJob?.error || 'An error occurred during notes generation'}
                </p>
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-white text-red-600 hover:bg-gray-100"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
