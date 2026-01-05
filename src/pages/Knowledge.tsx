import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Upload,
  FileText,
  BookOpen,
  Calendar,
  MoreVertical,
  Trash2,
  Download,
  Loader2,
  AlertCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { useMyCourses, useSearchCourses, useCourseDocuments, useUploadDocument } from "@/lib/api/hooks";
import { getErrorMessage } from "@/lib/api";
import type { Course, Document } from "@/lib/api/types";

export default function Knowledge() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [isSyllabus, setIsSyllabus] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch courses - use search if query exists, otherwise use my courses
  const { data: myCoursesData, isLoading: isLoadingCourses, error: coursesError } = useMyCourses({
    page: 1,
    page_size: 50,
  });

  const { data: searchData, isLoading: isSearching } = useSearchCourses({
    name: searchQuery,
    page: 1,
    page_size: 50,
  });

  // Determine which data to use and memoize courses
  const coursesData = searchQuery.trim().length > 0 ? searchData : myCoursesData;
  const isLoadingCoursesData = searchQuery.trim().length > 0 ? isSearching : isLoadingCourses;

  const courses = useMemo(() => coursesData?.results || [], [coursesData?.results]);

  // Fetch documents for selected course (with pagination support)
  const { data: documentsData, isLoading: isLoadingDocuments, error: documentsError } = useCourseDocuments(
    selectedCourse || 0,
    {
      page: 1,
      page_size: 50, // Fetch up to 50 documents per page
    }
  );
  // API returns paginated response with 'results' array, but also supports legacy 'documents' format
  const documents = documentsData?.results || documentsData?.documents || [];

  // Upload mutation
  const uploadDocument = useUploadDocument(selectedCourse || 0);

  // Auto-select first course if none selected and courses are loaded
  useEffect(() => {
    if (!selectedCourse && courses.length > 0) {
      setSelectedCourse(courses[0].id);
    }
  }, [courses, selectedCourse]);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }
    setSelectedFile(file);
    setDocumentName((prev) => prev || file.name);
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedCourse) {
      toast({
        title: "Missing information",
        description: "Please select a file and course",
        variant: "destructive",
      });
      return;
    }

    // Use document name or file name as fallback
    const name = documentName.trim() || selectedFile.name;

    try {
      await uploadDocument.mutateAsync({
        file: selectedFile,
        name: name,
        is_syllabus: isSyllabus,
      });
      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully.",
      });
      setUploadOpen(false);
      setSelectedFile(null);
      setDocumentName("");
      setIsSyllabus(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDownload = (document: Document) => {
    // API returns 'file' field, but we also support 'file_url' for backward compatibility
    const fileUrl = document.file || document.file_url;
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getDocumentType = (document: Document): string => {
    // Check API 'type' field first, then fallback to name check
    if (document.type === "SYLLABUS" || document.type === "syllabus") {
      return "Syllabus";
    }
    // Check if document name contains "syllabus" (case insensitive)
    if (document.name.toLowerCase().includes("syllabus")) {
      return "Syllabus";
    }
    return "Regular";
  };

  return (
    <DashboardLayout
      title="Knowledge Management"
      description="Manage your course materials and documents"
    >
      <div className="space-y-6">
        {/* Header actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" disabled={!selectedCourse}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Upload a new document to the selected course.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                {!selectedCourse && (
                  <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Please select a course first to upload a document.
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="docName">Document Name</Label>
                  <Input
                    id="docName"
                    placeholder="Enter document name"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    disabled={!selectedCourse}
                  />
                  <p className="text-xs text-muted-foreground">
                    If not provided, the file name will be used
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isSyllabus"
                    checked={isSyllabus}
                    onCheckedChange={(checked) => setIsSyllabus(checked === true)}
                    disabled={!selectedCourse}
                  />
                  <Label htmlFor="isSyllabus" className="text-sm font-normal cursor-pointer">
                    This is a syllabus document
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">File</Label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${isDragging
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                      } ${!selectedCourse ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.pptx"
                      onChange={handleFileInputChange}
                      disabled={!selectedCourse}
                    />
                    {selectedFile ? (
                      <div className="space-y-2">
                        <FileText className="w-8 h-8 mx-auto text-primary mb-2" />
                        <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(selectedFile.size)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            setDocumentName("");
                            setIsSyllabus(false);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Drag & drop your file here, or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, DOC, DOCX, PPTX up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setUploadOpen(false);
                      setSelectedFile(null);
                      setDocumentName("");
                      setIsSyllabus(false);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="hero"
                    onClick={handleUpload}
                    disabled={!selectedFile || !selectedCourse || uploadDocument.isPending}
                  >
                    {uploadDocument.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Upload"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Two column layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Courses list */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Courses ({courses.length})
            </h3>
            {isLoadingCoursesData ? (
              <div className="flex items-center justify-center py-8">
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
              <div className="p-8 rounded-xl border border-dashed border-border text-center">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No courses found matching your search" : "No courses available"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map((course: Course) => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(course.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${selectedCourse === course.id
                      ? "border-primary bg-accent shadow-sm"
                      : "border-border bg-card hover:border-primary/50"
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{course.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {course.course_code}
                          {course.semester && ` • Semester ${course.semester}`}
                        </p>
                        {course.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {course.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {course.school?.name || "N/A"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Documents list */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Documents ({documents.length})
            </h3>
            {!selectedCourse ? (
              <div className="p-8 rounded-xl border border-dashed border-border text-center">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  Select a course to view its documents
                </p>
              </div>
            ) : isLoadingDocuments ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : documentsError ? (
              <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">{getErrorMessage(documentsError)}</p>
                </div>
              </div>
            ) : documents.length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-border text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  No documents found for this course
                </p>
                <Button
                  variant="subtle"
                  className="mt-4"
                  onClick={() => setUploadOpen(true)}
                >
                  Upload First Document
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc: Document) => {
                  const docType = getDocumentType(doc);
                  return (
                    <div
                      key={doc.id}
                      className="p-4 rounded-xl border border-border bg-card hover:shadow-card transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${docType === "Syllabus" ? "bg-primary/10" : "bg-secondary"
                            }`}>
                            {docType === "Syllabus" ? (
                              <BookOpen className="w-5 h-5 text-primary" />
                            ) : (
                              <FileText className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground truncate">{doc.name}</h4>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${docType === "Syllabus"
                                ? "bg-primary/10 text-primary"
                                : "bg-secondary text-muted-foreground"
                                }`}>
                                {docType}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(doc.created || doc.uploaded_at || doc.updated || "")}
                              </span>
                              {doc.size && (
                                <span className="text-xs text-muted-foreground">
                                  {formatFileSize(doc.size)}
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {(doc.type || doc.file_type || "FILE").toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownload(doc)}>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
