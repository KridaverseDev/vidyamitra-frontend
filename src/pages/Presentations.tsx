import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Presentation,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Trash2,
  MoreVertical,
  Loader2,
  AlertCircle,
  Heart,
  Edit2,
  Sparkles,
  Star
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  useMyCourses,
  useSearchCourses,
  useCourseDocuments
} from "@/lib/api/hooks";
import {
  usePresentations,
  usePresentationDetails,
  useGeneratePresentation,
  useExportPresentation,
  useDeletePresentation,
  useMarkFavorite,
  useRemoveFavorite,
  useFavoritePresentations,
  useUpdateSlide,
  useDeleteSlide
} from "@/lib/api/hooks";
import { getErrorMessage } from "@/lib/api";
import type { Course, Document, Presentation as PresentationType, Slide } from "@/lib/api/types";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Presentations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<number | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedPresentation, setSelectedPresentation] = useState<PresentationType | null>(null);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");

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

  // Fetch presentations
  const { data: presentationsData, isLoading: isLoadingPresentations } = usePresentations({
    page: 1,
    page_size: 50,
  });
  const presentations = useMemo(() => presentationsData?.results || [], [presentationsData?.results]);

  // Fetch favorite presentations
  const { data: favoritesData, isLoading: isLoadingFavorites } = useFavoritePresentations({
    page: 1,
    page_size: 50,
  });
  const favorites = useMemo(() => favoritesData?.results || [], [favoritesData?.results]);

  // Fetch presentation details when viewing
  const { data: presentationDetails, isLoading: isLoadingDetails } = usePresentationDetails(
    selectedPresentation?.id || 0,
    !!selectedPresentation?.id && viewOpen
  );

  // Mutations
  const generatePresentation = useGeneratePresentation(selectedDocument || 0);
  const deletePresentation = useDeletePresentation();
  const exportPresentation = useExportPresentation();
  const markFavorite = useMarkFavorite();
  const removeFavorite = useRemoveFavorite();
  const updateSlide = useUpdateSlide(selectedPresentation?.id || 0);
  const deleteSlide = useDeleteSlide(selectedPresentation?.id || 0);

  // Filter presentations based on active tab
  const displayedPresentations = activeTab === "favorites" ? favorites : presentations;
  const filteredPresentations = useMemo(() => {
    if (!searchQuery.trim()) return displayedPresentations;
    return displayedPresentations.filter(p =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.query?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [displayedPresentations, searchQuery]);

  const handleGenerate = async (title: string, count: number, query: string) => {
    if (!selectedDocument) {
      toast({
        title: "No document selected",
        description: "Please select a document to generate presentation from.",
        variant: "destructive",
      });
      return;
    }

    try {
      await generatePresentation.mutateAsync({ title, count, query });
      toast({
        title: "Presentation generated",
        description: "Your presentation has been generated successfully.",
      });
      setGenerateOpen(false);
      setSelectedDocument(null);
    } catch (error) {
      toast({
        title: "Generation failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleView = (pres: PresentationType) => {
    setSelectedPresentation(pres);
    setCurrentSlide(0);
    setViewOpen(true);
  };

  const handleExport = async (pres: PresentationType) => {
    try {
      const { blob, filename } = await exportPresentation.mutateAsync(pres.id || 0);

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
        title: "Presentation exported",
        description: `"${filename}" has been downloaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (pres: PresentationType) => {
    if (!pres.id) return;

    try {
      await deletePresentation.mutateAsync(pres.id);
      toast({
        title: "Presentation deleted",
        description: "The presentation has been deleted successfully.",
      });
      if (selectedPresentation?.id === pres.id) {
        setViewOpen(false);
        setSelectedPresentation(null);
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleToggleFavorite = async (pres: PresentationType, isFavorite: boolean) => {
    if (!pres.id) return;

    try {
      if (isFavorite) {
        await removeFavorite.mutateAsync(pres.id);
        toast({
          title: "Removed from favorites",
          description: "The presentation has been removed from your favorites.",
        });
      } else {
        await markFavorite.mutateAsync(pres.id);
        toast({
          title: "Added to favorites",
          description: "The presentation has been added to your favorites.",
        });
      }
    } catch (error) {
      toast({
        title: "Operation failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleEditSlide = (slide: Slide) => {
    setEditingSlide(slide);
    setEditOpen(true);
  };

  const handleUpdateSlide = async (updates: { title?: string; content?: string }) => {
    if (!editingSlide?.id) return;

    try {
      await updateSlide.mutateAsync({ slideId: editingSlide.id, request: updates });
      toast({
        title: "Slide updated",
        description: "The slide has been updated successfully.",
      });
      setEditOpen(false);
      setEditingSlide(null);
    } catch (error) {
      toast({
        title: "Update failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleDeleteSlide = async (slide: Slide) => {
    if (!slide.id) return;

    try {
      await deleteSlide.mutateAsync(slide.id);
      toast({
        title: "Slide deleted",
        description: "The slide has been deleted successfully.",
      });
      // Adjust current slide if needed
      if (presentationDetails?.slides && currentSlide >= presentationDetails.slides.length - 1) {
        setCurrentSlide(Math.max(0, currentSlide - 1));
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const slides = presentationDetails?.slides || [];
  const isFavorite = selectedPresentation?.id ? favorites.some(f => f.id === selectedPresentation.id) : false;

  return (
    <DashboardLayout
      title="Presentations"
      description="Generate professional slide decks from your content"
    >
      <div className="space-y-6">
        {/* Header actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search presentations..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Presentation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Generate New Presentation</DialogTitle>
                <DialogDescription>
                  Create a slide deck from your course documents using AI.
                </DialogDescription>
              </DialogHeader>
              <GeneratePresentationForm
                courses={courses}
                documents={documents}
                selectedCourse={selectedCourse}
                selectedDocument={selectedDocument}
                onSelectCourse={setSelectedCourse}
                onSelectDocument={setSelectedDocument}
                onGenerate={handleGenerate}
                isLoading={generatePresentation.isPending}
                isLoadingCourses={isLoadingCoursesData}
                isLoadingDocuments={isLoadingDocuments}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "favorites")}>
          <TabsList>
            <TabsTrigger value="all">
              All ({presentations.length})
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Star className="w-4 h-4 mr-2" />
              Favorites ({favorites.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {/* Presentations grid */}
            {isLoadingPresentations || (activeTab === "favorites" && isLoadingFavorites) ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredPresentations.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPresentations.map((pres) => {
                  const isFav = favorites.some(f => f.id === pres.id);
                  return (
                    <PresentationCard
                      key={pres.id}
                      presentation={pres}
                      isFavorite={isFav}
                      onView={() => handleView(pres)}
                      onExport={() => handleExport(pres)}
                      onDelete={() => handleDelete(pres)}
                      onToggleFavorite={() => handleToggleFavorite(pres, isFav)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="p-12 rounded-xl border border-dashed border-border text-center">
                <Presentation className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  {activeTab === "favorites"
                    ? "No favorite presentations yet."
                    : "No presentations found. Generate your first presentation!"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* View presentation dialog */}
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle>{selectedPresentation?.title}</DialogTitle>
                  <DialogDescription>
                    {slides.length > 0 && `Slide ${currentSlide + 1} of ${slides.length}`}
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => selectedPresentation && handleToggleFavorite(selectedPresentation, isFavorite)}
                  >
                    {isFavorite ? (
                      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    ) : (
                      <Heart className="w-4 h-4" />
                    )}
                  </Button>
                  {selectedPresentation && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleExport(selectedPresentation)}
                      disabled={exportPresentation.isPending}
                    >
                      {exportPresentation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => setViewOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {/* Slide content */}
            {isLoadingDetails ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : slides.length > 0 ? (
              <div className="flex-1 flex flex-col">
                <div className="flex-1 bg-gradient-to-br from-primary/5 to-secondary/50 rounded-xl p-8 flex flex-col justify-center min-h-0 overflow-y-auto">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-2xl font-bold text-foreground flex-1">
                      {slides[currentSlide]?.title}
                    </h2>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditSlide(slides[currentSlide])}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit Slide
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteSlide(slides[currentSlide])}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Slide
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="text-muted-foreground whitespace-pre-line">
                    {slides[currentSlide]?.content}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                    disabled={currentSlide === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <div className="flex gap-1">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? "bg-primary w-4" : "bg-muted-foreground/30"
                          }`}
                      />
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                    disabled={currentSlide === slides.length - 1}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">No slides found</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit slide dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Slide</DialogTitle>
              <DialogDescription>
                Update the slide title and content.
              </DialogDescription>
            </DialogHeader>
            {editingSlide && (
              <EditSlideForm
                slide={editingSlide}
                onSave={handleUpdateSlide}
                onCancel={() => {
                  setEditOpen(false);
                  setEditingSlide(null);
                }}
                isLoading={updateSlide.isPending}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

// Generate Presentation Form Component
function GeneratePresentationForm({
  courses,
  documents,
  selectedCourse,
  selectedDocument,
  onSelectCourse,
  onSelectDocument,
  onGenerate,
  isLoading,
  isLoadingCourses,
  isLoadingDocuments
}: {
  courses: Course[];
  documents: Document[];
  selectedCourse: number | null;
  selectedDocument: number | null;
  onSelectCourse: (id: number) => void;
  onSelectDocument: (id: number) => void;
  onGenerate: (title: string, count: number, query: string) => Promise<void>;
  isLoading: boolean;
  isLoadingCourses: boolean;
  isLoadingDocuments: boolean;
}) {
  const [title, setTitle] = useState("");
  const [count, setCount] = useState(10);
  const [query, setQuery] = useState("");

  const handleSubmit = () => {
    if (!selectedCourse) {
      toast({
        title: "Missing course",
        description: "Please select a course.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedDocument) {
      toast({
        title: "Missing document",
        description: "Please select a document.",
        variant: "destructive",
      });
      return;
    }
    if (!title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a presentation title.",
        variant: "destructive",
      });
      return;
    }
    if (!query.trim()) {
      toast({
        title: "Missing query",
        description: "Please enter a query for presentation generation.",
        variant: "destructive",
      });
      return;
    }
    onGenerate(title.trim(), count, query.trim());
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Course</Label>
        <Select
          value={selectedCourse?.toString() || ""}
          onValueChange={(value) => onSelectCourse(parseInt(value))}
          disabled={isLoadingCourses}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingCourses ? "Loading courses..." : "Select a course"} />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id?.toString() || ""}>
                {course.name} ({course.course_code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Source Document</Label>
        <Select
          value={selectedDocument?.toString() || ""}
          onValueChange={(value) => onSelectDocument(parseInt(value))}
          disabled={!selectedCourse || isLoadingDocuments}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoadingDocuments ? "Loading documents..." : selectedCourse ? "Select a document" : "Select a course first"} />
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
        <Label>Presentation Title</Label>
        <Input
          placeholder="e.g., Introduction to Machine Learning"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Number of Slides</Label>
        <Input
          type="number"
          min="1"
          max="50"
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value) || 10)}
        />
        <p className="text-xs text-muted-foreground">
          Note: Actual slides = {count} + 2 (includes title and conclusion slides)
        </p>
      </div>
      <div className="space-y-2">
        <Label>Query / Description</Label>
        <Textarea
          placeholder="e.g., Create slides explaining supervised learning, unsupervised learning, and reinforcement learning"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={4}
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button
          variant="hero"
          onClick={handleSubmit}
          disabled={isLoading || !selectedCourse || !selectedDocument || !title.trim() || !query.trim()}
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

// Presentation Card Component
function PresentationCard({
  presentation,
  isFavorite,
  onView,
  onExport,
  onDelete,
  onToggleFavorite
}: {
  presentation: PresentationType;
  isFavorite: boolean;
  onView: () => void;
  onExport: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}) {
  return (
    <div className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-card-hover transition-all duration-300">
      {/* Preview area */}
      <div
        className="h-40 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center cursor-pointer"
        onClick={onView}
      >
        <Presentation className="w-16 h-16 text-primary/40 group-hover:scale-110 transition-transform" />
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{presentation.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {presentation.query}
            </p>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(presentation.created || presentation.created_at || "")}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleFavorite}>
                {isFavorite ? (
                  <>
                    <Heart className="w-4 h-4 mr-2 fill-red-500 text-red-500" />
                    Remove Favorite
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    Add Favorite
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

// Edit Slide Form Component
function EditSlideForm({
  slide,
  onSave,
  onCancel,
  isLoading
}: {
  slide: Slide;
  onSave: (updates: { title?: string; content?: string }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [title, setTitle] = useState(slide.title);
  const [content, setContent] = useState(slide.content);

  const handleSubmit = () => {
    onSave({
      title: title.trim(),
      content: content.trim(),
    });
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Slide Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Slide Content</Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
        />
        <p className="text-xs text-muted-foreground">
          Use newlines to create bullet points. Markdown-style formatting is supported.
        </p>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="hero"
          onClick={handleSubmit}
          disabled={isLoading || !title.trim() || !content.trim()}
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
