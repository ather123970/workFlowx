import React from 'react';
import { LearningJob, DataGatheringStatus } from '@/types/learning';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Loader2, 
  Clock, 
  Database, 
  Brain, 
  Search, 
  BookOpen,
  Target,
  AlertTriangle
} from 'lucide-react';

interface AdvancedProgressTrackerProps {
  job: LearningJob;
  detailedProgress: {
    currentLevel: DataGatheringStatus | null;
    overallProgress: number;
    estimatedTimeRemaining: number;
    totalDataPoints: number;
  };
}

export const AdvancedProgressTracker: React.FC<AdvancedProgressTrackerProps> = ({
  job,
  detailedProgress
}) => {
  const getLevelIcon = (level: number) => {
    const icons = [
      BookOpen,    // Level 1: Core definition
      Database,    // Level 2: Types, formulas
      Target,      // Level 3: Real-world examples
      Search,      // Level 4: Related topics
      Brain,       // Level 5: Practice questions
      AlertTriangle // Level 6: Common mistakes
    ];
    return icons[level - 1] || BookOpen;
  };

  const getLevelColor = (level: number, completed: boolean) => {
    if (completed) return 'text-green-600';
    if (level === job.current_level) return 'text-blue-600';
    return 'text-gray-400';
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStatusMessage = (status: string): string => {
    const messages: Record<string, string> = {
      'gathering': '🔄 Collecting detailed knowledge...',
      'processing': '⚙️ Processing gathered data...',
      'structuring': '📋 Structuring comprehensive content...',
      'finalizing': '✨ Finalizing and validating content...',
      'completed': '✅ Content generation completed!',
      'failed': '❌ Generation failed'
    };
    return messages[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Main Progress Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {job.status === 'completed' ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : job.status === 'failed' ? (
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                ) : (
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                )}
                Generating: {job.request.chapter}
              </CardTitle>
              <CardDescription>
                {job.request.subject} • {job.request.class && `Class ${job.request.class}`} • {job.request.depth_level || 'Intermediate'} Level
              </CardDescription>
            </div>
            <Badge variant={job.status === 'completed' ? 'default' : job.status === 'failed' ? 'destructive' : 'secondary'}>
              {job.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">{job.progress}%</span>
            </div>
            <Progress value={job.progress} className="h-3" />
          </div>

          {/* Status Message */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-blue-800 font-medium">{getStatusMessage(job.status)}</p>
            {detailedProgress.estimatedTimeRemaining > 0 && job.status !== 'completed' && (
              <div className="flex items-center gap-2 mt-2 text-blue-600 text-sm">
                <Clock className="w-4 h-4" />
                Estimated time remaining: {formatTime(detailedProgress.estimatedTimeRemaining)}
              </div>
            )}
          </div>

          {/* Data Points Collected */}
          {detailedProgress.totalDataPoints > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Data points collected:</span>
              <Badge variant="outline">{detailedProgress.totalDataPoints}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data Gathering Progress</CardTitle>
          <CardDescription>
            Multi-layered content collection across 6 comprehensive levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {job.gathering_status.map((levelStatus, index) => {
              const LevelIcon = getLevelIcon(levelStatus.level);
              const isActive = levelStatus.level === job.current_level;
              const isCompleted = levelStatus.completed;
              
              return (
                <div 
                  key={levelStatus.level}
                  className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                    isActive ? 'bg-blue-50 border-2 border-blue-200' : 
                    isCompleted ? 'bg-green-50 border border-green-200' : 
                    'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className={`flex-shrink-0 ${getLevelColor(levelStatus.level, isCompleted)}`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : isActive ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <LevelIcon className="w-6 h-6" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">
                        Level {levelStatus.level}: {levelStatus.description}
                      </h4>
                      <div className="flex items-center gap-2">
                        {levelStatus.data_points_collected > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {levelStatus.data_points_collected} points
                          </Badge>
                        )}
                        <span className="text-sm text-gray-600">
                          {levelStatus.progress}%
                        </span>
                      </div>
                    </div>
                    
                    <Progress 
                      value={levelStatus.progress} 
                      className={`h-2 ${
                        isCompleted ? '[&>div]:bg-green-500' :
                        isActive ? '[&>div]:bg-blue-500' : 
                        '[&>div]:bg-gray-300'
                      }`}
                    />
                    
                    {isActive && levelStatus.estimated_remaining_time > 0 && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                        <Clock className="w-3 h-3" />
                        ~{formatTime(levelStatus.estimated_remaining_time)} remaining
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Level Descriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What Each Level Covers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Level 1:</strong> Core definition and introduction
                  <p className="text-gray-600 text-xs">Fundamental concepts and importance</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Database className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Level 2:</strong> Types, formulas, laws, components
                  <p className="text-gray-600 text-xs">Mathematical foundations and classifications</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Target className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Level 3:</strong> Real-world examples and differences
                  <p className="text-gray-600 text-xs">Practical applications and comparisons</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Search className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Level 4:</strong> Related chapters and connections
                  <p className="text-gray-600 text-xs">Knowledge network and prerequisites</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Brain className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Level 5:</strong> Numerical examples and questions
                  <p className="text-gray-600 text-xs">Practice problems and solutions</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Level 6:</strong> Common mistakes and mastery
                  <p className="text-gray-600 text-xs">Pitfalls, tricks, and visual understanding</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
