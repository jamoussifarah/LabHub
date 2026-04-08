import React, { createContext, useContext, useState, ReactNode } from "react";

export type Role = "ADMIN" | "TECHNICIEN" | "ETUDIANT";
const API_URL = import.meta.env.VITE_API_URL;
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: { name: string; email: string; password: string; role?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("reclamation_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Helper pour extraire le rôle depuis le tableau "roles" du backend
  const extractRole = (rolesArray: string[] | undefined): Role => {
    if (!rolesArray) return "ETUDIANT";
    if (rolesArray.includes("ADMIN")) return "ADMIN";
    if (rolesArray.includes("TECHNICIEN")) return "TECHNICIEN";
    return "ETUDIANT";
  };

  const login = async (email: string, password: string) => {
    console.log("🔐 Tentative de login :", email);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      console.log("📡 Status HTTP :", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Login échoué :", errorText);
        return { success: false, message: "Email ou mot de passe incorrect." };
      }

      const data = await response.json();
      console.log("✅ Données reçues :", data);

      // Vérification de la structure
      if (!data.user || !data.user.roles) {
        console.error("Structure inattendue :", data);
        return { success: false, message: "Format de réponse invalide." };
      }

      const role = extractRole(data.user.roles);
      console.log("🎭 Rôle extrait :", role);

      const userData: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: role
      };

      setUser(userData);
      localStorage.setItem("reclamation_user", JSON.stringify(userData));
      localStorage.setItem("reclamation_token", data.token);
      console.log("💾 Stocké dans localStorage", userData);

      return { success: true };
    } catch (error) {
      console.error("🔥 Erreur réseau :", error);
      return { success: false, message: "Erreur de connexion au serveur" };
    }
  };

  const register = async (userData: { name: string; email: string; password: string; role?: string }) => {
    console.log("📝 Tentative d'inscription :", userData.email);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("❌ Inscription échouée :", error);
        return { success: false, message: error };
      }

      const data = await response.json();
      console.log("✅ Inscription réussie, données :", data);

      const role = extractRole(data.user.roles);
      const newUser: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: role,
      };

      setUser(newUser);
      localStorage.setItem("reclamation_user", JSON.stringify(newUser));
      localStorage.setItem("reclamation_token", data.token);
      console.log("💾 Utilisateur connecté automatiquement", newUser);
      return { success: true };
    } catch (error) {
      console.error("🔥 Erreur inscription :", error);
      return { success: false, message: "Erreur de connexion au serveur" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("reclamation_user");
    localStorage.removeItem("reclamation_token");
    console.log("🔓 Déconnexion effectuée");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};