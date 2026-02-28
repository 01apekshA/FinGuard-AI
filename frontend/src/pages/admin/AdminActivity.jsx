import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ScrollText } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { fetchActivityLogs } from "../../redux/slices/adminSlice";
import { formatDate } from "../../utils/format";

const ACTION_CLASS = {
  login: "chip-info",
  register: "chip-success",
  logout: "chip-neutral",
  deposit: "chip-success",
  transfer: "chip-info",
  kyc_approved: "chip-success",
  kyc_rejected: "chip-danger",
  fraud_resolved: "chip-success",
};

export default function AdminActivity() {
  const dispatch = useDispatch();
  const { activity } = useSelector((s) => s.admin);
  useEffect(() => {
    dispatch(fetchActivityLogs());
  }, [dispatch]);

  return (
    <DashboardLayout title="Activity Logs" subtitle="Audit trail across the FinGuard platform.">
      <div className="bg-white rounded-card p-6 shadow-card border border-ink-100">
        <div className="flex items-center gap-2 mb-4">
          <ScrollText size={18} className="text-brand-700" />
          <p className="font-semibold text-ink-900">Audit log</p>
          <span className="chip chip-info ml-auto">{activity.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-ink-500 text-xs uppercase tracking-wide">
                <th className="pb-3 font-semibold">Time</th>
                <th className="pb-3 font-semibold">Actor</th>
                <th className="pb-3 font-semibold">Action</th>
                <th className="pb-3 font-semibold">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {activity.map((a) => (
                <tr key={a.id}>
                  <td className="py-3 text-sm text-ink-600 whitespace-nowrap">
                    {formatDate(a.created_at)}
                  </td>
                  <td className="py-3 text-sm text-ink-900 font-medium">
                    {a.actor_email || "—"}
                  </td>
                  <td className="py-3">
                    <span className={`chip ${ACTION_CLASS[a.action] || "chip-neutral"}`}>
                      {a.action.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-ink-600">{a.detail || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
