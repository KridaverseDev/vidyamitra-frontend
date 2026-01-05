import { apiClient } from "../client";
import type {
    Presentation,
    GeneratePresentationRequest,
    UpdateSlideRequest,
    Slide,
    GetPresentationResponse,
    PaginatedResponse,
    PaginationParams,
} from "../types";

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

const handleExportError = async (response: Response): Promise<never> => {
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

export const presentationsApi = {
    async generatePresentation(
        documentId: number,
        request: GeneratePresentationRequest
    ): Promise<void> {
        await apiClient.post<void>(`/v1/presentations/${documentId}/`, request);
    },

    async getPresentations(
        params?: PaginationParams
    ): Promise<PaginatedResponse<Presentation>> {
        return apiClient.get<PaginatedResponse<Presentation>>("/v1/presentations", params);
    },

    async getPresentationDetails(
        presentationId: number
    ): Promise<GetPresentationResponse> {
        return apiClient.get<GetPresentationResponse>(`/v1/presentations/${presentationId}`);
    },

    async exportPresentation(
        presentationId: number
    ): Promise<{ blob: Blob; filename: string }> {
        const { getFirebaseToken } = await import("../auth");
        const url = buildUrl(`/v1/presentations/${presentationId}?export=true`);
        const token = await getFirebaseToken();

        const headers: HeadersInit = token ? { Authorization: token } : {};
        const response = await fetch(url, { method: "GET", headers });

        if (!response.ok) {
            await handleExportError(response);
        }

        const contentDisposition = response.headers.get("Content-Disposition");
        const filename = extractFilename(
            contentDisposition,
            `presentation_${presentationId}.pptx`
        );

        return { blob: await response.blob(), filename };
    },

    async deletePresentation(presentationId: number): Promise<void> {
        await apiClient.delete<void>(`/v1/presentations/${presentationId}`);
    },

    async markFavorite(presentationId: number): Promise<void> {
        await apiClient.post<void>(`/v1/presentations/${presentationId}/favorites`);
    },

    async removeFavorite(presentationId: number): Promise<void> {
        await apiClient.delete<void>(`/v1/presentations/${presentationId}/favorites`);
    },

    async getFavorites(
        params?: PaginationParams
    ): Promise<PaginatedResponse<Presentation>> {
        return apiClient.get<PaginatedResponse<Presentation>>("/v1/presentations/favorites", params);
    },

    async updateSlide(slideId: number, request: UpdateSlideRequest): Promise<void> {
        await apiClient.put<void>(`/v1/presentations/slide/${slideId}`, request);
    },

    async deleteSlide(slideId: number): Promise<void> {
        await apiClient.delete<void>(`/v1/presentations/slide/${slideId}`);
    },
};

