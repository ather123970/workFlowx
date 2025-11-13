# 🤖 Claude/Sonnet-4 Integration Instructions

## 🎯 System Overview

This document contains the **exact instructions for Claude/Sonnet-4** to generate comprehensive educational content following the specifications provided. The system implements a production-ready content generation pipeline with source validation, RAG implementation, and quality assurance.

## 📋 Implementation Status

✅ **ContentGenerationService**: Source fetching, RAG, quality checks  
✅ **SyllabusValidationService**: Board syllabus validation and matching  
✅ **EnhancedAIService**: Complete content generation pipeline  
✅ **Quality Assurance**: Automated content validation  
✅ **Source Priority System**: Board → ClassNotes → Local → Textbooks  

## 🔄 Content Generation Flow

### **Step 1: Syllabus Validation**
```typescript
// Validate chapter exists in official board syllabus
const syllabusResult = await syllabusValidationService.validateChapterInSyllabus(request);

if (!syllabusResult.found) {
  return { syllabus_status: 'SYLLABUS_NOT_FOUND', suggestions: [...] };
}
```

### **Step 2: Source Fetching (Priority Order)**
```typescript
// 1. Official board syllabus (MANDATORY)
const boardSource = await fetchBoardSyllabus(request);

// 2. ClassNotes.xyz (First fallback)
const classNotesSource = await fetchClassNotes(request);

// 3. Ilmkidunya, local sites
const localSources = await fetchLocalSources(request);

// 4. Textbooks and open PDFs
const textbookSources = await fetchTextbookSources(request);
```

### **Step 3: RAG Processing**
```typescript
// Chunk text: 400-800 tokens, 75 token overlap
const chunks = chunkText(source.content, 400, 800, 75);

// Retrieve relevant chunks with auto-expansion
let topK = 6;
if (avgSimilarity < 0.75) {
  topK = 12; // Auto-expand for low similarity
}
```

### **Step 4: Content Generation with Quality Loop**
```typescript
let attempts = 0;
const maxAttempts = 3;

while (attempts < maxAttempts) {
  const topicPage = await generateTopicPage(topic, request, context);
  const qualityCheck = performQualityCheck(topicPage);
  
  if (qualityCheck.passed) {
    return topicPage;
  }
  
  // Auto-regenerate with expansion prompt
  if (!qualityCheck.length) {
    prompt += "\n\nEXPAND: The explanation is too short...";
  }
  
  attempts++;
}
```

## 🎯 Exact Prompt Templates

### **System Prompt**
```
You are a school-level tutor and content writer. Use the CONTEXT (board syllabus + retrieved passages) to produce accurate, syllabus-aligned notes. Do not invent new syllabus topics. For the topic provided, output JSON with fields: definition, explanation, comparison (if applicable), example_detailed, example_short, questions (3). Explanation must be at least 15 lines (~250 words). Use simple English, Pakistan-relevant examples, and exam-style questions. If context contradicts, prefer board syllabus wording. Output only JSON.
```

### **User Prompt Template**
```
Topic: "{topic_title}"
Subject: "{subject}"  Class: {class}  Board: "{board}"
Context passages: [
  { "text":"...", "url":"...", "type":"syllabus/pdf|classnotes|ilmkidunya|textbook" },
  ...
]

Instructions:
1) Use the CONTEXT to write a short Definition (1-5 lines).
2) Write an Explanation: minimum 15 lines and 250 words. Use numbered/bullet steps where helpful.
3) If the topic has a natural comparator, include Comparison subsection.
4) Add Example (Detailed) 3-6 lines related to Pakistan when possible.
5) Add Example (Short) 1 line.
6) Add 3 Questions with answers (Easy/Medium/Hard). Include solution steps if numeric.
7) Keep tone friendly, simple, and exam-oriented.

Return JSON exactly like:
{
 "page_type":"topic",
 "topic_title":"{topic_title}",
 "definition":"...",
 "explanation":"...",
 "comparison":"...",
 "example_detailed":"...",
 "example_short":"...",
 "questions":[ {"difficulty":"easy","q":"...","a":"..."}, ... ]
}
```

## ✅ Quality Assurance Checks

### **Mandatory Requirements**
```typescript
interface QualityCheck {
  presence: boolean;        // All required fields exist
  length: boolean;          // Explanation >= 15 lines AND >= 250 words
  syllabus_alignment: boolean; // Topic matches board syllabus
  answer_correctness: boolean; // No placeholders, proper solutions
  readability: boolean;     // Average sentence < 25 words
  source_traceability: boolean; // Source references included
}
```

### **Auto-Regeneration Logic**
```typescript
if (!qualityCheck.length) {
  prompt += `\n\nEXPAND: The Explanation for topic ${topic} is too short. 
  Expand it to at least 15 lines and 250 words. Use the provided CONTEXT 
  and include stepwise explanations, examples, and connections to related topics. 
  Keep tone simple and classroom-friendly.`;
}
```

## 🔗 Source Integration Examples

### **ClassNotes.xyz Integration**
```typescript
// Pattern: https://classnotes.xyz/posts/class-11-physics-vectors-and-equilibrium-notes
const searchUrl = `https://classnotes.xyz/posts/class-${class}-${subject}-${chapter}-notes`;

// Extract PDF links and convert Google Drive URLs
const pdfLinks = extractPDFLinks(pageContent);
const convertedUrl = convertGoogleDriveUrl(pdfUrl);
// Convert: /file/d/ID/view → /uc?export=download&id=ID
```

### **Board Syllabus URLs**
```typescript
const boardUrls = {
  'FBISE': ['https://fbise.edu.pk/syllabus.pdf'],
  'Punjab': ['https://punjab.gov.pk/education/syllabus.pdf'],
  'Sindh': ['https://sindh.gov.pk/education/syllabus.pdf'],
  'KPK': ['https://kpk.gov.pk/education/syllabus.pdf'],
  'Balochistan': ['https://balochistan.gov.pk/education/syllabus.pdf']
};
```

## 📊 Content Standards Enforcement

### **Length Requirements (ENFORCED)**
- **Definition**: 1-5 lines (concise)
- **Explanation**: MINIMUM 15 lines AND 250 words, PREFERRED 250-800 words
- **Examples**: Detailed (3-6 lines), Short (1 line)
- **Questions**: 3 questions (Easy/Medium/Hard) with full solutions

### **Pakistan-Relevant Examples**
```typescript
// Example patterns to follow:
"A car traveling at 60 km/h from Karachi to Hyderabad..."
"The distance from Lahore to Islamabad is 280 km southeast..."
"In Pakistani textile industry, vectors are used to..."
```

### **Exam-Style Questions**
```typescript
{
  "difficulty": "easy",
  "q": "What is the difference between a vector and a scalar quantity?",
  "a": "A vector has both magnitude and direction (like velocity), while a scalar has only magnitude (like speed)."
},
{
  "difficulty": "medium", 
  "q": "Find the resultant of two vectors: 3 units east and 4 units north.",
  "a": "Using Pythagorean theorem: R = √(3² + 4²) = √25 = 5 units. Direction: tan⁻¹(4/3) = 53.1° north of east."
},
{
  "difficulty": "hard",
  "q": "Two forces of 10N and 15N act at an angle of 60° between them. Find their resultant.",
  "a": "Using R² = A² + B² + 2AB cos θ: R² = 10² + 15² + 2(10)(15)cos(60°) = 100 + 225 + 150 = 475. R = √475 = 21.8N"
}
```

## 🚫 Failure Handling

### **Syllabus Not Found**
```typescript
if (!syllabusResult.found) {
  return {
    success: false,
    syllabus_status: 'SYLLABUS_NOT_FOUND',
    suggestions: top5Matches.map(match => ({
      chapter: match.chapter,
      similarity: match.similarity
    }))
  };
}
```

### **Quality Assurance Failure**
```typescript
if (attempts === 3 && !qualityCheck.passed) {
  // Mark for human review
  flagTopicForHumanReview(topic);
  markJobLowConfidence();
  
  throw new Error(`Quality assurance failed after ${maxAttempts} attempts`);
}
```

## 📈 Logging & Audit Trail

### **Required Logging**
```typescript
interface AuditLog {
  job_id: string;
  input: LearningRequest;
  source_urls: string[];
  model_prompts: string[];
  model_outputs: string[];
  qc_results: QualityCheck[];
  regeneration_attempts: Record<string, number>;
  processing_time_ms: number;
}
```

## 🎯 Success Criteria

### **Job Completion Requirements**
- ✅ All topics pass quality checks
- ✅ Minimum word count met (250+ per explanation)
- ✅ Source traceability maintained
- ✅ Syllabus alignment verified
- ✅ No placeholder content
- ✅ Pakistan-relevant examples included

### **UI Enablement Rules**
```typescript
// Only enable "View Notes" and "Download PDF" when:
if (job.status === 'COMPLETED' && 
    job.quality_score >= 80 && 
    job.result?.metadata?.completeness_score >= 90) {
  enableViewAndDownload();
}
```

## 🔧 Technical Implementation

### **API Integration Points**
```typescript
// Main generation endpoint
const result = await enhancedAIService.generateComprehensiveNotes(request);

// Syllabus validation
const validation = await syllabusValidationService.validateChapterInSyllabus(request);

// Content generation with RAG
const topicPage = await contentGenerationService.generateTopicPage(topic, request, context);
```

### **Error Recovery**
```typescript
// Graceful degradation with fallback content
try {
  return await realAIGeneration(prompt);
} catch (error) {
  console.warn('AI generation failed, using fallback');
  return await fallbackContentGeneration(topic);
}
```

---

## 🎉 **Implementation Complete!**

The system now implements **all Claude/Sonnet-4 instructions** with:

✅ **Exact source priority order** (Board → ClassNotes → Local → Textbooks)  
✅ **RAG implementation** with chunking and retrieval  
✅ **Quality assurance loops** with auto-regeneration  
✅ **Syllabus validation** with fuzzy matching  
✅ **Content standards enforcement** (15+ lines, 250+ words)  
✅ **Pakistan-relevant examples** and exam-style questions  
✅ **Comprehensive logging** and audit trails  
✅ **Error handling** with graceful degradation  

**The AI Notes platform is now production-ready with full Claude/Sonnet-4 integration! 🚀**
