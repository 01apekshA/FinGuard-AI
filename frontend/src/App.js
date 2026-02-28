import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { store } from "@/redux/store";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

import Dashboard from "@/pages/user/Dashboard";
import WalletPage from "@/pages/user/Wallet";
import Transactions from "@/pages/user/Transactions";
import Analytics from "@/pages/user/Analytics";
import Profile from "@/pages/user/Profile";

import AdminOverview from "@/pages/admin/AdminOverview";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminFraud from "@/pages/admin/AdminFraud";
import AdminKYC from "@/pages/admin/AdminKYC";
import AdminActivity from "@/pages/admin/AdminActivity";

import ProtectedRoute from "@/components/common/ProtectedRoute";

function AppRouter() {
  const location = useLocation();
  // Detect Google OAuth callback synchronously to avoid race conditions
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wallet"
        element={
          <ProtectedRoute>
            <WalletPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminOverview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute adminOnly>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/fraud"
        element={
          <ProtectedRoute adminOnly>
            <AdminFraud />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/kyc"
        element={
          <ProtectedRoute adminOnly>
            <AdminKYC />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/activity"
        element={
          <ProtectedRoute adminOnly>
            <AdminActivity />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRouter />
        <Toaster
          position="top-right"
          toastOptions={{
            className: "",
            style: {
              borderRadius: "16px",
              background: "#FFFFFF",
              color: "#0F172A",
              border: "1px solid #E2E8F0",
              boxShadow: "0 10px 40px rgba(15,23,42,0.08)",
              fontSize: "14px",
              fontWeight: 500,
              padding: "12px 16px",
            },
            success: {
              iconTheme: { primary: "#10B981", secondary: "#FFFFFF" },
            },
            error: {
              iconTheme: { primary: "#EF4444", secondary: "#FFFFFF" },
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  );
}
