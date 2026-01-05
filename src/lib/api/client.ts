import { getFirebaseToken } from "./auth";
import { handleApiResponse, type ApiError } from "./errors";

const getBaseUrl = (): string => {
    const apiUrl = import.meta.env.VITE_API_URL || "https://reva.syek.in";
    return import.meta.env.DEV && apiUrl.includes("localhost") ? "" : apiUrl;
};

const BASE_URL = getBaseUrl();

export interface RequestConfig extends RequestInit {
    requireAuth?: boolean;
    customHeaders?: HeadersInit;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = BASE_URL) {
        this.baseUrl = baseUrl;
    }

    private async getHeaders(
        requireAuth: boolean = true,
        customHeaders?: HeadersInit
    ): Promise<HeadersInit> {
        const headers: HeadersInit = {
            "Content-Type": "application/json",
            ...customHeaders,
        };

        if (requireAuth) {
            const token = await getFirebaseToken();
            if (token) {
                headers["Authorization"] = token;
            }
        }

        return headers;
    }

    private buildUrl(endpoint: string): string {
        if (!this.baseUrl) {
            return endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
        }
        const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
        return `${this.baseUrl}/${cleanEndpoint}`;
    }

    private buildUrlWithParams(
        endpoint: string,
        params?: Record<string, string | number | boolean | undefined>
    ): string {
        const url = this.buildUrl(endpoint);
        if (!params) return url;

        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });

        const queryString = searchParams.toString();
        return queryString ? `${url}?${queryString}` : url;
    }

    async get<T>(
        endpoint: string,
        params?: Record<string, string | number | boolean | undefined>,
        config?: RequestConfig
    ): Promise<T> {
        const url = this.buildUrlWithParams(endpoint, params);
        const headers = await this.getHeaders(config?.requireAuth ?? true, config?.customHeaders);

        const response = await fetch(url, {
            method: "GET",
            headers,
            ...config,
        });

        return handleApiResponse<T>(response);
    }

    async post<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<T> {
        const url = this.buildUrl(endpoint);
        const isFormData = body instanceof FormData;

        const headers = await this.getHeaders(
            config?.requireAuth ?? true,
            isFormData
                ? { ...config?.customHeaders }
                : { ...config?.customHeaders, "Content-Type": "application/json" }
        );

        let requestBody: string | FormData | undefined;
        if (isFormData) {
            requestBody = body as FormData;
        } else if (body !== undefined && body !== null) {
            requestBody = JSON.stringify(body);
        }

        const response = await fetch(url, {
            method: "POST",
            headers,
            body: requestBody,
            ...config,
        });

        return handleApiResponse<T>(response);
    }

    async put<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<T> {
        const url = this.buildUrl(endpoint);
        const headers = await this.getHeaders(config?.requireAuth ?? true, config?.customHeaders);

        const response = await fetch(url, {
            method: "PUT",
            headers,
            body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
            ...config,
        });

        return handleApiResponse<T>(response);
    }

    async delete<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<T> {
        const url = this.buildUrl(endpoint);
        const headers = await this.getHeaders(config?.requireAuth ?? true, config?.customHeaders);

        const response = await fetch(url, {
            method: "DELETE",
            headers,
            body: body ? JSON.stringify(body) : undefined,
            ...config,
        });

        return handleApiResponse<T>(response);
    }

    async patch<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<T> {
        const url = this.buildUrl(endpoint);
        const headers = await this.getHeaders(config?.requireAuth ?? true, config?.customHeaders);

        const response = await fetch(url, {
            method: "PATCH",
            headers,
            body: JSON.stringify(body),
            ...config,
        });

        return handleApiResponse<T>(response);
    }
}

export const apiClient = new ApiClient();
export { ApiClient };
