export const formatCurrency = (value, currency = "USD") => {
  if (value === null || value === undefined || isNaN(value)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatCompactCurrency = (value, currency = "USD") => {
  if (value === null || value === undefined || isNaN(value)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
};

export const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const formatDateShort = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const initials = (name = "") =>
  name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const cn = (...classes) => classes.filter(Boolean).join(" ");

export const categoryColor = (cat) => {
  const map = {
    food: "#F59E0B",
    groceries: "#10B981",
    transport: "#3B82F6",
    shopping: "#8B5CF6",
    entertainment: "#EC4899",
    bills: "#EF4444",
    health: "#06B6D4",
    salary: "#16A34A",
    freelance: "#0EA5E9",
    investment: "#A78BFA",
    income: "#22C55E",
    transfer: "#64748B",
    other: "#94A3B8",
  };
  return map[cat?.toLowerCase()] || "#94A3B8";
};
