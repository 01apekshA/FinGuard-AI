import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen auth-bg flex">
      {/* Left side - branded */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center shadow-pill">
            <Shield className="text-white" size={22} strokeWidth={2.4} />
          </div>
          <div>
            <p className="text-xl font-bold text-ink-900">FinGuard</p>
            <p className="text-xs text-ink-500 font-medium">AI Banking</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-md"
        >
          <h2 className="text-4xl xl:text-5xl font-bold text-ink-900 leading-tight tracking-tight">
            Banking, supercharged by AI.
          </h2>
          <p className="mt-4 text-ink-600 text-base leading-relaxed">
            Real-time fraud detection, smart budgets, and predictive analytics —
            all wrapped in a beautiful, secure dashboard you'll actually love using.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <Pillar value="0.4s" label="Avg AI insight" />
            <Pillar value="99.9%" label="Fraud catch rate" />
            <Pillar value="5+" label="AI agents" />
            <Pillar value="24/7" label="Monitoring" />
          </div>
        </motion.div>

        <p className="text-xs text-ink-400">© 2026 FinGuard Inc. Built with care.</p>

        {/* Floating decorations */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-brand-300/30 blur-3xl" />
        <div className="absolute bottom-10 right-12 w-60 h-60 rounded-full bg-emerald-200/40 blur-3xl" />
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center">
              <Shield className="text-white" size={20} />
            </div>
            <p className="text-lg font-bold">FinGuard</p>
          </div>

          <h1 className="text-3xl font-bold text-ink-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-ink-500 mt-2 text-sm">{subtitle}</p>}

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-6 text-sm text-ink-500 text-center">{footer}</div>}

          <p className="mt-10 text-xs text-ink-400 text-center">
            By continuing, you agree to FinGuard's{" "}
            <Link to="#" className="text-brand-700 font-medium">
              Terms
            </Link>{" "}
            &{" "}
            <Link to="#" className="text-brand-700 font-medium">
              Privacy Policy
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function Pillar({ value, label }) {
  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-white">
      <p className="text-2xl font-bold text-ink-900">{value}</p>
      <p className="text-xs text-ink-500 mt-1 font-medium">{label}</p>
    </div>
  );
}
