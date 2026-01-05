export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface PaginationParams {
    page?: number;
    page_size?: number;
    [key: string]: string | number | boolean | undefined;
}

export interface LoginRequest {
    id_token: string;
}

export interface LoginResponse {
    id: number;
    first_name: string;
    username: string;
    email: string;
}

export interface User {
    id: number;
    first_name: string;
    username: string;
    email: string;
    created_at?: string;
    updated_at?: string;
}

export interface ApiKey {
    id: number;
    provider: "openai" | "gemini" | "grok";
    provider_display: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateApiKeyRequest {
    provider: "openai" | "gemini" | "grok";
    api_key: string;
}

export interface UpdateApiKeyRequest {
    provider: "openai" | "gemini" | "grok";
    api_key: string;
}

export interface DeleteApiKeyResponse {
    message: string;
}

export interface School {
    id: number;
    name: string;
}

export interface Course {
    id: number;
    name: string;
    course_code: string;
    semester: number;
    description?: string;
    school: {
        id: number;
        name: string;
        is_active: boolean;
    };
    syllabus_document?: unknown | null;
    created_at?: string;
}

export interface CourseSearchParams extends PaginationParams {
    name: string;
}

export interface QuestionListParams extends PaginationParams {
    is_valid?: boolean;
}

export interface Document {
    id: number;
    name: string;
    namespace?: string;
    file: string;
    file_url?: string;
    file_type?: string;
    type?: string;
    uploaded_at?: string;
    created?: string;
    updated?: string;
    size?: number;
    course_id?: number;
    course?: number;
    created_by?: {
        id: number;
        first_name: string;
    };
}

export interface CourseDocumentsResponse {
    course_id?: number;
    documents?: Document[];
    count?: number;
    next?: string | null;
    previous?: string | null;
    results?: Document[];
}

export interface UploadDocumentRequest {
    file: File;
    name: string;
    is_syllabus?: boolean;
}

export interface QuizOption {
    id: number;
    text: string;
    is_correct: boolean;
}

export interface QuizQuestion {
    id: number;
    topic: string;
    question: string;
    options: {
        option_a: string;
        option_b: string;
        option_c: string;
        option_d: string;
    };
    correct: 'a' | 'b' | 'c' | 'd';
    users: number;
    created: string;
    updated: string;
}

export interface GenerateQuizRequest {
    topic: string;
    count: number;
    query: string;
}

export interface UpdateQuizQuestionRequest {
    question?: string;
    options?: {
        option_a?: string;
        option_b?: string;
        option_c?: string;
        option_d?: string;
    };
    correct?: 'a' | 'b' | 'c' | 'd';
}

export interface ExportMoodleResponse {
    file_path: string;
}

export interface LegacyQuizQuestion {
    id: number;
    question_text: string;
    question_type: "multiple_choice" | "true_false" | "short_answer" | "essay";
    options: QuizOption[];
    points: number;
}

export interface Quiz {
    id: number;
    title: string;
    description: string;
    course_id: number;
    created_at: string;
    total_questions?: number;
    questions?: LegacyQuizQuestion[];
    total_points?: number;
}

export interface LegacyGenerateQuizRequest {
    document_id?: number;
    topic?: string;
    num_questions?: number;
    difficulty?: "easy" | "medium" | "hard";
}

export interface QuizAnswer {
    question_id: number;
    selected_option_id?: number;
    answer_text?: string;
}

export interface SubmitQuizRequest {
    answers: QuizAnswer[];
}

export interface QuizResult {
    question_id: number;
    is_correct: boolean;
    points_earned: number;
    correct_answer: string;
}

export interface SubmitQuizResponse {
    quiz_id: number;
    score: number;
    total_points: number;
    percentage: number;
    correct_answers: number;
    total_questions: number;
    submitted_at: string;
    results: QuizResult[];
}

export interface QuestionOption {
    text: string;
    is_correct: boolean;
    id?: number;
}

export interface Question {
    id: number;
    course: number;
    course_outcome: number;
    question: string;
    question_text?: string;
    question_type?: "multiple_choice" | "true_false" | "short_answer" | "essay";
    options?: QuestionOption[];
    marks: number;
    points?: number;
    validated: boolean;
    difficulty: "easy" | "medium" | "hard";
    blooms_level: number;
    created: string;
    created_at?: string;
    updated: string;
    updated_at?: string;
    course_id?: number;
}

export interface CreateQuestionsRequest {
    questions: Question[];
}

export interface GenerateQuestionsRequest {
    syllabus_id: number;
    document_id: number;
    count: number;
    user_prompt: string;
    difficulty_distribution: {
        easy: number;
        medium: number;
        hard: number;
    };
    blooms_distribution: {
        l1: number;
        l2: number;
        l3: number;
        l4: number;
        l5: number;
        l6: number;
    };
}

export interface CreateQuestionsResponse {
    course_id: number;
    created_count: number;
    questions: Question[];
}

export interface QuestionPaperRequest {
    title?: string;
    num_questions?: number;
    difficulty_distribution?: {
        easy?: number;
        medium?: number;
        hard?: number;
    };
    question_types?: string[];
    total_points?: number;
    question_ids?: number[];
}

export interface QuestionPaper {
    id?: number;
    title?: string;
    course_id?: number;
    questions?: Question[];
    total_questions?: number;
    total_points?: number;
    created_at?: string;
    file_path?: string;
}

export interface ValidateQuestionsRequest {
    questions?: Question[];
    question_ids?: number[];
}

export interface ValidationResult {
    index: number;
    valid: boolean;
    errors: string[];
}

export interface ValidateQuestionsResponse {
    valid?: boolean;
    results?: ValidationResult[];
}

export interface InvalidateQuestionsRequest {
    question_ids: number[];
    reason?: string;
}

export interface InvalidateQuestionsResponse {
    invalidated_count?: number;
    question_ids?: number[];
}

export interface DeleteQuestionsRequest {
    question_ids: number[];
}

export interface DeleteQuestionsResponse {
    deleted_count: number;
    question_ids: number[];
}

export interface Slide {
    id: number;
    title: string;
    content: string;
    created: string;
    updated: string;
    slide_number?: number;
    notes?: string;
    presentation_id?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Presentation {
    id: number;
    title: string;
    query: string;
    created: string;
    updated: string;
    document_id?: number;
    slide_count?: number;
    created_at?: string;
    updated_at?: string;
    slides?: Slide[];
}

export interface GetPresentationResponse {
    presentation: Presentation;
    slides: Slide[];
}

export interface GeneratePresentationRequest {
    title: string;
    count: number;
    query: string;
}

export interface UpdateSlideRequest {
    title?: string;
    content?: string;
    notes?: string;
}

export interface ExportPresentationParams {
    export: boolean;
    format?: "pdf" | "pptx" | "html";
}

export interface DeleteResponse {
    message: string;
    [key: string]: unknown;
}
