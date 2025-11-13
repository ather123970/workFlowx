import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Sparkles } from "lucide-react";

const BOARDS = [
  "FBISE (Federal Board)",
  "Punjab Board",
  "Sindh Board",
  "KPK Board",
  "Balochistan Board",
];

const SUBJECTS = {
  "9": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Urdu", "Pakistan Studies", "Islamiyat"],
  "10": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Urdu", "Pakistan Studies", "Islamiyat"],
  "11": ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English", "Urdu"],
  "12": ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English", "Urdu"],
};

interface NotesFormProps {
  onSubmit: (data: {
    classGrade: string;
    board: string;
    subject: string;
    chapterName: string;
  }) => void;
  isGenerating: boolean;
}

export const NotesForm = ({ onSubmit, isGenerating }: NotesFormProps) => {
  const [classGrade, setClassGrade] = useState<string>("");
  const [board, setBoard] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [chapterName, setChapterName] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (classGrade && board && subject && chapterName) {
      onSubmit({ classGrade, board, subject, chapterName });
    }
  };

  const availableSubjects = classGrade ? SUBJECTS[classGrade as keyof typeof SUBJECTS] || [] : [];

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-elevated">
      <CardHeader className="space-y-2 bg-gradient-hero text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-2">
          <BookOpen className="w-8 h-8" />
          <CardTitle className="text-2xl">Generate Smart Notes</CardTitle>
        </div>
        <CardDescription className="text-primary-foreground/90">
          Get comprehensive, syllabus-aligned notes for any chapter in seconds
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="class">Class / Grade</Label>
              <Select value={classGrade} onValueChange={setClassGrade} disabled={isGenerating}>
                <SelectTrigger id="class">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9">Class 9</SelectItem>
                  <SelectItem value="10">Class 10</SelectItem>
                  <SelectItem value="11">Class 11</SelectItem>
                  <SelectItem value="12">Class 12</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="board">Education Board</Label>
              <Select value={board} onValueChange={setBoard} disabled={isGenerating}>
                <SelectTrigger id="board">
                  <SelectValue placeholder="Select board" />
                </SelectTrigger>
                <SelectContent>
                  {BOARDS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select value={subject} onValueChange={setSubject} disabled={isGenerating || !classGrade}>
              <SelectTrigger id="subject">
                <SelectValue placeholder={classGrade ? "Select subject" : "Select class first"} />
              </SelectTrigger>
              <SelectContent>
                {availableSubjects.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chapter">Chapter Name</Label>
            <Input
              id="chapter"
              placeholder="e.g., Vectors, Newton's Laws, Photosynthesis"
              value={chapterName}
              onChange={(e) => setChapterName(e.target.value)}
              disabled={isGenerating}
              className="text-base"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg font-semibold"
            disabled={!classGrade || !board || !subject || !chapterName || isGenerating}
          >
            {isGenerating ? (
              <>Generating Notes...</>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Notes
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};