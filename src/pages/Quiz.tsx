import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
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
  Edit2,
  Trash2,
  FileDown,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Download,
  ListChecks,
  ArrowLeft
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  useMyCourses,
  useSearchCourses,
  useCourseDocuments
} from "@/lib/api/hooks";
import {
  useGenerateQuiz,
  useQuizQuestions,
  useDeleteQuizQuestion,
  useDeleteQuiz,
  useUpdateQuizQuestion,
  useExportToMoodle
} from "@/lib/api/hooks";
import { getErrorMessage } from "@/lib/api";
import type { Course, Document, QuizQuestion } from "@/lib/api/types";

const normalizeTopic = (topic: string): string => {
  return topic
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/_/g, "-")
    .split("-")
    .filter(Boolean)
    .join("-");
};

const formatTopicForDisplay = (topic: string): string => {
  return topic
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function Quiz() {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTopic, setCurrentTopic] = useState<string>("");
  const [generateOpen, setGenerateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);

  // Fetch courses
  const { data: myCoursesData, isLoading: isLoadingCourses } = useMyCourses({
    page: 1,
    page_size: 50,
  });

  const { data: searchData, isLoading: isSearching } = useSearchCourses({
    name: searchQuery,
    page: 1,
    page_size: 50,
  });

  const coursesData = searchQuery.trim().length > 0 ? searchData : myCoursesData;
  const courses = useMemo(() => coursesData?.results || [], [coursesData?.results]);
  const isLoadingCoursesData = searchQuery.trim().length > 0 ? isSearching : isLoadingCourses;

  // Fetch documents for selected course
  const { data: documentsData, isLoading: isLoadingDocuments } = useCourseDocuments(
    selectedCourse || 0,
    { page: 1, page_size: 100 }
  );
  const documents = useMemo(() => documentsData?.results || documentsData?.documents || [], [documentsData]);

  // Fetch quiz questions for current topic
  const { data: quizData, isLoading: isLoadingQuiz } = useQuizQuestions(
    currentTopic,
    { page: 1, page_size: 100 }
  );
  const quizQuestions = useMemo(() => quizData?.results || [], [quizData?.results]);

  // Mutations
  const generateQuiz = useGenerateQuiz(selectedDocument || 0);
  const deleteQuestion = useDeleteQuizQuestion(currentTopic);
  const deleteQuiz = useDeleteQuiz();
  const updateQuestion = useUpdateQuizQuestion(currentTopic);
  const exportToMoodle = useExportToMoodle();

  const handleGenerate = async (topic: string, count: number, query: string) => {
    if (!selectedDocument) {
      toast({
        title: "No document selected",
        description: "Please select a document to generate quiz from.",
        variant: "destructive",
      });
      return;
    }

    try {
      const normalizedTopic = normalizeTopic(topic);
      const result = await generateQuiz.mutateAsync({
        topic: normalizedTopic,
        count,
        query
      });
      setCurrentTopic(normalizedTopic);
      setGenerateOpen(false);
      toast({
        title: "Quiz generated",
        description: `Successfully generated ${result.count || result.results?.length || 0} question(s).`,
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    try {
      await deleteQuestion.mutateAsync(questionId);
      toast({
        title: "Question deleted",
        description: "The quiz question has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuiz = async () => {
    if (!currentTopic) return;

    try {
      await deleteQuiz.mutateAsync(currentTopic);
      setCurrentTopic("");
      toast({
        title: "Quiz deleted",
        description: "All questions for this topic have been deleted.",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    if (!currentTopic) return;

    try {
      const result = await exportToMoodle.mutateAsync(currentTopic);

      // Download the file
      const fileResponse = await fetch(result.file_path);
      const blob = await fileResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentTopic}.xml`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Quiz exported",
        description: `"${currentTopic}.xml" has been downloaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleEdit = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setEditOpen(true);
  };

  const handleUpdate = async (updates: { question?: string; options?: { option_a?: string; option_b?: string; option_c?: string; option_d?: string }; correct?: 'a' | 'b' | 'c' | 'd' }) => {
    if (!editingQuestion?.id) return;

    try {
      await updateQuestion.mutateAsync({ questionId: editingQuestion.id, updates });
      toast({
        title: "Question updated",
        description: "The quiz question has been updated successfully.",
      });
      setEditOpen(false);
      setEditingQuestion(null);
    } catch (error) {
      toast({
        title: "Update failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  if (!selectedCourse) {
    return (
      <DashboardLayout
        title="Quiz Generator"
        description="Create interactive MCQ quizzes from your course documents"
      >
        <div className="space-y-6">
          {/* Course Selection */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Select a Course</h3>
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {isLoadingCoursesData ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : courses.length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-border text-center">
                <p className="text-muted-foreground">No courses found</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(course.id || 0)}
                    className="p-4 rounded-xl border bg-card hover:border-primary transition-all text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{course.name}</h4>
                        <p className="text-sm text-muted-foreground">{course.course_code || course.name}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Select
                      </Button>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Quiz Generator"
      description="Create interactive MCQ quizzes from your course documents"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedCourse(null);
                setSelectedDocument(null);
                setCurrentTopic("");
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>
            {currentTopic && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  Topic: {formatTopicForDisplay(currentTopic)}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={exportToMoodle.isPending || quizQuestions.length === 0}
                >
                  {exportToMoodle.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Export to Moodle
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteQuiz}
                  disabled={deleteQuiz.isPending}
                >
                  {deleteQuiz.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete Quiz
                </Button>
              </div>
            )}
          </div>
          <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" disabled={!selectedDocument}>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Generate Quiz</DialogTitle>
                <DialogDescription>
                  Create MCQ quiz questions from your document using AI.
                </DialogDescription>
              </DialogHeader>
              <GenerateQuizForm
                documents={documents}
                selectedDocument={selectedDocument}
                onSelectDocument={setSelectedDocument}
                onGenerate={handleGenerate}
                isLoading={generateQuiz.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Document Selection */}
        {!currentTopic && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select a Document</h3>
            {isLoadingDocuments ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : documents.length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-border text-center">
                <p className="text-muted-foreground">No documents found for this course</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocument(doc.id || 0)}
                    className={`p-4 rounded-xl border transition-all text-left ${selectedDocument === doc.id
                      ? "border-primary bg-primary/5"
                      : "bg-card hover:border-primary"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{doc.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {doc.type || "Document"}
                        </p>
                      </div>
                      {selectedDocument === doc.id && (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quiz Questions */}
        {currentTopic && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Quiz Questions ({quizQuestions.length})
              </h3>
            </div>

            {isLoadingQuiz ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : quizQuestions.length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-border text-center">
                <ListChecks className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No questions found for this topic</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setGenerateOpen(true)}
                >
                  Generate Questions
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {quizQuestions.map((question) => (
                  <QuizQuestionCard
                    key={question.id}
                    question={question}
                    onEdit={() => handleEdit(question)}
                    onDelete={() => question.id && handleDeleteQuestion(question.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Edit Question Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Quiz Question</DialogTitle>
              <DialogDescription>
                Update the question, options, or correct answer.
              </DialogDescription>
            </DialogHeader>
            {editingQuestion && (
              <EditQuizQuestionForm
                question={editingQuestion}
                onSave={handleUpdate}
                onCancel={() => {
                  setEditOpen(false);
                  setEditingQuestion(null);
                }}
                isLoading={updateQuestion.isPending}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

// Generate Quiz Form Component
function GenerateQuizForm({
  documents,
  selectedDocument,
  onSelectDocument,
  onGenerate,
  isLoading
}: {
  documents: Document[];
  selectedDocument: number | null;
  onSelectDocument: (id: number) => void;
  onGenerate: (topic: string, count: number, query: string) => Promise<void>;
  isLoading: boolean;
}) {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(10);
  const [query, setQuery] = useState("");

  const handleSubmit = () => {
    if (!selectedDocument) {
      toast({
        title: "Missing document",
        description: "Please select a document.",
        variant: "destructive",
      });
      return;
    }
    if (!topic.trim()) {
      toast({
        title: "Missing topic",
        description: "Please enter a topic name.",
        variant: "destructive",
      });
      return;
    }
    if (!query.trim()) {
      toast({
        title: "Missing query",
        description: "Please enter a query for question generation.",
        variant: "destructive",
      });
      return;
    }
    onGenerate(topic.trim(), count, query.trim());
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Document</Label>
        <Select
          value={selectedDocument?.toString() || ""}
          onValueChange={(value) => onSelectDocument(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a document" />
          </SelectTrigger>
          <SelectContent>
            {documents.map((doc) => (
              <SelectItem key={doc.id} value={doc.id?.toString() || ""}>
                {doc.name} {doc.type === "SYLLABUS" && "(Syllabus)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Topic</Label>
        <Input
          placeholder="e.g., Machine Learning Basics"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Number of Questions</Label>
        <Input
          type="number"
          min="1"
          max="50"
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value) || 10)}
        />
      </div>
      <div className="space-y-2">
        <Label>Query / Prompt</Label>
        <Textarea
          placeholder="e.g., Generate questions on supervised learning algorithms"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={4}
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button
          variant="hero"
          onClick={handleSubmit}
          disabled={isLoading || !selectedDocument || !topic.trim() || !query.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Quiz
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Quiz Question Card Component
function QuizQuestionCard({
  question,
  onEdit,
  onDelete
}: {
  question: QuizQuestion;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const correctOption = question.correct.toUpperCase();
  const options = [
    { key: 'A', value: question.options.option_a },
    { key: 'B', value: question.options.option_b },
    { key: 'C', value: question.options.option_c },
    { key: 'D', value: question.options.option_d },
  ];

  return (
    <div className="p-6 rounded-xl border bg-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="font-medium text-foreground mb-4">{question.question}</p>
          <div className="space-y-2">
            {options.map((opt) => (
              <div
                key={opt.key}
                className={`flex items-center gap-3 p-3 rounded-lg border ${opt.key === correctOption
                  ? "bg-emerald-500/10 border-emerald-500/20"
                  : "bg-muted/50"
                  }`}
              >
                <Badge
                  variant={opt.key === correctOption ? "default" : "outline"}
                  className={opt.key === correctOption ? "bg-emerald-600" : ""}
                >
                  {opt.key}
                </Badge>
                <span className="flex-1">{opt.value}</span>
                {opt.key === correctOption && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Edit Quiz Question Form Component
function EditQuizQuestionForm({
  question,
  onSave,
  onCancel,
  isLoading
}: {
  question: QuizQuestion;
  onSave: (updates: { question?: string; options?: { option_a?: string; option_b?: string; option_c?: string; option_d?: string }; correct?: 'a' | 'b' | 'c' | 'd' }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [questionText, setQuestionText] = useState(question.question);
  const [optionA, setOptionA] = useState(question.options.option_a);
  const [optionB, setOptionB] = useState(question.options.option_b);
  const [optionC, setOptionC] = useState(question.options.option_c);
  const [optionD, setOptionD] = useState(question.options.option_d);
  const [correct, setCorrect] = useState<'a' | 'b' | 'c' | 'd'>(question.correct);

  const handleSubmit = () => {
    onSave({
      question: questionText.trim(),
      options: {
        option_a: optionA.trim(),
        option_b: optionB.trim(),
        option_c: optionC.trim(),
        option_d: optionD.trim(),
      },
      correct,
    });
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Question</Label>
        <Textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Option A</Label>
          <Input
            value={optionA}
            onChange={(e) => setOptionA(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Option B</Label>
          <Input
            value={optionB}
            onChange={(e) => setOptionB(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Option C</Label>
          <Input
            value={optionC}
            onChange={(e) => setOptionC(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Option D</Label>
          <Input
            value={optionD}
            onChange={(e) => setOptionD(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Correct Answer</Label>
        <Select
          value={correct}
          onValueChange={(value) => setCorrect(value as 'a' | 'b' | 'c' | 'd')}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
            <SelectItem value="b">B</SelectItem>
            <SelectItem value="c">C</SelectItem>
            <SelectItem value="d">D</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="hero"
          onClick={handleSubmit}
          disabled={isLoading || !questionText.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
