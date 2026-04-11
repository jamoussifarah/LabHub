import { api } from "./apiClient";
import { User } from "../Models/user";

export const userService = {
  // Récupère tous les utilisateurs
  getAll: (): Promise<User[]> => 
    api.get("/auth/users"),

  // Filtre les techniciens (si ton backend n'a pas d'endpoint dédié, 
  // tu peux filtrer côté client ou utiliser un endpoint spécifique)
  getTechnicians: async (): Promise<User[]> => {
  try {
    const techs = await api.get<User[]>("/auth/techniciens");
    console.log("✅ Techniciens reçus:", techs);
    return techs;
  } catch (err) {
    console.error("❌ Erreur getTechniciens:", err);
    const allUsers = await api.get<User[]>("/auth/users");
    return allUsers.filter(u => 
      u.roles?.includes("TECHNICIEN") || 
      u.roles?.includes("TECHNICIAN")
    );
  }
},
  // Dans userService.ts

  getById: (id: string): Promise<User> => 
    api.get(`/auth/users/${id}`),
  update: (id: string, payload: Partial<User> & { currentPassword?: string; newPassword?: string }): Promise<User> =>
  api.put(`/auth/techniciens/${id}`, payload),
};