import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Loader2, AlertCircle, FileText, Search, Download, Zap, CheckSquare } from "lucide-react";
import { JobState } from "@/types/notes";

interface ProgressModalProps {
  isOpen: boolean;
  status: JobState;
  progress: number;
}

const STATUS_MESSAGES: Record<JobState, { label: string; description: string; icon: any }> = {
  RECEIVED: {
    label: "Job Received",
    description: "Your request has been queued for processing",
    icon: CheckSquare,
  },
  VALIDATING_INPUT: {
    label: "Validating Input",
    description: "Checking class, board, subject, and chapter details",
    icon: CheckSquare,
  },
  FETCH_SYLLABUS: {
    label: "Fetching Syllabus",
    description: "Downloading official board syllabus documents",
    icon: Download,
  },
  SYLLABUS_NOT_FOUND: {
    label: "Syllabus Not Found",
    description: "Unable to find syllabus - awaiting confirmation",
    icon: AlertCircle,
  },
  EXTRACT_TOPICS: {
    label: "Extracting Topics",
    description: "Parsing syllabus to extract chapter topics",
    icon: FileText,
  },
  SCRAPE_RESOURCES: {
    label: "Gathering Resources",
    description: "Collecting educational content from trusted sources",
    icon: Search,
  },
  INDEX_EMBED: {
    label: "Processing Content",
    description: "Indexing and embedding content for AI processing",
    icon: Zap,
  },
  RETRIEVE_CONTEXT: {
    label: "Retrieving Context",
    description: "Finding relevant information for each topic",
    icon: Search,
  },
  GENERATE_CONTENT: {
    label: "Generating Notes",
    description: "AI is creating comprehensive notes with examples and questions",
    icon: FileText,
  },
  QC_CHECKS: {
    label: "Quality Checks",
    description: "Validating content quality and completeness",
    icon: CheckSquare,
  },
  NEEDS_RETRY: {
    label: "Retrying Generation",
    description: "Improving content quality - please wait",
    icon: Loader2,
  },
  HUMAN_REVIEW: {
    label: "Under Review",
    description: "Content is being reviewed for quality assurance",
    icon: AlertCircle,
  },
  COMPILE_PDF: {
    label: "Compiling PDF",
    description: "Formatting and finalizing your notes document",
    icon: FileText,
  },
  COMPLETED: {
    label: "Completed!",
    description: "Your comprehensive notes are ready for download",
    icon: CheckCircle2,
  },
  FAILED: {
    label: "Generation Failed",
    description: "Something went wrong. Please try again.",
    icon: AlertCircle,
  },
};

export const ProgressModal = ({ isOpen, status, progress }: ProgressModalProps) => {
  const statusInfo = STATUS_MESSAGES[status] || STATUS_MESSAGES.RECEIVED;
  const isCompleted = status === "COMPLETED";
  const isFailed = status === "FAILED";
  const IconComponent = statusInfo.icon;

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : isFailed ? (
              <AlertCircle className="w-6 h-6 text-red-600" />
            ) : (
              <IconComponent className="w-6 h-6 animate-pulse text-primary" />
            )}
            {statusInfo.label}
          </DialogTitle>
          <DialogDescription className="text-base">
            {statusInfo.description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-center text-muted-foreground">
            {progress}% Complete
          </p>
          {!isCompleted && !isFailed && (
            <p className="text-xs text-center text-muted-foreground">
              This may take 3-5 minutes. Please don't close this window.
            </p>
          )}
          {isCompleted && (
            <p className="text-sm text-center text-green-600 font-medium">
              Your notes are ready! You can now view or download them.
            </p>
          )}
          {isFailed && (
            <p className="text-sm text-center text-red-600 font-medium">
              Please try again or contact support if the issue persists.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};