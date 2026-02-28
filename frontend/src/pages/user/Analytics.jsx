import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Sparkles,
  TrendingUp,
  ShieldAlert,
  PiggyBank,
  AlertTriangle,
  Activity,
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import AIInsightCard from "../../components/cards/AIInsightCard";
import SpendingLineChart from "../../components/charts/SpendingLineChart";
import ExpenseDonutChart from "../../components/charts/ExpenseDonutChart";
import RiskGauge from "../../components/charts/RiskGauge";
import AIAssistantWidget from "../../components/cards/AIAssistantWidget";
import {
  fetchFinancialHealth,
  fetchSpendingPrediction,
  fetchBudgetAdvice,
  fetchRiskScore,
  fetchFraudAlerts,
} from "../../redux/slices/aiSlice";
import {
  fetchExpenseBreakdown,
  fetchSpendingTrend,
} from "../../redux/slices/analyticsSlice";
import { formatCurrency, formatDate } from "../../utils/format";

export default function Analytics() {
  const dispatch = useDispatch();
  const { health, prediction, budget, risk, fraudAlerts } = useSelector((s) => s.ai);
  const { expense, trend } = useSelector((s) => s.analytics);

  useEffect(() => {
    dispatch(fetchFinancialHealth());
    dispatch(fetchSpendingPrediction());
    dispatch(fetchBudgetAdvice());
    dispatch(fetchRiskScore());
    dispatch(fetchFraudAlerts());
    dispatch(fetchExpenseBreakdown());
    dispatch(fetchSpendingTrend());
  }, [dispatch]);

  return (
    <DashboardLayout
      title="AI Analytics"
      subtitle="Five specialised AI agents working on your finances 24/7."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <AIInsightCard
          testid="insight-health"
          icon={Sparkles}
          title="Financial Health"
          badge={health?.rating || "—"}
          badgeClass="chip-success"
          description={
            health
              ? `Score ${health.score}/100. Savings ratio ${(
                  (health.savings_ratio || 0) * 100
                ).toFixed(0)}%, monthly income ${formatCurrency(health.income_30d)}.`
              : "Calculating…"
          }
        />
        <AIInsightCard
          testid="insight-prediction"
          icon={TrendingUp}
          title="Predicted Spend (Next Month)"
          badge={prediction?.trend || "stable"}
          badgeClass="chip-info"
          description={
            prediction
              ? `Forecast: ${formatCurrency(prediction.predicted_total)}. Trend is ${
                  prediction.trend
                }.`
              : "Crunching trends…"
          }
        />
        <AIInsightCard
          testid="insight-budget"
          icon={PiggyBank}
          title="Smart Budget Tip"
          badge="AI"
          badgeClass="chip-success"
          description={budget?.ai_summary || budget?.summary || "Generating personalised advice…"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending trend */}
        <div className="lg:col-span-2 bg-white rounded-card p-6 shadow-card border border-ink-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-ink-900 font-semibold">Spending Trend (14d)</p>
              <p className="text-xs text-ink-500 mt-0.5">Daily expense pattern</p>
            </div>
            <span className="chip chip-info">
              <Activity size={12} /> Live
            </span>
          </div>
          <SpendingLineChart points={trend} />
        </div>

        {/* Risk gauge */}
        <div className="bg-white rounded-card p-6 shadow-card border border-ink-100 flex flex-col">
          <div>
            <p className="text-ink-900 font-semibold">Risk Scoring Agent</p>
            <p className="text-xs text-ink-500 mt-0.5">Aggregated activity risk</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <RiskGauge score={risk?.score || 0} level={risk?.level || "low"} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center mt-3">
            <Stat label="High" value={risk?.alerts_high || 0} color="text-red-600" />
            <Stat label="Med" value={risk?.alerts_medium || 0} color="text-amber-600" />
            <Stat label="Low" value={risk?.alerts_low || 0} color="text-brand-700" />
          </div>
        </div>

        {/* Expense categorization */}
        <div className="bg-white rounded-card p-6 shadow-card border border-ink-100">
          <p className="text-ink-900 font-semibold">Expense Categorization</p>
          <p className="text-xs text-ink-500 mt-0.5 mb-3">Last 30 days</p>
          <ExpenseDonutChart breakdown={expense.breakdown} total={expense.total} />
        </div>

        {/* Budget tips */}
        <div className="bg-white rounded-card p-6 shadow-card border border-ink-100">
          <p className="text-ink-900 font-semibold mb-3">Budget Advisor</p>
          <ul className="space-y-2">
            {budget?.tips?.slice(0, 5).map((t, i) => (
              <li
                key={i}
                className="text-sm text-ink-700 flex items-start gap-2 bg-ink-50 rounded-2xl p-3"
              >
                <Sparkles size={14} className="text-brand-700 mt-0.5 shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Fraud alerts */}
        <div className="bg-white rounded-card p-6 shadow-card border border-ink-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-ink-900 font-semibold">Fraud Alerts</p>
            <span className="chip chip-danger">
              <ShieldAlert size={12} />
              {fraudAlerts.length} open
            </span>
          </div>
          {fraudAlerts.length === 0 && (
            <p className="text-sm text-ink-500">No fraud alerts. You're safe.</p>
          )}
          <div className="space-y-2">
            {fraudAlerts.slice(0, 5).map((a) => (
              <div
                key={a.id}
                data-testid={`fraud-${a.id}`}
                className="flex items-start gap-3 bg-red-50 rounded-2xl p-3"
              >
                <AlertTriangle size={18} className="text-red-600 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-red-900 truncate">{a.reason}</p>
                  <p className="text-xs text-red-700/80 mt-0.5">
                    {formatDate(a.created_at)} · Risk {Math.round(a.risk_score)} ·{" "}
                    <span className="uppercase font-semibold">{a.severity}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <AIAssistantWidget embedded />
      </div>
    </DashboardLayout>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="bg-ink-50 rounded-xl py-2">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-ink-500 font-semibold">{label}</p>
    </div>
  );
}
