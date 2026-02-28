import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Search, Download } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import TransactionsTable from "../../components/tables/TransactionsTable";
import { fetchTransactions } from "../../redux/slices/transactionSlice";

const TYPES = ["all", "deposit", "transfer_out", "transfer_in", "payment", "withdrawal"];
const STATUSES = ["all", "completed", "pending", "flagged", "failed"];

export default function Transactions() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, loading } = useSelector((s) => s.transactions);
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 15;

  // Sync URL ?q param into state when route changes
  useEffect(() => {
    setQ(searchParams.get("q") || "");
    setPage(0);
  }, [searchParams]);

  useEffect(() => {
    const params = {};
    if (q) params.q = q;
    if (type !== "all") params.type = type;
    if (status !== "all") params.status = status;
    params.limit = 200;
    dispatch(fetchTransactions(params));
  }, [dispatch, q, type, status]);

  const handleSearchChange = (v) => {
    setQ(v);
    setPage(0);
    if (v) setSearchParams({ q: v });
    else setSearchParams({});
  };

  const paged = useMemo(() => {
    const start = page * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, page]);
  const totalPages = Math.ceil(items.length / PAGE_SIZE) || 1;

  const exportCsv = () => {
    const header = "Date,Description,Counterparty,Category,Type,Amount,Status\n";
    const rows = items
      .map(
        (t) =>
          `"${new Date(t.created_at).toLocaleString()}","${t.description || ""}","${
            t.counterparty || ""
          }","${t.category}","${t.type}",${t.amount.toFixed(2)},"${t.status}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout title="Transactions" subtitle="Search, filter, and export your activity.">
      <div className="bg-white rounded-card p-5 lg:p-6 shadow-card border border-ink-100">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              data-testid="txn-search"
              value={q}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by description, payee or category…"
              className="pl-10 pr-4 h-12 w-full rounded-2xl bg-ink-50 focus:bg-white focus:outline-none border border-transparent focus:border-brand-300 text-sm"
            />
          </div>
          <select
            data-testid="txn-type-filter"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-12 px-4 rounded-2xl bg-ink-50 text-sm focus:outline-none border border-transparent focus:border-brand-300"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t === "all" ? "All types" : t.replace("_", " ")}
              </option>
            ))}
          </select>
          <select
            data-testid="txn-status-filter"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-12 px-4 rounded-2xl bg-ink-50 text-sm focus:outline-none border border-transparent focus:border-brand-300"
          >
            {STATUSES.map((t) => (
              <option key={t} value={t}>
                {t === "all" ? "All status" : t}
              </option>
            ))}
          </select>
          <button
            data-testid="txn-export"
            onClick={exportCsv}
            className="h-12 px-4 rounded-2xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-sm flex items-center gap-2"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>

        {loading ? (
          <p className="text-center py-12 text-ink-500 text-sm">Loading transactions…</p>
        ) : (
          <TransactionsTable items={paged} />
        )}

        {/* Pagination */}
        {items.length > PAGE_SIZE && (
          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm text-ink-500">
              Showing {page * PAGE_SIZE + 1}–{Math.min(items.length, (page + 1) * PAGE_SIZE)} of{" "}
              {items.length}
            </p>
            <div className="flex gap-2">
              <button
                data-testid="page-prev"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="h-10 px-4 rounded-xl bg-ink-100 hover:bg-ink-200 disabled:opacity-50 text-sm font-semibold"
              >
                Previous
              </button>
              <button
                data-testid="page-next"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage(page + 1)}
                className="h-10 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
