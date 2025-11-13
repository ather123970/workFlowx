-- Create notes_requests table to track generation jobs
CREATE TABLE public.notes_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_grade INTEGER NOT NULL CHECK (class_grade >= 9 AND class_grade <= 12),
  board TEXT NOT NULL,
  subject TEXT NOT NULL,
  chapter_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'validating', 'fetching_syllabus', 'scraping_content', 'generating', 'compiling_pdf', 'completed', 'failed')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create generated_notes table to store completed notes
CREATE TABLE public.generated_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.notes_requests(id) ON DELETE CASCADE,
  pdf_url TEXT,
  topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notes_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_notes ENABLE ROW LEVEL SECURITY;

-- Public access policies (no authentication required for this educational tool)
CREATE POLICY "Anyone can create notes requests"
ON public.notes_requests
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view notes requests"
ON public.notes_requests
FOR SELECT
USING (true);

CREATE POLICY "Anyone can update notes requests"
ON public.notes_requests
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can view generated notes"
ON public.generated_notes
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create generated notes"
ON public.generated_notes
FOR INSERT
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_notes_requests_updated_at
BEFORE UPDATE ON public.notes_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();