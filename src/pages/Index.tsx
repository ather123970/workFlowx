import { useState, useEffect } from "react";
import { StunningHero } from "@/components/StunningHero";
import { EnhancedNotesForm } from "@/components/EnhancedNotesForm";
import { ComprehensiveNotesViewer } from "@/components/ComprehensiveNotesViewer";
import { StudentFriendlyNotesViewer } from "@/components/StudentFriendlyNotesViewer";
import { EnhancedProgressModalV2 } from "@/components/EnhancedProgressModalV2";
import { NotesPreviewModal } from "@/components/NotesPreviewModal";
import { FreeAIInitializer } from "@/components/FreeAIInitializer";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, ArrowUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { learningPlatformService } from "@/services/learningPlatformService";
import { freeNotesGenerationService } from "@/services/freeNotesGenerationService";
import { pdfGenerationService } from "@/services/pdfGenerationService";
import { LearningRequest, ComprehensiveChapter, LearningJob } from "@/types/learning";

const Index = () => {
  const [showHero, setShowHero] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [currentJob, setCurrentJob] = useState<LearningJob | null>(null);
  const [comprehensiveChapter, setComprehensiveChapter] = useState<ComprehensiveChapter | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showNotesViewer, setShowNotesViewer] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequestData, setLastRequestData] = useState<LearningRequest | null>(null);
  const [detailedProgress, setDetailedProgress] = useState<any>(null);
  const { toast } = useToast();

  // Poll job status when jobId is available
  useEffect(() => {
    if (jobId && isGenerating) {
      const pollInterval = setInterval(async () => {
        try {
          // Check free notes generation service for job status
          const freeJob = freeNotesGenerationService.getJobStatus(jobId);
          
          if (freeJob) {
            setCurrentJob(freeJob as any); // Convert to LearningJob format
            setDetailedProgress({
              currentLevel: null,
              overallProgress: freeJob.progress,
              estimatedTimeRemaining: 0,
              totalDataPoints: freeJob.scrapedSources
            });

            if (freeJob.status === 'completed' || freeJob.status === 'failed') {
              clearInterval(pollInterval);
              setIsGenerating(false);
              setShowProgressModal(false);
              
              if (freeJob.status === 'completed' && freeJob.result) {
                console.log('📚 Generated chapter data:', freeJob.result);
                console.log('📚 Setting comprehensiveChapter and showing notes viewer');
                setComprehensiveChapter(freeJob.result);
                setShowNotesViewer(true);
                setShowForm(false);
                setShowHero(false);
                console.log('📚 State updated - showNotesViewer: true, showForm: false, showHero: false');
                
                // Auto-scroll to top
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
                
                toast({
                  title: "✅ FREE Notes Ready!",
                  description: "Your comprehensive notes have been generated using free AI and data sources!",
                });
              } else if (freeJob.status === 'failed') {
                setError(freeJob.error || "Failed to generate notes. Please try again.");
                
                toast({
                  title: "Generation Failed",
                  description: "There was an issue generating your notes. Please try again.",
                  variant: "destructive",
                });
              }
            }
            return; // Exit early since we found the job
          }

          // Fallback to regular service
          const statusResult = learningPlatformService.getJobStatus(jobId);
          
          if (statusResult.job) {
            setCurrentJob(statusResult.job);
            setDetailedProgress(statusResult.detailedProgress);

            if (statusResult.isComplete) {
              clearInterval(pollInterval);
              setIsGenerating(false);
              setShowProgressModal(false);
              
              if (statusResult.job.status === 'completed' && statusResult.result) {
                setComprehensiveChapter(statusResult.result);
                setShowNotesViewer(true);
                
                // Auto-scroll to top
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
                
                toast({
                  title: "✅ Ready to View Notes",
                  description: "Your comprehensive notes have been generated successfully!",
                });
              } else if (statusResult.job.status === 'failed') {
                setError(statusResult.job.error || "Failed to generate notes. Please try again.");
                
                toast({
                  title: "Generation Failed",
                  description: "There was an issue generating your notes. Please try again.",
                  variant: "destructive",
                });
              }
            }
          }
        } catch (error) {
          console.error('Error polling job status:', error);
        }
      }, 2000);

      return () => clearInterval(pollInterval);
    }
  }, [jobId, isGenerating, toast]);

  // Navigation handlers
  const handleGetStarted = () => {
    setShowHero(false);
    setShowForm(true);
  };

  const handleBackToHero = () => {
    setShowHero(true);
    setShowForm(false);
    setShowNotesViewer(false);
    setIsGenerating(false);
    setError(null);
  };

  const handleSubmit = async (data: {
    classGrade: string;
    board: string;
    subject: string;
    chapterName: string;
  }) => {
    console.log('Form submitted with data:', data);
    setIsGenerating(true);
    setError(null);
    setComprehensiveChapter(null);
    setShowNotesViewer(false);
    setShowProgressModal(true);
    
    const request: LearningRequest = {
      class: parseInt(data.classGrade),
      board: data.board,
      subject: data.subject,
      chapter: data.chapterName,
      depth_level: 'intermediate' // Default depth level
    };
    
    setLastRequestData(request);

    try {
      console.log('🚀 Starting notes generation with request:', request);
      // Use the free notes generation service directly
      const jobId = await freeNotesGenerationService.generateFreeNotes(request);
      console.log('🚀 Generated jobId:', jobId);
      
      if (jobId) {
        console.log('✅ JobId received, setting up UI states');
        // Start the generation process
        setJobId(jobId);
        setShowProgressModal(true);
        setShowForm(false); // Hide form during generation
        console.log('✅ UI states set - showProgressModal: true, showForm: false');
        
        // Set initial job state
        setCurrentJob({
          id: jobId,
          request: request,
          status: 'initializing',
          progress: 0,
          currentStep: 'Starting generation process...',
          scrapedSources: 0,
          generatedTopics: 0,
          totalTopics: 0
        } as any);
        
        toast({
          title: "🚀 Starting Generation...",
          description: "Creating your comprehensive, student-friendly notes with detailed explanations and examples!",
        });
        
        console.log('Free notes generation started with ID:', jobId);
      } else {
        console.error('❌ No jobId received from generateFreeNotes');
        setError("Failed to start notes generation. Please try again.");
        setIsGenerating(false);
        setShowProgressModal(false);
        setShowForm(true); // Show form again on error
      }
    } catch (error) {
      console.error("❌ Error generating notes:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
      setIsGenerating(false);
      setShowProgressModal(false);
      setShowForm(true); // Show form again on error
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    if (lastRequestData) {
      const formData = {
        classGrade: lastRequestData.class.toString(),
        board: lastRequestData.board,
        subject: lastRequestData.subject,
        chapterName: lastRequestData.chapter,
      };
      handleSubmit(formData);
    }
  };

  const handleDownloadPDF = async () => {
    if (comprehensiveChapter) {
      try {
        toast({
          title: "🔄 Generating PDF...",
          description: "Please wait while we create your professional PDF document.",
        });

        // Try structured PDF generation first
        try {
          await pdfGenerationService.generatePDF(comprehensiveChapter);
        } catch (structuredError) {
          console.warn("Structured PDF generation failed, trying HTML method:", structuredError);
          
          // Fallback to HTML-based PDF generation
          const fileName = `${comprehensiveChapter.subject}_${comprehensiveChapter.chapter.replace(/[^a-zA-Z0-9]/g, '_')}_Notes.pdf`;
          await pdfGenerationService.generatePDFFromHTML('comprehensive-notes-content', fileName);
        }
        
        toast({
          title: "✅ PDF Downloaded!",
          description: "Your comprehensive notes have been saved as a PDF file.",
        });
      } catch (error: any) {
        console.error("PDF generation error:", error);
        toast({
          title: "Download Failed",
          description: error.message || "Unable to generate PDF. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handlePreviewNotes = () => {
    setShowPreviewModal(true);
  };

  const handleClosePreview = () => {
    setShowPreviewModal(false);
  };

  const handleShareNotes = async () => {
    if (comprehensiveChapter) {
      try {
        if (navigator.share) {
          await navigator.share({
            title: `${comprehensiveChapter.chapter} - ${comprehensiveChapter.subject} Notes`,
            text: `Comprehensive notes for ${comprehensiveChapter.chapter} in ${comprehensiveChapter.subject}`,
            url: window.location.href,
          });
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(window.location.href);
          toast({
            title: "Link Copied",
            description: "Notes link has been copied to clipboard.",
          });
        }
      } catch (error) {
        toast({
          title: "Share Failed",
          description: "Unable to share notes. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <FreeAIInitializer>
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-50/50">
        {/* Show Hero Section */}
        {showHero && (
          <StunningHero onGetStarted={handleGetStarted} />
        )}

        {/* Show Notes Form */}
        {showForm && !showNotesViewer && !isGenerating && (
          <>
            <EnhancedNotesForm onSubmit={handleSubmit} isGenerating={isGenerating} />
            
            {/* Back to Hero Button */}
            <div className="fixed top-6 left-6 z-50">
              <Button
                onClick={handleBackToHero}
                variant="outline"
                className="bg-white/80 backdrop-blur-sm border-gray-300 hover:bg-white"
              >
                <ArrowUp className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>

            {/* Error Display */}
            {error && !isGenerating && (
              <div className="fixed bottom-6 right-6 max-w-md z-50">
                <Alert variant="destructive" className="shadow-2xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Generation Failed</AlertTitle>
                  <AlertDescription className="mt-2">
                    {error}
                    <div className="mt-4">
                      <Button onClick={handleRetry} variant="outline" size="sm" className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </>
        )}

        {/* Show Notes Viewer */}
        {showNotesViewer && comprehensiveChapter && (
          <>
            <StudentFriendlyNotesViewer 
              chapter={comprehensiveChapter}
              onDownload={handleDownloadPDF}
              onShare={handleShareNotes}
              onBack={() => {
                setShowNotesViewer(false);
                setShowForm(true);
                setComprehensiveChapter(null);
              }}
            />
          </>
        )}

        {/* Debug: Show when notes viewer should be visible but isn't */}
        {showNotesViewer && !comprehensiveChapter && (
          <div className="min-h-screen flex items-center justify-center bg-red-50">
            <div className="text-center p-8">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Debug: Notes Viewer Issue</h2>
              <p className="text-red-500 mb-4">showNotesViewer is true but comprehensiveChapter is null</p>
              <Button onClick={() => {
                setShowNotesViewer(false);
                setShowForm(true);
              }}>
                Back to Form
              </Button>
            </div>
          </div>
        )}

        {/* Debug: Show current state */}
        {!showHero && !showForm && !showNotesViewer && !isGenerating && (
          <div className="min-h-screen flex items-center justify-center bg-yellow-50">
            <div className="text-center p-8">
              <h2 className="text-2xl font-bold text-yellow-600 mb-4">Debug: No Component Showing</h2>
              <p className="text-yellow-500 mb-4">
                Hero: {showHero ? 'true' : 'false'}, 
                Form: {showForm ? 'true' : 'false'}, 
                NotesViewer: {showNotesViewer ? 'true' : 'false'}, 
                Generating: {isGenerating ? 'true' : 'false'}
              </p>
              <p className="text-yellow-500 mb-4">
                Chapter exists: {comprehensiveChapter ? 'true' : 'false'}
              </p>
              <Button onClick={() => {
                setShowHero(true);
                setShowForm(false);
                setShowNotesViewer(false);
              }}>
                Back to Home
              </Button>
            </div>
          </div>
        )}

        {/* Loading Screen for Generation */}
        {isGenerating && !showProgressModal && (
          <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">🚀 Starting Generation...</h2>
              <p className="text-gray-600">Setting up your personalized learning experience</p>
            </div>
          </div>
        )}

        {/* Enhanced Progress Modal */}
        <EnhancedProgressModalV2 
          isOpen={showProgressModal}
          currentJob={currentJob}
          detailedProgress={detailedProgress}
          onPreviewNotes={handlePreviewNotes}
          onDownloadPDF={handleDownloadPDF}
        />

        {/* Notes Preview Modal */}
        <NotesPreviewModal 
          isOpen={showPreviewModal}
          onClose={handleClosePreview}
          currentJob={currentJob}
          onDownloadPDF={handleDownloadPDF}
        />
      </div>
    </FreeAIInitializer>
  );
};

export default Index;