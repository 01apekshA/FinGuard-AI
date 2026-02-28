import {
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  ShoppingBag,
  Bus,
  Coffee,
  Tv,
  Receipt,
  HeartPulse,
  Wallet as WalletIcon,
} from "lucide-react";
import { formatCurrency, formatDateShort } from "../../utils/format";

const CATEGORY_ICONS = {
  food: Coffee,
  groceries: ShoppingBag,
  transport: Bus,
  shopping: ShoppingBag,
  entertainment: Tv,
  bills: Receipt,
  health: HeartPulse,
  salary: WalletIcon,
  income: ArrowDownLeft,
  transfer: ArrowUpRight,
  other: Receipt,
};

const STATUS_CLASS = {
  completed: "chip-success",
  pending: "chip-warning",
  failed: "chip-danger",
  flagged: "chip-danger",
};

export default function TransactionsTable({ items = [], compact = false }) {
  if (!items.length) {
    return (
      <div data-testid="transactions-empty" className="p-8 text-center text-ink-500 text-sm">
        No transactions yet.
      </div>
    );
  }
  return (
    <div data-testid="transactions-table" className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-ink-500 text-xs uppercase tracking-wide">
            <th className="pb-3 font-semibold">Transaction</th>
            {!compact && <th className="pb-3 font-semibold">Category</th>}
            <th className="pb-3 font-semibold">Date</th>
            {!compact && <th className="pb-3 font-semibold">Status</th>}
            <th className="pb-3 font-semibold text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {items.map((t) => {
            const Icon = CATEGORY_ICONS[t.category?.toLowerCase()] || Receipt;
            const isIncome = t.type === "deposit" || t.type === "transfer_in";
            const isFlagged = t.is_flagged === "yes" || t.status === "flagged";
            return (
              <tr
                key={t.id}
                data-testid={`tx-row-${t.id}`}
                className="hover:bg-ink-50/60 transition-colors"
              >
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        isFlagged
                          ? "bg-red-100 text-red-600"
                          : isIncome
                          ? "bg-brand-100 text-brand-700"
                          : "bg-ink-100 text-ink-700"
                      }`}
                    >
                      {isFlagged ? <ShieldAlert size={18} /> : <Icon size={18} />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-ink-900 text-sm truncate max-w-[200px]">
                        {t.counterparty || t.description}
                      </p>
                      <p className="text-xs text-ink-500 truncate max-w-[200px]">{t.description}</p>
                    </div>
                  </div>
                </td>
                {!compact && (
                  <td className="py-4 text-sm text-ink-600 capitalize">{t.category}</td>
                )}
                <td className="py-4 text-sm text-ink-600">{formatDateShort(t.created_at)}</td>
                {!compact && (
                  <td className="py-4">
                    <span className={`chip ${STATUS_CLASS[t.status] || "chip-neutral"}`}>
                      {t.status}
                    </span>
                  </td>
                )}
                <td className="py-4 text-right">
                  <p
                    className={`font-semibold text-sm ${
                      isIncome ? "text-brand-700" : "text-ink-900"
                    }`}
                  >
                    {isIncome ? "+" : "-"} {formatCurrency(t.amount)}
                  </p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
