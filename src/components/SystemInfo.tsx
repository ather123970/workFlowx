import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Database, Search, Sparkles, FileCheck } from "lucide-react";

const pipeline = [
  {
    icon: CheckCircle2,
    title: "Validation",
    description: "Verify chapter exists in official board syllabus",
  },
  {
    icon: Database,
    title: "Fetch Syllabus",
    description: "Download official board curriculum and topic list",
  },
  {
    icon: Search,
    title: "Gather Resources",
    description: "Collect content from educational sites and references",
  },
  {
    icon: Sparkles,
    title: "AI Generation",
    description: "Create comprehensive notes with definitions, examples, and questions",
  },
  {
    icon: FileCheck,
    title: "Quality Check",
    description: "Verify completeness and compile final PDF",
  },
];

export const SystemInfo = () => {
  return (
    <section className="mt-16 mb-12">
      <h2 className="text-3xl font-bold text-center mb-4 text-foreground">
        How It Works
      </h2>
      <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
        Our AI-powered system follows a strict pipeline to ensure comprehensive, accurate notes
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {pipeline.map((step, index) => {
          const Icon = step.icon;
          return (
            <Card key={step.title} className="shadow-soft">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    Step {index + 1}
                  </span>
                </div>
                <CardTitle className="text-base">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs">{step.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="mt-8 p-6 bg-accent/20 rounded-lg max-w-3xl mx-auto">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          What You Get in Every Note
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 text-secondary flex-shrink-0" />
            <span><strong>Clear definitions</strong> in simple English (2-5 lines)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 text-secondary flex-shrink-0" />
            <span><strong>Step-by-step explanations</strong> covering all aspects of the concept</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 text-secondary flex-shrink-0" />
            <span><strong>Comparison sections</strong> (e.g., vectors vs scalars, acids vs bases)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 text-secondary flex-shrink-0" />
            <span><strong>Real-life Pakistani examples</strong> that make concepts relatable</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 text-secondary flex-shrink-0" />
            <span><strong>3 practice questions</strong> per topic with complete solutions (Medium/Harder/Hardest)</span>
          </li>
        </ul>
      </div>
    </section>
  );
};