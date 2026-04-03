import { Navigate } from "react-router";
import { useAuth, Role } from "../../context/AuthContext";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  allowedRole: Role;
}

export default function ProtectedRoute({ children, allowedRole }: Props) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/signin" replace />;

  if (user?.role !== allowedRole) {
    if (user?.role === "admin")      return <Navigate to="/" replace />;
    if (user?.role === "technicien") return <Navigate to="/technicien/dashboard" replace />;
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}
