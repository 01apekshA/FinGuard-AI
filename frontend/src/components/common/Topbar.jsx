import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Menu } from "lucide-react";
import NotificationsButton from "./NotificationsButton";
import ProfileMenu from "./ProfileMenu";
import QuickPayModal from "./QuickPayModal";

export default function Topbar({ onToggleSidebar, title, subtitle }) {
  const [q, setQ] = useState("");
  const [quickPayOpen, setQuickPayOpen] = useState(false);
  const navigate = useNavigate();

  const submitSearch = (e) => {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed) {
      navigate(`/transactions?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate("/transactions");
    }
  };

  return (
    <>
      <header
        data-testid="topbar"
        className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-ink-200 h-[80px] flex items-center px-6 lg:px-8"
      >
        <button
          data-testid="sidebar-toggle"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl hover:bg-ink-100 mr-2"
        >
          <Menu size={22} />
        </button>

        <div className="flex-1 min-w-0">
          {title && (
            <>
              <h1 className="text-[22px] lg:text-[26px] font-bold text-ink-900 leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-ink-500 mt-0.5 hidden sm:block">{subtitle}</p>
              )}
            </>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <form onSubmit={submitSearch} className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
            />
            <input
              data-testid="topbar-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search transactions, payees…"
              className="pl-10 pr-4 h-12 w-[260px] xl:w-[320px] rounded-2xl bg-ink-50 border border-transparent focus:border-brand-300 focus:bg-white focus:outline-none text-sm placeholder:text-ink-400"
            />
          </form>

          <NotificationsButton />

          <button
            data-testid="topbar-quick-action"
            onClick={() => setQuickPayOpen(true)}
            className="h-12 px-5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm flex items-center gap-2 shadow-pill transition-colors"
          >
            <Plus size={18} />
            Quick Pay
          </button>
        </div>

        <div className="ml-3 flex items-center gap-2">
          <ProfileMenu />
        </div>
      </header>

      <QuickPayModal open={quickPayOpen} onClose={() => setQuickPayOpen(false)} />
    </>
  );
}
