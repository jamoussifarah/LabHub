import { User } from "./user";

export interface AuthResponse {
  token: string;
  user: User;
}
 
export interface LoginRequest {
  email: string;
  password: string;
}
 
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  studentId?: string;
  department?: string;
}