import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, Zap, Clock, Database, Shield, Users } from "lucide-react";

const benefits = [
  { icon: Zap, text: "AI-Powered Content Generation" },
  { icon: Clock, text: "Save Hours on Question Preparation" },
  { icon: Database, text: "Centralized Knowledge Repository" },
  { icon: Shield, text: "Secure & Private Platform" },
  { icon: Users, text: "Built for Educators, by Educators" },
];

export function Benefits() {
  return (
    <section className="py-24 subtle-gradient relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Designed for
                <span className="gradient-text"> Modern Educators</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Join hundreds of educators at REVA University who are transforming 
                their teaching with Vidyamitra's AI-powered tools.
              </p>
            </div>

            {/* Benefits list */}
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:shadow-card transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{benefit.text}</span>
                </div>
              ))}
            </div>

            <Button variant="hero" size="lg" asChild>
              <Link to="/auth?mode=signup">
                Try it Free
                <Check className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* Right content - Stats card */}
          <div className="relative">
            <div className="bg-card rounded-2xl shadow-xl border border-border p-8 space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <Zap className="w-4 h-4" />
                  Platform Statistics
                </div>
                <h3 className="text-2xl font-bold text-foreground">
                  Trusted by REVA University
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-secondary/50 rounded-xl">
                  <div className="text-3xl font-bold gradient-text">15+</div>
                  <div className="text-sm text-muted-foreground mt-1">Schools & Departments</div>
                </div>
                <div className="text-center p-4 bg-secondary/50 rounded-xl">
                  <div className="text-3xl font-bold gradient-text">500+</div>
                  <div className="text-sm text-muted-foreground mt-1">Active Educators</div>
                </div>
                <div className="text-center p-4 bg-secondary/50 rounded-xl">
                  <div className="text-3xl font-bold gradient-text">50K+</div>
                  <div className="text-sm text-muted-foreground mt-1">Questions Generated</div>
                </div>
                <div className="text-center p-4 bg-secondary/50 rounded-xl">
                  <div className="text-3xl font-bold gradient-text">2K+</div>
                  <div className="text-sm text-muted-foreground mt-1">Presentations Created</div>
                </div>
              </div>

              <div className="pt-4 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                  Empowering education through artificial intelligence
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
