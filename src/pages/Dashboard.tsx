import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Link } from "react-router-dom";
import { BookOpen, FileQuestion, ListChecks, Presentation, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: BookOpen,
    title: "Knowledge Management",
    description: "Upload and manage course materials, syllabi, and teaching resources.",
    href: "/knowledge",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: FileQuestion,
    title: "Question Bank",
    description: "Create and manage assessment questions with AI assistance.",
    href: "/questions",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    icon: ListChecks,
    title: "Quiz Generator",
    description: "Create interactive quizzes and export question papers.",
    href: "/quiz",
    color: "bg-violet-500/10 text-violet-600",
  },
  {
    icon: Presentation,
    title: "Presentations",
    description: "Generate professional slide decks from your content.",
    href: "/presentations",
    color: "bg-amber-500/10 text-amber-600",
  },
];

export default function Dashboard() {
  return (
    <DashboardLayout 
      title="Welcome to Vidyamitra" 
      description="Your AI-powered teaching companion"
    >
      <div className="space-y-8">
        {/* Welcome banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-orange-600 p-8 text-primary-foreground">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Hello, Dr. Priya! 👋</h2>
            <p className="text-primary-foreground/80 max-w-xl">
              Ready to create amazing learning experiences? Explore the tools below 
              to manage your courses, generate questions, and build presentations.
            </p>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
        </div>

        {/* Feature cards */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature) => (
              <Link
                key={feature.href}
                to={feature.href}
                className="group bg-card rounded-xl border border-border p-6 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                <div className="flex items-center text-sm font-medium text-primary">
                  Explore
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent activity placeholder */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <p className="text-muted-foreground">
              Your recent activity will appear here as you use the platform.
            </p>
            <Button variant="subtle" className="mt-4" asChild>
              <Link to="/knowledge">
                Get Started with Knowledge Management
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
