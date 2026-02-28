import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import {
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";

import { auth } from "../../firebase";

import AuthLayout from "../../layouts/AuthLayout";
import { loginThunk, clearError } from "../../redux/slices/authSlice";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { status, error } = useSelector((s) => s.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return toast.error("Email and password required");
    }

    const result = await dispatch(
      loginThunk({ email, password })
    );

    if (loginThunk.fulfilled.match(result)) {
      toast.success(
        `Welcome back, ${result.payload.full_name.split(" ")[0]}!`
      );

      const target =
        result.payload.role === "admin"
          ? "/admin"
          : (location.state?.from || "/dashboard");

      navigate(target, { replace: true });

    } else {
      toast.error(result.payload || "Login failed");
      dispatch(clearError());
    }
  };

  // NEW FIREBASE GOOGLE LOGIN
  const handleGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();

    const result = await signInWithPopup(
      auth,
      provider
    );

    const token = await result.user.getIdToken();

    const response = await fetch(
      "http://127.0.0.1:8001/api/auth/google",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      }
    );

    const data = await response.json();

    console.log("BACKEND RESPONSE:", data);

    if (!response.ok) {
      throw new Error(data.error || "Google login failed");
    }
    localStorage.setItem("fg_token", data.token);

toast.success(
  `Welcome ${data.user.name}!`
);

window.location.href = "/dashboard";

  } catch (error) {
    console.error("GOOGLE ERROR:", error);

    toast.error(error.message);
  }
};
const useDemo = () => {
    setEmail("demo@finguard.ai");
    setPassword("Demo@123");
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your FinGuard account to continue."
      footer={
        <span>
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-brand-700 font-semibold"
            data-testid="link-register"
          >
            Create one
          </Link>
        </span>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field icon={Mail} label="Email">
          <input
            data-testid="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@finguard.ai"
            className="w-full bg-transparent text-sm focus:outline-none placeholder:text-ink-400"
            autoComplete="email"
          />
        </Field>

        <Field icon={Lock} label="Password">
          <input
            data-testid="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPass ? "text" : "password"}
            placeholder="••••••••"
            className="w-full bg-transparent text-sm focus:outline-none placeholder:text-ink-400"
            autoComplete="current-password"
          />

          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="ml-2 text-ink-400 hover:text-ink-600"
            aria-label="Toggle password visibility"
          >
            {showPass ? (
              <EyeOff size={16} />
            ) : (
              <Eye size={16} />
            )}
          </button>
        </Field>

        <button
          data-testid="login-submit"
          type="submit"
          disabled={status === "loading"}
          className="w-full h-12 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:bg-ink-300 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-pill transition-colors"
        >
          {status === "loading" ? (
            <Loader2
              className="animate-spin"
              size={18}
            />
          ) : (
            "Sign in"
          )}
        </button>

        <button
          type="button"
          data-testid="login-demo"
          onClick={useDemo}
          className="w-full h-11 rounded-2xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs transition-colors"
        >
          Use demo credentials
        </button>

        <div className="relative flex items-center gap-3 py-2">
          <div className="flex-1 h-px bg-ink-200" />

          <span className="text-xs text-ink-400 font-medium">
            or continue with
          </span>

          <div className="flex-1 h-px bg-ink-200" />
        </div>

        <button
          data-testid="login-google"
          type="button"
          onClick={handleGoogle}
          className="w-full h-12 rounded-2xl border border-ink-200 hover:border-brand-300 hover:bg-brand-50/40 text-ink-800 font-semibold text-sm flex items-center justify-center gap-3 transition-colors"
        >
          <GoogleIcon />
          Sign in with Google
        </button>

        {error && (
          <p className="text-red-600 text-xs text-center">
            {error}
          </p>
        )}
      </form>
    </AuthLayout>
  );
}

function Field({ icon: Icon, label, children }) {
  return (
    <label className="block">
      <span className="text-xs text-ink-600 font-semibold mb-1.5 block">
        {label}
      </span>

      <div className="flex items-center gap-3 h-12 px-4 rounded-2xl bg-ink-50 border border-transparent focus-within:border-brand-300 focus-within:bg-white transition-colors">
        <Icon
          size={18}
          className="text-ink-400"
        />

        {children}
      </div>
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />

      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />

      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />

      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}