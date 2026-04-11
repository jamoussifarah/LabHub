export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  studentId?: string;
  department?: string;
  roles: string[];
  createdAt: string; // ISO date string
  updatedAt: string;
  active: boolean;
  firstName:string;
}