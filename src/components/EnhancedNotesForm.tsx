import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { syllabusService, ChapterInfo } from '@/services/syllabusService';
import { 
  BookOpen, 
  GraduationCap, 
  School, 
  FileText, 
  Sparkles, 
  Zap,
  Clock,
  Target,
  CheckCircle,
  ArrowRight,
  Brain,
  Download
} from 'lucide-react';

const formSchema = z.object({
  classGrade: z.string().min(1, 'Please select a class'),
  board: z.string().min(1, 'Please select a board'),
  subject: z.string().min(1, 'Please select a subject'),
  chapterName: z.string().min(1, 'Please select a chapter'),
});

interface EnhancedNotesFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  isGenerating: boolean;
}

export const EnhancedNotesForm: React.FC<EnhancedNotesFormProps> = ({ onSubmit, isGenerating }) => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [availableChapters, setAvailableChapters] = useState<ChapterInfo[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      classGrade: '',
      board: '',
      subject: '',
      chapterName: '',
    },
  });

  // Update available subjects when class or board changes
  useEffect(() => {
    if (selectedClass && selectedBoard) {
      const subjects = syllabusService.getAvailableSubjects(selectedBoard, parseInt(selectedClass));
      setAvailableSubjects(subjects);
      setAvailableChapters([]);
      form.setValue('subject', '');
      form.setValue('chapterName', '');
    }
  }, [selectedClass, selectedBoard, form]);

  // Update available chapters when subject changes
  useEffect(() => {
    if (selectedClass && selectedBoard && selectedSubject) {
      const chapters = syllabusService.getChapters(selectedBoard, parseInt(selectedClass), selectedSubject);
      setAvailableChapters(chapters);
      form.setValue('chapterName', '');
    }
  }, [selectedClass, selectedBoard, selectedSubject, form]);

  // Subject icons and colors for UI
  const subjectStyles: Record<string, { icon: string; color: string }> = {
    'Physics': { icon: '⚛️', color: 'from-blue-500 to-cyan-500' },
    'Mathematics': { icon: '📐', color: 'from-purple-500 to-pink-500' },
    'Chemistry': { icon: '🧪', color: 'from-green-500 to-emerald-500' },
    'Biology': { icon: '🧬', color: 'from-emerald-500 to-teal-500' },
  };

  // Handle form field changes
  const handleClassChange = (value: string) => {
    setSelectedClass(value);
    form.setValue('classGrade', value);
  };

  const handleBoardChange = (value: string) => {
    setSelectedBoard(value);
    form.setValue('board', value);
  };

  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value);
    form.setValue('subject', value);
  };

  const boards = [
    { value: 'FBISE', label: 'Federal Board (FBISE)', region: 'Federal' },
    { value: 'BISE-LHR', label: 'BISE Lahore', region: 'Punjab' },
    { value: 'BISE-RWP', label: 'BISE Rawalpindi', region: 'Punjab' },
    { value: 'BISE-FSD', label: 'BISE Faisalabad', region: 'Punjab' },
    { value: 'BISE-MLT', label: 'BISE Multan', region: 'Punjab' },
    { value: 'BSEK', label: 'BSEK Karachi', region: 'Sindh' },
    { value: 'BISE-HYD', label: 'BISE Hyderabad', region: 'Sindh' },
    { value: 'BISE-PWR', label: 'BISE Peshawar', region: 'KPK' },
    { value: 'BISE-QTA', label: 'BISE Quetta', region: 'Balochistan' }
  ];

  const classes = [
    { value: '9', label: 'Class 9', description: 'Secondary School Certificate (Part I)' },
    { value: '10', label: 'Class 10', description: 'Secondary School Certificate (Part II)' },
    { value: '11', label: 'Class 11', description: 'Higher Secondary Certificate (Part I)' },
    { value: '12', label: 'Class 12', description: 'Higher Secondary Certificate (Part II)' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-50/50 py-8 md:py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl md:rounded-3xl mb-6 md:mb-8 shadow-xl">
            <Brain className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight px-2">
            Generate Your Study Notes
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
            Select your academic details below to generate comprehensive, AI-powered study notes tailored for Pakistani education boards
          </p>
        </div>

        <Card className="shadow-2xl border border-blue-100 bg-white">
          <CardHeader className="text-center pb-6 md:pb-10 bg-gradient-to-r from-blue-50 to-blue-100/50 px-4 md:px-6">
            <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
              <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              FREE AI Notes Generator
            </CardTitle>
            <CardDescription className="text-base md:text-lg text-gray-600 px-2">
              Powered by free AI models • No API keys required • Pakistani curriculum focused
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Class Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <GraduationCap className="w-5 h-5 text-purple-500" />
                    <FormLabel className="text-lg font-semibold text-gray-900">Select Class</FormLabel>
                  </div>
                  <FormField
                    control={form.control}
                    name="classGrade"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {classes.map((cls) => (
                              <div
                                key={cls.value}
                                onClick={() => {
                                  field.onChange(cls.value);
                                  handleClassChange(cls.value);
                                }}
                                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                                  field.value === cls.value
                                    ? 'border-blue-500 bg-blue-50 shadow-xl ring-2 ring-blue-200'
                                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
                                }`}
                              >
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-gray-900 mb-1">{cls.label}</div>
                                  <div className="text-xs text-gray-500">{cls.description}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Board Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <School className="w-5 h-5 text-blue-500" />
                    <FormLabel className="text-lg font-semibold text-gray-900">Select Board</FormLabel>
                  </div>
                  <FormField
                    control={form.control}
                    name="board"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            handleBoardChange(value);
                          }} value={field.value}>
                            <SelectTrigger className="h-14 text-lg border-2 border-gray-200 focus:border-blue-500">
                              <SelectValue placeholder="Choose your education board" />
                            </SelectTrigger>
                            <SelectContent>
                              {boards.map((board) => (
                                <SelectItem key={board.value} value={board.value} className="py-3">
                                  <div className="flex items-center justify-between w-full">
                                    <span className="font-medium">{board.label}</span>
                                    <Badge variant="outline" className="ml-2">
                                      {board.region}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Subject Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-5 h-5 text-green-500" />
                    <FormLabel className="text-lg font-semibold text-gray-900">Select Subject</FormLabel>
                  </div>
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availableSubjects.map((subject) => {
                              const style = subjectStyles[subject] || { icon: '📚', color: 'from-gray-500 to-gray-600' };
                              const chapters = syllabusService.getChapters(selectedBoard, parseInt(selectedClass), subject);
                              
                              return (
                                <div
                                  key={subject}
                                  onClick={() => {
                                    field.onChange(subject);
                                    handleSubjectChange(subject);
                                  }}
                                  className={`p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                                    field.value === subject
                                      ? 'border-blue-500 bg-blue-50 shadow-xl ring-2 ring-blue-200'
                                      : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
                                  }`}
                                >
                                  <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${style.color} flex items-center justify-center text-2xl`}>
                                      {style.icon}
                                    </div>
                                    <div>
                                      <div className="text-lg font-semibold text-gray-900">{subject}</div>
                                      <div className="text-sm text-gray-500">{chapters.length} chapters available</div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Chapter Selection */}
                {selectedSubject && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-5 h-5 text-orange-500" />
                      <FormLabel className="text-lg font-semibold text-gray-900">Select Chapter</FormLabel>
                    </div>
                    <FormField
                      control={form.control}
                      name="chapterName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="h-14 text-lg border-2 border-gray-200 focus:border-orange-500">
                                <SelectValue placeholder={`Choose a ${selectedSubject} chapter`} />
                              </SelectTrigger>
                              <SelectContent className="max-h-60">
                                {availableChapters.map((chapter) => (
                                  <SelectItem key={chapter.chapterName} value={chapter.chapterName} className="py-2">
                                    <div className="flex items-center justify-between w-full">
                                      <span>{chapter.chapterNumber}. {chapter.chapterName}</span>
                                      <Badge variant="outline" className="ml-2 text-xs">
                                        {chapter.difficulty}
                                      </Badge>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Features Preview */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-500" />
                    What You'll Get
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">15-50+ lines per topic</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Practice questions with solutions</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Pakistani context examples</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">Professional PDF download</span>
                    </div>
                  </div>
                </div>

                {/* Generation Time Estimate */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">Estimated Generation Time: 2-5 minutes</span>
                  </div>
                  <p className="text-blue-600 text-sm mt-1">
                    Time varies based on available AI model (Ollama fastest, browser-based slower)
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Generating Notes...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Zap className="w-6 h-6" />
                      <span>Generate FREE AI Notes</span>
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  )}
                </Button>

                {/* Free Notice */}
                <div className="text-center">
                  <Badge className="bg-green-100 text-green-800 border-green-300 px-4 py-2">
                    <Sparkles className="w-4 h-4 mr-2" />
                    100% FREE • No API Keys • No Subscriptions
                  </Badge>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
