import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { User, Lock, Mail, Phone, BadgeCheck, ShieldCheck, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axios";
import { fetchMe } from "../../redux/slices/authSlice";
import { formatDate, initials } from "../../utils/format";

export default function Profile() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const [form, setForm] = useState({ full_name: "", phone: "" });
  const [pwd, setPwd] = useState({ current_password: "", new_password: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm({ full_name: user.full_name || "", phone: user.phone || "" });
  }, [user]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.patch("/users/me", form);
      toast.success("Profile updated");
      dispatch(fetchMe());
    } catch (e) {
      toast.error(e.response?.data?.detail || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!pwd.current_password || !pwd.new_password) return toast.error("Fill both passwords");
    if (pwd.new_password.length < 6) return toast.error("Password must be 6+ characters");
    try {
      await api.post("/users/me/password", pwd);
      toast.success("Password changed");
      setPwd({ current_password: "", new_password: "" });
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    }
  };

  return (
    <DashboardLayout title="Profile" subtitle="Manage your account, identity, and security settings.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="bg-white rounded-card p-6 shadow-card border border-ink-100 text-center">
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.full_name}
              className="w-24 h-24 rounded-3xl mx-auto object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-3xl mx-auto bg-brand-100 text-brand-700 font-bold text-3xl flex items-center justify-center">
              {initials(user?.full_name)}
            </div>
          )}
          <h3 className="mt-4 text-lg font-bold text-ink-900">{user?.full_name}</h3>
          <p className="text-sm text-ink-500">{user?.email}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {user?.kyc_status === "approved" && (
              <span className="chip chip-success">
                <BadgeCheck size={12} /> KYC verified
              </span>
            )}
            {user?.kyc_status === "pending" && (
              <span className="chip chip-warning">KYC pending</span>
            )}
            <span className="chip chip-info">
              <ShieldCheck size={12} /> {user?.auth_provider}
            </span>
          </div>
          <p className="mt-4 text-xs text-ink-400">Member since {formatDate(user?.created_at)}</p>
        </div>

        {/* Edit profile */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-card p-6 shadow-card border border-ink-100">
            <div className="flex items-center gap-2 mb-4">
              <User size={18} className="text-brand-700" />
              <p className="font-semibold text-ink-900">Account details</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field icon={User} label="Full name">
                <input
                  data-testid="profile-name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full bg-transparent text-sm focus:outline-none"
                />
              </Field>
              <Field icon={Mail} label="Email">
                <input
                  value={user?.email || ""}
                  disabled
                  className="w-full bg-transparent text-sm text-ink-500"
                />
              </Field>
              <Field icon={Phone} label="Phone">
                <input
                  data-testid="profile-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 555 0123"
                  className="w-full bg-transparent text-sm focus:outline-none"
                />
              </Field>
            </div>
            <button
              data-testid="profile-save"
              onClick={saveProfile}
              disabled={saving}
              className="mt-5 h-12 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:bg-ink-300 text-white font-semibold text-sm shadow-pill"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>

          {user?.auth_provider === "local" && (
            <div className="bg-white rounded-card p-6 shadow-card border border-ink-100">
              <div className="flex items-center gap-2 mb-4">
                <Lock size={18} className="text-brand-700" />
                <p className="font-semibold text-ink-900">Password & security</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field icon={Lock} label="Current password">
                  <input
                    data-testid="profile-current-pwd"
                    type="password"
                    value={pwd.current_password}
                    onChange={(e) => setPwd({ ...pwd, current_password: e.target.value })}
                    className="w-full bg-transparent text-sm focus:outline-none"
                  />
                </Field>
                <Field icon={Lock} label="New password">
                  <input
                    data-testid="profile-new-pwd"
                    type="password"
                    value={pwd.new_password}
                    onChange={(e) => setPwd({ ...pwd, new_password: e.target.value })}
                    className="w-full bg-transparent text-sm focus:outline-none"
                  />
                </Field>
              </div>
              <button
                data-testid="profile-change-pwd"
                onClick={changePassword}
                className="mt-5 h-12 px-6 rounded-2xl bg-ink-900 hover:bg-ink-800 text-white font-semibold text-sm"
              >
                Update password
              </button>
            </div>
          )}

          <div className="bg-white rounded-card p-6 shadow-card border border-red-100">
            <p className="font-semibold text-red-700 mb-1">Danger zone</p>
            <p className="text-sm text-ink-500 mb-3">
              Deleting your account is permanent and cannot be undone.
            </p>
            <button
              disabled
              className="h-11 px-5 rounded-2xl bg-red-50 text-red-600 font-semibold text-sm flex items-center gap-2 opacity-70 cursor-not-allowed"
            >
              <Trash2 size={16} /> Delete account (disabled)
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
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
