import { GraduationCap } from "lucide-react";

export const Hero = () => {
  return (
    <div className="text-center space-y-6 mb-12">
      <div className="inline-flex items-center gap-3 p-3 bg-gradient-hero rounded-2xl shadow-elevated">
        <GraduationCap className="w-12 h-12 text-primary-foreground" />
      </div>
      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent">
          AI Notes Maker
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Get comprehensive, concept-focused study notes aligned with Pakistani education boards.
          Perfect for classes 9-12.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          <span>Syllabus-Aligned</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary"></div>
          <span>Detailed Examples</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-education-purple"></div>
          <span>Practice Questions</span>
        </div>
      </div>
    </div>
  );
};