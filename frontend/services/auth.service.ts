import { api } from "@/lib/api";
import type {
  LoginInput,
  LoginResponse,
  RegisterInput,
  User,
} from "@/types/auth";

export const authService = {
  async login(data: LoginInput): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  async register(data: RegisterInput): Promise<{ user: User }> {
    const response = await api.post<{ user: User }>("/auth/register", data);
    return response.data;
  },

  async getCurrentUser(): Promise<{ user: User }> {
    const response = await api.get<{ user: User }>("/auth/me");
    return response.data;
  },
};