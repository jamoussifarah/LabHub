import React, { createContext, useContext, useState, ReactNode } from "react";

export type Role = "admin" | "technicien";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  isAuthenticated: boolean;
}

// ─── Comptes mock ────────────────────────────────────────────────────────────
const MOCK_USERS: (User & { password: string })[] = [
  {
    id: 1,
    name: "Ahmed Ben Ali",
    email: "admin@reclamation.tn",
    password: "admin123",
    role: "admin",
  },
  {
    id: 2,
    name: "Mohamed Trabelsi",
    email: "tech@reclamation.tn",
    password: "tech123",
    role: "technicien",
  },
  {
    id: 3,
    name: "Sami Bouazizi",
    email: "sami@reclamation.tn",
    password: "sami123",
    role: "technicien",
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("reclamation_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email: string, password: string) => {
    const found = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (!found) {
      return { success: false, message: "Email ou mot de passe incorrect." };
    }
    const { password: _, ...userWithoutPassword } = found;
    setUser(userWithoutPassword);
    localStorage.setItem("reclamation_user", JSON.stringify(userWithoutPassword));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("reclamation_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
