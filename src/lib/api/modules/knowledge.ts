import { apiClient } from "../client";
import type {
    Course,
    CourseSearchParams,
    CourseDocumentsResponse,
    Document,
    PaginatedResponse,
    PaginationParams,
    UploadDocumentRequest,
} from "../types";

const getBaseUrl = (): string => {
    const apiUrl = import.meta.env.VITE_API_URL || "https://reva.syek.in";
    return import.meta.env.DEV && apiUrl.includes("localhost") ? "" : apiUrl;
};

const buildUploadUrl = (endpoint: string, params: URLSearchParams): string => {
    const baseUrl = getBaseUrl();
    const urlWithParams = `${endpoint}?${params.toString()}`;
    return baseUrl ? `${baseUrl}${urlWithParams}` : urlWithParams;
};

const transformDocumentsResponse = (
    response: PaginatedResponse<Document>,
    courseId: number
): CourseDocumentsResponse => ({
    course_id: courseId,
    documents: response.results || [],
    count: response.count,
    next: response.next,
    previous: response.previous,
    results: response.results,
});

export const knowledgeApi = {
    async getMyCourses(
        params?: PaginationParams
    ): Promise<PaginatedResponse<Course>> {
        return apiClient.get<PaginatedResponse<Course>>("/v1/knowledge/my-courses/", params);
    },

    async searchCourses(
        params: CourseSearchParams
    ): Promise<PaginatedResponse<Course>> {
        return apiClient.get<PaginatedResponse<Course>>("/v1/knowledge/courses/search", params);
    },

    async getCourseDocuments(
        courseId: number,
        params?: PaginationParams
    ): Promise<CourseDocumentsResponse> {
        const response = await apiClient.get<PaginatedResponse<Document>>(
            `/v1/knowledge/course/${courseId}/documents`,
            params
        );
        return transformDocumentsResponse(response, courseId);
    },

    async uploadDocument(
        courseId: number,
        request: UploadDocumentRequest
    ): Promise<void> {
        const { getFirebaseToken } = await import("../auth");
        const token = await getFirebaseToken();
        if (!token) {
            throw new Error("Not authenticated");
        }

        const formData = new FormData();
        formData.append("document", request.file);

        const endpoint = `/v1/knowledge/course/${courseId}/upload-document`;
        const params = new URLSearchParams({
            name: request.name,
            is_syllabus: (request.is_syllabus ?? false).toString(),
        });

        const url = buildUploadUrl(endpoint, params);
        const response = await fetch(url, {
            method: "POST",
            headers: { Authorization: token },
            body: formData,
        });

        if (response.status === 204) {
            return;
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                detail: response.statusText,
            }));
            throw new Error(errorData.detail || `HTTP ${response.status}`);
        }
    },
};
