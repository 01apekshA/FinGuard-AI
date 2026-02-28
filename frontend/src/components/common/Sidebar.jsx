import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Wallet as WalletIcon,
  ArrowLeftRight,
  Sparkles,
  Shield,
  Users,
  AlertTriangle,
  ListChecks,
  ScrollText,
  Settings,
  LogOut,
  CircleUserRound,
} from "lucide-react";
import { logout } from "../../redux/slices/authSlice";
import { cn, initials } from "../../utils/format";

const userLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, testid: "nav-dashboard" },
  { to: "/wallet", label: "Wallet", icon: WalletIcon, testid: "nav-wallet" },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight, testid: "nav-transactions" },
  { to: "/analytics", label: "AI Analytics", icon: Sparkles, testid: "nav-analytics" },
  { to: "/profile", label: "Profile", icon: Settings, testid: "nav-profile" },
];

const adminLinks = [
  { to: "/admin", label: "Overview", icon: Shield, testid: "nav-admin-overview" },
  { to: "/admin/users", label: "Users", icon: Users, testid: "nav-admin-users" },
  { to: "/admin/fraud", label: "Fraud Monitor", icon: AlertTriangle, testid: "nav-admin-fraud" },
  { to: "/admin/kyc", label: "KYC Approvals", icon: ListChecks, testid: "nav-admin-kyc" },
  { to: "/admin/activity", label: "Activity Logs", icon: ScrollText, testid: "nav-admin-activity" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <aside
      data-testid="sidebar"
      className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[260px] bg-white border-r border-ink-200 px-5 py-6 z-30"
    >
      {/* Logo */}
      <button
        data-testid="sidebar-logo"
        onClick={() => navigate(isAdmin ? "/admin" : "/dashboard")}
        className="flex items-center gap-2 mb-8 px-2 hover:opacity-80 transition-opacity text-left"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center shadow-pill">
          <Shield className="text-white" size={20} strokeWidth={2.4} />
        </div>
        <div>
          <p className="text-[20px] font-bold leading-none text-ink-900 tracking-tight">FinGuard</p>
          <p className="text-[11px] text-ink-500 font-medium mt-0.5">AI Banking</p>
        </div>
      </button>

      {/* Profile card */}
      <div data-testid="sidebar-profile" className="bg-ink-50 rounded-2xl p-3 flex items-center gap-3 mb-6">
        {user?.picture ? (
          <img
            src={user.picture}
            alt={user.full_name}
            className="w-11 h-11 rounded-xl object-cover"
          />
        ) : (
          <div className="w-11 h-11 rounded-xl bg-brand-100 text-brand-700 font-semibold flex items-center justify-center">
            {initials(user?.full_name)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink-900 truncate">{user?.full_name}</p>
          <p className="text-xs text-ink-500 truncate">
            {user?.role === "admin" ? "Administrator" : "Personal"}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar">
        <p className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold px-3 mb-1">
          Banking
        </p>
        {userLinks.map(({ to, label, icon: Icon, testid }) => (
          <NavLink key={to} to={to} data-testid={testid} end>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  "sidebar-item relative flex items-center gap-3 px-3 h-[48px] rounded-xl text-[14px] font-medium transition-colors",
                  isActive
                    ? "active"
                    : "text-ink-700 hover:bg-ink-50"
                )}
              >
                <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
                <span>{label}</span>
              </motion.div>
            )}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <p className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold px-3 mt-5 mb-1">
              Admin
            </p>
            {adminLinks.map(({ to, label, icon: Icon, testid }) => (
              <NavLink key={to} to={to} data-testid={testid} end>
                {({ isActive }) => (
                  <motion.div
                    whileHover={{ x: 2 }}
                    className={cn(
                      "sidebar-item relative flex items-center gap-3 px-3 h-[48px] rounded-xl text-[14px] font-medium transition-colors",
                      isActive ? "active" : "text-ink-700 hover:bg-ink-50"
                    )}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
                    <span>{label}</span>
                  </motion.div>
                )}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Logout */}
      <button
        data-testid="logout-btn"
        onClick={handleLogout}
        className="mt-4 flex items-center gap-3 px-3 h-[48px] rounded-xl text-[14px] font-medium text-ink-700 hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        <LogOut size={20} />
        <span>Log out</span>
        <CircleUserRound className="ml-auto opacity-0" size={16} />
      </button>
    </aside>
  );
}
