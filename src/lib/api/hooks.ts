import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getErrorMessage } from "./index";
import type {
    PaginationParams,
    CourseSearchParams,
    UploadDocumentRequest,
    GenerateQuizRequest,
    SubmitQuizRequest,
    CreateQuestionsRequest,
    GenerateQuestionsRequest,
    QuestionPaperRequest,
    QuestionListParams,
    ValidateQuestionsRequest,
    InvalidateQuestionsRequest,
    DeleteQuestionsRequest,
    GeneratePresentationRequest,
    UpdateSlideRequest,
} from "./types";

export function useCurrentUser(enabled: boolean = true) {
    return useQuery({
        queryKey: ["user", "current"],
        queryFn: () => api.auth.getCurrentUser(),
        enabled,
        retry: false,
        staleTime: 5 * 60 * 1000,
    });
}

export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (token: string) => api.auth.login(token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });
}

export function useApiKeys() {
    return useQuery({
        queryKey: ["api-keys"],
        queryFn: () => api.auth.listApiKeys(),
        staleTime: 2 * 60 * 1000,
    });
}

export function useCreateOrUpdateApiKey() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: { provider: "openai" | "gemini" | "grok"; api_key: string }) =>
            api.auth.createOrUpdateApiKey(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["api-keys"] });
        },
    });
}

export function useDeleteApiKey() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (apiKeyId: number) => api.auth.deleteApiKey(apiKeyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["api-keys"] });
        },
    });
}

export function useToggleApiKey() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (apiKeyId: number) => api.auth.toggleApiKey(apiKeyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["api-keys"] });
        },
    });
}

export function useMyCourses(params?: PaginationParams) {
    return useQuery({
        queryKey: ["knowledge", "courses", "my", params],
        queryFn: () => api.knowledge.getMyCourses(params),
    });
}

export function useSearchCourses(params: CourseSearchParams) {
    return useQuery({
        queryKey: ["knowledge", "courses", "search", params],
        queryFn: () => api.knowledge.searchCourses(params),
        enabled: !!params.name && params.name.length > 0,
    });
}

export function useCourseDocuments(
    courseId: number,
    params?: PaginationParams
) {
    return useQuery({
        queryKey: ["knowledge", "courses", courseId, "documents", params],
        queryFn: () => api.knowledge.getCourseDocuments(courseId, params),
        enabled: !!courseId,
    });
}

export function useUploadDocument(courseId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: UploadDocumentRequest) =>
            api.knowledge.uploadDocument(courseId, request),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["knowledge", "courses", courseId, "documents"],
            });
        },
    });
}

export function useCourseQuestions(
    courseId: number,
    params?: QuestionListParams
) {
    return useQuery({
        queryKey: ["questions", "course", courseId, params],
        queryFn: () => api.questions.getCourseQuestions(courseId, params),
        enabled: !!courseId,
    });
}

export function useCreateQuestions(courseId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: CreateQuestionsRequest) =>
            api.questions.createQuestions(courseId, request),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["questions", "course", courseId],
            });
        },
    });
}

export function useGenerateQuestions(courseId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            request,
            params,
        }: {
            request: GenerateQuestionsRequest;
            params?: PaginationParams;
        }) => api.questions.generateQuestions(courseId, request, params),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["questions", "course", courseId],
            });
        },
    });
}

export function useGenerateQuestionPaper(courseId: number) {
    return useMutation({
        mutationFn: (questionIds: number[]) =>
            api.questions.generateQuestionPaper(courseId, questionIds),
    });
}

export function useValidateQuestions(courseId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (questionIds: number[]) =>
            api.questions.validateQuestions(questionIds),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["questions", "course", courseId],
            });
        },
    });
}

export function useInvalidateQuestions(courseId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            questionIds,
            reason,
        }: {
            questionIds: number[];
            reason?: string;
        }) => api.questions.invalidateQuestions(questionIds, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["questions", "course", courseId],
            });
        },
    });
}

export function useDeleteQuestions(courseId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: DeleteQuestionsRequest) =>
            api.questions.deleteQuestions(request),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["questions", "course", courseId],
            });
        },
    });
}

export function useUpdateQuestion(courseId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            questionId,
            updates,
        }: {
            questionId: number;
            updates: Partial<import("./types").Question>;
        }) => api.questions.updateQuestion(questionId, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["questions", "course", courseId],
            });
        },
    });
}

export function usePresentations(params?: PaginationParams) {
    return useQuery({
        queryKey: ["presentations", params],
        queryFn: () => api.presentations.getPresentations(params),
    });
}

export function usePresentationDetails(presentationId: number, enabled: boolean = true) {
    return useQuery({
        queryKey: ["presentations", presentationId],
        queryFn: () => api.presentations.getPresentationDetails(presentationId),
        enabled: enabled && !!presentationId,
    });
}

export function useGeneratePresentation(documentId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: GeneratePresentationRequest) =>
            api.presentations.generatePresentation(documentId, request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["presentations"] });
        },
    });
}

export function useExportPresentation() {
    return useMutation({
        mutationFn: (presentationId: number) =>
            api.presentations.exportPresentation(presentationId),
    });
}

export function useMarkFavorite() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (presentationId: number) =>
            api.presentations.markFavorite(presentationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["presentations"] });
            queryClient.invalidateQueries({ queryKey: ["presentations", "favorites"] });
        },
    });
}

export function useRemoveFavorite() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (presentationId: number) =>
            api.presentations.removeFavorite(presentationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["presentations"] });
            queryClient.invalidateQueries({ queryKey: ["presentations", "favorites"] });
        },
    });
}

export function useFavoritePresentations(params?: PaginationParams) {
    return useQuery({
        queryKey: ["presentations", "favorites", params],
        queryFn: () => api.presentations.getFavorites(params),
    });
}

export function useDeletePresentation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (presentationId: number) =>
            api.presentations.deletePresentation(presentationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["presentations"] });
        },
    });
}

export function useUpdateSlide(presentationId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            slideId,
            request,
        }: {
            slideId: number;
            request: UpdateSlideRequest;
        }) => api.presentations.updateSlide(slideId, request),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["presentations", presentationId],
            });
        },
    });
}

export function useDeleteSlide(presentationId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (slideId: number) =>
            api.presentations.deleteSlide(slideId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["presentations", presentationId],
            });
        },
    });
}

export function useGenerateQuiz(documentId: number) {
    return useMutation({
        mutationFn: (request: { topic: string; count: number; query: string }) =>
            api.quiz.generateQuiz(documentId, request),
    });
}

export function useQuizQuestions(topic: string, params?: PaginationParams) {
    return useQuery({
        queryKey: ["quiz", "questions", topic, params],
        queryFn: () => api.quiz.listQuizQuestions(topic, params),
        enabled: !!topic,
    });
}

export function useDeleteQuizQuestion(topic: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (questionId: number) => api.quiz.deleteQuizQuestion(questionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quiz", "questions", topic] });
        },
    });
}

export function useDeleteQuiz() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (topic: string) => api.quiz.deleteQuiz(topic),
        onSuccess: (_, topic) => {
            queryClient.invalidateQueries({ queryKey: ["quiz", "questions", topic] });
        },
    });
}

export function useUpdateQuizQuestion(topic: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ questionId, updates }: { questionId: number; updates: { question?: string; options?: { option_a?: string; option_b?: string; option_c?: string; option_d?: string }; correct?: 'a' | 'b' | 'c' | 'd' } }) =>
            api.quiz.updateQuizQuestion(questionId, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quiz", "questions", topic] });
        },
    });
}

export function useExportToMoodle() {
    return useMutation({
        mutationFn: (topic: string) => api.quiz.exportToMoodle(topic),
    });
}
