import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Plus, 
  Presentation, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Trash2,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

// Mock data
const presentations = [
  { 
    id: 1, 
    title: "Introduction to Data Structures", 
    slides: 15, 
    document: "DSA Syllabus 2024",
    date: "2024-01-20"
  },
  { 
    id: 2, 
    title: "Arrays and Linked Lists Overview", 
    slides: 22, 
    document: "Arrays and Linked Lists",
    date: "2024-01-25"
  },
  { 
    id: 3, 
    title: "Trees in Computer Science", 
    slides: 18, 
    document: "Trees and Graphs",
    date: "2024-02-01"
  },
];

const slideContent = [
  { title: "Introduction", content: "Welcome to our presentation on Data Structures. In this session, we will explore the fundamental concepts that form the backbone of computer science." },
  { title: "What are Data Structures?", content: "Data structures are specialized formats for organizing, processing, retrieving and storing data. They make it easier to access and work with data efficiently." },
  { title: "Types of Data Structures", content: "**Linear Structures**: Arrays, Linked Lists, Stacks, Queues\n\n**Non-Linear Structures**: Trees, Graphs\n\n**Hash-based Structures**: Hash Tables" },
];

export default function Presentations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [generateOpen, setGenerateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedPresentation, setSelectedPresentation] = useState<typeof presentations[0] | null>(null);

  const filteredPresentations = presentations.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerate = () => {
    toast({
      title: "Generating presentation...",
      description: "AI is creating your slide deck.",
    });
    setGenerateOpen(false);
  };

  const openPresentation = (pres: typeof presentations[0]) => {
    setSelectedPresentation(pres);
    setCurrentSlide(0);
    setViewOpen(true);
  };

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
                <Plus className="w-4 h-4 mr-2" />
                Generate Presentation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate New Presentation</DialogTitle>
                <DialogDescription>
                  Create a slide deck from your course documents using AI.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Course</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cs301">Data Structures & Algorithms</SelectItem>
                      <SelectItem value="cs302">Database Management Systems</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Source Document</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a document" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doc1">Arrays and Linked Lists</SelectItem>
                      <SelectItem value="doc2">Trees and Graphs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Presentation Title</Label>
                  <Input placeholder="Enter title" />
                </div>
                <div className="space-y-2">
                  <Label>Topic / Focus Area</Label>
                  <Textarea 
                    placeholder="E.g., Focus on practical applications and real-world examples..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Number of Slides</Label>
                  <Input type="number" placeholder="15" defaultValue={15} />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setGenerateOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="hero" onClick={handleGenerate}>
                    Generate
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Presentations grid */}
        {filteredPresentations.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPresentations.map((pres) => (
              <div
                key={pres.id}
                className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-card-hover transition-all duration-300"
              >
                {/* Preview area */}
                <div 
                  className="h-40 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center cursor-pointer"
                  onClick={() => openPresentation(pres)}
                >
                  <Presentation className="w-16 h-16 text-primary/40 group-hover:scale-110 transition-transform" />
                </div>
                
                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{pres.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {pres.slides} slides • {pres.document}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {pres.date}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openPresentation(pres)}>
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-xl border border-dashed border-border text-center">
            <Presentation className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              No presentations found. Generate your first presentation!
            </p>
          </div>
        )}

        {/* View presentation dialog */}
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <DialogTitle>{selectedPresentation?.title}</DialogTitle>
                <Button variant="ghost" size="icon" onClick={() => setViewOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <DialogDescription>
                Slide {currentSlide + 1} of {slideContent.length}
              </DialogDescription>
            </DialogHeader>
            
            {/* Slide content */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 bg-gradient-to-br from-primary/5 to-secondary/50 rounded-xl p-8 flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  {slideContent[currentSlide]?.title}
                </h2>
                <p className="text-muted-foreground whitespace-pre-line">
                  {slideContent[currentSlide]?.content}
                </p>
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
                  {slideContent.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === currentSlide ? "bg-primary w-4" : "bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCurrentSlide(Math.min(slideContent.length - 1, currentSlide + 1))}
                  disabled={currentSlide === slideContent.length - 1}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
