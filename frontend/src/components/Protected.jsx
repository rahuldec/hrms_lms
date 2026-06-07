import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function Protected({ children, requireRole }) {
  const { session, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }
  if (!session) return <Navigate to="/" replace />;
  if (requireRole && role && role !== requireRole) {
    return <Navigate to={role === "admin" ? "/admin" : "/trainee"} replace />;
  }
  return children;
}
