import { Navigate } from "react-router-dom";
import { useAuth, Role } from "../../context/AuthContext";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  allowedRole: Role;
}

export default function ProtectedRoute({ children, allowedRole }: Props) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/signin" replace />;
  }

  if (user.role !== allowedRole) {
    switch (user.role) {
      case "admin":
        return <Navigate to="/" replace />;

      case "technicien":
        return <Navigate to="/technicien/dashboard" replace />;

      default:
        return <Navigate to="/signin" replace />;
    }
  }

  return <>{children}</>;
}
