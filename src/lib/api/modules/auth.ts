import { apiClient } from "../client";
import type {
    LoginRequest,
    LoginResponse,
    User,
    ApiKey,
    CreateApiKeyRequest,
    UpdateApiKeyRequest,
    DeleteApiKeyResponse,
} from "../types";

const VALID_PROVIDERS = ["openai", "gemini", "grok"] as const;

const normalizeApiKeyRequest = <T extends { provider: string; api_key: string }>(
    request: T
): T => {
    const normalized = {
        ...request,
        provider: request.provider.toLowerCase() as typeof VALID_PROVIDERS[number],
        api_key: request.api_key.trim(),
    };

    if (!VALID_PROVIDERS.includes(normalized.provider)) {
        throw new Error(
            `Invalid provider: ${normalized.provider}. Must be one of: ${VALID_PROVIDERS.join(", ")}`
        );
    }

    if (!normalized.api_key) {
        throw new Error("API key cannot be empty");
    }

    return normalized;
};

export const authApi = {
    async login(token: string): Promise<LoginResponse> {
        return apiClient.post<LoginResponse>(
            "/v1/auth/login/",
            { id_token: token },
            { requireAuth: false }
        );
    },

    async getCurrentUser(): Promise<User> {
        return apiClient.get<User>("/v1/user/me");
    },

    async createOrUpdateApiKey(request: CreateApiKeyRequest): Promise<ApiKey> {
        return apiClient.post<ApiKey>(
            "/v1/user/api-keys/",
            normalizeApiKeyRequest(request)
        );
    },

    async listApiKeys(): Promise<ApiKey[]> {
        return apiClient.get<ApiKey[]>("/v1/user/api-keys/");
    },

    async updateApiKey(apiKeyId: number, request: UpdateApiKeyRequest): Promise<ApiKey> {
        return apiClient.put<ApiKey>(
            `/v1/user/api-keys/${apiKeyId}`,
            normalizeApiKeyRequest(request)
        );
    },

    async deleteApiKey(apiKeyId: number): Promise<DeleteApiKeyResponse> {
        return apiClient.delete<DeleteApiKeyResponse>(`/v1/user/api-keys/${apiKeyId}`);
    },

    async toggleApiKey(apiKeyId: number): Promise<ApiKey> {
        return apiClient.patch<ApiKey>(`/v1/user/api-keys/${apiKeyId}/toggle`, {});
    },
};
