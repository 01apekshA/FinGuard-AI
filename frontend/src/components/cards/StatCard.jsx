import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency } from "../../utils/format";

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconBg = "#DCFCE7",
  iconColor = "#047857",
  delta,
  testid,
  isCurrency = true,
}) {
  const positive = delta >= 0;
  return (
    <motion.div
      data-testid={testid}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className="bg-white rounded-card p-5 lg:p-6 shadow-card border border-ink-100"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          {Icon && <Icon size={22} style={{ color: iconColor }} strokeWidth={2.4} />}
        </div>
        {typeof delta === "number" && (
          <span
            className={`chip ${positive ? "chip-success" : "chip-danger"}`}
          >
            {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="text-ink-500 text-sm font-medium">{title}</p>
      <p className="text-ink-900 text-[26px] font-bold mt-1 tracking-tight">
        {typeof value === "number"
          ? isCurrency
            ? formatCurrency(value)
            : value.toLocaleString()
          : value}
      </p>
    </motion.div>
  );
}
