import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TrendingUp, Wallet as WalletIcon, PiggyBank, ArrowUpRight, ShieldCheck, Sparkles, Repeat } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import BalanceCard from "../../components/cards/BalanceCard";
import StatCard from "../../components/cards/StatCard";
import CashflowBarChart from "../../components/charts/CashflowBarChart";
import ExpenseDonutChart from "../../components/charts/ExpenseDonutChart";
import TransactionsTable from "../../components/tables/TransactionsTable";
import AIAssistantWidget from "../../components/cards/AIAssistantWidget";
import RiskGauge from "../../components/charts/RiskGauge";
import Loader from "../../components/common/Loader";
import { fetchWallet, depositMoney } from "../../redux/slices/walletSlice";
import { fetchRecentTransactions } from "../../redux/slices/transactionSlice";
import {
  fetchCashflow,
  fetchExpenseBreakdown,
  fetchSummary,
} from "../../redux/slices/analyticsSlice";
import {
  fetchFinancialHealth,
  fetchRiskScore,
  fetchBudgetAdvice,
} from "../../redux/slices/aiSlice";
import { formatCurrency } from "../../utils/format";
import { useNavigate } from "react-router-dom";

const RATES = [
  { code: "EUR", flag: "🇪🇺", rate: 0.92 },
  { code: "GBP", flag: "🇬🇧", rate: 0.79 },
  { code: "JPY", flag: "🇯🇵", rate: 153.4 },
  { code: "INR", flag: "🇮🇳", rate: 83.2 },
];

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { wallet } = useSelector((s) => s.wallet);
  const { recent } = useSelector((s) => s.transactions);
  const { cashflow, expense, summary } = useSelector((s) => s.analytics);
  const { health, risk, budget } = useSelector((s) => s.ai);
  const user = useSelector((s) => s.auth.user);
  const [loading, setLoading] = useState(true);
  const [depositOpen, setDepositOpen] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([
        dispatch(fetchWallet()),
        dispatch(fetchRecentTransactions(6)),
        dispatch(fetchCashflow()),
        dispatch(fetchExpenseBreakdown()),
        dispatch(fetchSummary()),
        dispatch(fetchFinancialHealth()),
        dispatch(fetchRiskScore()),
        dispatch(fetchBudgetAdvice()),
      ]);
      setLoading(false);
    })();
  }, [dispatch]);

  if (loading && !wallet) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Loading your finances…">
        <Loader label="Crunching numbers…" />
      </DashboardLayout>
    );
  }

  const firstName = user?.full_name?.split(" ")[0] || "there";

  return (
    <DashboardLayout
      title={`Welcome back, ${firstName}`}
      subtitle="Here's what's happening with your money today."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero balance + stats row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BalanceCard
              balance={wallet?.balance || 0}
              currency={wallet?.currency || "USD"}
              onDeposit={() => setDepositOpen(true)}
              onSend={() => navigate("/wallet")}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
              <StatCard
                testid="stat-income"
                title="Income (30d)"
                value={summary.income}
                icon={TrendingUp}
                iconBg="#DCFCE7"
                iconColor="#15803D"
                delta={8.4}
              />
              <StatCard
                testid="stat-expense"
                title="Expense (30d)"
                value={summary.expense}
                icon={WalletIcon}
                iconBg="#ECFCCB"
                iconColor="#65A30D"
                delta={-3.2}
              />
            </div>
          </div>

          {/* 3rd stat row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              testid="stat-savings"
              title="Total Savings"
              value={wallet?.savings || 0}
              icon={PiggyBank}
              iconBg="#D1FAE5"
              iconColor="#047857"
              delta={5.6}
            />
            <StatCard
              testid="stat-credit"
              title="Credit Score"
              value={Math.round(wallet?.credit_score || 720)}
              icon={ShieldCheck}
              iconBg="#DBEAFE"
              iconColor="#1D4ED8"
              isCurrency={false}
            />
            <StatCard
              testid="stat-health"
              title="Health Score"
              value={`${health?.score || 0}/100`}
              icon={Sparkles}
              iconBg="#FCE7F3"
              iconColor="#BE185D"
            />
          </div>

          {/* Cashflow chart */}
          <div className="bg-white rounded-card p-6 shadow-card border border-ink-100">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-ink-900 font-semibold">Cashflow Analytics</p>
                <p className="text-xs text-ink-500 mt-0.5">Last 6 months income vs expense</p>
              </div>
              <button className="text-xs font-semibold text-brand-700 hover:text-brand-800">
                View report →
              </button>
            </div>
            <CashflowBarChart data={cashflow} />
          </div>

          {/* Recent transactions */}
          <div className="bg-white rounded-card p-6 shadow-card border border-ink-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-ink-900 font-semibold">Recent Transactions</p>
                <p className="text-xs text-ink-500 mt-0.5">Latest activity across your wallet</p>
              </div>
              <button
                onClick={() => navigate("/transactions")}
                className="text-xs font-semibold text-brand-700 hover:text-brand-800"
                data-testid="view-all-transactions"
              >
                View all →
              </button>
            </div>
            <TransactionsTable items={recent} compact />
          </div>
        </div>

        {/* Right column - 1/3 */}
        <div className="space-y-6">
          <AIAssistantWidget embedded />

          {/* Expense breakdown */}
          <div className="bg-white rounded-card p-6 shadow-card border border-ink-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-ink-900 font-semibold">Expense Statistics</p>
                <p className="text-xs text-ink-500 mt-0.5">Last 30 days</p>
              </div>
            </div>
            <ExpenseDonutChart breakdown={expense.breakdown} total={expense.total} />
            <div className="mt-4 space-y-2">
              {expense.breakdown.slice(0, 5).map((b) => (
                <div key={b.category} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-ink-600">{b.category}</span>
                  <span className="font-semibold text-ink-900">{formatCurrency(b.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk + budget tip */}
          <div className="bg-white rounded-card p-6 shadow-card border border-ink-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-ink-900 font-semibold">Risk Score</p>
                <p className="text-xs text-ink-500 mt-0.5">Based on 30-day activity</p>
              </div>
            </div>
            <div className="flex items-center justify-center py-2">
              <RiskGauge score={risk?.score || 0} level={risk?.level || "low"} />
            </div>
            {budget?.tips?.[0] && (
              <div className="mt-3 p-3 rounded-2xl bg-brand-50 text-sm text-brand-800">
                <Sparkles size={14} className="inline mr-1 -mt-0.5" />
                <span className="font-medium">{budget.tips[0]}</span>
              </div>
            )}
          </div>

          {/* Currency exchange */}
          <div className="bg-white rounded-card p-6 shadow-card border border-ink-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-ink-900 font-semibold">Currency Exchange</p>
                <p className="text-xs text-ink-500 mt-0.5">USD base • live indicative</p>
              </div>
              <Repeat size={18} className="text-ink-400" />
            </div>
            <div className="space-y-2">
              {RATES.map((r) => (
                <div
                  key={r.code}
                  className="flex items-center justify-between bg-ink-50 rounded-2xl px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{r.flag}</span>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">USD → {r.code}</p>
                      <p className="text-xs text-ink-500">1 USD</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-brand-700 font-semibold text-sm">
                    {r.rate.toFixed(2)}
                    <ArrowUpRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {depositOpen && (
        <DepositModal
          onClose={() => setDepositOpen(false)}
          onSubmit={async (amount) => {
            const r = await dispatch(depositMoney({ amount, note: "Manual deposit" }));
            if (depositMoney.fulfilled.match(r)) {
              toast.success(`Deposited ${formatCurrency(amount)}`);
              setDepositOpen(false);
              dispatch(fetchWallet());
              dispatch(fetchRecentTransactions(6));
              dispatch(fetchSummary());
            } else {
              toast.error(r.payload || "Deposit failed");
            }
          }}
        />
      )}
    </DashboardLayout>
  );
}

function DepositModal({ onClose, onSubmit }) {
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        data-testid="deposit-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-card p-6 w-full max-w-md shadow-card"
      >
        <h3 className="text-xl font-bold text-ink-900">Deposit funds</h3>
        <p className="text-sm text-ink-500 mt-1">Add money instantly to your wallet.</p>
        <input
          data-testid="deposit-amount-input"
          autoFocus
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="mt-5 w-full h-14 px-4 rounded-2xl bg-ink-50 text-2xl font-bold text-ink-900 focus:outline-none focus:bg-white focus:border-brand-300 border border-transparent"
        />
        <div className="mt-2 flex gap-2">
          {[100, 500, 1000].map((v) => (
            <button
              key={v}
              onClick={() => setAmount(String(v))}
              className="flex-1 h-10 rounded-xl bg-brand-50 text-brand-700 font-semibold text-xs hover:bg-brand-100"
            >
              + ${v}
            </button>
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-2xl bg-ink-100 text-ink-700 font-semibold text-sm"
          >
            Cancel
          </button>
          <button
            data-testid="deposit-confirm-btn"
            onClick={async () => {
              const v = parseFloat(amount);
              if (!v || v <= 0) return toast.error("Enter a valid amount");
              setSubmitting(true);
              await onSubmit(v);
              setSubmitting(false);
            }}
            disabled={submitting}
            className="flex-1 h-12 rounded-2xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 disabled:bg-ink-300"
          >
            {submitting ? "Depositing…" : "Confirm deposit"}
          </button>
        </div>
      </div>
    </div>
  );
}
