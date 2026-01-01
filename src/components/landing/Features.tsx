import { BookOpen, FileQuestion, ListChecks, Presentation } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Knowledge Management",
    description: "Upload, organize, and manage your course materials, syllabi, and teaching resources in one centralized location.",
  },
  {
    icon: FileQuestion,
    title: "Question Bank",
    description: "Generate AI-powered questions from your documents with customizable difficulty levels and Bloom's taxonomy alignment.",
  },
  {
    icon: ListChecks,
    title: "Quiz Generation",
    description: "Create interactive quizzes and assessments in minutes. Export question papers with automatic formatting.",
  },
  {
    icon: Presentation,
    title: "Presentations",
    description: "Transform your course content into professional slide decks with AI-generated summaries and key points.",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-background relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything You Need to
            <span className="gradient-text"> Teach Smarter</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful AI tools designed specifically for educators to save time 
            and enhance the learning experience.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-card rounded-2xl border border-border p-6 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-5 group-hover:bg-primary/10 transition-colors duration-300">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Hover accent */}
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
