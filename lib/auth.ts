import { useAuthStore } from "./store/authStore";

export const API_BASE_URL = "https://pcprimedz.onrender.com";

export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/admin/login`,
  REGISTER: `${API_BASE_URL}/admin/register`,
};

// Decode JWT token
export function decodeToken(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

export function isAdmin(): boolean {
  if (typeof window === "undefined") return false;
  
  const { token, user } = useAuthStore.getState();
  if (!token) return false;

  const decoded = decodeToken(token);
  return decoded?.role === "admin" || user?.role === "admin";
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return useAuthStore.getState().token;
}

export function getUsername(): string | null {
  if (typeof window === "undefined") return null;
  return useAuthStore.getState().user?.username || null;
}

export function storeAuthData(token: string, username: string) {
  if (typeof window === "undefined") return;
  
  if (!token) {
    console.error("storeAuthData called with empty token");
    throw new Error("Cannot store auth data: token is required");
  }

  const decoded = decodeToken(token);
  const role = decoded?.role || "admin";
  
  useAuthStore.getState().setAuth(token, {
    username: username || "admin",
    role,
  });
  
  console.debug("Auth data stored successfully", { username, tokenPreview: `${token.slice(0, 10)}...` });
}

export function clearAuthData() {
  if (typeof window === "undefined") return;
  useAuthStore.getState().clearAuth();
}

// Admin Login API call
export async function login(username: string, password: string) {
  try {
    console.log("=== LOGIN DEBUG START ===");
    console.log("Endpoint:", AUTH_ENDPOINTS.LOGIN);
    console.log("Username:", username);
    console.log("Payload:", JSON.stringify({ username, password }));
    
    const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    console.log("Response Status:", response.status, response.statusText);
    console.log("Response Headers:", {
      contentType: response.headers.get("content-type"),
      cors: response.headers.get("access-control-allow-origin"),
    });

    if (!response.ok) {
      let errorMessage = "Login failed";
      let errorData = null;
      try {
        const text = await response.text();
        console.error("Raw response text:", text);
        
        if (text) {
          errorData = JSON.parse(text);
          console.error("Parsed error response:", errorData);
          errorMessage = errorData.message || errorData.error || errorData.msg || `Error ${response.status}: ${response.statusText}`;
        } else {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
      } catch (e) {
        console.error("Failed to parse error response:", e);
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
      console.log("=== LOGIN DEBUG END (ERROR) ===");
      throw new Error(errorMessage);
    }

    const text = await response.text();
    console.log("Raw response body:", text);
    
    const data = JSON.parse(text);
    console.log("Parsed response data:", data);
    console.log("Available fields in response:", Object.keys(data));
    
    // Validate response contains token
    if (!data.token && !data.access_token && !data.data?.token && !data.data?.access_token) {
      console.error("login: response missing token field in any format:", data);
      console.log("=== LOGIN DEBUG END (NO TOKEN) ===");
      throw new Error("missing access token - backend did not return a token in expected format");
    }

    // Support various response formats from different backends
    const token = data.token || data.access_token || data.data?.token || data.data?.access_token;
    const user = data.username || data.user?.username || data.data?.username || username;
    
    console.log("Extracted token:", !!token, "Extracted username:", user);
    console.log("=== LOGIN DEBUG END (SUCCESS) ===");

    // Support both 'token' and 'access_token' field names from backend
    return {
      token,
      username: user,
      ...data
    };
  } catch (error) {
    console.log("=== LOGIN DEBUG END (EXCEPTION) ===");
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network error. Please check your connection.");
  }
}

// Admin Register API call
export async function registerAdmin(
  username: string,
  email: string,
  password: string
) {
  const response = await fetch(AUTH_ENDPOINTS.REGISTER, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Admin registration failed");
  }

  return response.json();
}

// API request with authentication
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = getToken();

  // Build headers, prefer options.headers but ensure Content-Type default for non-FormData
  const headers = {
    ...(!(options.body instanceof FormData) && { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Debug logging to help investigate 401 issues
  try {
    console.debug("authenticatedFetch request", {
      url,
      method: options.method || "GET",
      hasToken: !!token,
      tokenPreview: token ? `${token.slice(0, 10)}...${token.slice(-4)}` : null,
      headers,
      bodyPreview:
        options.body && typeof options.body === "string"
          ? options.body.slice(0, 200)
          : options.body && options.body instanceof FormData
          ? Array.from((options.body as FormData).entries()).map(([k, v]) => ({ k, v: v instanceof File ? `[File:${(v as File).name}]` : String(v).slice(0, 200) }))
          : null,
    });
  } catch {
    // ignore logging errors
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Include cookies and credentials
  });

  // Log response status and body on failure to aid debugging
  if (!response.ok) {
    try {
      const text = await response.text();
      console.warn(`authenticatedFetch response not ok (${response.status}) for ${url}:`, text);
    } catch {
      console.warn(`authenticatedFetch response not ok (${response.status}) for ${url} (could not read body)`);
    }
  }

  if (response.status === 401) {
    console.warn("authenticatedFetch received 401, clearing auth and redirecting to /login");
    clearAuthData();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  return response;
}
