import { BookCheck, Brain, FileText, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Target,
    title: "Syllabus-Aligned",
    description: "Notes perfectly matched to official FBISE and provincial board syllabi",
  },
  {
    icon: Brain,
    title: "Concept-Focused",
    description: "Deep explanations that help you understand, not just memorize",
  },
  {
    icon: FileText,
    title: "Real-Life Examples",
    description: "Pakistani context examples that make concepts relatable and memorable",
  },
  {
    icon: BookCheck,
    title: "Practice Questions",
    description: "Exam-style questions with complete answers for each topic",
  },
];

export const Features = () => {
  return (
    <section className="mt-16 mb-12">
      <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
        Why Use AI Notes Maker?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="shadow-soft hover:shadow-elevated transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};