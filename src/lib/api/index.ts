import { authApi } from "./modules/auth";
import { knowledgeApi } from "./modules/knowledge";
import { quizApi } from "./modules/quiz";
import { questionsApi } from "./modules/questions";
import { presentationsApi } from "./modules/presentations";

export { authApi } from "./modules/auth";
export { knowledgeApi } from "./modules/knowledge";
export { quizApi } from "./modules/quiz";
export { questionsApi } from "./modules/questions";
export { presentationsApi } from "./modules/presentations";

export { apiClient, ApiClient } from "./client";

export {
    getFirebaseToken,
    getCurrentFirebaseUser,
    isAuthenticated,
    refreshFirebaseToken,
    waitForAuth,
} from "./auth";

export {
    ApiError,
    handleApiResponse,
    isApiError,
    getErrorMessage,
    type ApiErrorResponse,
} from "./errors";

export type * from "./types";

export const api = {
    auth: authApi,
    knowledge: knowledgeApi,
    quiz: quizApi,
    questions: questionsApi,
    presentations: presentationsApi,
};

export default api;
