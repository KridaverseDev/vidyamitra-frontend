import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ListChecks, Clock, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Quiz() {
  return (
    <DashboardLayout 
      title="Quiz Generator" 
      description="Create interactive quizzes and assessments"
    >
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <ListChecks className="w-10 h-10 text-primary" />
          </div>

          {/* Content */}
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Quiz Module Coming Soon
          </h2>
          <p className="text-muted-foreground mb-8">
            We're working hard to bring you an amazing quiz generation experience. 
            Create interactive assessments, set time limits, and track student performance.
          </p>

          {/* Features preview */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-card border border-border">
              <Clock className="w-6 h-6 text-primary mb-2" />
              <p className="text-sm font-medium text-foreground">Timed Quizzes</p>
              <p className="text-xs text-muted-foreground">Set time limits for assessments</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border">
              <Bell className="w-6 h-6 text-primary mb-2" />
              <p className="text-sm font-medium text-foreground">Instant Feedback</p>
              <p className="text-xs text-muted-foreground">Real-time results for students</p>
            </div>
          </div>

          {/* Notify form */}
          <div className="flex gap-3 max-w-sm mx-auto">
            <Input placeholder="Enter your email" type="email" />
            <Button variant="hero">Notify Me</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
