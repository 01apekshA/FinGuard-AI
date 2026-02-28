import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon,
  Settings,
  Shield,
  ChevronDown,
  LogOut,
  BadgeCheck,
} from "lucide-react";
import { logout } from "../../redux/slices/authSlice";
import { initials } from "../../utils/format";

export default function ProfileMenu() {
  const ref = useRef(null);
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  if (!user) return null;

  const isAdmin = user.role === "admin";

  const items = [
    {
      icon: UserIcon,
      label: "View profile",
      testid: "profile-menu-profile",
      action: () => navigate("/profile"),
    },
    {
      icon: Settings,
      label: "Account settings",
      testid: "profile-menu-settings",
      action: () => navigate("/profile"),
    },
    ...(isAdmin
      ? [
          {
            icon: Shield,
            label: "Admin panel",
            testid: "profile-menu-admin",
            action: () => navigate("/admin"),
          },
        ]
      : []),
  ];

  return (
    <div ref={ref} className="relative">
      <button
        data-testid="topbar-profile-menu"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 p-1 pr-3 rounded-2xl hover:bg-ink-50 transition-colors"
      >
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.full_name}
            className="w-10 h-10 rounded-xl object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 font-semibold flex items-center justify-center">
            {initials(user.full_name)}
          </div>
        )}
        <div className="hidden md:block text-left">
          <p className="text-xs font-semibold text-ink-900 leading-tight max-w-[100px] truncate">
            {user.full_name.split(" ")[0]}
          </p>
          <p className="text-[10px] text-ink-500 uppercase tracking-wide font-semibold">
            {isAdmin ? "Admin" : "Personal"}
          </p>
        </div>
        <ChevronDown size={14} className="text-ink-400 hidden md:block" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            data-testid="profile-menu-panel"
            className="absolute right-0 mt-2 w-[280px] bg-white rounded-3xl shadow-cardHover border border-ink-100 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-ink-100 flex items-center gap-3">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.full_name}
                  className="w-12 h-12 rounded-2xl object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 font-semibold flex items-center justify-center">
                  {initials(user.full_name)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-ink-900 truncate">
                  {user.full_name}
                </p>
                <p className="text-xs text-ink-500 truncate">{user.email}</p>
                {user.kyc_status === "approved" && (
                  <span className="chip chip-success mt-1">
                    <BadgeCheck size={10} /> Verified
                  </span>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="p-2">
              {items.map(({ icon: Icon, label, testid, action }) => (
                <button
                  key={label}
                  data-testid={testid}
                  onClick={() => {
                    action();
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 h-11 rounded-xl text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors"
                >
                  <Icon size={16} className="text-ink-400" />
                  {label}
                </button>
              ))}
            </div>

            <div className="border-t border-ink-100 p-2">
              <button
                data-testid="profile-menu-logout"
                onClick={() => {
                  dispatch(logout());
                  navigate("/login", { replace: true });
                }}
                className="w-full flex items-center gap-3 px-3 h-11 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
