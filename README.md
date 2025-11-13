# WorkFlowX - AI-Powered Study Notes Generator

A modern, responsive web application that generates comprehensive, syllabus-aligned study notes for Pakistani educational boards. Built with React, TypeScript, and AI integration for seamless note generation and PDF export.

## 🎯 High-Level Goal

Generate syllabus-aligned, concept-focused, printable PDF notes where every topic includes:
- **Definition** (1–5 lines)
- **Detailed Explanation** (10–50+ lines)
- **Real-life Example** (Pakistan-relevant)
- **Micro Example** (1 line)
- **3 Exam Questions** (easy/medium/hard) with answers

## 🏗️ System Architecture

### Core Components

1. **Job Management System** - Tracks generation pipeline with 15 distinct states
2. **PDF Scraping & Parsing** - Fetches official board syllabi
3. **Vector Database & RAG** - Intelligent content retrieval
4. **LLM Integration** - Claude/Sonnet-4 for content generation
5. **Quality Assurance** - Automated validation and scoring
6. **PDF Generation** - Professional document compilation

### Pipeline States

```
RECEIVED → VALIDATING_INPUT → FETCH_SYLLABUS → EXTRACT_TOPICS → 
SCRAPE_RESOURCES → INDEX_EMBED → RETRIEVE_CONTEXT → GENERATE_CONTENT → 
QC_CHECKS → COMPILE_PDF → COMPLETED
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Anthropic API key (optional for full AI features)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd syllabus-savvy-scribe-main

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase and API keys

# Run database migrations
npx supabase db push

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
VITE_ANTHROPIC_API_KEY=your_anthropic_key (optional)
```

## 📚 Supported Boards & Subjects

### Pakistani Education Boards
- **FBISE** (Federal Board)
- **Punjab Board**
- **Sindh Board**
- **KPK Board**
- **AJK Board**

### Subjects (Classes 9-12)
- Physics
- Chemistry
- Mathematics
- Biology
- English
- Urdu
- Islamiat
- Pakistan Studies

## 🔧 Technical Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** for components
- **Lucide React** for icons

### Backend Services
- **Supabase** for database and authentication
- **Vector Database** for content retrieval
- **PDF Processing** with jsPDF
- **Web Scraping** for educational resources

### AI & ML
- **Anthropic Claude** for content generation
- **Vector Embeddings** for semantic search
- **RAG (Retrieval Augmented Generation)**
- **Quality Scoring** algorithms

## 📖 API Endpoints

### Core Endpoints

```typescript
POST /api/generate_notes
// Body: { class, board, subject, chapter, user_id }
// Returns: { job_id }

GET /api/job_status?job_id=...
// Returns: { job_id, state, progress_percent, message, quality_score?, pdf_url? }

GET /api/preview?job_id=...
// Returns: HTML preview (only when state == COMPLETED)

GET /api/download?job_id=...
// Returns: PDF file (only when state == COMPLETED)
```

### Utility Endpoints

```typescript
GET /api/boards
// Returns: Available board configurations

GET /api/stats
// Returns: System statistics and health
```

## 🎨 Features

### For Students
- **Comprehensive Notes** - Complete chapter coverage
- **Pakistan-Relevant Examples** - Local context and applications
- **Exam Questions** - Graded difficulty with detailed answers
- **Professional PDF** - Print-ready formatting
- **Progress Tracking** - Real-time generation updates

### For Educators
- **Syllabus Alignment** - Exact topic matching
- **Quality Assurance** - Automated content validation
- **Customizable Content** - Board-specific requirements
- **Bulk Generation** - Multiple chapters/subjects

### Technical Features
- **Intelligent Caching** - Faster subsequent generations
- **Error Recovery** - Automatic retry mechanisms
- **Scalable Architecture** - Handle multiple concurrent requests
- **Monitoring & Logging** - Comprehensive system observability

## 📊 Quality Assurance

### Automated Checks
- **Presence Check** - All required sections included
- **Length Validation** - Appropriate content depth
- **Syllabus Alignment** - Topic matching verification
- **Answer Quality** - Question-answer coherence
- **Safety Check** - Inappropriate content filtering
- **Readability Score** - Grade-appropriate language

### Quality Metrics
- **Overall Score** (0-10 scale)
- **Content Completeness** percentage
- **Syllabus Accuracy** rating
- **Student Readability** level

## 🔄 Development Workflow

### Local Development

```bash
# Start development server
npm run dev

# Run type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Management

```bash
# Apply migrations
npx supabase db push

# Reset database
npx supabase db reset

# Generate types
npx supabase gen types typescript --local > src/types/supabase.ts
```

## 📁 Project Structure

```
src/
├── components/          # React components
├── pages/              # Page components
├── services/           # Core business logic
│   ├── jobManager.ts   # Job state management
│   ├── pdfScraper.ts   # Syllabus fetching
│   ├── vectorDatabase.ts # Content indexing
│   ├── llmService.ts   # AI integration
│   ├── qualityChecker.ts # Content validation
│   ├── pdfGenerator.ts # Document creation
│   └── notesOrchestrator.ts # Main pipeline
├── types/              # TypeScript definitions
├── hooks/              # Custom React hooks
└── lib/                # Utility functions

supabase/
├── migrations/         # Database schema
└── functions/          # Edge functions
```

## 🧪 Testing Strategy

### Quality Validation
- **20 sample chapters** across 5 boards
- **Exact syllabus matching** verification
- **Content length requirements** (150+ words per explanation)
- **Pakistan-relevant examples** validation
- **PDF rendering** quality checks

### Performance Testing
- **Median generation time** tracking
- **95th percentile** latency monitoring
- **Concurrent request** handling
- **Memory usage** optimization

## 🚀 Deployment

### Production Deployment

```bash
# Build the application
npm run build

# Deploy to your hosting platform
# (Vercel, Netlify, or similar)
```

### Environment Setup
1. Set up Supabase project
2. Configure authentication
3. Apply database migrations
4. Set environment variables
5. Deploy application

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Use existing component patterns
3. Maintain comprehensive logging
4. Add appropriate error handling
5. Update documentation

### Code Style
- Use Prettier for formatting
- Follow ESLint rules
- Write descriptive commit messages
- Add JSDoc comments for complex functions

## 📞 Support

### Common Issues
- **Dependencies not installing**: Clear node_modules and reinstall
- **Database connection errors**: Check Supabase configuration
- **PDF generation failing**: Verify jsPDF installation
- **API rate limits**: Implement proper throttling

### Getting Help
- Check the documentation
- Review existing issues
- Contact the development team
- Submit detailed bug reports

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

## 🙏 Acknowledgments

- Pakistani education boards for syllabus access
- Open source community for tools and libraries
- Educational content providers
- Beta testers and early adopters

---

**Built with ❤️ for Pakistani students and educators**
