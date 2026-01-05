import { apiClient } from "../client";
import type {
    Question,
    CreateQuestionsRequest,
    CreateQuestionsResponse,
    GenerateQuestionsRequest,
    DeleteQuestionsRequest,
    DeleteQuestionsResponse,
    PaginatedResponse,
    PaginationParams,
    QuestionListParams,
} from "../types";

const validateGenerateRequest = (request: GenerateQuestionsRequest): void => {
    if (!request.syllabus_id || !request.document_id || !request.count || !request.user_prompt) {
        throw new Error("Missing required fields: syllabus_id, document_id, count, or user_prompt");
    }

    if (
        !request.difficulty_distribution ||
        request.difficulty_distribution.easy === undefined ||
        request.difficulty_distribution.medium === undefined ||
        request.difficulty_distribution.hard === undefined
    ) {
        throw new Error("difficulty_distribution must have easy, medium, and hard fields");
    }

    if (
        !request.blooms_distribution ||
        request.blooms_distribution.l1 === undefined ||
        request.blooms_distribution.l2 === undefined ||
        request.blooms_distribution.l3 === undefined ||
        request.blooms_distribution.l4 === undefined ||
        request.blooms_distribution.l5 === undefined ||
        request.blooms_distribution.l6 === undefined
    ) {
        throw new Error("blooms_distribution must have l1, l2, l3, l4, l5, and l6 fields");
    }

    if (!request.user_prompt.trim()) {
        throw new Error("user_prompt cannot be empty");
    }
};

const buildUrlWithParams = (endpoint: string, params?: PaginationParams): string => {
    if (!params) return endpoint;
    const searchParams = new URLSearchParams({
        page: String(params.page || 1),
        page_size: String(params.page_size || 25),
    });
    return `${endpoint}?${searchParams.toString()}`;
};

const getBaseUrl = (): string => {
    const apiUrl = import.meta.env.VITE_API_URL || "https://reva.syek.in";
    return import.meta.env.DEV && apiUrl.includes("localhost") ? "" : apiUrl;
};

const buildUrl = (endpoint: string): string => {
    const baseUrl = getBaseUrl();
    if (!baseUrl) {
        return endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    }
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
    return `${baseUrl}/${cleanEndpoint}`;
};

const extractFilename = (contentDisposition: string | null, fallback: string): string => {
    if (!contentDisposition) return fallback;
    const quotedMatch = contentDisposition.match(/filename="(.+)"/);
    if (quotedMatch) return quotedMatch[1];
    const unquotedMatch = contentDisposition.match(/filename=([^;]+)/);
    return unquotedMatch ? unquotedMatch[1].trim() : fallback;
};

const handleBinaryError = async (response: Response): Promise<never> => {
    const { ApiError } = await import("../errors");
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
        try {
            const errorData = await response.json();
            throw new ApiError(
                errorData.detail || `HTTP error! status: ${response.status}`,
                response.status,
                errorData
            );
        } catch {
            throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
        }
    }

    try {
        const text = await response.clone().text();
        throw new ApiError(text || `HTTP error! status: ${response.status}`, response.status);
    } catch {
        throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
    }
};

export const questionsApi = {
    async generateQuestions(
        courseId: number,
        request: GenerateQuestionsRequest,
        params?: PaginationParams
    ): Promise<PaginatedResponse<Question>> {
        validateGenerateRequest(request);
        const url = buildUrlWithParams(`/v1/question/course/${courseId}`, params);
        return apiClient.post<PaginatedResponse<Question>>(url, request);
    },

    async createQuestions(
        courseId: number,
        request: CreateQuestionsRequest
    ): Promise<CreateQuestionsResponse> {
        return apiClient.post<CreateQuestionsResponse>(
            `/v1/question/course/${courseId}`,
            request
        );
    },

    async getCourseQuestions(
        courseId: number,
        params?: QuestionListParams
    ): Promise<PaginatedResponse<Question>> {
        return apiClient.get<PaginatedResponse<Question>>(
            `/v1/question/course/${courseId}/questions`,
            params
        );
    },

    async generateQuestionPaper(
        courseId: number,
        questionIds: number[]
    ): Promise<{ blob: Blob; filename: string }> {
        const { getFirebaseToken } = await import("../auth");
        const url = buildUrl(`/v1/question/paper/course/${courseId}`);
        const token = await getFirebaseToken();

        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (token) {
            headers["Authorization"] = token;
        }

        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify({ question_ids: questionIds }),
        });

        if (!response.ok) {
            await handleBinaryError(response);
        }

        const contentDisposition = response.headers.get("Content-Disposition");
        const filename = extractFilename(contentDisposition, "question_paper.docx");

        return { blob: await response.blob(), filename };
    },

    async validateQuestions(questionIds: number[]): Promise<void> {
        await apiClient.post<null>("/v1/question/validate/", { question_ids: questionIds });
    },

    async invalidateQuestions(questionIds: number[], reason?: string): Promise<void> {
        const body: { question_ids: number[]; reason?: string } = { question_ids: questionIds };
        if (reason) {
            body.reason = reason;
        }
        await apiClient.post<null>("/v1/question/invalidate/", body);
    },

    async deleteQuestions(request: DeleteQuestionsRequest): Promise<DeleteQuestionsResponse> {
        return apiClient.delete<DeleteQuestionsResponse>("/v1/question/delete", request);
    },

    async updateQuestion(questionId: number, updates: Partial<Question>): Promise<Question> {
        return apiClient.put<Question>(`/v1/question/${questionId}`, updates);
    },
};
