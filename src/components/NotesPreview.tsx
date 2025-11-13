import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, CheckCircle2 } from "lucide-react";

interface NotesPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  content: any;
}

export const NotesPreview = ({ isOpen, onClose, content }: NotesPreviewProps) => {
  if (!content) return null;

  const topics = content.topics || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="w-6 h-6 text-primary" />
            Notes Preview
          </DialogTitle>
          <DialogDescription>
            Review your generated notes before downloading
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Introduction */}
            {content.introduction && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary">Introduction</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {content.introduction.substring(0, 300)}
                  {content.introduction.length > 300 && "..."}
                </p>
              </div>
            )}

            <Separator />

            {/* Topics List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">
                Topics Covered ({topics.length})
              </h3>
              <div className="space-y-4">
                {topics.map((topic: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3 bg-card">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-base">
                        {index + 1}. {topic.title}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        Topic {index + 1}
                      </Badge>
                    </div>
                    
                    {topic.sections && (
                      <div className="space-y-2 text-sm">
                        {topic.sections.definition && (
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">Definition included</span>
                          </div>
                        )}
                        {topic.sections.explanation && (
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">Detailed explanation provided</span>
                          </div>
                        )}
                        {topic.sections.comparison && (
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">Comparison with related concepts</span>
                          </div>
                        )}
                        {topic.sections.examples && (
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">Real-life examples included</span>
                          </div>
                        )}
                        {topic.sections.questions && (
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">Practice questions with solutions</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata */}
            {content.metadata && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Generated:</span>
                  <span className="font-medium">
                    {new Date(content.metadata.generatedAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Topics:</span>
                  <span className="font-medium">{content.metadata.topicCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Words:</span>
                  <span className="font-medium">{content.metadata.wordCount}</span>
                </div>
                {content.qualityScore && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quality Score:</span>
                    <span className="font-medium">{content.qualityScore}/100</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};