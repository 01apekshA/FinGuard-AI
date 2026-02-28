import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMe } from "../../redux/slices/authSlice";
import Loader from "./Loader";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const dispatch = useDispatch();
  const { user, status } = useSelector((s) => s.auth);
  const location = useLocation();

  useEffect(() => {
    // CRITICAL: If returning from OAuth callback, skip the /me check.
    if (window.location.hash?.includes("session_id=")) return;
    if (!user && status === "idle") {
      dispatch(fetchMe());
    }
  }, [user, status, dispatch]);

  // Still checking (initial or fetching)
  if (status === "idle" || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page">
        <Loader label="Checking session…" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
