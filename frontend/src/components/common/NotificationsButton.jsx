import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Bell, ShieldAlert, ArrowDownLeft, Wallet, Sparkles, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchFraudAlerts } from "../../redux/slices/aiSlice";
import { fetchRecentTransactions } from "../../redux/slices/transactionSlice";
import { formatDate, formatCurrency } from "../../utils/format";

export default function NotificationsButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const [seenIds, setSeenIds] = useState(() =>
    new Set(JSON.parse(localStorage.getItem("fg_seen_notifs") || "[]"))
  );
  const fraudAlerts = useSelector((s) => s.ai.fraudAlerts);
  const recent = useSelector((s) => s.transactions.recent);
  const user = useSelector((s) => s.auth.user);

  useEffect(() => {
    if (!user) return;
    dispatch(fetchFraudAlerts());
    dispatch(fetchRecentTransactions(8));
    const t = setInterval(() => {
      dispatch(fetchFraudAlerts());
      dispatch(fetchRecentTransactions(8));
    }, 30000);
    return () => clearInterval(t);
  }, [dispatch, user]);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Build notification feed
  const items = [
    ...fraudAlerts.slice(0, 5).map((a) => ({
      id: `fraud-${a.id}`,
      type: "fraud",
      title: a.reason,
      subtitle: `${a.severity.toUpperCase()} risk · ${Math.round(a.risk_score)} score`,
      time: a.created_at,
      action: () => navigate(user?.role === "admin" ? "/admin/fraud" : "/analytics"),
    })),
    ...recent.slice(0, 5).map((t) => {
      const isIncome = t.type === "deposit" || t.type === "transfer_in";
      return {
        id: `tx-${t.id}`,
        type: isIncome ? "income" : "expense",
        title: isIncome
          ? `Received ${formatCurrency(t.amount)}`
          : `Paid ${formatCurrency(t.amount)} • ${t.category}`,
        subtitle: t.counterparty || t.description || "Transaction",
        time: t.created_at,
        action: () => navigate("/transactions"),
      };
    }),
  ].sort((a, b) => new Date(b.time) - new Date(a.time));

  const unreadCount = items.filter((i) => !seenIds.has(i.id)).length;

  const markAllRead = () => {
    const all = new Set(items.map((i) => i.id));
    setSeenIds(all);
    localStorage.setItem("fg_seen_notifs", JSON.stringify([...all]));
  };

  const ICONS = {
    fraud: { Icon: ShieldAlert, bg: "bg-red-100", color: "text-red-600" },
    income: { Icon: ArrowDownLeft, bg: "bg-brand-100", color: "text-brand-700" },
    expense: { Icon: Wallet, bg: "bg-ink-100", color: "text-ink-700" },
  };

  return (
    <div ref={ref} className="relative">
      <button
        data-testid="topbar-notifications"
        onClick={() => setOpen((v) => !v)}
        className="relative w-12 h-12 rounded-2xl bg-ink-50 hover:bg-ink-100 flex items-center justify-center transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            data-testid="notifications-panel"
            className="absolute right-0 mt-2 w-[360px] bg-white rounded-3xl shadow-cardHover border border-ink-100 overflow-hidden z-50"
          >
            <div className="p-4 border-b border-ink-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-ink-900">Notifications</p>
                <p className="text-xs text-ink-500">
                  {unreadCount > 0
                    ? `${unreadCount} new update${unreadCount > 1 ? "s" : ""}`
                    : "You're all caught up"}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  data-testid="notifications-mark-read"
                  onClick={markAllRead}
                  className="text-xs font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1"
                >
                  <Check size={12} /> Mark read
                </button>
              )}
            </div>
            <div className="max-h-[420px] overflow-y-auto">
              {items.length === 0 && (
                <div className="p-8 text-center text-sm text-ink-500">
                  <Sparkles size={24} className="mx-auto mb-2 text-brand-400" />
                  No notifications yet.
                </div>
              )}
              {items.map((n) => {
                const { Icon, bg, color } = ICONS[n.type];
                const unread = !seenIds.has(n.id);
                return (
                  <button
                    key={n.id}
                    data-testid={`notif-${n.id}`}
                    onClick={() => {
                      const next = new Set(seenIds);
                      next.add(n.id);
                      setSeenIds(next);
                      localStorage.setItem("fg_seen_notifs", JSON.stringify([...next]));
                      n.action();
                      setOpen(false);
                    }}
                    className="w-full flex gap-3 items-start text-left p-4 hover:bg-ink-50 transition-colors border-b border-ink-100 last:border-b-0"
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${bg} ${color} shrink-0`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink-900 line-clamp-1">
                        {n.title}
                      </p>
                      <p className="text-xs text-ink-500 line-clamp-1 mt-0.5">
                        {n.subtitle}
                      </p>
                      <p className="text-[10px] text-ink-400 mt-1 font-medium uppercase tracking-wide">
                        {formatDate(n.time)}
                      </p>
                    </div>
                    {unread && (
                      <span className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
