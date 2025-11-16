/**
 * Error handler utility for mapping backend errors to user-friendly messages
 * Full error details are logged to console for debugging
 */

export interface ApiError {
  status?: number;
  message?: string;
  error?: string;
  code?: string;
}

/**
 * Parse and extract error details from API response
 */
export const parseApiError = async (response: Response): Promise<ApiError> => {
  try {
    const data = await response.json();
    return {
      status: response.status,
      message: data.message || data.error || response.statusText,
      error: data.error,
      code: data.code,
    };
  } catch {
    return {
      status: response.status,
      message: response.statusText,
    };
  }
};

/**
 * Map backend errors to user-friendly messages
 * Shows friendly text to users while full details are logged to console
 */
export const getUserFriendlyError = (error: unknown): string => {
  // Log full error details to console for debugging
  console.error("[DEBUG] Full error details:", error);

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network errors
    if (message.includes("failed to fetch") || message.includes("network")) {
      return "Connection error. Please check your internet and try again.";
    }

    // JSON parsing errors
    if (message.includes("json")) {
      return "Server returned invalid data. Please try again.";
    }

    // Timeout
    if (message.includes("timeout")) {
      return "Request took too long. Please try again.";
    }

    // 401 Unauthorized
    if (message.includes("401") || message.includes("unauthorized")) {
      return "Your session has expired. Please log in again.";
    }

    // 403 Forbidden
    if (message.includes("403") || message.includes("forbidden")) {
      return "You don't have permission to perform this action.";
    }

    // 404 Not Found
    if (message.includes("404") || message.includes("not found")) {
      return "The requested resource was not found.";
    }

    // 409 Conflict
    if (message.includes("409") || message.includes("conflict")) {
      return "This action conflicts with existing data. Please refresh and try again.";
    }

    // 422 Validation Error
    if (message.includes("422") || message.includes("validation")) {
      return "Please check your input and try again.";
    }

    // 500+ Server errors
    if (message.includes("500") || message.includes("internal server error")) {
      return "Server error. Please try again in a moment.";
    }

    // Generic error fallback
    if (error.message) {
      return "An error occurred. Please try again.";
    }
  }

  // Handle ApiError objects
  if (error && typeof error === "object" && "status" in error) {
    const apiError = error as ApiError;

    switch (apiError.status) {
      case 400:
        return "Invalid request. Please check your input.";
      case 401:
        return "Your session has expired. Please log in again.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 409:
        return "This action conflicts with existing data. Please refresh and try again.";
      case 422:
        return "Please check your input and try again.";
      case 500:
      case 502:
      case 503:
      case 504:
        return "Server error. Please try again in a moment.";
      default:
        if (apiError.message) {
          return "An error occurred. Please try again.";
        }
    }
  }

  // Fallback for unknown errors
  return "An unexpected error occurred. Please try again.";
};

/**
 * Wrap an API call to provide user-friendly error handling
 * Logs full error to console, returns friendly message for UI
 */
export const withErrorHandling = async <T,>(
  apiCall: () => Promise<T>
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const data = await apiCall();
    return { data, error: null };
  } catch (error) {
    const friendlyMessage = getUserFriendlyError(error);
    console.error("[ERROR] API call failed:", {
      friendlyMessage,
      rawError: error,
    });
    return { data: null, error: friendlyMessage };
  }
};
