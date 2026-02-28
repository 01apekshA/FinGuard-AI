import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "../../layouts/AuthLayout";
import { registerThunk } from "../../redux/slices/authSlice";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.password)
      return toast.error("All fields are required");
    if (form.password.length < 6) return toast.error("Password must be 6+ characters");
    const result = await dispatch(registerThunk(form));
    if (registerThunk.fulfilled.match(result)) {
      toast.success("Welcome to FinGuard!");
      navigate("/dashboard", { replace: true });
    } else {
      toast.error(result.payload || "Registration failed");
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Open a FinGuard account in seconds — it's free."
      footer={
        <span>
          Already have an account?{" "}
          <Link to="/login" className="text-brand-700 font-semibold" data-testid="link-login">
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field icon={UserIcon} label="Full name">
          <input
            data-testid="register-name"
            value={form.full_name}
            onChange={update("full_name")}
            placeholder="Jordan Rivera"
            className="w-full bg-transparent text-sm focus:outline-none placeholder:text-ink-400"
          />
        </Field>
        <Field icon={Mail} label="Email">
          <input
            data-testid="register-email"
            value={form.email}
            onChange={update("email")}
            type="email"
            placeholder="you@finguard.ai"
            className="w-full bg-transparent text-sm focus:outline-none placeholder:text-ink-400"
          />
        </Field>
        <Field icon={Lock} label="Password">
          <input
            data-testid="register-password"
            value={form.password}
            onChange={update("password")}
            type="password"
            placeholder="At least 6 characters"
            className="w-full bg-transparent text-sm focus:outline-none placeholder:text-ink-400"
          />
        </Field>
        <button
          data-testid="register-submit"
          type="submit"
          disabled={status === "loading"}
          className="w-full h-12 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:bg-ink-300 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-pill transition-colors"
        >
          {status === "loading" ? <Loader2 className="animate-spin" size={18} /> : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}

function Field({ icon: Icon, label, children }) {
  return (
    <label className="block">
      <span className="text-xs text-ink-600 font-semibold mb-1.5 block">{label}</span>
      <div className="flex items-center gap-3 h-12 px-4 rounded-2xl bg-ink-50 border border-transparent focus-within:border-brand-300 focus-within:bg-white transition-colors">
        <Icon size={18} className="text-ink-400" />
        {children}
      </div>
    </label>
  );
}
