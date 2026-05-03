import { Navigate } from "react-router";
import { useAuth, Role } from "../../context/AuthContext";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  allowedRole: Role;
}

export default function ProtectedRoute({ children, allowedRole }: Props) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  const role = user?.role;

  if (role !== allowedRole) {
    const r = String(role);

    if (r === "admin") {
      return <Navigate to="/" replace />;
    }

    if (r === "technicien") {
      return <Navigate to="/technicien/dashboard" replace />;
    }

    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}
