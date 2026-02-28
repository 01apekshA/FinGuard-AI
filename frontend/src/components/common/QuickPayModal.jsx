import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  Send,
  Coffee,
  ShoppingBag,
  Bus,
  Tv,
  Receipt,
  HeartPulse,
  ShoppingCart,
  ArrowLeftRight,
  Briefcase,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchBeneficiaries,
  transferMoney,
  fetchWallet,
} from "../../redux/slices/walletSlice";
import { fetchRecentTransactions } from "../../redux/slices/transactionSlice";
import { fetchSummary } from "../../redux/slices/analyticsSlice";
import { formatCurrency, initials, cn } from "../../utils/format";

export const CATEGORY_OPTIONS = [
  { value: "food", label: "Food", icon: Coffee, color: "#F59E0B" },
  { value: "groceries", label: "Groceries", icon: ShoppingCart, color: "#10B981" },
  { value: "transport", label: "Transport", icon: Bus, color: "#3B82F6" },
  { value: "shopping", label: "Shopping", icon: ShoppingBag, color: "#8B5CF6" },
  { value: "entertainment", label: "Fun", icon: Tv, color: "#EC4899" },
  { value: "bills", label: "Bills", icon: Receipt, color: "#EF4444" },
  { value: "health", label: "Health", icon: HeartPulse, color: "#06B6D4" },
  { value: "transfer", label: "Transfer", icon: ArrowLeftRight, color: "#64748B" },
  { value: "business", label: "Business", icon: Briefcase, color: "#0EA5E9" },
  { value: "other", label: "Other", icon: Sparkles, color: "#94A3B8" },
];

export default function QuickPayModal({ open, onClose, preset = null }) {
  const dispatch = useDispatch();
  const { beneficiaries, wallet } = useSelector((s) => s.wallet);
  const [step, setStep] = useState(1); // 1=recipient+amount, 2=category+note
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [benefId, setBenefId] = useState(preset?.id || "");
  const [name, setName] = useState(preset?.name || "");
  const [account, setAccount] = useState(preset?.account_number || "");
  const [category, setCategory] = useState("transfer");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      dispatch(fetchBeneficiaries());
      setStep(1);
      setAmount("");
      setNote("");
      setBenefId(preset?.id || "");
      setName(preset?.name || "");
      setAccount(preset?.account_number || "");
      setCategory("transfer");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const balance = wallet?.balance || 0;
  const amt = parseFloat(amount) || 0;
  const insufficient = amt > balance;

  const handleNext = () => {
    if (!amt || amt <= 0) return toast.error("Enter a valid amount");
    if (insufficient) return toast.error("Insufficient balance");
    if (!benefId && (!name || !account))
      return toast.error("Choose a beneficiary or enter recipient details");
    setStep(2);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const r = await dispatch(
      transferMoney({
        beneficiary_id: benefId || undefined,
        counterparty_name: benefId ? undefined : name,
        counterparty_account: benefId ? undefined : account,
        amount: amt,
        category,
        note,
      })
    );
    setSubmitting(false);
    if (transferMoney.fulfilled.match(r)) {
      const catLabel = CATEGORY_OPTIONS.find((c) => c.value === category)?.label || category;
      toast.success(`Sent ${formatCurrency(amt)} • ${catLabel}`);
      dispatch(fetchWallet());
      dispatch(fetchRecentTransactions(10));
      dispatch(fetchSummary());
      onClose();
    } else {
      toast.error(r.payload || "Transfer failed");
    }
  };

  return (
    <div
      data-testid="quickpay-modal"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-900/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-card w-full max-w-lg shadow-card overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-ink-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              {step === 1 ? "Step 1 of 2" : "Step 2 of 2"}
            </p>
            <h3 className="text-xl font-bold text-ink-900">
              {step === 1 ? "Send money" : "What's this for?"}
            </h3>
          </div>
          <button
            data-testid="quickpay-close"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-ink-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <>
              {/* Amount */}
              <div className="mb-4">
                <label className="text-xs text-ink-600 font-semibold mb-1.5 block">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 text-2xl font-bold">
                    $
                  </span>
                  <input
                    data-testid="quickpay-amount"
                    type="number"
                    inputMode="decimal"
                    autoFocus
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className={cn(
                      "w-full h-16 pl-10 pr-4 rounded-2xl bg-ink-50 text-3xl font-bold focus:outline-none focus:bg-white border-2 transition-colors",
                      insufficient
                        ? "border-red-300 text-red-600"
                        : "border-transparent focus:border-brand-300 text-ink-900"
                    )}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-ink-500">
                    Available: {formatCurrency(balance)}
                  </p>
                  {insufficient && (
                    <p className="text-xs text-red-600 font-semibold">
                      Insufficient balance
                    </p>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  {[25, 50, 100, 500].map((q) => (
                    <button
                      key={q}
                      onClick={() => setAmount(String(q))}
                      data-testid={`quickpay-quick-${q}`}
                      className="flex-1 h-9 rounded-xl bg-brand-50 text-brand-700 font-semibold text-xs hover:bg-brand-100"
                    >
                      ${q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Beneficiary picker */}
              <div className="mb-4">
                <label className="text-xs text-ink-600 font-semibold mb-1.5 block">
                  Send to
                </label>
                {beneficiaries.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-2">
                    {beneficiaries.map((b) => (
                      <button
                        key={b.id}
                        data-testid={`quickpay-benef-${b.id}`}
                        onClick={() => {
                          if (benefId === b.id) {
                            setBenefId("");
                          } else {
                            setBenefId(b.id);
                            setName(b.name);
                            setAccount(b.account_number);
                          }
                        }}
                        className={cn(
                          "shrink-0 flex flex-col items-center gap-1.5 w-20 p-2 rounded-2xl transition-all",
                          benefId === b.id
                            ? "bg-brand-50 ring-2 ring-brand-400"
                            : "hover:bg-ink-50"
                        )}
                      >
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-semibold text-sm"
                          style={{ backgroundColor: b.avatar_color }}
                        >
                          {initials(b.name)}
                        </div>
                        <span className="text-[11px] font-semibold text-ink-700 truncate w-full text-center">
                          {b.name.split(" ")[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {!benefId && (
                  <div className="space-y-2">
                    <input
                      data-testid="quickpay-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Recipient name"
                      className="w-full h-12 px-4 rounded-2xl bg-ink-50 text-sm focus:outline-none focus:bg-white border border-transparent focus:border-brand-300"
                    />
                    <input
                      data-testid="quickpay-account"
                      value={account}
                      onChange={(e) => setAccount(e.target.value)}
                      placeholder="Account number"
                      className="w-full h-12 px-4 rounded-2xl bg-ink-50 text-sm focus:outline-none focus:bg-white border border-transparent focus:border-brand-300"
                    />
                  </div>
                )}
              </div>

              <button
                data-testid="quickpay-next"
                onClick={handleNext}
                className="w-full h-12 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-pill transition-colors"
              >
                Continue →
              </button>
            </>
          ) : (
            <>
              {/* Summary */}
              <div className="bg-brand-50 rounded-2xl p-4 mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-brand-700 font-semibold uppercase">
                    Sending
                  </p>
                  <p className="text-2xl font-bold text-brand-900 mt-0.5">
                    {formatCurrency(amt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-brand-700 font-semibold uppercase">
                    To
                  </p>
                  <p className="text-sm font-bold text-brand-900 mt-0.5 max-w-[140px] truncate">
                    {name}
                  </p>
                </div>
              </div>

              {/* Category selector */}
              <div className="mb-4">
                <label className="text-xs text-ink-600 font-semibold mb-2 block">
                  What's this for?
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {CATEGORY_OPTIONS.map(({ value, label, icon: Icon, color }) => (
                    <button
                      key={value}
                      data-testid={`quickpay-cat-${value}`}
                      onClick={() => setCategory(value)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all",
                        category === value
                          ? "bg-ink-900 text-white scale-105"
                          : "bg-ink-50 hover:bg-ink-100 text-ink-700"
                      )}
                    >
                      <Icon
                        size={20}
                        style={{
                          color: category === value ? color : color,
                        }}
                      />
                      <span className="text-[10px] font-semibold">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="mb-4">
                <label className="text-xs text-ink-600 font-semibold mb-1.5 block">
                  Add a note (optional)
                </label>
                <input
                  data-testid="quickpay-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Dinner at sushi bar"
                  maxLength={80}
                  className="w-full h-12 px-4 rounded-2xl bg-ink-50 text-sm focus:outline-none focus:bg-white border border-transparent focus:border-brand-300"
                />
              </div>

              <div className="flex gap-2">
                <button
                  data-testid="quickpay-back"
                  onClick={() => setStep(1)}
                  className="px-5 h-12 rounded-2xl bg-ink-100 hover:bg-ink-200 text-ink-800 font-semibold text-sm"
                >
                  ← Back
                </button>
                <button
                  data-testid="quickpay-submit"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 h-12 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:bg-ink-300 text-white font-semibold text-sm shadow-pill flex items-center justify-center gap-2 transition-colors"
                >
                  {submitting ? (
                    "Sending…"
                  ) : (
                    <>
                      <Send size={16} /> Send {formatCurrency(amt)}
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
