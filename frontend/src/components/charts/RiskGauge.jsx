import { motion } from "framer-motion";

export default function RiskGauge({ score = 0, level = "low" }) {
  // 0-100 score; arc from -90 to 90 deg
  const angle = -90 + (score / 100) * 180;
  const colorMap = {
    low: "#10B981",
    medium: "#F59E0B",
    high: "#EF4444",
  };
  const color = colorMap[level] || "#10B981";
  return (
    <div data-testid="risk-gauge" className="flex flex-col items-center">
      <svg width="180" height="110" viewBox="0 0 180 110">
        <defs>
          <linearGradient id="riskGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>
        <path
          d="M 15 95 A 75 75 0 0 1 165 95"
          stroke="#E2E8F0"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 15 95 A 75 75 0 0 1 165 95"
          stroke="url(#riskGrad)"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="235"
          strokeDashoffset={235 - (235 * score) / 100}
        />
        <motion.line
          x1="90"
          y1="95"
          x2="90"
          y2="30"
          stroke="#0F172A"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ originX: "90px", originY: "95px" }}
          initial={{ rotate: -90 }}
          animate={{ rotate: angle }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
        <circle cx="90" cy="95" r="6" fill="#0F172A" />
      </svg>
      <p className="text-3xl font-bold text-ink-900 mt-2">{Math.round(score)}</p>
      <span
        className="mt-1 chip"
        style={{ backgroundColor: `${color}22`, color }}
      >
        {level.toUpperCase()} risk
      </span>
    </div>
  );
}
