import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CheckCircle2, XCircle, UserX, UserCheck, Search } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  fetchAdminUsers,
  updateUserKYC,
  toggleUserActive,
} from "../../redux/slices/adminSlice";
import { formatCurrency, initials } from "../../utils/format";

export default function AdminUsers() {
  const dispatch = useDispatch();
  const { users } = useSelector((s) => s.admin);
  const [q, setQ] = useState("");

  useEffect(() => {
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  const filtered = users.filter(
    (u) =>
      !q ||
      u.email.toLowerCase().includes(q.toLowerCase()) ||
      u.full_name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <DashboardLayout title="User Management" subtitle="View, verify, and moderate user accounts.">
      <div className="bg-white rounded-card p-6 shadow-card border border-ink-100">
        <div className="relative max-w-md mb-5">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            data-testid="admin-user-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or email…"
            className="pl-10 pr-4 h-12 w-full rounded-2xl bg-ink-50 text-sm focus:bg-white focus:outline-none border border-transparent focus:border-brand-300"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-ink-500 text-xs uppercase tracking-wide">
                <th className="pb-3 font-semibold">User</th>
                <th className="pb-3 font-semibold">Role</th>
                <th className="pb-3 font-semibold">KYC</th>
                <th className="pb-3 font-semibold">Balance</th>
                <th className="pb-3 font-semibold">Tx</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  data-testid={`admin-user-row-${u.id}`}
                  className="hover:bg-ink-50/60"
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      {u.picture ? (
                        <img
                          src={u.picture}
                          alt={u.full_name}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 font-semibold flex items-center justify-center">
                          {initials(u.full_name)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-ink-900">{u.full_name}</p>
                        <p className="text-xs text-ink-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`chip ${u.role === "admin" ? "chip-info" : "chip-neutral"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4">
                    <span
                      className={`chip ${
                        u.kyc_status === "approved"
                          ? "chip-success"
                          : u.kyc_status === "rejected"
                          ? "chip-danger"
                          : "chip-warning"
                      }`}
                    >
                      {u.kyc_status}
                    </span>
                  </td>
                  <td className="py-4 text-sm font-semibold text-ink-900">
                    {formatCurrency(u.wallet_balance || 0)}
                  </td>
                  <td className="py-4 text-sm text-ink-600">{u.transaction_count}</td>
                  <td className="py-4">
                    <span className={`chip ${u.is_active ? "chip-success" : "chip-neutral"}`}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="inline-flex gap-1">
                      {u.kyc_status !== "approved" && (
                        <button
                          data-testid={`approve-kyc-${u.id}`}
                          onClick={async () => {
                            const r = await dispatch(
                              updateUserKYC({ user_id: u.id, status: "approved" })
                            );
                            if (updateUserKYC.fulfilled.match(r)) toast.success("KYC approved");
                          }}
                          className="p-2 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100"
                          title="Approve KYC"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      {u.kyc_status !== "rejected" && (
                        <button
                          onClick={async () => {
                            await dispatch(updateUserKYC({ user_id: u.id, status: "rejected" }));
                            toast.success("KYC rejected");
                          }}
                          className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100"
                          title="Reject KYC"
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                      <button
                        data-testid={`toggle-active-${u.id}`}
                        onClick={async () => {
                          const r = await dispatch(toggleUserActive(u.id));
                          if (toggleUserActive.fulfilled.match(r))
                            toast.success(`User ${r.payload.is_active ? "activated" : "deactivated"}`);
                          else toast.error(r.payload || "Action failed");
                        }}
                        className={`p-2 rounded-xl ${
                          u.is_active
                            ? "bg-ink-100 text-ink-700 hover:bg-ink-200"
                            : "bg-brand-50 text-brand-700 hover:bg-brand-100"
                        }`}
                        title={u.is_active ? "Deactivate" : "Activate"}
                      >
                        {u.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
