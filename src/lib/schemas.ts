export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface User {
  id: number;
  first_name: string;
  username: string;
  email: string;
}

export interface School {
  id: number;
  name: string;
  is_active: boolean;
}

export interface SyllabusDocument {
  id: number;
  name: string;
  file: string;
}

export interface Course {
  id: number;
  name: string;
  course_code: string;
  semester: number;
  school: School;
  syllabus_document: SyllabusDocument;
}

export interface UploadDocumentParams {
  name: string;
  is_syllabus: boolean;
  document: File;
}

export interface CourseDocument {
  id: number;
  name: string;
  namespace: string;
  file: string;
  created: string;
  updated: string;
  course: number;
  type: string; // Could be a union: "SYLLABUS" | "OTHER" if known
  created_by: {
    id: number;
    first_name: string;
  };
}

export interface Question {
  id: number;
  course: number;
  course_outcome: number;
  question: string;
  marks: number;
  validated: boolean;
  difficulty: string;
  blooms_level: number;
  created: string;
  updated: string;
}

export interface Presentation {
  id: number;
  title: string;
  query: string;
  created: string;
  updated: string;
}

export interface Slide {
  id: number;
  title: string;
  content: string;
  updated: string;
}

export interface PresentationSlide {
  presentation: Presentation;
  slides: Slide[];
}

export interface ExportPresentation {
  file_url: string;
}
