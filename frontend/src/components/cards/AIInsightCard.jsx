import { motion } from "framer-motion";

export default function AIInsightCard({
  icon: Icon,
  title,
  description,
  badge,
  badgeClass = "chip-success",
  cta,
  onCta,
  testid,
}) {
  return (
    <motion.div
      data-testid={testid}
      whileHover={{ y: -4 }}
      className="bg-white rounded-card p-6 shadow-card border border-ink-100 flex flex-col"
    >
      <div className="flex items-start gap-3 mb-3">
        {Icon && (
          <div className="w-11 h-11 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-700">
            <Icon size={20} strokeWidth={2.2} />
          </div>
        )}
        <div className="flex-1">
          <p className="text-ink-900 font-semibold">{title}</p>
          {badge && <span className={`chip ${badgeClass} mt-1`}>{badge}</span>}
        </div>
      </div>
      <p className="text-sm text-ink-500 leading-relaxed flex-1">{description}</p>
      {cta && (
        <button
          onClick={onCta}
          className="mt-4 self-start text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          {cta} →
        </button>
      )}
    </motion.div>
  );
}
