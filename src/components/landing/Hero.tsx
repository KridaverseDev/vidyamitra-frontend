import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, BookOpen, Brain, Presentation } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 subtle-gradient" />
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-primary/20 text-sm font-medium text-accent-foreground animate-fade-up">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>AI-Powered Education Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight animate-fade-up delay-100">
              <span className="gradient-text">Vidyamitra</span>
              <br />
              <span className="text-foreground">Your Teaching</span>
              <br />
              <span className="text-foreground">Companion</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 animate-fade-up delay-200">
              Empower your teaching with AI. Create quizzes, generate questions, 
              build presentations, and manage course materials — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up delay-300">
              <Button variant="hero" size="xl" asChild>
                <Link to="/auth?mode=signup">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/auth">Log In</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 justify-center lg:justify-start pt-4 animate-fade-up delay-400">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">500+</div>
                <div className="text-sm text-muted-foreground">Educators</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">10K+</div>
                <div className="text-sm text-muted-foreground">Questions Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">1K+</div>
                <div className="text-sm text-muted-foreground">Courses</div>
              </div>
            </div>
          </div>

          {/* Right content - Feature preview */}
          <div className="relative animate-fade-up delay-200">
            <div className="relative">
              {/* Main card */}
              <div className="bg-card rounded-2xl shadow-xl border border-border p-6 space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">AI Question Generator</h3>
                    <p className="text-sm text-muted-foreground">Generate MCQs from your syllabus</p>
                  </div>
                </div>

                {/* Sample question */}
                <div className="space-y-3 p-4 bg-secondary/50 rounded-xl">
                  <div className="text-sm font-medium text-foreground">
                    Q. What is the time complexity of binary search?
                  </div>
                  <div className="space-y-2">
                    {['O(n)', 'O(log n)', 'O(n²)', 'O(1)'].map((option, i) => (
                      <div 
                        key={i} 
                        className={`flex items-center gap-2 p-2 rounded-lg text-sm ${i === 1 ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground'}`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 ${i === 1 ? 'border-primary bg-primary' : 'border-muted-foreground/30'}`}>
                          {i === 1 && <div className="w-full h-full rounded-full bg-primary-foreground scale-50" />}
                        </div>
                        {option}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="px-2 py-1 rounded-md bg-accent text-accent-foreground font-medium">Medium</span>
                  <span className="text-muted-foreground">Bloom's Level: L2</span>
                </div>
              </div>

              {/* Floating cards */}
              <div className="absolute -top-4 -left-4 bg-card rounded-xl shadow-lg border border-border p-3 animate-float">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">12 Documents</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-card rounded-xl shadow-lg border border-border p-3 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <Presentation className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">8 Presentations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
