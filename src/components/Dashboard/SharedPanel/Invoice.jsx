import { useMemo, useRef, useState } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiFileText,
  FiPackage,
  FiPrinter,
  FiSearch,
  FiTrendingUp,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import useOrders from "../../Hooks/useOrders";
import useLoginUser from "../../Hooks/useLoginUser";
import useAdmin from "../../Hooks/useAdmin";
import Loading from "../../Root/Loading";
import NoData from "../../utils/NoData";
import TutorialModal from "../../DashboardTutorial/TutorialModal";

const LOGO = "https://i.ibb.co/G4k8xvLB/taskra-logo.png";

/* ── helpers ───────────────────────────────────────── */
const fmtDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "—";

const fmtMoney = (n = 0) => `£${(Number(n) || 0).toLocaleString("en-GB")}`;

const STATUS = {
  confirmed: { cls: "tk-badge-success", Icon: FiCheckCircle, label: "Paid" },
  completed: { cls: "tk-badge-success", Icon: FiCheckCircle, label: "Completed" },
  complete: { cls: "tk-badge-success", Icon: FiCheckCircle, label: "Completed" },
  pending: { cls: "tk-badge-warning", Icon: FiClock, label: "Awaiting" },
  inprogress: { cls: "tk-badge-info", Icon: FiClock, label: "In Process" },
  cancelled: { cls: "tk-badge-error", Icon: FiXCircle, label: "Void" },
};
const getStatus = (s) => STATUS[s?.toLowerCase()] || STATUS.pending;

const StatusBadge = ({ status }) => {
  const { cls, Icon, label } = getStatus(status);
  return (
    <span className={cls}>
      <Icon size={11} />
      {label}
    </span>
  );
};

/* ── KPI card ──────────────────────────────────────── */
const StatCard = ({ icon, label, value }) => {
  const Icon = icon;
  return (
    <div className="tk-card p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-primary-tint text-primary flex items-center justify-center shrink-0">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-body-text/70 mb-0.5 truncate">{label}</p>
        <p className="text-2xl font-bold text-ink leading-none">{value}</p>
      </div>
    </div>
  );
};

/* ── Invoice preview modal (with PDF export) ───────── */
const InvoiceModal = ({ order, onClose }) => {
  const docRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  if (!order) return null;

  const ref = order.transactionId?.slice(-8)?.toUpperCase() || order._id?.slice(-8)?.toUpperCase() || "N/A";
  const isPaid = ["confirmed", "completed", "complete"].includes(order.status?.toLowerCase());

  const handleDownloadPdf = async () => {
    if (!docRef.current || exporting) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(docRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      pdf.addImage(img, "PNG", 0, 0, pageWidth, imgHeight);
      pdf.save(`taskra-invoice-${ref}.pdf`);
      toast.success("Invoice downloaded");
    } catch (err) {
      console.error("Invoice export failed:", err);
      toast.error("Could not export the PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-ink/60 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-surface rounded-2xl shadow-soft flex flex-col max-h-[95vh] overflow-hidden"
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-line-app shrink-0">
          <p className="text-sm font-semibold text-ink">Invoice #{ref}</p>
          <div className="flex items-center gap-2">
            <button onClick={handleDownloadPdf} disabled={exporting} className="tk-btn-primary h-9">
              <FiDownload size={14} />
              {exporting ? "Exporting…" : "Download PDF"}
            </button>
            <button onClick={() => window.print()} className="tk-btn-secondary h-9">
              <FiPrinter size={14} />
              Print
            </button>
            <button onClick={onClose} className="tk-icon-btn" aria-label="Close">
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Printable document */}
        <div className="overflow-y-auto flex-1 bg-app-bg p-4 md:p-6">
          <div ref={docRef} className="bg-white rounded-xl border border-line-app p-8 md:p-10 relative">
            {/* Letterhead */}
            <div className="flex items-start justify-between gap-4 pb-6 border-b-2 border-primary mb-8">
              <div className="flex items-center gap-3">
                <img
                  src={LOGO}
                  alt="Taskra"
                  crossOrigin="anonymous"
                  className="h-12 w-auto object-contain"
                />
                <div>
                  <p className="text-xl font-bold text-ink leading-none">Taskra</p>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-body-text/60 mt-1">
                    Creative Marketplace
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold uppercase tracking-tight text-ink leading-none">
                  Invoice
                </p>
                <p className="text-xs font-semibold text-body-text/60 mt-2">Ref: #{ref}</p>
                <p className="text-xs text-body-text/60 mt-1">
                  Issued: {fmtDate(order.date || order.createdAt)}
                </p>
              </div>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-body-text/60 mb-3 pb-1 border-b border-line-app">
                  Billed To
                </p>
                <p className="text-base font-bold text-ink">{order.userName || "—"}</p>
                <p className="text-xs text-body-text mt-1">{order.userEmail || "—"}</p>
                {order.phone && <p className="text-xs text-body-text mt-1">{order.phone}</p>}
                {order.address && <p className="text-xs text-body-text mt-1">{order.address}</p>}
                <div className="mt-2">
                  <StatusBadge status={order.status} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-body-text/60 mb-3 pb-1 border-b border-line-app">
                  Details
                </p>
                <div className="space-y-2 text-xs text-body-text">
                  <p>
                    <span className="font-semibold text-ink">Category:</span> {order.category || "—"}
                  </p>
                  <p className="break-all">
                    <span className="font-semibold text-ink">Transaction:</span>{" "}
                    {order.transactionId || "—"}
                  </p>
                  <p>
                    <span className="font-semibold text-ink">Order ID:</span> {order._id}
                  </p>
                </div>
              </div>
            </div>

            {/* Line items */}
            <table className="w-full text-sm mb-8">
              <thead>
                <tr className="bg-primary-tint">
                  <th className="px-5 py-3 text-left text-[10px] font-bold tracking-widest uppercase text-primary rounded-l-lg">
                    Description
                  </th>
                  <th className="px-5 py-3 text-right text-[10px] font-bold tracking-widest uppercase text-primary w-32 rounded-r-lg">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-line-app">
                  <td className="px-5 py-5">
                    <p className="font-semibold text-ink mb-1">
                      {order.category || "Professional Service"}
                    </p>
                    <p className="text-xs text-body-text/80 leading-relaxed">
                      {order.item?.requirement ||
                        "Service delivery as per contractual agreement and signed scope of work."}
                    </p>
                  </td>
                  <td className="px-5 py-5 text-right align-top font-bold text-ink">
                    {fmtMoney(order.total)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-6">
              <div className="w-60 space-y-2.5">
                <div className="flex justify-between text-xs font-semibold text-body-text/70 uppercase tracking-wider">
                  <span>Subtotal</span>
                  <span className="text-ink">{fmtMoney(order.total)}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-body-text/70 uppercase tracking-wider">
                  <span>Service Fee</span>
                  <span className="text-ink">£0.00</span>
                </div>
                <div className="pt-3 border-t-2 border-primary flex justify-between items-center">
                  <span className="text-xs font-bold text-body-text/70 uppercase tracking-wider">
                    Grand Total
                  </span>
                  <span className="text-2xl font-bold text-primary">{fmtMoney(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Paid seal */}
            {isPaid && (
              <div className="absolute bottom-24 left-8 rotate-[-15deg] opacity-10 pointer-events-none">
                <div className="border-4 border-success-text text-success-text px-6 py-2 text-3xl font-bold rounded-xl tracking-widest uppercase">
                  Paid in full
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-line-app text-center">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-body-text/40">
                Empowering creatives worldwide · Taskra.io
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── main page ─────────────────────────────────────── */
const Invoice = () => {
  const [orders, , isLoading] = useOrders();
  const { currentUser } = useLoginUser();
  const isadmin = useAdmin();
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [search, setSearch] = useState("");

  // Role-aware: admin sees everything, everyone else sees orders they
  // paid for (client) or fulfilled (professional).
  const data = useMemo(() => {
    if (!orders || !currentUser) return [];
    if (isadmin) return orders;
    return orders.filter(
      (o) => o.userEmail === currentUser.email || o.item?.freelancerId === currentUser._id
    );
  }, [orders, currentUser, isadmin]);

  if (isLoading) return <Loading />;

  const filtered = data.filter(
    (c) =>
      !search ||
      c.userName?.toLowerCase().includes(search.toLowerCase()) ||
      c.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase()) ||
      c.transactionId?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = data.reduce((s, c) => s + (Number(c.total) || 0), 0);
  const settled = data.filter((c) =>
    ["confirmed", "completed", "complete"].includes(c.status?.toLowerCase())
  ).length;
  const inProgress = data.filter((c) =>
    ["pending", "inprogress"].includes(c.status?.toLowerCase())
  ).length;

  return (
    <div className="tk-page">
      <TutorialModal
        componentName="invoices"
        title="Invoices"
        description="Every processed transaction lives here."
        listItems={[
          "Search invoices by customer, category or transaction id",
          "Open any row to preview the full invoice",
          "Download a PDF copy for your records",
        ]}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="tk-eyebrow mb-1">Financial ledger</p>
          <h1 className="tk-page-title">Invoices</h1>
          <p className="text-sm text-body-text/70 mt-1">
            Record of all processed transactions
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <FiSearch
            size={15}
            className="text-body-text/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="tk-input pl-9"
          />
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={FiFileText} label="Total Invoices" value={data.length} />
        <StatCard icon={FiCheckCircle} label="Settled" value={settled} />
        <StatCard icon={FiClock} label="Pending" value={inProgress} />
        <StatCard icon={FiTrendingUp} label="Total Value" value={fmtMoney(totalRevenue)} />
      </div>

      {/* Ledger table */}
      {filtered.length === 0 ? (
        <NoData
          title="No invoices yet"
          message={
            search
              ? "No invoices match your search."
              : "Invoices will appear here once orders are processed."
          }
        />
      ) : (
        <div className="tk-table-wrap">
          <div className="overflow-x-auto">
            <table className="tk-table">
              <thead className="tk-thead">
                <tr>
                  <th className="tk-th">Transaction</th>
                  <th className="tk-th">Customer</th>
                  <th className="tk-th">Category</th>
                  <th className="tk-th">Value</th>
                  <th className="tk-th">Status</th>
                  <th className="tk-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id} className="tk-row">
                    <td className="tk-td">
                      <p className="text-xs font-bold text-ink">
                        #{(c.transactionId || c._id)?.slice(-12).toUpperCase()}
                      </p>
                      <p className="text-[10px] text-body-text/60 uppercase tracking-wider mt-1">
                        {fmtDate(c.date || c.createdAt)}
                      </p>
                    </td>
                    <td className="tk-td">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            c.item?.clientPhoto ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              c.userName || "U"
                            )}&background=FE6D06&color=fff&size=80`
                          }
                          alt={c.userName}
                          className="w-9 h-9 object-cover rounded-full border border-line-app shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink truncate">
                            {c.userName || "—"}
                          </p>
                          <p className="text-[11px] text-body-text/70 truncate">
                            {c.userEmail || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="tk-td">
                      <span className="tk-badge-neutral">{c.category || "—"}</span>
                    </td>
                    <td className="tk-td font-bold">{fmtMoney(c.total)}</td>
                    <td className="tk-td">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="tk-td text-right">
                      <button
                        onClick={() => setInvoiceOrder(c)}
                        className="tk-btn-secondary h-9"
                      >
                        <FiPackage size={13} />
                        Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {invoiceOrder && <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />}
    </div>
  );
};

export default Invoice;
