// API Base URL
export const API_BASE_URL = "https://pcprimedz.onrender.com";

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/admin/login`,
  REGISTER: `${API_BASE_URL}/admin/register`,
};

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: "auth_token",
  USERNAME: "username",
  ROLE: "user_role",
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

// Check if user is admin
export function isAdmin(): boolean {
  if (typeof window === "undefined") return false;
  
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (!token) return false;

  const decoded = decodeToken(token);
  return decoded?.role === "admin";
}

// Get stored token
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

// Get stored username
export function getUsername(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.USERNAME);
}

// Store auth data
export function storeAuthData(token: string, username: string) {
  if (typeof window === "undefined") return;
  
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.USERNAME, username);
  
  // Decode and store role
  const decoded = decodeToken(token);
  if (decoded?.role) {
    localStorage.setItem(STORAGE_KEYS.ROLE, decoded.role);
  }
}

// Clear auth data
export function clearAuthData() {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USERNAME);
  localStorage.removeItem(STORAGE_KEYS.ROLE);
}

// Admin Login API call
export async function login(username: string, password: string) {
  try {
    const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      let errorMessage = "Login failed";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
      } catch {
        errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
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

  // Build headers, prefer options.headers but ensure Content-Type default
  const headers = {
    "Content-Type": "application/json",
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
    // Token expired or invalid
    console.warn("authenticatedFetch received 401, clearing auth and redirecting to /login");
    clearAuthData();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  return response;
}
