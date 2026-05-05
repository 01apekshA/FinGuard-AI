import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  Activity,
  ShieldAlert,
  CheckCircle2,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/cards/StatCard";
import TransactionsTable from "../../components/tables/TransactionsTable";
import {
  fetchPlatformStats,
  fetchAllFraudAlerts,
  fetchAllTransactions,
} from "../../redux/slices/adminSlice";
import { formatCurrency, formatDate } from "../../utils/format";
// Admin monitoring and analytics overview
export default function AdminOverview() {
  const dispatch = useDispatch();
  const { stats, fraud, transactions } = useSelector((s) => s.admin);

  useEffect(() => {
    dispatch(fetchPlatformStats());
    dispatch(fetchAllFraudAlerts());
    dispatch(fetchAllTransactions());
  }, [dispatch]);

  return (
    <DashboardLayout
      title="Admin Overview"
      subtitle="Realtime platform health, fraud signals, and operations."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          testid="admin-stat-users"
          title="Total Users"
          value={stats?.total_users ?? "—"}
          icon={Users}
          iconBg="#DBEAFE"
          iconColor="#1D4ED8"
          isCurrency={false}
        />
        <StatCard
          testid="admin-stat-active"
          title="Active Users"
          value={stats?.active_users ?? "—"}
          icon={Activity}
          iconBg="#D1FAE5"
          iconColor="#047857"
          isCurrency={false}
        />
        <StatCard
          testid="admin-stat-flagged"
          title="Open Alerts"
          value={stats?.open_fraud_alerts ?? "—"}
          icon={ShieldAlert}
          iconBg="#FEE2E2"
          iconColor="#B91C1C"
          isCurrency={false}
        />
        <StatCard
          testid="admin-stat-kyc"
          title="Pending KYC"
          value={stats?.pending_kyc ?? "—"}
          icon={CheckCircle2}
          iconBg="#FEF3C7"
          iconColor="#B45309"
          isCurrency={false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-card p-6 shadow-card border border-ink-100">
          <p className="text-ink-500 text-xs uppercase tracking-wide font-semibold">
            Total Volume
          </p>
          <p className="text-3xl font-bold text-ink-900 mt-1">
            {formatCurrency(stats?.total_volume || 0)}
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-ink-500">
            <DollarSign size={14} /> All-time processed across all wallets
          </div>
        </div>
        <div className="bg-white rounded-card p-6 shadow-card border border-ink-100">
          <p className="text-ink-500 text-xs uppercase tracking-wide font-semibold">
            Total Transactions
          </p>
          <p className="text-3xl font-bold text-ink-900 mt-1">
            {stats?.total_transactions ?? 0}
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-ink-500">
            <TrendingUp size={14} /> Combined activity across users
          </div>
        </div>
        <div className="bg-white rounded-card p-6 shadow-card border border-ink-100">
          <p className="text-ink-500 text-xs uppercase tracking-wide font-semibold">
            Flagged Transactions
          </p>
          <p className="text-3xl font-bold text-red-600 mt-1">
            {stats?.flagged_transactions ?? 0}
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-ink-500">
            <ShieldAlert size={14} /> Auto-flagged by fraud agent
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-card p-6 shadow-card border border-ink-100">
          <p className="text-ink-900 font-semibold mb-3">Recent Platform Transactions</p>
          <TransactionsTable items={transactions.slice(0, 10)} />
        </div>
        <div className="bg-white rounded-card p-6 shadow-card border border-ink-100">
          <p className="text-ink-900 font-semibold mb-3">Top Fraud Signals</p>
          {fraud.length === 0 && <p className="text-sm text-ink-500">No alerts.</p>}
          <div className="space-y-2">
            {fraud.slice(0, 6).map((a) => (
              <div key={a.id} className="bg-red-50 rounded-2xl p-3">
                <p className="text-sm font-semibold text-red-900 line-clamp-1">{a.reason}</p>
                <p className="text-xs text-red-700/70 mt-0.5">
                  {formatDate(a.created_at)} · Risk {Math.round(a.risk_score)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
