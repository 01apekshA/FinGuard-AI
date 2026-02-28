import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  fetchAllFraudAlerts,
  resolveFraudAlert,
} from "../../redux/slices/adminSlice";
import { formatDate } from "../../utils/format";

export default function AdminFraud() {
  const dispatch = useDispatch();
  const { fraud } = useSelector((s) => s.admin);

  useEffect(() => {
    dispatch(fetchAllFraudAlerts());
  }, [dispatch]);

  const severityClass = {
    high: "bg-red-50 border-red-200",
    medium: "bg-amber-50 border-amber-200",
    low: "bg-emerald-50 border-emerald-200",
  };

  return (
    <DashboardLayout
      title="Fraud Monitoring"
      subtitle="Auto-flagged transactions detected by FinGuard's fraud agent."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fraud.length === 0 && (
          <div className="col-span-full bg-white rounded-card p-10 text-center shadow-card border border-ink-100">
            <ShieldCheck className="mx-auto text-brand-600 mb-3" size={36} />
            <p className="font-semibold text-ink-900">No fraud signals</p>
            <p className="text-sm text-ink-500">All clear across the platform.</p>
          </div>
        )}
        {fraud.map((a) => (
          <div
            key={a.id}
            data-testid={`fraud-card-${a.id}`}
            className={`rounded-card p-5 shadow-card border ${severityClass[a.severity] || "bg-white border-ink-100"}`}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center">
                <AlertTriangle
                  size={20}
                  className={
                    a.severity === "high"
                      ? "text-red-600"
                      : a.severity === "medium"
                      ? "text-amber-600"
                      : "text-brand-600"
                  }
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink-900">{a.reason}</p>
                <p className="text-xs text-ink-500 mt-0.5">{formatDate(a.created_at)}</p>
              </div>
              <span
                className={`chip ${
                  a.severity === "high"
                    ? "chip-danger"
                    : a.severity === "medium"
                    ? "chip-warning"
                    : "chip-success"
                }`}
              >
                {a.severity}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-ink-500">
                Risk score{" "}
                <span className="text-ink-900 font-bold">{Math.round(a.risk_score)}</span>
              </p>
              <span
                className={`chip ${
                  a.status === "open" ? "chip-warning" : "chip-success"
                }`}
              >
                {a.status}
              </span>
            </div>
            {a.status === "open" && (
              <button
                data-testid={`resolve-${a.id}`}
                onClick={async () => {
                  const r = await dispatch(resolveFraudAlert(a.id));
                  if (resolveFraudAlert.fulfilled.match(r)) toast.success("Alert resolved");
                }}
                className="mt-3 w-full h-10 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold"
              >
                Mark resolved
              </button>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
