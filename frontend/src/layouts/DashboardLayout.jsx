import { useState } from "react";
import Sidebar from "../components/common/Sidebar";
import Topbar from "../components/common/Topbar";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

export default function DashboardLayout({ title, subtitle, children }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  return (
    <div className="min-h-screen bg-page">
      <Sidebar />
      {/* Mobile sidebar overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-ink-900/40" onClick={() => setOpen(false)}>
          <div
            className="absolute left-0 top-0 bottom-0 w-[260px] bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />
          </div>
        </div>
      )}

      <div className="lg:ml-[260px] flex flex-col min-h-screen">
        <Topbar
          onToggleSidebar={() => setOpen(!open)}
          title={title}
          subtitle={subtitle}
        />
        <main className="flex-1 p-5 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
