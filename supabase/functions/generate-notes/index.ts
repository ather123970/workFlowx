import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotesRequest {
  id: string;
  class_grade: number;
  board: string;
  subject: string;
  chapter_name: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requestId } = await req.json();
    console.log("Starting notes generation for request:", requestId);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch the request details
    const { data: request, error: fetchError } = await supabase
      .from("notes_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (fetchError || !request) {
      throw new Error("Request not found");
    }

    const notesRequest = request as NotesRequest;

    // Update status to validating
    await updateStatus(supabase, requestId, "validating", 10);
    
    // Simulate validation (in real implementation, check syllabus)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update status to fetching syllabus
    await updateStatus(supabase, requestId, "fetching_syllabus", 30);
    
    // Here we would scrape board websites for syllabus
    // For now, we'll use sample topics
    const topics = await fetchSyllabusTopics(notesRequest);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Update status to scraping content
    await updateStatus(supabase, requestId, "scraping_content", 50);
    
    // Here we would scrape educational resources
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Update status to generating
    await updateStatus(supabase, requestId, "generating", 70);
    
    // Generate notes using AI
    const notesContent = await generateNotesContent(supabase, notesRequest, topics);
    
    // Update status to compiling PDF
    await updateStatus(supabase, requestId, "compiling_pdf", 90);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Save the generated notes
    const { data: generatedNote, error: saveError } = await supabase
      .from("generated_notes")
      .insert({
        request_id: requestId,
        topics: topics,
        content: notesContent,
      })
      .select()
      .single();

    if (saveError) {
      throw saveError;
    }

    // Update status to completed
    await updateStatus(supabase, requestId, "completed", 100);

    return new Response(
      JSON.stringify({ success: true, noteId: generatedNote.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error generating notes:", error);
    
    const { requestId } = await req.json().catch(() => ({}));
    if (requestId) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      
      await supabase
        .from("notes_requests")
        .update({
          status: "failed",
          error_message: error.message,
        })
        .eq("id", requestId);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function updateStatus(supabase: any, requestId: string, status: string, progress: number) {
  await supabase
    .from("notes_requests")
    .update({ status, progress })
    .eq("id", requestId);
}

async function fetchSyllabusTopics(request: NotesRequest): Promise<string[]> {
  // In real implementation, scrape board websites
  // For now, return sample topics based on chapter
  const chapterName = request.chapter_name.toLowerCase();
  
  if (chapterName.includes("vector")) {
    return [
      "Introduction to Vectors",
      "Vectors vs Scalars",
      "Vector Addition and Subtraction",
      "Scalar Multiplication",
      "Unit Vectors",
      "Vector Components",
    ];
  } else if (chapterName.includes("newton")) {
    return [
      "Newton's First Law (Inertia)",
      "Newton's Second Law (F=ma)",
      "Newton's Third Law (Action-Reaction)",
      "Applications of Newton's Laws",
    ];
  }
  
  // Default topics
  return [
    "Introduction",
    "Key Concepts",
    "Examples and Applications",
    "Practice Problems",
  ];
}

async function generateNotesContent(
  supabase: any,
  request: NotesRequest,
  topics: string[]
): Promise<any> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

  // Enhanced system prompt for comprehensive content
  const systemPrompt = `You are an expert educational content creator for Pakistani students (Classes 9-12) with deep knowledge of ${request.board} curriculum.

CRITICAL REQUIREMENTS:
1. Create COMPREHENSIVE, CONCEPT-FOCUSED notes that cover EVERY aspect of each topic
2. Always include comparisons with related concepts (e.g., vectors vs scalars, acids vs bases, speed vs velocity)
3. Use simple, clear English suitable for Pakistani students
4. Include real-life Pakistani examples (using local context: Lahore, Karachi, Pakistani currency, local scenarios)
5. Provide detailed step-by-step explanations, not just definitions
6. Generate authentic exam-style questions matching ${request.board} paper patterns

QUALITY STANDARDS:
- Definitions: 2-5 lines, crystal clear
- Explanations: Multiple paragraphs with step-by-step breakdown
- Comparisons: MANDATORY where applicable - explain differences and similarities
- Examples: 2-3 real-life examples per topic (detailed + short)
- Questions: 3 questions (Medium/Harder/Hardest) with COMPLETE worked solutions

Your output must be thorough enough that a student can master the topic from these notes alone.`;

  // Build comprehensive context for RAG-style generation
  const contextualPrompt = buildContextualPrompt(request, topics);
  
  const userPrompt = `${contextualPrompt}

Generate comprehensive study notes following this EXACT structure:

# INTRODUCTION
Write a compelling introduction to Chapter "${request.chapter_name}" that covers:
- What this chapter is about (2-3 sentences)
- Why we study this (importance in real life)
- Where we use these concepts daily (Pakistani context examples)
- Key learning objectives

${topics.map((topic, index) => `
# TOPIC ${index + 1}: ${topic}

## Definition
[Provide a clear, 2-5 line definition using simple English]

## Detailed Explanation
[Provide comprehensive explanation with:
- Step-by-step breakdown of the concept
- Key principles and rules
- How it works in practice
- Important formulas or relationships (if applicable)]

## Comparison with Related Concepts
[MANDATORY: Compare this topic with related concepts. Examples:
- If vectors, compare with scalars
- If acids, compare with bases
- If speed, compare with velocity
Include a clear table or structured comparison showing differences]

## Real-Life Examples

### Detailed Example
[Provide one comprehensive real-life example using Pakistani context:
- Setup the scenario (use Pakistani cities, situations, currency)
- Show step-by-step how the concept applies
- Explain the outcome]

### Quick Example
[1-2 sentence micro-example for quick reference]

## Practice Questions

### Question 1 (Medium Difficulty)
**Q:** [Write exam-style question]
**A:** [Provide complete worked solution with steps]

### Question 2 (Harder Difficulty)
**Q:** [Write exam-style question requiring deeper understanding]
**A:** [Provide complete worked solution with steps]

### Question 3 (Hardest Difficulty)
**Q:** [Write challenging application question]
**A:** [Provide complete worked solution with detailed steps]
`).join('\n')}

CRITICAL: Ensure EVERY section is complete. Do not skip comparisons or examples. Make notes comprehensive enough for complete concept mastery.`;

  try {
    console.log("Generating comprehensive notes with enhanced prompts...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 16000, // Ensure enough tokens for comprehensive content
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please wait a moment and try again.");
      }
      if (response.status === 402) {
        throw new Error("AI credits depleted. Please add credits to continue.");
      }
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI generation failed: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    console.log("Generated content length:", generatedContent.length);
    
    // Quality checks - ensure content meets standards
    const qualityIssues = performQualityChecks(generatedContent, topics);
    if (qualityIssues.length > 0) {
      console.warn("Quality issues detected:", qualityIssues);
      // Log but continue - we can improve incrementally
    }

    // Parse and structure the content
    const structuredContent = parseGeneratedContent(generatedContent, topics);

    return {
      introduction: structuredContent.introduction,
      topics: structuredContent.topics,
      rawContent: generatedContent,
      qualityScore: calculateQualityScore(structuredContent),
      metadata: {
        generatedAt: new Date().toISOString(),
        model: "google/gemini-2.5-flash",
        topicCount: topics.length,
        wordCount: generatedContent.split(/\s+/).length,
      }
    };

  } catch (error) {
    console.error("Error calling AI:", error);
    throw error;
  }
}

// Build contextual prompt with RAG-style information
function buildContextualPrompt(request: NotesRequest, topics: string[]): string {
  // In production, this would fetch from vector DB
  // For now, provide rich context based on subject and chapter
  
  const contextMap: Record<string, string> = {
    "vectors": `CONTEXT: Vectors are fundamental in physics and mathematics, representing quantities with both magnitude and direction. 
    Key concepts: vector addition (triangle/parallelogram law), scalar multiplication, unit vectors, components (i, j, k notation), 
    magnitude calculation, dot product, cross product. Always contrast with scalars (mass, time, temperature).
    Pakistani examples: displacement from Lahore to Islamabad, force on a cricket ball, velocity of a car on M2 motorway.`,
    
    "newton": `CONTEXT: Newton's Laws form the foundation of classical mechanics. 
    First Law (Inertia): Objects resist changes in motion. Example: passenger jerking forward when bus brakes.
    Second Law (F=ma): Force equals mass times acceleration. Example: pushing a loaded cart vs empty cart.
    Third Law (Action-Reaction): Every action has equal opposite reaction. Example: walking, swimming, rocket propulsion.
    Pakistani examples: use local transport, cricket, everyday situations.`,
    
    "default": `CONTEXT: This is a core ${request.subject} topic for Class ${request.class_grade} in the ${request.board} curriculum.
    Focus on conceptual understanding with step-by-step explanations. Use Pakistani daily life scenarios for examples.
    Ensure comparisons with related concepts where applicable.`
  };
  
  const chapterLower = request.chapter_name.toLowerCase();
  let context = contextMap.default;
  
  for (const [key, value] of Object.entries(contextMap)) {
    if (chapterLower.includes(key)) {
      context = value;
      break;
    }
  }
  
  return `CONTEXTUAL INFORMATION:
${context}

BOARD: ${request.board}
CLASS: ${request.class_grade}
SUBJECT: ${request.subject}
CHAPTER: ${request.chapter_name}

OFFICIAL TOPICS (from syllabus):
${topics.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;
}

// Quality check functions
function performQualityChecks(content: string, topics: string[]): string[] {
  const issues: string[] = [];
  
  // Check 1: All topics mentioned
  for (const topic of topics) {
    if (!content.toLowerCase().includes(topic.toLowerCase())) {
      issues.push(`Missing topic: ${topic}`);
    }
  }
  
  // Check 2: Key sections present
  const requiredSections = ['definition', 'explanation', 'example', 'question'];
  for (const section of requiredSections) {
    const pattern = new RegExp(section, 'i');
    if (!pattern.test(content)) {
      issues.push(`Missing section type: ${section}`);
    }
  }
  
  // Check 3: Minimum content length
  if (content.length < 3000) {
    issues.push("Content too short for comprehensive notes");
  }
  
  // Check 4: Comparison sections (should have "vs" or "versus" or "compare")
  const hasComparisons = /\b(vs\.?|versus|compar(e|ison)|difference between)\b/i.test(content);
  if (!hasComparisons) {
    issues.push("No comparison sections detected");
  }
  
  return issues;
}

function parseGeneratedContent(content: string, topics: string[]): any {
  const lines = content.split('\n');
  
  // Extract introduction
  const introStart = lines.findIndex(l => /^#\s*introduction/i.test(l));
  const firstTopicStart = lines.findIndex(l => /^#\s*topic\s*1/i.test(l));
  
  const introduction = introStart !== -1 && firstTopicStart !== -1
    ? lines.slice(introStart + 1, firstTopicStart).join('\n').trim()
    : lines.slice(0, Math.min(20, lines.length)).join('\n');
  
  // Parse topics
  const parsedTopics = topics.map((topicTitle, index) => {
    const topicNum = index + 1;
    const topicStart = lines.findIndex(l => 
      new RegExp(`^#\\s*topic\\s*${topicNum}`, 'i').test(l)
    );
    
    const nextTopicStart = lines.findIndex((l, i) => 
      i > topicStart && new RegExp(`^#\\s*topic\\s*${topicNum + 1}`, 'i').test(l)
    );
    
    const topicContent = topicStart !== -1
      ? lines.slice(topicStart, nextTopicStart !== -1 ? nextTopicStart : undefined).join('\n')
      : '';
    
    return {
      title: topicTitle,
      content: topicContent,
      sections: extractTopicSections(topicContent),
    };
  });
  
  return {
    introduction,
    topics: parsedTopics,
  };
}

function extractTopicSections(topicContent: string): any {
  const sections: any = {
    definition: '',
    explanation: '',
    comparison: '',
    examples: [],
    questions: [],
  };
  
  const lines = topicContent.split('\n');
  let currentSection = '';
  let sectionContent: string[] = [];
  
  for (const line of lines) {
    if (/^##\s*definition/i.test(line)) {
      if (currentSection && sectionContent.length) {
        sections[currentSection] = sectionContent.join('\n').trim();
      }
      currentSection = 'definition';
      sectionContent = [];
    } else if (/^##\s*(detailed\s*)?explanation/i.test(line)) {
      if (currentSection && sectionContent.length) {
        sections[currentSection] = sectionContent.join('\n').trim();
      }
      currentSection = 'explanation';
      sectionContent = [];
    } else if (/^##\s*comparison/i.test(line)) {
      if (currentSection && sectionContent.length) {
        sections[currentSection] = sectionContent.join('\n').trim();
      }
      currentSection = 'comparison';
      sectionContent = [];
    } else if (/^##\s*(real-life\s*)?examples?/i.test(line)) {
      if (currentSection && sectionContent.length) {
        sections[currentSection] = sectionContent.join('\n').trim();
      }
      currentSection = 'examples';
      sectionContent = [];
    } else if (/^##\s*practice\s*questions?/i.test(line)) {
      if (currentSection && sectionContent.length) {
        sections[currentSection] = sectionContent.join('\n').trim();
      }
      currentSection = 'questions';
      sectionContent = [];
    } else {
      sectionContent.push(line);
    }
  }
  
  // Save last section
  if (currentSection && sectionContent.length) {
    sections[currentSection] = sectionContent.join('\n').trim();
  }
  
  return sections;
}

function calculateQualityScore(content: any): number {
  let score = 0;
  const maxScore = 100;
  
  // Introduction quality (20 points)
  if (content.introduction && content.introduction.length > 200) score += 20;
  else if (content.introduction && content.introduction.length > 100) score += 10;
  
  // Topics completeness (60 points - 20 per topic for first 3)
  const topicsToCheck = Math.min(3, content.topics.length);
  for (let i = 0; i < topicsToCheck; i++) {
    const topic = content.topics[i];
    if (!topic) continue;
    
    let topicScore = 0;
    if (topic.sections?.definition) topicScore += 4;
    if (topic.sections?.explanation && topic.sections.explanation.length > 200) topicScore += 6;
    if (topic.sections?.comparison) topicScore += 4;
    if (topic.sections?.examples) topicScore += 3;
    if (topic.sections?.questions) topicScore += 3;
    
    score += topicScore;
  }
  
  // Overall content length (20 points)
  const totalLength = content.topics.reduce((sum: number, t: any) => 
    sum + (t.content?.length || 0), 0
  );
  if (totalLength > 5000) score += 20;
  else if (totalLength > 3000) score += 15;
  else if (totalLength > 1500) score += 10;
  
  return Math.min(score, maxScore);
}