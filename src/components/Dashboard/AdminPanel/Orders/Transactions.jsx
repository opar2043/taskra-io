import { useState } from "react";
import {
  FiPackage,
  FiCalendar,
  FiSearch,
  FiClock,
  FiCheck,
  FiAlertCircle,
  FiList,
  FiFileText,
} from "react-icons/fi";
import useInboxQuote from "../../../Hooks/useInboxQuote";
import Loading from "../../../Root/Loading";
import TutorialModal from "../../../DashboardTutorial/TutorialModal";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_MAP = {
  inprogress: { badge: "tk-badge-warning", Icon: FiAlertCircle, label: "In Progress" },
  pending: { badge: "tk-badge-warning", Icon: FiClock, label: "Pending" },
  confirmed: { badge: "tk-badge-success", Icon: FiCheck, label: "Confirmed" },
};

const getStatus = (s) => STATUS_MAP[s?.toLowerCase()] || STATUS_MAP.pending;

const StatusBadge = ({ status }) => {
  const { badge, Icon, label } = getStatus(status);
  return (
    <span className={`inline-flex items-center gap-1.5 ${badge}`}>
      <Icon size={11} />
      {label}
    </span>
  );
};

const fmt = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-GB", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

// ─── Stat Card ───────────────────────────────────────────────────────────────

const StatCard = ({ icon, label, value }) => {
  const Icon = icon;
  return (
    <div className="tk-card p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-primary-tint text-primary flex items-center justify-center shrink-0">
        <Icon size={20} />
      </div>
      <div>
        <p className="tk-eyebrow">{label}</p>
        <p className="text-xl font-semibold text-ink mt-0.5 leading-tight">{value}</p>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const Transactions = () => {
  const [inboxquote, , isLoading] = useInboxQuote();
  const [search, setSearch] = useState("");

  if (isLoading) return <Loading />;

  // Only show pending & inprogress — exclude confirmed
  const data = (inboxquote || []).filter((q) => q.status?.toLowerCase() !== "confirmed");

  const filtered = data.filter(
    (q) =>
      !search ||
      q.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      q.requirement?.toLowerCase().includes(search.toLowerCase()) ||
      q.status?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = data.filter((q) => q.status?.toLowerCase() === "pending").length;
  const inProgressCount = data.filter((q) => q.status?.toLowerCase() === "inprogress").length;
  const totalValue = data.reduce((s, q) => s + (q.price || 0), 0);

  return (
    <div className="tk-page">
      <TutorialModal
        componentName="Transactions"
        title="Welcome to Pending Transactions"
        description="Watch live quotes as they move through pending and in-progress stages."
        listItems={[
          "Search active quotes by client or requirement",
          "Track pending and in-progress totals",
          "Review timelines and quote values",
        ]}
      />

      {/* ── Page Header ── */}
      <div>
        <p className="tk-eyebrow">Admin Panel</p>
        <h1 className="tk-page-title">All Pending Transactions</h1>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard icon={FiPackage} label="Total Quotes" value={data.length} />
        <StatCard icon={FiClock} label="Pending" value={pendingCount} />
        <StatCard icon={FiAlertCircle} label="In Progress" value={inProgressCount} />
      </div>

      {/* ── Table Card ── */}
      <div className="tk-table-wrap">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-line-app bg-app-bg/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <FiFileText size={15} className="text-primary" />
            <span className="text-sm font-semibold text-ink">Active Quotes</span>
            <span className="tk-badge-info">{filtered.length}</span>
          </div>
          <div className="relative">
            <FiSearch
              size={14}
              className="text-body-text/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10"
            />
            <input
              type="text"
              placeholder="Search client, requirement…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="tk-input pl-9 w-full sm:w-60"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="tk-table">
            <thead className="tk-thead">
              <tr>
                {["#", "Client", "Requirement", "Price", "Timeline", "Status", "Created"].map(
                  (h) => (
                    <th key={h} className="tk-th whitespace-nowrap">
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-primary-tint text-primary rounded-2xl flex items-center justify-center">
                        <FiPackage size={26} />
                      </div>
                      <p className="text-sm font-medium text-body-text/70">
                        No pending transactions found
                      </p>
                      {search && (
                        <p className="text-xs text-body-text/60">Try adjusting your search</p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((q, idx) => (
                  <tr key={q._id} className="tk-row">
                    {/* Index */}
                    <td className="tk-td-muted">{String(idx + 1).padStart(2, "0")}</td>

                    {/* Client */}
                    <td className="tk-td">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            q.clientPhoto ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              q.clientName || "U"
                            )}&background=FE6D06&color=fff&size=80`
                          }
                          alt={q.clientName}
                          className="w-9 h-9 rounded-full object-cover border border-line-app shrink-0"
                        />
                        <span className="font-semibold text-ink whitespace-nowrap">
                          {q.clientName || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Requirement */}
                    <td className="tk-td max-w-xs">
                      <div className="flex items-center gap-1.5">
                        <FiList size={12} className="text-body-text/50 shrink-0" />
                        <span className="text-xs text-body-text/70 truncate">
                          {q.requirement || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="tk-td">
                      <span className="font-semibold text-ink">£{q.price ?? 0}</span>
                    </td>

                    {/* Timeline */}
                    <td className="tk-td">
                      <div className="flex items-center gap-1.5">
                        <FiCalendar size={12} className="text-body-text/50 shrink-0" />
                        <span className="text-xs text-body-text/70 whitespace-nowrap">
                          {fmt(q.timeline)}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="tk-td">
                      <StatusBadge status={q.status} />
                    </td>

                    {/* Created */}
                    <td className="tk-td">
                      <div className="flex items-center gap-1.5">
                        <FiCalendar size={12} className="text-body-text/50 shrink-0" />
                        <span className="text-xs text-body-text/70 whitespace-nowrap">
                          {fmt(q.createdAt)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-6 py-3.5 border-t border-line-app bg-app-bg/70 flex items-center justify-between">
            <span className="text-xs text-body-text/70">
              Showing <span className="font-semibold text-ink">{filtered.length}</span> of{" "}
              <span className="font-semibold text-ink">{data.length}</span> active quotes
            </span>
            <span className="text-xs font-semibold text-primary">
              Total Value: £{totalValue.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
