const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

export const apiRequest = async <T>(
  method: HttpMethod,
  endpoint: string,
  data?: object,
  token?: string
): Promise<ApiResponse<T>> => {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const options: RequestInit = { method, headers };
    if (data && method !== "GET") options.body = JSON.stringify(data);

    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const json = await res.json();

    if (!res.ok) throw new Error(json.message || "API Error");

    return json as ApiResponse<T>;
  } catch (err) {
    console.error("❌ API Request Error:", err);
    throw err;
  }
};

// CRUD wrapper
export const api = {
  get: <T>(endpoint: string, token?: string) =>
    apiRequest<T>("GET", endpoint, undefined, token),

  post: <T>(endpoint: string, data: object, token?: string) =>
    apiRequest<T>("POST", endpoint, data, token),

  put: <T>(endpoint: string, data: object, token?: string) =>
    apiRequest<T>("PUT", endpoint, data, token),

  delete: <T>(endpoint: string, token?: string) =>
    apiRequest<T>("DELETE", endpoint, undefined, token),
};
