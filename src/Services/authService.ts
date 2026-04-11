import { AuthResponse, LoginRequest, RegisterRequest } from "../Models/Auth";
import { api, setToken, removeToken } from "./apiClient";

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const data = await api.post<AuthResponse>("/auth/login", credentials);

    setToken(data.token);
    localStorage.setItem("reclamation_user", JSON.stringify(data.user));
    return data;
  },

  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const data = await api.post<AuthResponse>("/auth/register", payload);

    setToken(data.token);
    localStorage.setItem("reclamation_user", JSON.stringify(data.user));

    return data;
  },

  async logout(): Promise<void> {
    try {
      await api.post<void>("/auth/logout", {});
    } finally {
      removeToken();
      localStorage.removeItem("reclamation_user");
    }
  },
};