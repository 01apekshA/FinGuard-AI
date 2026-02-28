import { motion } from "framer-motion";
import { ArrowDownToLine, Send, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "../../utils/format";

export default function BalanceCard({ balance = 0, currency = "USD", onDeposit, onSend }) {
  const [show, setShow] = useState(true);
  return (
    <motion.div
      data-testid="balance-card"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className="relative overflow-hidden balance-hero rounded-card p-7 lg:p-8 shadow-card"
    >
      <div className="absolute -top-12 -right-10 w-56 h-56 rounded-full bg-white/30 blur-2xl" />
      <div className="absolute -bottom-16 -left-10 w-60 h-60 rounded-full bg-emerald-300/40 blur-3xl" />
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div>
          <p className="text-emerald-900/80 text-sm font-semibold tracking-wide uppercase">
            Total Balance
          </p>
          <p className="text-emerald-900/70 text-xs mt-1">Available across all accounts</p>
        </div>
        <button
          data-testid="balance-toggle-visibility"
          onClick={() => setShow((v) => !v)}
          className="w-10 h-10 rounded-xl bg-white/40 hover:bg-white/60 flex items-center justify-center text-emerald-900"
          aria-label="Toggle balance"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <div className="relative z-10 flex items-end gap-2">
        <p
          data-testid="balance-amount"
          className="text-emerald-950 font-bold tracking-tight"
          style={{ fontSize: "42px", lineHeight: 1 }}
        >
          {show ? formatCurrency(balance, currency) : "••••••"}
        </p>
      </div>
      <p className="relative z-10 mt-2 text-emerald-900/70 text-sm">
        VISA • 4421 •••• •••• 0917
      </p>
      <div className="relative z-10 mt-6 flex gap-3">
        <button
          data-testid="balance-deposit-btn"
          onClick={onDeposit}
          className="flex items-center gap-2 px-5 h-12 rounded-2xl bg-emerald-900 text-white font-semibold text-sm hover:bg-emerald-950 transition-colors"
        >
          <ArrowDownToLine size={18} />
          Deposit
        </button>
        <button
          data-testid="balance-send-btn"
          onClick={onSend}
          className="flex items-center gap-2 px-5 h-12 rounded-2xl bg-white/80 backdrop-blur text-emerald-900 font-semibold text-sm hover:bg-white transition-colors"
        >
          <Send size={18} />
          Send
        </button>
      </div>
    </motion.div>
  );
}
