import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children, adminOnly = false, staffOnly = false }) {
  const { user, loading } = useAuth();
  if (loading || user === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="font-mono-stat text-zinc-500 text-sm">Chargement...</p>
      </div>
    );
  }
  if (user === false) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;
  if (staffOnly && !["admin", "moderator"].includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
