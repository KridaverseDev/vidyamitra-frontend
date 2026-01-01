import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Sparkles, 
  Check, 
  X, 
  Edit2, 
  Trash2,
  FileDown,
  ArrowLeft,
  Plus
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Mock data
const courses = [
  { id: 1, name: "Data Structures & Algorithms", code: "CS301", semester: "V", school: "School of Computing" },
  { id: 2, name: "Database Management Systems", code: "CS302", semester: "V", school: "School of Computing" },
  { id: 3, name: "Computer Networks", code: "CS401", semester: "VII", school: "School of Computing" },
];

const questions = [
  { 
    id: 1, 
    text: "What is the time complexity of binary search algorithm?", 
    difficulty: "Medium", 
    blooms: "L2", 
    marks: 2, 
    validated: true,
    courseId: 1
  },
  { 
    id: 2, 
    text: "Explain the difference between stack and queue data structures with examples.", 
    difficulty: "Easy", 
    blooms: "L3", 
    marks: 5, 
    validated: true,
    courseId: 1
  },
  { 
    id: 3, 
    text: "Implement a function to detect a cycle in a linked list.", 
    difficulty: "Hard", 
    blooms: "L4", 
    marks: 10, 
    validated: false,
    courseId: 1
  },
  { 
    id: 4, 
    text: "What is the worst-case time complexity of quicksort?", 
    difficulty: "Easy", 
    blooms: "L1", 
    marks: 2, 
    validated: false,
    courseId: 1
  },
];

const difficultyColors: Record<string, string> = {
  Easy: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Hard: "bg-red-500/10 text-red-600 border-red-500/20",
};

export default function Questions() {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [generateOpen, setGenerateOpen] = useState(false);

  const validatedQuestions = questions.filter(q => q.validated && q.courseId === selectedCourse);
  const unvalidatedQuestions = questions.filter(q => !q.validated && q.courseId === selectedCourse);

  const handleGenerate = () => {
    toast({
      title: "Generating questions...",
      description: "AI is generating questions from your document.",
    });
    setGenerateOpen(false);
  };

  const toggleQuestion = (id: number) => {
    setSelectedQuestions(prev => 
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  if (!selectedCourse) {
    return (
      <DashboardLayout 
        title="Question Bank" 
        description="Create and manage assessment questions"
      >
        <div className="space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course.id)}
                className="text-left p-6 rounded-xl border border-border bg-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
              >
                <h3 className="font-semibold text-foreground mb-1">{course.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {course.code} • Semester {course.semester}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{course.school}</p>
                <Button variant="subtle" size="sm" className="mt-4">
                  View Questions
                </Button>
              </button>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const selectedCourseName = courses.find(c => c.id === selectedCourse)?.name;

  return (
    <DashboardLayout 
      title={selectedCourseName || "Questions"} 
      description="Manage questions for this course"
    >
      <div className="space-y-6">
        {/* Back button and actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedCourse(null)}
            className="w-fit"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
          <div className="flex gap-3">
            <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Questions
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Generate Questions with AI</DialogTitle>
                  <DialogDescription>
                    Configure how AI should generate questions from your documents.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Source Document</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a document" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="doc1">Arrays and Linked Lists</SelectItem>
                        <SelectItem value="doc2">Trees and Graphs</SelectItem>
                        <SelectItem value="doc3">Sorting Algorithms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Number of Questions</Label>
                    <Input type="number" placeholder="10" defaultValue={10} />
                  </div>
                  <div className="space-y-2">
                    <Label>Custom Prompt (Optional)</Label>
                    <Textarea 
                      placeholder="E.g., Focus on practical applications..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Easy</Label>
                      <Input type="number" placeholder="3" defaultValue={3} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Medium</Label>
                      <Input type="number" placeholder="5" defaultValue={5} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Hard</Label>
                      <Input type="number" placeholder="2" defaultValue={2} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setGenerateOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="hero" onClick={handleGenerate}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            {selectedQuestions.length > 0 && (
              <Button variant="outline">
                <FileDown className="w-4 h-4 mr-2" />
                Export Selected ({selectedQuestions.length})
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="validated" className="space-y-4">
          <TabsList>
            <TabsTrigger value="validated">
              Validated ({validatedQuestions.length})
            </TabsTrigger>
            <TabsTrigger value="unvalidated">
              Unvalidated ({unvalidatedQuestions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="validated" className="space-y-3">
            {validatedQuestions.map((question) => (
              <QuestionCard 
                key={question.id} 
                question={question} 
                selected={selectedQuestions.includes(question.id)}
                onToggle={() => toggleQuestion(question.id)}
              />
            ))}
            {validatedQuestions.length === 0 && (
              <EmptyState message="No validated questions yet. Generate some questions to get started!" />
            )}
          </TabsContent>

          <TabsContent value="unvalidated" className="space-y-3">
            {unvalidatedQuestions.map((question) => (
              <QuestionCard 
                key={question.id} 
                question={question}
                selected={selectedQuestions.includes(question.id)}
                onToggle={() => toggleQuestion(question.id)}
              />
            ))}
            {unvalidatedQuestions.length === 0 && (
              <EmptyState message="No unvalidated questions. All questions have been reviewed!" />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

interface QuestionCardProps {
  question: {
    id: number;
    text: string;
    difficulty: string;
    blooms: string;
    marks: number;
    validated: boolean;
  };
  selected: boolean;
  onToggle: () => void;
}

function QuestionCard({ question, selected, onToggle }: QuestionCardProps) {
  return (
    <div className={`p-4 rounded-xl border bg-card transition-all duration-200 ${
      selected ? "border-primary shadow-sm" : "border-border hover:border-primary/30"
    }`}>
      <div className="flex items-start gap-4">
        <Checkbox 
          checked={selected} 
          onCheckedChange={onToggle}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <p className="text-foreground">{question.text}</p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge variant="outline" className={difficultyColors[question.difficulty]}>
              {question.difficulty}
            </Badge>
            <Badge variant="outline" className="bg-secondary">
              Bloom's {question.blooms}
            </Badge>
            <Badge variant="outline" className="bg-secondary">
              {question.marks} Marks
            </Badge>
            {question.validated ? (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                <Check className="w-3 h-3 mr-1" />
                Validated
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                <X className="w-3 h-3 mr-1" />
                Pending
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-12 rounded-xl border border-dashed border-border text-center">
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
