import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CheckCircle2, XCircle, ListChecks } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import { fetchAdminUsers, updateUserKYC } from "../../redux/slices/adminSlice";
import { formatDate, initials } from "../../utils/format";

export default function AdminKYC() {
  const dispatch = useDispatch();
  const { users } = useSelector((s) => s.admin);
  useEffect(() => {
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  const pending = users.filter((u) => u.kyc_status === "pending");
  const reviewed = users.filter((u) => u.kyc_status !== "pending");

  const decide = async (id, status) => {
    const r = await dispatch(updateUserKYC({ user_id: id, status }));
    if (updateUserKYC.fulfilled.match(r)) toast.success(`KYC ${status}`);
  };

  return (
    <DashboardLayout title="KYC Approvals" subtitle="Verify customer identities and unlock full access.">
      <div className="bg-white rounded-card p-6 shadow-card border border-ink-100 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <ListChecks size={18} className="text-amber-600" />
          <p className="font-semibold text-ink-900">Pending review ({pending.length})</p>
        </div>
        {pending.length === 0 && (
          <p className="text-sm text-ink-500">All KYC requests have been reviewed.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pending.map((u) => (
            <div
              key={u.id}
              data-testid={`kyc-pending-${u.id}`}
              className="bg-amber-50 rounded-3xl p-5 border border-amber-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-amber-200 text-amber-800 font-bold flex items-center justify-center">
                  {initials(u.full_name)}
                </div>
                <div>
                  <p className="font-semibold text-ink-900 text-sm">{u.full_name}</p>
                  <p className="text-xs text-ink-500">{u.email}</p>
                </div>
              </div>
              <p className="text-xs text-ink-500 mb-3">
                Joined {formatDate(u.created_at)}
              </p>
              <div className="flex gap-2">
                <button
                  data-testid={`kyc-approve-${u.id}`}
                  onClick={() => decide(u.id, "approved")}
                  className="flex-1 h-10 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold flex items-center justify-center gap-1"
                >
                  <CheckCircle2 size={14} /> Approve
                </button>
                <button
                  onClick={() => decide(u.id, "rejected")}
                  className="flex-1 h-10 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-sm font-semibold flex items-center justify-center gap-1"
                >
                  <XCircle size={14} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-card p-6 shadow-card border border-ink-100">
        <p className="font-semibold text-ink-900 mb-4">Reviewed ({reviewed.length})</p>
        <div className="space-y-2">
          {reviewed.slice(0, 12).map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 bg-ink-50 rounded-2xl px-4 py-3"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 font-semibold flex items-center justify-center">
                {initials(u.full_name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink-900 truncate">{u.full_name}</p>
                <p className="text-xs text-ink-500 truncate">{u.email}</p>
              </div>
              <span
                className={`chip ${
                  u.kyc_status === "approved" ? "chip-success" : "chip-danger"
                }`}
              >
                {u.kyc_status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
