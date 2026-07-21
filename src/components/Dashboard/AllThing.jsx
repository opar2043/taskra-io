import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  FaBriefcase,
  FaCamera,
  FaCheckCircle,
  FaClipboardList,
  FaComments,
  FaFileContract,
  FaMoneyBillWave,
  FaProjectDiagram,
  FaShoppingCart,
  FaStar,
  FaUserFriends,
  FaUsers,
} from "react-icons/fa";
import useAuth from "../Hooks/useAuth";
import useLoginUser from "../Hooks/useLoginUser";
import useFrelencerStat from "../Hooks/useFrelencerStat";
import useJobs from "../Hooks/useJobs";
import useOrders from "../Hooks/useOrders";
import Loading from "../Root/Loading";
import NoData from "../utils/NoData";
import TutorialModal from "../DashboardTutorial/TutorialModal";

/* ── tokens ────────────────────────────────────────── */
const PRIMARY = "#FE6D06"; // primary series
const INK = "#14141F"; // comparison series
const GRID = "#E7E9EE";
const AXIS_TICK = { fontSize: 11, fill: "#4B4B57" };

const chartTooltipProps = {
  contentStyle: {
    background: INK,
    border: "none",
    borderRadius: 12,
    color: "#fff",
    fontSize: 12,
    padding: "10px 14px",
  },
  labelStyle: { color: "#fff", fontWeight: 600, marginBottom: 4 },
  itemStyle: { color: "#fff", padding: 0 },
  cursor: { fill: "rgba(20,20,31,0.04)" },
};

/* ── helpers ───────────────────────────────────────── */
const fmtMoney = (n = 0) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "—";

const statusBadge = (status = "") => {
  const s = status.toLowerCase();
  if (["completed", "complete", "confirmed", "paid", "accepted"].includes(s))
    return "tk-badge-success";
  if (["cancelled", "canceled", "rejected", "closed"].includes(s)) return "tk-badge-error";
  if (["pending", "awaiting"].includes(s)) return "tk-badge-warning";
  if (["open", "inprogress", "in progress", "active"].includes(s)) return "tk-badge-info";
  return "tk-badge-neutral";
};

/* ── KPI stat card ─────────────────────────────────── */
const StatCard = ({ icon, label, value, sub }) => {
  const Icon = icon;
  return (
  <div className="tk-card p-5 flex flex-col gap-3">
    <div className="w-11 h-11 rounded-xl bg-primary-tint text-primary flex items-center justify-center">
      <Icon className="text-lg" />
    </div>
    <div>
      <p className="text-2xl font-bold text-ink leading-tight">{value ?? "—"}</p>
      <p className="text-xs font-medium text-body-text/70 mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-body-text/60 mt-1">{sub}</p>}
    </div>
  </div>
  );
};

/* ── quick-stat row (side card) ────────────────────── */
const QuickStat = ({ icon, label, value }) => {
  const Icon = icon;
  return (
    <div className="flex items-center justify-between py-3 border-b border-line-app last:border-b-0">
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-8 h-8 rounded-xl bg-primary-tint text-primary flex items-center justify-center shrink-0">
          <Icon className="text-xs" />
        </span>
        <span className="text-sm text-body-text truncate">{label}</span>
      </div>
      <span className="text-sm font-semibold text-ink">{value ?? "—"}</span>
    </div>
  );
};

/* ── capsule bar chart card ────────────────────────── */
const BreakdownChart = ({ title, data, series }) => (
  <div className="tk-card p-5">
    <p className="text-sm font-semibold text-ink mb-4">{title}</p>
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barSize={16} barGap={6}>
        <CartesianGrid strokeDasharray="4 4" stroke={GRID} vertical={false} />
        <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} interval={0} />
        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} width={36} />
        <Tooltip {...chartTooltipProps} />
        {series.length > 1 && (
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "#4B4B57" }} />
        )}
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            fill={i === 0 ? PRIMARY : INK}
            radius={[12, 12, 12, 12]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  </div>
);

/* ── main component ────────────────────────────────── */
const AllThing = () => {
  const { user } = useAuth();
  const { currentUser, isLoading: userLoading } = useLoginUser();
  const [stats, , statsLoading] = useFrelencerStat(currentUser?.email);
  const [jobs] = useJobs();
  const [orders] = useOrders();

  const role = stats?.role || currentUser?.role;
  const isAdmin = role === "admin";
  const isClient = role === "client";
  const isPro = role === "professional";

  /* KPI row per role */
  const kpis = useMemo(() => {
    const s = stats || {};
    if (isAdmin) {
      return [
        {
          icon: FaUsers,
          label: "Total Users",
          value: s.totalUsers,
          sub: `${s.totalClients ?? 0} clients · ${s.totalFreelancers ?? 0} professionals`,
        },
        { icon: FaBriefcase, label: "Total Jobs", value: s.totalJobs, sub: `${s.openJobs ?? 0} open` },
        {
          icon: FaShoppingCart,
          label: "Total Orders",
          value: s.totalOrders,
          sub: `${s.completedOrders ?? 0} completed`,
        },
        {
          icon: FaMoneyBillWave,
          label: "Total Revenue",
          value: fmtMoney(s.totalRevenue),
          sub: `${fmtMoney(s.todayRevenue)} today`,
        },
      ];
    }
    if (isClient) {
      return [
        { icon: FaBriefcase, label: "Jobs Posted", value: s.jobsPosted, sub: `${s.openJobs ?? 0} open` },
        { icon: FaFileContract, label: "Quotes Received", value: s.quotesReceived },
        {
          icon: FaShoppingCart,
          label: "Total Orders",
          value: s.totalOrders,
          sub: `${s.inprogressProjects ?? 0} in progress`,
        },
        { icon: FaMoneyBillWave, label: "Total Spent", value: fmtMoney(s.totalSpent) },
      ];
    }
    return [
      {
        icon: FaMoneyBillWave,
        label: "Total Earnings",
        value: fmtMoney(s.totalEarnings),
        sub: `${fmtMoney(s.todayEarnings)} today`,
      },
      {
        icon: FaProjectDiagram,
        label: "Total Projects",
        value: s.totalProjects,
        sub: `${s.inprogressProjects ?? 0} in progress`,
      },
      { icon: FaFileContract, label: "Bids Sent", value: s.bidsSent, sub: `${s.bidsToday ?? 0} today` },
      { icon: FaStar, label: "Reviews Received", value: s.reviewsReceived },
    ];
  }, [stats, isAdmin, isClient]);

  /* Capsule chart data per role */
  const chart = useMemo(() => {
    const s = stats || {};
    if (isAdmin) {
      return {
        title: "Jobs & orders by status",
        series: [
          { key: "Jobs", label: "Jobs" },
          { key: "Orders", label: "Orders" },
        ],
        data: [
          { name: "Open", Jobs: s.openJobs || 0 },
          { name: "Pending", Jobs: s.pendingJobs || 0, Orders: s.pendingOrders || 0 },
          { name: "Confirmed", Orders: s.confirmedOrders || 0 },
          { name: "In progress", Orders: s.inprogressOrders || 0 },
          { name: "Completed", Jobs: s.completedJobs || 0, Orders: s.completedOrders || 0 },
          { name: "Cancelled", Jobs: s.cancelledJobs || 0 },
        ],
      };
    }
    if (isClient) {
      return {
        title: "Jobs & projects breakdown",
        series: [
          { key: "Jobs", label: "Jobs" },
          { key: "Projects", label: "Projects" },
        ],
        data: [
          { name: "Open", Jobs: s.openJobs || 0 },
          { name: "In progress", Projects: s.inprogressProjects || 0 },
          { name: "Completed", Jobs: s.completedJobs || 0, Projects: s.completedProjects || 0 },
          { name: "Cancelled", Jobs: s.cancelledJobs || 0 },
        ],
      };
    }
    return {
      title: "Work breakdown",
      series: [{ key: "value", label: "Count" }],
      data: [
        { name: "Bids sent", value: s.bidsSent || 0 },
        { name: "Projects", value: s.totalProjects || 0 },
        { name: "In progress", value: s.inprogressProjects || 0 },
        { name: "Completed", value: s.completedProjects || 0 },
        { name: "Photo jobs", value: s.photoJobs || 0 },
        { name: "Video jobs", value: s.videoJobs || 0 },
      ],
    };
  }, [stats, isAdmin, isClient]);

  /* Quick stats side card per role */
  const quickStats = useMemo(() => {
    const s = stats || {};
    if (isAdmin) {
      return [
        { icon: FaFileContract, label: "Total quotes", value: s.totalQuotes },
        { icon: FaStar, label: "Total reviews", value: s.totalReviews },
        { icon: FaComments, label: "Conversations", value: s.totalConversations },
        { icon: FaComments, label: "Messages", value: s.totalMessages },
        { icon: FaUserFriends, label: "Saved professionals", value: s.savedFreelancers },
        { icon: FaClipboardList, label: "Saved jobs", value: s.savedJobs },
      ];
    }
    if (isClient) {
      return [
        { icon: FaUserFriends, label: "Saved professionals", value: s.savedFreelancers },
        { icon: FaClipboardList, label: "Saved jobs", value: s.savedJobs },
        { icon: FaComments, label: "Conversations", value: s.conversations },
        { icon: FaCheckCircle, label: "Completed projects", value: s.completedProjects },
      ];
    }
    return [
      { icon: FaMoneyBillWave, label: "Avg order value", value: fmtMoney(s.averageOrderValue) },
      { icon: FaClipboardList, label: "Saved jobs", value: s.savedJobs },
      { icon: FaComments, label: "Conversations", value: s.conversations },
      { icon: FaComments, label: "Messages", value: s.totalMessages },
      { icon: FaCamera, label: "Photo jobs", value: s.photoJobs },
    ];
  }, [stats, isAdmin, isClient]);

  /* Recent items table: client → own jobs; admin/professional → orders */
  const recent = useMemo(() => {
    if (isClient) {
      const mine = (jobs || [])
        .filter((j) => j.email === currentUser?.email)
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5);
      return { type: "jobs", rows: mine };
    }
    const list = (orders || [])
      .filter((o) => (isPro ? o.item?.freelancerId === currentUser?._id : true))
      .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0))
      .slice(0, 5);
    return { type: "orders", rows: list };
  }, [jobs, orders, isClient, isPro, currentUser]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (statsLoading || (user && !currentUser && userLoading)) {
    return <Loading />;
  }

  if (!stats || !role) {
    return (
      <div className="tk-page">
        <NoData
          title="No dashboard data found"
          message="We could not load your dashboard statistics. Please try again later."
        />
      </div>
    );
  }

  const roleLabel = isAdmin ? "Admin" : isClient ? "Client" : "Professional";
  const completion = currentUser?.profileCompletion || 0;

  return (
    <div className="tk-page">
      <TutorialModal
        componentName="dashboard-home"
        title="Your dashboard"
        description="Everything about your Taskra activity at a glance."
        listItems={[
          "Track your key numbers in the stat cards",
          "Read the breakdown chart to spot trends",
          "Jump into recent items from the table below",
        ]}
      />

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <p className="tk-eyebrow mb-1">{roleLabel} dashboard</p>
          <h1 className="tk-page-title">
            {greeting()}, {currentUser?.name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-sm text-body-text/70 mt-1">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <span className="tk-badge-info self-start">{roleLabel}</span>
      </div>

      {/* Profile completion (professionals only) */}
      {isPro && (
        <div className="tk-card p-5 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 w-full">
            <h3 className="text-base font-semibold text-ink flex items-center gap-2 mb-1">
              Profile completion
              {completion === 100 && <FaCheckCircle className="text-success-text" />}
            </h3>
            <p className="text-sm text-body-text/80 mb-3">
              {currentUser?.profileCompletionMessage ||
                (completion === 100
                  ? "Your profile is 100% complete and ready for verification."
                  : "Complete all sections in your settings to reach 100% and get verified by our team.")}
            </p>
            <div className="w-full bg-app-bg rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  completion === 100 ? "bg-success-text" : "bg-primary"
                }`}
                style={{ width: `${completion}%` }}
              ></div>
            </div>
          </div>
          <span
            className={`text-4xl font-bold shrink-0 ${
              completion === 100 ? "text-success-text" : "text-primary"
            }`}
          >
            {completion}%
          </span>
        </div>
      )}

      {/* KPI stat row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <StatCard key={k.label} {...k} />
        ))}
      </div>

      {/* Chart + quick stats row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <BreakdownChart title={chart.title} data={chart.data} series={chart.series} />
        </div>
        <div className="tk-card p-5">
          <p className="text-sm font-semibold text-ink mb-2">Quick stats</p>
          {quickStats.map((q) => (
            <QuickStat key={q.label} {...q} />
          ))}
        </div>
      </div>

      {/* Recent items table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="tk-section-title">
            {recent.type === "jobs" ? "Recent jobs" : "Recent orders"}
          </h2>
          <Link
            to={recent.type === "jobs" ? "/dashboard/my-jobs" : "/dashboard/invoice"}
            className="text-sm font-semibold text-primary hover:text-primary-hover"
          >
            View all
          </Link>
        </div>

        {recent.rows.length === 0 ? (
          <NoData
            title={recent.type === "jobs" ? "No jobs yet" : "No orders yet"}
            message={
              recent.type === "jobs"
                ? "Post your first job to see it here."
                : "Orders will appear here as soon as they are created."
            }
          />
        ) : (
          <div className="tk-table-wrap">
            <div className="overflow-x-auto">
              <table className="tk-table">
                <thead className="tk-thead">
                  {recent.type === "jobs" ? (
                    <tr>
                      <th className="tk-th">Job</th>
                      <th className="tk-th">Category</th>
                      <th className="tk-th">Location</th>
                      <th className="tk-th">Event date</th>
                      <th className="tk-th">Budget</th>
                      <th className="tk-th">Status</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="tk-th">Customer</th>
                      <th className="tk-th">Category</th>
                      <th className="tk-th">Date</th>
                      <th className="tk-th">Amount</th>
                      <th className="tk-th">Status</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {recent.type === "jobs"
                    ? recent.rows.map((job) => (
                        <tr key={job._id} className="tk-row">
                          <td className="tk-td font-medium">{job.title || "—"}</td>
                          <td className="tk-td">{job.category || "—"}</td>
                          <td className="tk-td-muted">{job.location || "—"}</td>
                          <td className="tk-td-muted">{fmtDate(job.eventDate)}</td>
                          <td className="tk-td font-semibold">
                            {job.price ? `£${Number(job.price).toLocaleString()}` : "—"}
                          </td>
                          <td className="tk-td">
                            <span className={statusBadge(job.status)}>{job.status || "—"}</span>
                          </td>
                        </tr>
                      ))
                    : recent.rows.map((order) => (
                        <tr key={order._id} className="tk-row">
                          <td className="tk-td">
                            <p className="font-medium">{order.userName || "—"}</p>
                            <p className="text-xs text-body-text/60">{order.userEmail || ""}</p>
                          </td>
                          <td className="tk-td">{order.category || "—"}</td>
                          <td className="tk-td-muted">{fmtDate(order.createdAt || order.date)}</td>
                          <td className="tk-td font-semibold">{fmtMoney(order.total)}</td>
                          <td className="tk-td">
                            <span className={statusBadge(order.status)}>{order.status || "—"}</span>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllThing;
