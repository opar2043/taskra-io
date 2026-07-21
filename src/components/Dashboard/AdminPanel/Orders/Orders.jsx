import { useState } from "react";
import toast from "react-hot-toast";
import {
  FiX,
  FiSearch,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiXCircle,
  FiEye,
  FiShoppingBag,
} from "react-icons/fi";
import useOrders from "../../../Hooks/useOrders";
import useAxios from "../../../Hooks/useAxios";
import NoData from "../../../utils/NoData";
import Loading from "../../../Root/Loading";
import TutorialModal from "../../../DashboardTutorial/TutorialModal";

const STATUS_MAP = {
  confirmed: { badge: "tk-badge-success", Icon: FiCheckCircle, label: "Confirmed" },
  pending: { badge: "tk-badge-warning", Icon: FiClock, label: "Pending" },
  inprogress: { badge: "tk-badge-warning", Icon: FiAlertCircle, label: "Processing" },
  completed: { badge: "tk-badge-success", Icon: FiCheckCircle, label: "Completed" },
  cancelled: { badge: "tk-badge-error", Icon: FiXCircle, label: "Cancelled" },
};

const STATUS_OPTIONS = ["confirmed", "pending", "inprogress", "completed", "cancelled"];

const fmt = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-GB", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

const getStatus = (s) => STATUS_MAP[s?.toLowerCase()] || STATUS_MAP.pending;

const StatCard = ({ label, value, accent }) => (
  <div className="tk-card p-5 flex flex-col justify-center">
    <p className="tk-eyebrow mb-2">{label}</p>
    <p className={`text-xl font-semibold leading-none ${accent ? "text-primary" : "text-ink"}`}>
      {value}
    </p>
  </div>
);

const OrderModal = ({ order, onClose }) => {
  if (!order) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-surface rounded-2xl shadow-soft overflow-hidden flex flex-col">
        <div className="bg-app-bg border-b border-line-app px-6 py-4 flex items-center justify-between text-ink">
          <h2 className="font-semibold tracking-tight">Order Audit Log</h2>
          <button
            onClick={onClose}
            className="p-1 text-body-text hover:bg-white rounded-lg transition-colors"
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 border-b border-line-app pb-4">
            <div>
              <p className="tk-eyebrow">Client</p>
              <p className="text-sm font-semibold text-ink">{order.userName}</p>
            </div>
            <div>
              <p className="tk-eyebrow">Status</p>
              <div className="mt-1">
                <span className={getStatus(order.status).badge}>{order.status}</span>
              </div>
            </div>
          </div>
          {[
            { label: "Category", value: order.category },
            { label: "Total Paid", value: `£${order.total}` },
            { label: "Transaction ID", value: order.transactionId },
            { label: "Email", value: order.userEmail },
            { label: "Plan Date", value: fmt(order.date) },
            { label: "Address", value: order.address },
          ].map((item) => (
            <div key={item.label} className="border-b border-line-app/60 pb-3 last:border-0">
              <p className="tk-eyebrow">{item.label}</p>
              <p className="text-xs font-semibold text-ink mt-1">{item.value || "N/A"}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Orders = () => {
  const [orders, refetch, isLoading] = useOrders();
  const axiosSecure = useAxios();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState("");

  if (isLoading) return <Loading />;

  const data = orders || [];
  const filtered = data.filter(
    (c) =>
      !search ||
      c.userName?.toLowerCase().includes(search.toLowerCase()) ||
      c.userEmail?.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusChange = async (order, status) => {
    if (!status || status === order.status) return;
    try {
      await axiosSecure.patch(`/orders/${order._id}`, { status });
      toast.success(`Order marked as ${getStatus(status).label}.`);
      refetch();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update order status."
      );
    }
  };

  return (
    <div className="tk-page">
      <TutorialModal
        componentName="AdminOrders"
        title="Welcome to the Transaction Ledger"
        description="Oversee every order and financial entry recorded on the platform."
        listItems={[
          "Search orders by client or email",
          "Track order status and revenue",
          "Open any order for a full audit log",
        ]}
      />

      <div className="tk-card p-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <p className="tk-eyebrow">Verify fulfillments and financial entries.</p>
          <h1 className="tk-page-title flex items-center gap-2">
            <FiShoppingBag className="text-primary" />
            Transaction Ledger
          </h1>
        </div>
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-body-text/50 z-10" />
          <input
            type="text"
            placeholder="Search ledger..."
            className="tk-input w-full pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Entries" value={data.length} />
        <StatCard
          label="Confirmed"
          value={data.filter((c) => c.status === "confirmed").length}
          accent
        />
        <StatCard
          label="In Progress"
          value={data.filter((c) => c.status === "inprogress").length}
          accent
        />
        <StatCard
          label="Revenue"
          value={`£${data.reduce((s, c) => s + (c.total || 0), 0).toLocaleString()}`}
          accent
        />
      </div>

      {filtered.length === 0 ? (
        <NoData title="No records available" message="No orders match the current search." />
      ) : (
        <div className="tk-table-wrap">
          <div className="overflow-x-auto">
            <table className="tk-table">
              <thead className="tk-thead">
                <tr>
                  <th className="tk-th">Client Info</th>
                  <th className="tk-th">Category</th>
                  <th className="tk-th">Amount</th>
                  <th className="tk-th">Status</th>
                  <th className="tk-th">Date</th>
                  <th className="tk-th text-right">Moderation</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id} className="tk-row">
                    <td className="tk-td">
                      <p className="font-semibold text-ink leading-tight">
                        {c.userName || "Account"}
                      </p>
                      <p className="text-[10px] font-semibold text-body-text/60 mt-1 uppercase truncate max-w-[160px]">
                        {c.userEmail}
                      </p>
                    </td>
                    <td className="tk-td">
                      <span className="tk-badge-info">{c.category || "General"}</span>
                    </td>
                    <td className="tk-td">
                      <p className="font-semibold text-ink">£{c.total}</p>
                    </td>
                    <td className="tk-td">
                      <span className={getStatus(c.status).badge}>
                        {getStatus(c.status).label}
                      </span>
                    </td>
                    <td className="tk-td-muted whitespace-nowrap">{fmt(c.date)}</td>
                    <td className="tk-td text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        <select
                          value={
                            STATUS_OPTIONS.includes(c.status?.toLowerCase())
                              ? c.status.toLowerCase()
                              : "pending"
                          }
                          onChange={(e) => handleStatusChange(c, e.target.value)}
                          className="tk-input h-8 w-32 text-xs capitalize"
                          title="Change status"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s} className="capitalize">
                              {STATUS_MAP[s].label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => setSelectedOrder(c)}
                          className="tk-icon-btn text-primary"
                          title="View audit log"
                        >
                          <FiEye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedOrder && (
        <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
};

export default Orders;
