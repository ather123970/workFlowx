-- Create notes_jobs table for job management
CREATE TABLE IF NOT EXISTS notes_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    class_grade INTEGER NOT NULL CHECK (class_grade >= 9 AND class_grade <= 12),
    board TEXT NOT NULL,
    subject TEXT NOT NULL,
    chapter TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'RECEIVED' CHECK (state IN (
        'RECEIVED', 'VALIDATING_INPUT', 'FETCH_SYLLABUS', 'SYLLABUS_NOT_FOUND',
        'EXTRACT_TOPICS', 'SCRAPE_RESOURCES', 'INDEX_EMBED', 'RETRIEVE_CONTEXT',
        'GENERATE_CONTENT', 'QC_CHECKS', 'NEEDS_RETRY', 'HUMAN_REVIEW',
        'COMPILE_PDF', 'COMPLETED', 'FAILED'
    )),
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    message TEXT,
    quality_score DECIMAL(3,2) CHECK (quality_score >= 0 AND quality_score <= 10),
    pdf_url TEXT,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_logs table for logging
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level TEXT NOT NULL CHECK (level IN ('ERROR', 'WARN', 'INFO', 'DEBUG')),
    message TEXT NOT NULL,
    data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create syllabus_data table for caching syllabus information
CREATE TABLE IF NOT EXISTS syllabus_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board TEXT NOT NULL,
    class_grade INTEGER NOT NULL,
    subject TEXT NOT NULL,
    chapters JSONB NOT NULL,
    source_url TEXT,
    extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(board, class_grade, subject)
);

-- Create embedding_chunks table for vector database
CREATE TABLE IF NOT EXISTS embedding_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chunk_id TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    source TEXT NOT NULL,
    metadata JSONB NOT NULL,
    embedding VECTOR(384), -- Using pgvector extension if available
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create generated_notes table for storing final notes packages
CREATE TABLE IF NOT EXISTS generated_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES notes_jobs(id) ON DELETE CASCADE,
    content JSONB NOT NULL,
    pdf_path TEXT,
    word_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_jobs_user_id ON notes_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_jobs_state ON notes_jobs(state);
CREATE INDEX IF NOT EXISTS idx_notes_jobs_created_at ON notes_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_syllabus_data_board_class_subject ON syllabus_data(board, class_grade, subject);
CREATE INDEX IF NOT EXISTS idx_embedding_chunks_source ON embedding_chunks(source);
CREATE INDEX IF NOT EXISTS idx_generated_notes_job_id ON generated_notes(job_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for notes_jobs updated_at
CREATE TRIGGER update_notes_jobs_updated_at 
    BEFORE UPDATE ON notes_jobs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE notes_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE embedding_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own jobs
CREATE POLICY "Users can view their own jobs" ON notes_jobs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own jobs" ON notes_jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs" ON notes_jobs
    FOR UPDATE USING (auth.uid() = user_id);

-- System logs are only accessible by authenticated users (for debugging)
CREATE POLICY "Authenticated users can view system logs" ON system_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert logs" ON system_logs
    FOR INSERT WITH CHECK (true);

-- Syllabus data is readable by all authenticated users
CREATE POLICY "Authenticated users can view syllabus data" ON syllabus_data
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can manage syllabus data" ON syllabus_data
    FOR ALL USING (true);

-- Embedding chunks are managed by the system
CREATE POLICY "System can manage embedding chunks" ON embedding_chunks
    FOR ALL USING (true);

-- Generated notes are accessible by job owners
CREATE POLICY "Users can view their generated notes" ON generated_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM notes_jobs 
            WHERE notes_jobs.id = generated_notes.job_id 
            AND notes_jobs.user_id = auth.uid()
        )
    );

CREATE POLICY "System can manage generated notes" ON generated_notes
    FOR ALL USING (true);

-- Create a function to clean up old completed jobs
CREATE OR REPLACE FUNCTION cleanup_old_jobs()
RETURNS void AS $$
BEGIN
    DELETE FROM notes_jobs 
    WHERE created_at < NOW() - INTERVAL '7 days'
    AND state IN ('COMPLETED', 'FAILED');
END;
$$ LANGUAGE plpgsql;

-- Create a function to get job statistics
CREATE OR REPLACE FUNCTION get_job_statistics()
RETURNS TABLE (
    total_jobs BIGINT,
    completed_jobs BIGINT,
    failed_jobs BIGINT,
    pending_jobs BIGINT,
    avg_completion_time INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_jobs,
        COUNT(*) FILTER (WHERE state = 'COMPLETED') as completed_jobs,
        COUNT(*) FILTER (WHERE state = 'FAILED') as failed_jobs,
        COUNT(*) FILTER (WHERE state NOT IN ('COMPLETED', 'FAILED')) as pending_jobs,
        AVG(updated_at - created_at) FILTER (WHERE state = 'COMPLETED') as avg_completion_time
    FROM notes_jobs
    WHERE created_at > NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Insert some sample board configurations
INSERT INTO syllabus_data (board, class_grade, subject, chapters, source_url) VALUES
('FBISE', 11, 'Physics', '[
    {
        "chapter_name": "Measurements",
        "topics": ["Introduction to Physics", "Physical Quantities and SI Units", "Significant Figures", "Precision and Accuracy", "Errors and Uncertainties"]
    },
    {
        "chapter_name": "Vectors and Equilibrium", 
        "topics": ["Introduction to Vectors", "Vectors vs Scalars", "Vector Addition and Subtraction", "Scalar Multiplication", "Unit Vectors", "Vector Components", "Equilibrium of Forces"]
    },
    {
        "chapter_name": "Motion and Force",
        "topics": ["Kinematics", "Equations of Motion", "Projectile Motion", "Circular Motion", "Newtons Laws of Motion", "Friction"]
    }
]'::jsonb, 'https://www.fbise.edu.pk/sites/default/files/2023-07/Physics%20XI-XII.pdf'),

('FBISE', 11, 'Chemistry', '[
    {
        "chapter_name": "Atomic Structure",
        "topics": ["Discovery of Fundamental Particles", "Atomic Models", "Quantum Numbers", "Electronic Configuration", "Periodic Trends"]
    }
]'::jsonb, 'https://www.fbise.edu.pk/sites/default/files/2023-07/Chemistry%20XI-XII.pdf'),

('FBISE', 11, 'Mathematics', '[
    {
        "chapter_name": "Number Systems",
        "topics": ["Real Numbers", "Complex Numbers", "Mathematical Induction", "Binomial Theorem"]
    }
]'::jsonb, 'https://www.fbise.edu.pk/sites/default/files/2023-07/Mathematics%20XI-XII.pdf')

ON CONFLICT (board, class_grade, subject) DO NOTHING;
