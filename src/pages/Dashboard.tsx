import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Link } from "react-router-dom";
import { BookOpen, FileQuestion, ListChecks, Presentation, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Knowledge Management",
    description: "Upload and manage course materials, syllabi, and teaching resources",
    href: "/knowledge",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: FileQuestion,
    title: "Question Bank",
    description: "Create and manage assessment questions with AI assistance",
    href: "/questions",
    gradient: "from-emerald-500 to-emerald-600",
  },
  {
    icon: ListChecks,
    title: "Quiz Generator",
    description: "Create interactive quizzes and export question papers",
    href: "/quiz",
    gradient: "from-violet-500 to-violet-600",
  },
  {
    icon: Presentation,
    title: "Presentations",
    description: "Generate professional slide decks from your content",
    href: "/presentations",
    gradient: "from-amber-500 to-amber-600",
  },
] as const;

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  gradient: string;
}

function FeatureCard({ icon: Icon, title, description, href, gradient }: FeatureCardProps) {
  return (
    <Link
      to={href}
      className="group block h-full"
    >
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{description}</p>
            </div>
            <div className="flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-all">
              <span>Explore</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const displayName = user?.first_name || "User";

  return (
    <DashboardLayout
      title="Dashboard"
      description="Your AI-powered teaching companion"
    >
      <div className="space-y-8">
        <Card className="border-0 bg-gradient-to-br from-primary to-orange-600 text-primary-foreground shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">
                  {isLoading ? "Hello! 👋" : `Hello, ${displayName}! 👋`}
                </h2>
                <p className="text-primary-foreground/90 max-w-2xl">
                  Ready to create amazing learning experiences? Explore the tools below to manage your courses, generate questions, and build presentations.
                </p>
              </div>
              <div className="hidden md:block">
                <Sparkles className="w-16 h-16 text-primary-foreground/20" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-6">Quick Actions</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => (
                <FeatureCard key={feature.href} {...feature} />
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-6">
                Your recent activity will appear here as you use the platform.
              </p>
              <Button variant="hero" asChild>
                <Link to="/knowledge">
                  Get Started
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
