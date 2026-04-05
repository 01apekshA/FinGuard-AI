import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Send, QrCode, UserPlus, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { QRCodeCanvas } from "qrcode.react";
import DashboardLayout from "../../layouts/DashboardLayout";
import QuickPayModal from "../../components/common/QuickPayModal";
import {
  fetchWallet,
  fetchBeneficiaries,
  addBeneficiary,
  deleteBeneficiary,
} from "../../redux/slices/walletSlice";
import { fetchRecentTransactions } from "../../redux/slices/transactionSlice";
import { formatCurrency, initials } from "../../utils/format";
import TransactionsTable from "../../components/tables/TransactionsTable";
// Wallet transaction integration

export default function WalletPage() {
  const dispatch = useDispatch();
  const { wallet, beneficiaries } = useSelector((s) => s.wallet);
  const { recent } = useSelector((s) => s.transactions);
  const user = useSelector((s) => s.auth.user);
  const [transferOpen, setTransferOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [addBenefOpen, setAddBenefOpen] = useState(false);
  const [selectedBenef, setSelectedBenef] = useState(null);

  useEffect(() => {
    dispatch(fetchWallet());
    dispatch(fetchBeneficiaries());
    dispatch(fetchRecentTransactions(10));
  }, [dispatch]);

  return (
    <DashboardLayout title="Wallet" subtitle="Send money, manage payees, and view your payment activity.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance + actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-card p-6 shadow-card border border-ink-100">
            <p className="text-ink-500 text-sm font-medium">Available balance</p>
            <p data-testid="wallet-balance" className="text-4xl font-bold text-ink-900 mt-1">
              {formatCurrency(wallet?.balance || 0, wallet?.currency)}
            </p>
            <p className="text-sm text-ink-500 mt-1">
              Savings: {formatCurrency(wallet?.savings || 0)} · Credit:{" "}
              {Math.round(wallet?.credit_score || 720)}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                data-testid="action-send"
                onClick={() => setTransferOpen(true)}
                className="px-5 h-12 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm flex items-center gap-2 shadow-pill"
              >
                <Send size={18} /> Send money
              </button>
              <button
                data-testid="action-qr"
                onClick={() => setQrOpen(true)}
                className="px-5 h-12 rounded-2xl bg-ink-100 hover:bg-ink-200 text-ink-800 font-semibold text-sm flex items-center gap-2"
              >
                <QrCode size={18} /> Receive (QR)
              </button>
              <button
                data-testid="action-add-payee"
                onClick={() => setAddBenefOpen(true)}
                className="px-5 h-12 rounded-2xl bg-ink-100 hover:bg-ink-200 text-ink-800 font-semibold text-sm flex items-center gap-2"
              >
                <UserPlus size={18} /> Add payee
              </button>
            </div>
          </div>

          {/* Recent transactions */}
          <div className="bg-white rounded-card p-6 shadow-card border border-ink-100">
            <p className="text-ink-900 font-semibold mb-4">Recent payments</p>
            <TransactionsTable items={recent} compact />
          </div>
        </div>

        {/* Beneficiaries */}
        <div className="bg-white rounded-card p-6 shadow-card border border-ink-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-ink-900 font-semibold">Beneficiaries</p>
            <button
              data-testid="add-beneficiary-btn"
              onClick={() => setAddBenefOpen(true)}
              className="text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              + Add new
            </button>
          </div>
          {beneficiaries.length === 0 && (
            <p className="text-sm text-ink-500">No beneficiaries yet. Add your first payee.</p>
          )}
          <div className="space-y-3">
            {beneficiaries.map((b) => (
              <div
                key={b.id}
                data-testid={`benef-${b.id}`}
                className="group flex items-center gap-3 p-3 rounded-2xl bg-ink-50 hover:bg-white hover:shadow-soft transition-all"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-semibold text-sm"
                  style={{ backgroundColor: b.avatar_color }}
                >
                  {initials(b.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-ink-900 truncate">{b.name}</p>
                  <p className="text-xs text-ink-500 truncate">
                    {b.bank_name || "Bank"} · {b.account_number}
                  </p>
                </div>
                <button
                  data-testid={`send-${b.id}`}
                  onClick={() => {
                    setSelectedBenef(b);
                    setTransferOpen(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl bg-brand-100 text-brand-700 hover:bg-brand-200"
                >
                  <Send size={14} />
                </button>
                <button
                  onClick={async () => {
                    const r = await dispatch(deleteBeneficiary(b.id));
                    if (deleteBeneficiary.fulfilled.match(r)) toast.success("Removed");
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <QuickPayModal
        open={transferOpen}
        preset={selectedBenef}
        onClose={() => {
          setTransferOpen(false);
          setSelectedBenef(null);
        }}
      />

      {qrOpen && (
        <Modal onClose={() => setQrOpen(false)} title="Receive money">
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-white border-2 border-brand-100 rounded-3xl">
              <QRCodeCanvas
                value={JSON.stringify({
                  to: user?.email,
                  name: user?.full_name,
                  bank: "FinGuard",
                })}
                size={200}
                fgColor="#0F172A"
                bgColor="#FFFFFF"
                level="M"
              />
            </div>
            <p className="text-sm text-ink-500 text-center">
              Share this QR code to receive instant payments.
            </p>
            <div className="bg-ink-50 rounded-2xl px-4 py-3 w-full text-center">
              <p className="text-xs text-ink-500 font-medium">Your handle</p>
              <p className="font-semibold text-ink-900 text-sm">{user?.email}</p>
            </div>
          </div>
        </Modal>
      )}

      {addBenefOpen && (
        <AddBeneficiaryModal
          onClose={() => setAddBenefOpen(false)}
          onSubmit={async (payload) => {
            const r = await dispatch(addBeneficiary(payload));
            if (addBeneficiary.fulfilled.match(r)) {
              toast.success("Beneficiary added");
              setAddBenefOpen(false);
              return true;
            }
            toast.error("Failed to add");
            return false;
          }}
        />
      )}
    </DashboardLayout>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-card p-6 w-full max-w-md shadow-card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-ink-900">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-ink-100">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TransferModal() {
  return null; // Deprecated: use QuickPayModal instead
}

function AddBeneficiaryModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    account_number: "",
    bank_name: "",
    nickname: "",
    avatar_color: "#10B981",
  });
  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <Modal title="Add beneficiary" onClose={onClose}>
      <div className="space-y-3">
        <Input label="Name" value={form.name} onChange={update("name")} testid="benef-name" />
        <Input
          label="Account number"
          value={form.account_number}
          onChange={update("account_number")}
          testid="benef-account"
        />
        <Input label="Bank name" value={form.bank_name} onChange={update("bank_name")} />
        <Input label="Nickname" value={form.nickname} onChange={update("nickname")} />
        <button
          data-testid="benef-submit"
          onClick={async () => {
            if (!form.name || !form.account_number)
              return toast.error("Name and account number required");
            await onSubmit(form);
          }}
          className="w-full h-12 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-pill"
        >
          Add beneficiary
        </button>
      </div>
    </Modal>
  );
}

function Input({ label, value, onChange, testid }) {
  return (
    <label className="block">
      <span className="text-xs text-ink-600 font-semibold mb-1.5 block">{label}</span>
      <input
        data-testid={testid}
        value={value}
        onChange={onChange}
        className="w-full h-12 px-4 rounded-2xl bg-ink-50 text-sm focus:outline-none focus:bg-white border border-transparent focus:border-brand-300"
      />
    </label>
  );
}
