import { useState } from "react";
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
  Download
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

// Mock data
const courses = [
  { id: 1, name: "Data Structures & Algorithms", code: "CS301", semester: "V", school: "School of Computing", documents: 8 },
  { id: 2, name: "Database Management Systems", code: "CS302", semester: "V", school: "School of Computing", documents: 5 },
  { id: 3, name: "Computer Networks", code: "CS401", semester: "VII", school: "School of Computing", documents: 12 },
  { id: 4, name: "Machine Learning", code: "CS501", semester: "IX", school: "School of Computing", documents: 6 },
];

const documents = [
  { id: 1, name: "DSA Syllabus 2024", type: "Syllabus", date: "2024-01-15", courseId: 1 },
  { id: 2, name: "Arrays and Linked Lists", type: "Regular", date: "2024-01-20", courseId: 1 },
  { id: 3, name: "Trees and Graphs", type: "Regular", date: "2024-01-25", courseId: 1 },
  { id: 4, name: "Sorting Algorithms", type: "Regular", date: "2024-02-01", courseId: 1 },
];

export default function Knowledge() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<number | null>(1);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [isSyllabus, setIsSyllabus] = useState(false);

  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const courseDocuments = documents.filter(doc => doc.courseId === selectedCourse);

  const handleUpload = () => {
    toast({
      title: "Document uploaded",
      description: "Your document has been uploaded successfully.",
    });
    setUploadOpen(false);
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
              <Button variant="hero">
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
                <div className="space-y-2">
                  <Label htmlFor="docName">Document Name</Label>
                  <Input id="docName" placeholder="Enter document name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">File</Label>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop your file here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, DOCX, PPTX up to 10MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="syllabus" 
                    checked={isSyllabus}
                    onCheckedChange={(checked) => setIsSyllabus(checked as boolean)}
                  />
                  <Label htmlFor="syllabus" className="text-sm font-normal">
                    Mark as Syllabus
                  </Label>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setUploadOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="hero" onClick={handleUpload}>
                    Upload
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
              Courses ({filteredCourses.length})
            </h3>
            <div className="space-y-3">
              {filteredCourses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourse(course.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    selectedCourse === course.id 
                      ? "border-primary bg-accent shadow-sm" 
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{course.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {course.code} • Semester {course.semester}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {course.school}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md">
                      <FileText className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-medium">{course.documents}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Documents list */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Documents ({courseDocuments.length})
            </h3>
            {selectedCourse ? (
              <div className="space-y-3">
                {courseDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl border border-border bg-card hover:shadow-card transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          doc.type === "Syllabus" ? "bg-primary/10" : "bg-secondary"
                        }`}>
                          {doc.type === "Syllabus" ? (
                            <BookOpen className="w-5 h-5 text-primary" />
                          ) : (
                            <FileText className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{doc.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              doc.type === "Syllabus" 
                                ? "bg-primary/10 text-primary" 
                                : "bg-secondary text-muted-foreground"
                            }`}>
                              {doc.type}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {doc.date}
                            </span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
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
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl border border-dashed border-border text-center">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  Select a course to view its documents
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
