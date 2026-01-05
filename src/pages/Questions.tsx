import { useState, useMemo } from "react";
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
  Plus,
  Loader2,
  AlertCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  useMyCourses,
  useSearchCourses,
  useCourseDocuments
} from "@/lib/api/hooks";
import {
  useCourseQuestions,
  useCreateQuestions,
  useGenerateQuestions,
  useUpdateQuestion,
  useDeleteQuestions,
  useInvalidateQuestions,
  useValidateQuestions,
  useGenerateQuestionPaper
} from "@/lib/api/hooks";
import { getErrorMessage, isApiError } from "@/lib/api";
import type { Course, Question, Document, GenerateQuestionsRequest } from "@/lib/api/types";

const difficultyColors: Record<string, string> = {
  easy: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  hard: "bg-red-500/10 text-red-600 border-red-500/20",
};

export default function Questions() {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [paperOpen, setPaperOpen] = useState(false);

  // Fetch courses
  const { data: myCoursesData, isLoading: isLoadingCourses, error: coursesError } = useMyCourses({
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

  // Fetch validated and unvalidated questions separately
  const {
    data: validatedQuestionsData,
    isLoading: isLoadingValidated,
    error: validatedError
  } = useCourseQuestions(selectedCourse || 0, {
    page: 1,
    page_size: 100,
    is_valid: true, // Get validated questions
  });

  const {
    data: unvalidatedQuestionsData,
    isLoading: isLoadingUnvalidated,
    error: unvalidatedError
  } = useCourseQuestions(selectedCourse || 0, {
    page: 1,
    page_size: 100,
    is_valid: false, // Get unvalidated questions
  });

  const validatedQuestions = useMemo(() => validatedQuestionsData?.results || [], [validatedQuestionsData?.results]);
  const unvalidatedQuestions = useMemo(() => unvalidatedQuestionsData?.results || [], [unvalidatedQuestionsData?.results]);
  const allQuestions = useMemo(() => [...validatedQuestions, ...unvalidatedQuestions], [validatedQuestions, unvalidatedQuestions]);

  const isLoadingQuestions = isLoadingValidated || isLoadingUnvalidated;
  const questionsError = validatedError || unvalidatedError;

  // Fetch documents for question generation (with pagination)
  const { data: documentsData } = useCourseDocuments(selectedCourse || 0, {
    page: 1,
    page_size: 50,
  });
  // API returns paginated response with 'results' array, but also supports legacy 'documents' format
  const documents = documentsData?.results || documentsData?.documents || [];

  // Mutations
  const createQuestions = useCreateQuestions(selectedCourse || 0);
  const generateQuestions = useGenerateQuestions(selectedCourse || 0);
  const updateQuestion = useUpdateQuestion(selectedCourse || 0);
  const deleteQuestions = useDeleteQuestions(selectedCourse || 0);
  const invalidateQuestions = useInvalidateQuestions(selectedCourse || 0);
  const validateQuestions = useValidateQuestions(selectedCourse || 0);
  const generatePaper = useGenerateQuestionPaper(selectedCourse || 0);

  // Filter questions by search query
  const filteredValidatedQuestions = useMemo(() => {
    if (!searchQuery.trim()) return validatedQuestions;
    const query = searchQuery.toLowerCase();
    return validatedQuestions.filter(q => {
      const questionText = q.question || q.question_text || "";
      return questionText.toLowerCase().includes(query);
    });
  }, [validatedQuestions, searchQuery]);

  const filteredUnvalidatedQuestions = useMemo(() => {
    if (!searchQuery.trim()) return unvalidatedQuestions;
    const query = searchQuery.toLowerCase();
    return unvalidatedQuestions.filter(q => {
      const questionText = q.question || q.question_text || "";
      return questionText.toLowerCase().includes(query);
    });
  }, [unvalidatedQuestions, searchQuery]);

  const toggleQuestion = (id: number) => {
    setSelectedQuestions(prev =>
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (selectedQuestions.length === 0) return;

    try {
      await deleteQuestions.mutateAsync({
        question_ids: selectedQuestions,
      });
      toast({
        title: "Questions deleted",
        description: `Successfully deleted ${selectedQuestions.length} question(s).`,
      });
      setSelectedQuestions([]);
    } catch (error) {
      toast({
        title: "Delete failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleInvalidate = async () => {
    if (selectedQuestions.length === 0) return;

    try {
      await invalidateQuestions.mutateAsync({
        questionIds: selectedQuestions,
        reason: "Marked as invalid by user",
      });
      toast({
        title: "Questions invalidated",
        description: `Successfully invalidated ${selectedQuestions.length} question(s).`,
      });
      setSelectedQuestions([]);
    } catch (error) {
      toast({
        title: "Invalidation failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleValidate = async () => {
    if (selectedQuestions.length === 0) return;

    try {
      await validateQuestions.mutateAsync(selectedQuestions);
      toast({
        title: "Questions validated",
        description: `Successfully validated ${selectedQuestions.length} question(s).`,
      });
      setSelectedQuestions([]);
    } catch (error) {
      toast({
        title: "Validation failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setEditOpen(true);
  };

  const handleGeneratePaper = async (questionIds: number[]) => {
    if (questionIds.length === 0) {
      toast({
        title: "No questions selected",
        description: "Please select questions to generate a paper.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { blob, filename } = await generatePaper.mutateAsync(questionIds);

      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Question paper downloaded",
        description: `"${filename}" has been downloaded successfully.`,
      });
      setPaperOpen(false);
      setSelectedQuestions([]);
    } catch (error) {
      toast({
        title: "Generation failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
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

          {isLoadingCoursesData ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : coursesError ? (
            <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm">{getErrorMessage(coursesError)}</p>
              </div>
            </div>
          ) : courses.length === 0 ? (
            <div className="p-12 rounded-xl border border-dashed border-border text-center">
              <p className="text-muted-foreground">No courses found</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course: Course) => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourse(course.id)}
                  className="text-left p-6 rounded-xl border border-border bg-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                >
                  <h3 className="font-semibold text-foreground mb-1">{course.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {course.course_code} {course.semester && `• Semester ${course.semester}`}
                  </p>
                  {course.school && (
                    <p className="text-xs text-muted-foreground mt-1">{course.school.name}</p>
                  )}
                  <Button variant="subtle" size="sm" className="mt-4">
                    View Questions
                  </Button>
                </button>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  const selectedCourseData = courses.find((c: Course) => c.id === selectedCourse);

  return (
    <DashboardLayout
      title={selectedCourseData?.name || "Questions"}
      description="Manage questions for this course"
    >
      <div className="space-y-6">
        {/* Back button and actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedCourse(null);
              setSelectedQuestions([]);
            }}
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
                <GenerateQuestionsForm
                  documents={documents}
                  onGenerate={async (request) => {
                    try {
                      // Validate documents exist before generating
                      const selectedDoc = documents.find(d => d.id === parseInt(request.document_id.toString()));
                      const selectedSyllabus = documents.find(d => d.id === parseInt(request.syllabus_id.toString()));

                      if (!selectedDoc) {
                        toast({
                          title: "Document not found",
                          description: "The selected source document does not exist. Please select a valid document.",
                          variant: "destructive",
                        });
                        return;
                      }

                      if (!selectedSyllabus) {
                        toast({
                          title: "Syllabus not found",
                          description: "The selected syllabus document does not exist. Please select a valid syllabus.",
                          variant: "destructive",
                        });
                        return;
                      }

                      const result = await generateQuestions.mutateAsync({
                        request,
                        params: { page: 1, page_size: 100 },
                      });

                      toast({
                        title: "Questions generated",
                        description: `Successfully generated ${result.count || result.results?.length || 0} question(s).`,
                      });
                      setGenerateOpen(false);
                    } catch (error) {
                      const errorMessage = getErrorMessage(error);

                      // Enhanced error handling for 500 errors
                      let detailedMessage = errorMessage;
                      if (isApiError(error) && error.statusCode === 500) {
                        detailedMessage = `${errorMessage}\n\nCommon fixes:\n• Add API keys in Profile > API Keys\n• Re-upload documents if they're missing\n• Try generating fewer questions`;
                      }

                      toast({
                        title: "Generation failed",
                        description: detailedMessage,
                        variant: "destructive",
                        duration: 10000, // Show longer for detailed errors
                      });
                    }
                  }}
                  isLoading={generateQuestions.isPending}
                />
              </DialogContent>
            </Dialog>
            <Dialog open={paperOpen} onOpenChange={setPaperOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FileDown className="w-4 h-4 mr-2" />
                  Generate Paper
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Generate Question Paper</DialogTitle>
                  <DialogDescription>
                    Create a question paper from existing questions in this course.
                  </DialogDescription>
                </DialogHeader>
                <GeneratePaperForm
                  selectedQuestions={selectedQuestions}
                  onGenerate={handleGeneratePaper}
                  isLoading={generatePaper.isPending}
                />
              </DialogContent>
            </Dialog>
            {selectedQuestions.length > 0 && (
              <>
                <Button
                  variant="default"
                  onClick={handleValidate}
                  disabled={validateQuestions.isPending}
                >
                  {validateQuestions.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Validate ({selectedQuestions.length})
                </Button>
                <Button
                  variant="outline"
                  onClick={handleInvalidate}
                  disabled={invalidateQuestions.isPending}
                >
                  {invalidateQuestions.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <X className="w-4 h-4 mr-2" />
                  )}
                  Invalidate ({selectedQuestions.length})
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteQuestions.isPending}
                >
                  {deleteQuestions.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete ({selectedQuestions.length})
                </Button>
              </>
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
        {isLoadingQuestions ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : questionsError ? (
          <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{getErrorMessage(questionsError)}</p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="validated" className="space-y-4">
            <TabsList>
              <TabsTrigger value="validated">
                Validated ({filteredValidatedQuestions.length})
              </TabsTrigger>
              <TabsTrigger value="unvalidated">
                Unvalidated ({filteredUnvalidatedQuestions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="validated" className="space-y-3">
              {filteredValidatedQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  selected={selectedQuestions.includes(question.id || 0)}
                  onToggle={() => question.id && toggleQuestion(question.id)}
                  onEdit={() => handleEdit(question)}
                  onDelete={async () => {
                    if (!question.id) return;
                    try {
                      await deleteQuestions.mutateAsync({
                        question_ids: [question.id],
                      });
                      toast({
                        title: "Question deleted",
                        description: "The question has been deleted successfully.",
                      });
                    } catch (error) {
                      toast({
                        title: "Delete failed",
                        description: getErrorMessage(error),
                        variant: "destructive",
                      });
                    }
                  }}
                />
              ))}
              {filteredValidatedQuestions.length === 0 && (
                <EmptyState message="No validated questions yet. Create some questions to get started!" />
              )}
            </TabsContent>

            <TabsContent value="unvalidated" className="space-y-3">
              {filteredUnvalidatedQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  selected={selectedQuestions.includes(question.id || 0)}
                  onToggle={() => question.id && toggleQuestion(question.id)}
                  onEdit={() => handleEdit(question)}
                  onDelete={async () => {
                    if (!question.id) return;
                    try {
                      await deleteQuestions.mutateAsync({
                        question_ids: [question.id],
                      });
                      toast({
                        title: "Question deleted",
                        description: "The question has been deleted successfully.",
                      });
                    } catch (error) {
                      toast({
                        title: "Delete failed",
                        description: getErrorMessage(error),
                        variant: "destructive",
                      });
                    }
                  }}
                />
              ))}
              {filteredUnvalidatedQuestions.length === 0 && (
                <EmptyState message="No unvalidated questions. All questions have been reviewed!" />
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Edit Question Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Update the question details below.
            </DialogDescription>
          </DialogHeader>
          {editingQuestion && (
            <EditQuestionForm
              question={editingQuestion}
              onSave={async (updates) => {
                if (!editingQuestion.id) return;
                try {
                  await updateQuestion.mutateAsync({
                    questionId: editingQuestion.id,
                    updates,
                  });
                  toast({
                    title: "Question updated",
                    description: "The question has been updated successfully.",
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
              }}
              onCancel={() => {
                setEditOpen(false);
                setEditingQuestion(null);
              }}
              isLoading={updateQuestion.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

interface QuestionCardProps {
  question: Question;
  selected: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function QuestionCard({ question, selected, onToggle, onEdit, onDelete }: QuestionCardProps) {
  const difficulty = question.difficulty || "medium";
  const difficultyLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  const questionText = question.question || question.question_text || "";
  const marks = question.marks || question.points || 0;
  const isValidated = question.validated ?? false;

  return (
    <div className={`p-4 rounded-xl border bg-card transition-all duration-200 ${selected ? "border-primary shadow-sm" : "border-border hover:border-primary/30"
      }`}>
      <div className="flex items-start gap-4">
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <p className="text-foreground">{questionText}</p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge variant="outline" className={difficultyColors[difficulty]}>
              {difficultyLabel}
            </Badge>
            {question.question_type && (
              <Badge variant="outline" className="bg-secondary">
                {question.question_type.replace("_", " ")}
              </Badge>
            )}
            {marks > 0 && (
              <Badge variant="outline" className="bg-secondary">
                {marks} {marks === 1 ? "Mark" : "Marks"}
              </Badge>
            )}
            {question.blooms_level && (
              <Badge variant="outline" className="bg-secondary">
                L{question.blooms_level}
              </Badge>
            )}
            {isValidated ? (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                <Check className="w-3 h-3 mr-1" />
                Validated
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                <X className="w-3 h-3 mr-1" />
                Unvalidated
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
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

function GenerateQuestionsForm({
  documents,
  onGenerate,
  isLoading
}: {
  documents: Document[];
  onGenerate: (request: GenerateQuestionsRequest) => Promise<void>;
  isLoading: boolean;
}) {
  const [documentId, setDocumentId] = useState<string>("");
  const [syllabusId, setSyllabusId] = useState<string>("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [userPrompt, setUserPrompt] = useState("");
  const [easyCount, setEasyCount] = useState(3);
  const [mediumCount, setMediumCount] = useState(5);
  const [hardCount, setHardCount] = useState(2);
  const [l1, setL1] = useState(2);
  const [l2, setL2] = useState(3);
  const [l3, setL3] = useState(2);
  const [l4, setL4] = useState(2);
  const [l5, setL5] = useState(1);
  const [l6, setL6] = useState(0);

  // Filter syllabus documents (for optional syllabus selection)
  const syllabusDocuments = documents.filter(doc =>
    doc.type === "SYLLABUS" || doc.name.toLowerCase().includes("syllabus")
  );
  // Source Document can be any document (including syllabus documents)

  const allDocuments = documents;

  const handleSubmit = () => {
    // Validate required fields
    if (!documentId) {
      toast({
        title: "Missing required field",
        description: "Please select a source document.",
        variant: "destructive",
      });
      return;
    }

    if (!syllabusId || syllabusId === "none") {
      toast({
        title: "Missing required field",
        description: "Please select a syllabus document.",
        variant: "destructive",
      });
      return;
    }

    if (!userPrompt.trim()) {
      toast({
        title: "Missing required field",
        description: "Please enter a user prompt for question generation.",
        variant: "destructive",
      });
      return;
    }

    // Validate distribution totals match count (recommended)
    const totalDifficulty = easyCount + mediumCount + hardCount;
    const totalBlooms = l1 + l2 + l3 + l4 + l5 + l6;

    if (totalDifficulty !== numQuestions) {
      toast({
        title: "Difficulty distribution mismatch",
        description: `Total difficulty distribution (${totalDifficulty}) should equal question count (${numQuestions}).`,
        variant: "destructive",
      });
      return;
    }

    if (totalBlooms !== numQuestions) {
      toast({
        title: "Blooms distribution mismatch",
        description: `Total Blooms distribution (${totalBlooms}) should equal question count (${numQuestions}).`,
        variant: "destructive",
      });
      return;
    }

    // All fields are REQUIRED according to the API
    const request: GenerateQuestionsRequest = {
      syllabus_id: parseInt(syllabusId), // REQUIRED
      document_id: parseInt(documentId), // REQUIRED
      count: numQuestions, // REQUIRED
      user_prompt: userPrompt.trim(), // REQUIRED - must not be empty
      difficulty_distribution: { // REQUIRED - all fields must be present
        easy: easyCount,
        medium: mediumCount,
        hard: hardCount,
      },
      blooms_distribution: { // REQUIRED - all fields must be present
        l1,
        l2,
        l3,
        l4,
        l5,
        l6,
      },
    };

    onGenerate(request);
  };

  return (
    <div className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto">
      <div className="space-y-2">
        <Label>Syllabus Document {syllabusDocuments.length === 0 && <span className="text-muted-foreground text-xs">(No syllabus documents available)</span>}</Label>
        <Select
          value={syllabusId || "none"}
          onValueChange={(value) => setSyllabusId(value === "none" ? "" : value)}
          disabled={syllabusDocuments.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder={syllabusDocuments.length === 0 ? "No syllabus documents available" : "Select a syllabus document"} />
          </SelectTrigger>
          <SelectContent>
            {syllabusDocuments.length === 0 ? (
              <SelectItem value="no-syllabus" disabled>No syllabus documents available</SelectItem>
            ) : (
              <>
                <SelectItem value="none">Select a syllabus document</SelectItem>
                {syllabusDocuments.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id.toString()}>
                    {doc.name}
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>
        {syllabusDocuments.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Upload a syllabus document in the Knowledge page to generate questions.
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Source Document {documents.length === 0 && <span className="text-muted-foreground text-xs">(No documents available)</span>}</Label>
        <Select value={documentId} onValueChange={setDocumentId} disabled={allDocuments.length === 0}>
          <SelectTrigger>
            <SelectValue placeholder={allDocuments.length === 0 ? "No documents available" : "Select a document"} />
          </SelectTrigger>
          <SelectContent>
            {allDocuments.length === 0 ? (
              <SelectItem value="no-docs" disabled>No documents available</SelectItem>
            ) : (
              allDocuments.map((doc) => (
                <SelectItem key={doc.id} value={doc.id.toString()}>
                  {doc.name} {doc.type === "SYLLABUS" && <span className="text-xs text-muted-foreground">(Syllabus)</span>}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {allDocuments.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Upload documents in the Knowledge page to generate questions.
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Number of Questions</Label>
        <Input
          type="number"
          placeholder="10"
          min="1"
          max="50"
          value={numQuestions}
          onChange={(e) => setNumQuestions(parseInt(e.target.value) || 10)}
        />
        <p className="text-xs text-muted-foreground">
          Recommended: Start with 5-10 questions. Large counts may cause errors.
        </p>
      </div>
      <div className="space-y-2">
        <Label>User Prompt <span className="text-destructive">*</span></Label>
        <Textarea
          placeholder="Generate questions focusing on machine learning concepts"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          rows={3}
          required
        />
        <p className="text-xs text-muted-foreground">
          Required: Provide a prompt to guide question generation
        </p>
      </div>
      <div className="space-y-2">
        <Label>Difficulty Distribution</Label>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Easy</Label>
            <Input
              type="number"
              min="0"
              value={easyCount}
              onChange={(e) => setEasyCount(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Medium</Label>
            <Input
              type="number"
              min="0"
              value={mediumCount}
              onChange={(e) => setMediumCount(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Hard</Label>
            <Input
              type="number"
              min="0"
              value={hardCount}
              onChange={(e) => setHardCount(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Bloom's Taxonomy Distribution</Label>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">L1 (Remember)</Label>
            <Input
              type="number"
              min="0"
              value={l1}
              onChange={(e) => setL1(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">L2 (Understand)</Label>
            <Input
              type="number"
              min="0"
              value={l2}
              onChange={(e) => setL2(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">L3 (Apply)</Label>
            <Input
              type="number"
              min="0"
              value={l3}
              onChange={(e) => setL3(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">L4 (Analyze)</Label>
            <Input
              type="number"
              min="0"
              value={l4}
              onChange={(e) => setL4(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">L5 (Evaluate)</Label>
            <Input
              type="number"
              min="0"
              value={l5}
              onChange={(e) => setL5(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">L6 (Create)</Label>
            <Input
              type="number"
              min="0"
              value={l6}
              onChange={(e) => setL6(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button
          variant="hero"
          onClick={handleSubmit}
          disabled={
            !documentId ||
            !syllabusId ||
            syllabusId === "none" ||
            !userPrompt.trim() ||
            isLoading ||
            syllabusDocuments.length === 0
          }
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function GeneratePaperForm({
  selectedQuestions,
  onGenerate,
  isLoading
}: {
  selectedQuestions: number[];
  onGenerate: (questionIds: number[]) => Promise<void>;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-4 pt-4">
      {selectedQuestions.length === 0 ? (
        <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Please select questions from the list above to generate a question paper.
          </p>
        </div>
      ) : (
        <>
          <div className="p-4 rounded-lg border bg-card">
            <p className="text-sm text-foreground">
              <strong>{selectedQuestions.length}</strong> question{selectedQuestions.length !== 1 ? "s" : ""} selected
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              A question paper will be generated from the selected questions.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="hero"
              onClick={() => onGenerate(selectedQuestions)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 mr-2" />
                  Generate Paper
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function EditQuestionForm({
  question,
  onSave,
  onCancel,
  isLoading
}: {
  question: Question;
  onSave: (updates: Partial<Question>) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}) {
  // Use API field names: 'question' (primary) or 'question_text' (backward compat)
  const initialQuestionText = question.question || question.question_text || "";
  const initialMarks = question.marks || question.points || 10;

  const [questionText, setQuestionText] = useState(initialQuestionText);
  const [questionType, setQuestionType] = useState(question.question_type || "multiple_choice");
  const [difficulty, setDifficulty] = useState(question.difficulty || "medium");
  const [marks, setMarks] = useState(initialMarks);

  const handleSubmit = () => {
    // Use API field names: 'question' and 'marks'
    onSave({
      question: questionText.trim(), // API uses 'question' field
      question_text: questionText.trim(), // Also include for backward compat
      question_type: questionType as "multiple_choice" | "true_false" | "short_answer" | "essay",
      difficulty: difficulty as "easy" | "medium" | "hard",
      marks: marks, // API uses 'marks' field
      points: marks, // Also include for backward compat
    });
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Question Text</Label>
        <Textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          rows={4}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Question Type</Label>
          <Select
            value={questionType}
            onValueChange={(value) => setQuestionType(value as "multiple_choice" | "true_false" | "short_answer" | "essay")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
              <SelectItem value="true_false">True/False</SelectItem>
              <SelectItem value="short_answer">Short Answer</SelectItem>
              <SelectItem value="essay">Essay</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Difficulty</Label>
          <Select
            value={difficulty}
            onValueChange={(value) => setDifficulty(value as "easy" | "medium" | "hard")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Marks</Label>
        <Input
          type="number"
          min="1"
          value={marks}
          onChange={(e) => setMarks(parseInt(e.target.value) || 10)}
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="hero" onClick={handleSubmit} disabled={isLoading || !questionText?.trim()}>
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
