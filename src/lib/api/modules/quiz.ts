import { apiClient } from "../client";
import type {
    QuizQuestion,
    GenerateQuizRequest,
    UpdateQuizQuestionRequest,
    ExportMoodleResponse,
    PaginatedResponse,
    PaginationParams,
} from "../types";

const normalizeTopic = (topic: string): string => {
    return topic
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/_/g, "-")
        .split("-")
        .filter(Boolean)
        .join("-");
};

export const quizApi = {
    async generateQuiz(
        documentId: number,
        request: GenerateQuizRequest
    ): Promise<PaginatedResponse<QuizQuestion>> {
        const normalizedRequest = {
            ...request,
            topic: normalizeTopic(request.topic),
        };
        return apiClient.post<PaginatedResponse<QuizQuestion>>(
            `/v1/quiz/document/${documentId}`,
            normalizedRequest
        );
    },

    async listQuizQuestions(
        topic: string,
        params?: PaginationParams
    ): Promise<PaginatedResponse<QuizQuestion>> {
        const normalizedTopic = normalizeTopic(topic);
        return apiClient.get<PaginatedResponse<QuizQuestion>>(
            `/v1/quiz/${normalizedTopic}/questions`,
            params
        );
    },

    async deleteQuizQuestion(questionId: number): Promise<void> {
        await apiClient.delete<void>(`/v1/quiz/delete-question/${questionId}`);
    },

    async deleteQuiz(topic: string): Promise<void> {
        const normalizedTopic = normalizeTopic(topic);
        await apiClient.delete<void>(`/v1/quiz/delete-quiz/${normalizedTopic}`);
    },

    async updateQuizQuestion(
        questionId: number,
        updates: UpdateQuizQuestionRequest
    ): Promise<void> {
        await apiClient.put<void>(`/v1/quiz/${questionId}/update`, updates);
    },

    async exportToMoodle(topic: string): Promise<ExportMoodleResponse> {
        const normalizedTopic = normalizeTopic(topic);
        return apiClient.get<ExportMoodleResponse>(`/v1/quiz/${normalizedTopic}/export-moodle`);
    },
};
