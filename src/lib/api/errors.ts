export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public errorCode?: string,
        public details?: unknown
    ) {
        super(message);
        this.name = "ApiError";

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }

    isAuthError(): boolean {
        return (
            this.statusCode === 401 ||
            this.statusCode === 403 ||
            (this.errorCode?.startsWith("AUTH_ERR_") ?? false)
        );
    }

    isClientError(): boolean {
        return this.statusCode >= 400 && this.statusCode < 500;
    }

    isServerError(): boolean {
        return this.statusCode >= 500;
    }

    getUserMessage(): string {
        if (this.errorCode) {
            switch (this.errorCode) {
                case "AUTH_ERR_100":
                    return "Your session has expired. Please sign in again.";
                case "AUTH_ERR_101":
                    return "Authentication certificate is invalid. Please sign in again.";
                case "AUTH_ERR_103":
                    return "Authentication token is missing. Please sign in again.";
                default:
                    return this.message;
            }
        }

        switch (this.statusCode) {
            case 400:
                return "Invalid request. Please check your input and try again.";
            case 401:
                return "You are not authorized. Please sign in again.";
            case 403:
                return "You don't have permission to perform this action.";
            case 404:
                return "The requested resource was not found.";
            case 422: {
                if (this.details && typeof this.details === "object") {
                    const detailObj = this.details as Record<string, unknown>;
                    if (Array.isArray(detailObj.detail)) {
                        const missingFields = (
                            detailObj.detail as Array<{ loc?: string[]; msg?: string }>
                        )
                            .filter((err) => err.loc && err.loc.length > 0)
                            .map((err) => {
                                const field = err.loc?.[err.loc.length - 1] || "unknown";
                                return `${field}: ${err.msg || "required"}`;
                            });
                        if (missingFields.length > 0) {
                            return `Validation error: Missing required fields:\n${missingFields.join("\n")}`;
                        }
                    }
                }
                return this.message || "Validation error. Please check all required fields are filled.";
            }
            case 413:
                return "The file is too large. Please choose a smaller file.";
            case 500: {
                let errorMsg = this.message || "A server error occurred. Please try again later.";

                if (this.details && typeof this.details === "object") {
                    const detailStr = JSON.stringify(this.details).toLowerCase();

                    if (detailStr.includes("openai") || detailStr.includes("api key")) {
                        errorMsg =
                            "OpenAI API key is missing or invalid. Please add your OpenAI API key in Profile > API Keys.";
                    } else if (detailStr.includes("gemini") || detailStr.includes("google")) {
                        errorMsg =
                            "Gemini API key is missing or invalid. Please add your Gemini API key in Profile > API Keys.";
                    } else if (detailStr.includes("pinecone") || detailStr.includes("namespace")) {
                        errorMsg =
                            "Document not found in vector store. Please re-upload the document in the Knowledge page.";
                    } else if (detailStr.includes("document") && detailStr.includes("not found")) {
                        errorMsg =
                            "Document not found. Please verify the document exists and has been uploaded successfully.";
                    } else if (detailStr.includes("course") && detailStr.includes("not found")) {
                        errorMsg = "Course not found. Please verify the course exists.";
                    } else if (detailStr.includes("json") || detailStr.includes("parse")) {
                        errorMsg =
                            "Error parsing AI response. Try generating fewer questions or check your prompt.";
                    } else if (detailStr.includes("database") || detailStr.includes("connection")) {
                        errorMsg = "Database connection error. Please try again later.";
                    }
                }

                return errorMsg;
            }
            default:
                return this.message || "An unexpected error occurred.";
        }
    }
}

export interface ApiErrorResponse {
    detail: string;
    error_code?: string;
    status_code?: number;
    [key: string]: unknown;
}

export async function handleApiResponse<T>(response: Response): Promise<T> {
    if (response.ok) {
        const contentType = response.headers.get("content-type");

        if (!contentType || !contentType.includes("application/json")) {
            if (response.status === 204 || response.status === 201) {
                return {} as T;
            }
            if (
                contentType?.includes("application/pdf") ||
                contentType?.includes("application/vnd.openxmlformats") ||
                contentType?.includes("application/octet-stream") ||
                contentType?.includes("application/vnd.ms-powerpoint")
            ) {
                return (await response.blob()) as unknown as T;
            }
            return {} as T;
        }

        return response.json();
    }

    try {
        const contentType = response.headers.get("content-type");
        let errorData: ApiErrorResponse;

        if (contentType?.includes("application/json")) {
            errorData = await response.json();
        } else {
            const text = await response.text();
            errorData = {
                detail: text || response.statusText || "An error occurred",
                status_code: response.status,
            };
        }

        let errorMessage = errorData.detail || "An error occurred";

        if (errorMessage.includes("Invalid request") || errorMessage.includes("check your input")) {
            const fieldErrors = Object.entries(errorData)
                .filter(([key]) => key !== "detail" && key !== "error_code" && key !== "status_code")
                .map(([key, value]) => {
                    if (Array.isArray(value)) {
                        return `${key}: ${value.join(", ")}`;
                    }
                    return `${key}: ${value}`;
                });

            if (fieldErrors.length > 0) {
                errorMessage = `${errorMessage}\n\nDetails:\n${fieldErrors.join("\n")}`;
            }
        }

        throw new ApiError(
            errorMessage,
            errorData.status_code || response.status,
            errorData.error_code,
            errorData
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError("Failed to parse error response", response.status, undefined, error);
    }
}

export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}

export function getErrorMessage(error: unknown): string {
    if (isApiError(error)) {
        const userMessage = error.getUserMessage();

        if (error.statusCode === 500) {
            const errorStr = (error.message || "").toLowerCase();
            if (errorStr.includes("question") || errorStr.includes("generate")) {
                return `${userMessage}\n\nTroubleshooting:\n• Check API keys in Profile > API Keys\n• Verify documents are uploaded in Knowledge page\n• Ensure documents have been processed\n• Try generating fewer questions`;
            }
        }

        return userMessage;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return "An unexpected error occurred";
}
