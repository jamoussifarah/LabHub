const BASE_URL = import.meta.env.VITE_API_URL;


export const getToken = (): string | null => localStorage.getItem("reclamation_token");
export const setToken = (token: string) => localStorage.setItem("reclamation_token", token);
export const removeToken = () => localStorage.removeItem("reclamation_token");


export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}


async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `HTTP error ${response.status}`;
    try {
      const body = await response.text();
      if (body) message = body;
    } catch (_) {}
    throw new ApiError(response.status, message);
  }

  //  SAFE: DELETE / NO CONTENT
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  //  SAFE: check if body exists
  const text = await response.text();

  if (!text) {
    return undefined as unknown as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch (e) {
    // fallback si backend renvoie texte brut
    return text as unknown as T;
  }
}

export const api = {
  get: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "GET" }),

  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),

  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) }),

  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "PATCH", body: JSON.stringify(body) }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),
};
