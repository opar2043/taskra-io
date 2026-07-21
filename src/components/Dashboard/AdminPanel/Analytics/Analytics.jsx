import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FiUsers,
  FiBriefcase,
  FiShoppingBag,
  FiFileText,
  FiStar,
  FiUserCheck,
  FiUser,
  FiCalendar,
  FiTrendingUp,
} from "react-icons/fi";
import useLoginUser from "../../../Hooks/useLoginUser";
import useFrelencerStat from "../../../Hooks/useFrelencerStat";
import Loading from "../../../Root/Loading";
import TutorialModal from "../../../DashboardTutorial/TutorialModal";

// Shared dark rounded tooltip bubble (design system chart spec).
const tooltipProps = {
  cursor: { fill: "rgba(20,20,31,0.04)" },
  contentStyle: {
    background: "#14141F",
    border: "none",
    borderRadius: "12px",
    padding: "10px 14px",
    boxShadow: "0 8px 24px rgba(20,20,31,0.25)",
  },
  labelStyle: { color: "#fff", fontWeight: 600, fontSize: 12, marginBottom: 4 },
  itemStyle: { color: "#fff", fontSize: 12 },
};

const axisTick = { fill: "#4B4B57", fontSize: 12 };

const fmtMoney = (n = 0) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n || 0);

const KPIItem = ({ label, value, icon }) => {
  const Icon = icon;
  return (
    <div className="tk-card p-5 flex items-start justify-between gap-3">
      <div>
        <p className="tk-eyebrow">{label}</p>
        <p className="text-2xl font-semibold text-ink mt-2 leading-none">{value}</p>
      </div>
      <div className="w-11 h-11 rounded-xl bg-primary-tint text-primary flex items-center justify-center shrink-0">
        <Icon size={20} />
      </div>
    </div>
  );
};

const StatSmall = ({ label, value, icon }) => {
  const Icon = icon;
  return (
    <div className="tk-card px-5 py-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-primary-tint text-primary flex items-center justify-center shrink-0">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-lg font-semibold text-ink leading-none">{value || 0}</p>
        <p className="tk-eyebrow mt-1">{label}</p>
      </div>
    </div>
  );
};

const Analytics = () => {
  const { currentUser } = useLoginUser();
  const [stats, , isLoading] = useFrelencerStat(currentUser?.email);

  if (isLoading || !stats) return <Loading />;

  // Mock monthly series for the growth chart (no historical endpoint yet —
  // mirrors the original Analytics page).
  const monthlyData = [
    { name: "Jan", revenue: 4000, users: 240 },
    { name: "Feb", revenue: 3000, users: 198 },
    { name: "Mar", revenue: 2000, users: 980 },
    { name: "Apr", revenue: 2780, users: 390 },
    { name: "May", revenue: 1890, users: 480 },
    { name: "Jun", revenue: 2390, users: 380 },
    { name: "Jul", revenue: 3490, users: 430 },
  ];

  const jobCategoryData = [
    { name: "Photography", jobs: stats?.photographyJobs || 0 },
    { name: "Videography", jobs: stats?.videographyJobs || 0 },
    { name: "Both", jobs: stats?.bothJobs || 0 },
  ];

  const orderStatusData = [
    { name: "Confirmed", orders: stats?.confirmedOrders || 0 },
    { name: "Pending", orders: stats?.pendingOrders || 0 },
    { name: "In Progress", orders: stats?.inprogressOrders || 0 },
    { name: "Completed", orders: stats?.completedOrders || 0 },
  ];

  return (
    <div className="tk-page">
      <TutorialModal
        componentName="Analytics"
        title="Welcome to System Analytics"
        description="Get a complete overview of platform performance and growth."
        listItems={[
          "Track revenue, users and order KPIs",
          "Explore growth and acquisition charts",
          "See how jobs are distributed by type",
        ]}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="tk-page-title">System Analytics</h1>
          <p className="text-sm text-body-text mt-1">
            Comprehensive overview of platform performance and growth.
          </p>
        </div>
        <div className="tk-card px-4 py-2 flex items-center gap-2 text-sm font-semibold text-ink">
          <FiCalendar className="text-primary" />
          <span>Last 30 Days</span>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPIItem label="Total Revenue" value={fmtMoney(stats?.totalRevenue)} icon={FiTrendingUp} />
        <KPIItem label="Total Users" value={stats?.totalUsers || 0} icon={FiUsers} />
        <KPIItem label="Total Jobs" value={stats?.totalJobs || 0} icon={FiBriefcase} />
        <KPIItem label="Total Orders" value={stats?.totalOrders || 0} icon={FiShoppingBag} />
      </div>

      {/* Secondary KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatSmall label="Clients" value={stats?.totalClients} icon={FiUser} />
        <StatSmall label="Professionals" value={stats?.totalFreelancers} icon={FiUserCheck} />
        <StatSmall label="Quotes" value={stats?.totalQuotes} icon={FiFileText} />
        <StatSmall label="Reviews" value={stats?.totalReviews} icon={FiStar} />
      </div>

      {/* Revenue growth + jobs by category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 tk-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-ink">Revenue Growth</h3>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-body-text">
              <span className="w-2 h-2 rounded-full bg-primary" /> Revenue (£)
            </span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="tkRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FE6D06" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#FE6D06" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E7E9EE" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} />
                <YAxis axisLine={false} tickLine={false} tick={axisTick} width={44} />
                <Tooltip {...tooltipProps} formatter={(v) => [fmtMoney(v), "Revenue"]} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#FE6D06"
                  strokeWidth={2.5}
                  fill="url(#tkRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="tk-card p-6">
          <h3 className="text-sm font-semibold text-ink mb-6">Jobs by Category</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobCategoryData}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E7E9EE" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} />
                <YAxis axisLine={false} tickLine={false} tick={axisTick} width={32} allowDecimals={false} />
                <Tooltip {...tooltipProps} />
                <Bar dataKey="jobs" fill="#FE6D06" barSize={18} radius={[12, 12, 12, 12]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-line-app flex justify-around">
            <div className="text-center">
              <p className="tk-eyebrow">Pending</p>
              <p className="text-sm font-semibold text-ink mt-1">{stats?.pendingJobs || 0}</p>
            </div>
            <div className="text-center">
              <p className="tk-eyebrow">Open</p>
              <p className="text-sm font-semibold text-ink mt-1">{stats?.openJobs || 0}</p>
            </div>
            <div className="text-center">
              <p className="tk-eyebrow">Finished</p>
              <p className="text-sm font-semibold text-ink mt-1">{stats?.completedJobs || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders status + user acquisition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tk-card p-6">
          <h3 className="text-sm font-semibold text-ink mb-6">Orders by Status</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderStatusData}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E7E9EE" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} />
                <YAxis axisLine={false} tickLine={false} tick={axisTick} width={32} allowDecimals={false} />
                <Tooltip {...tooltipProps} />
                <Bar dataKey="orders" fill="#FE6D06" barSize={18} radius={[12, 12, 12, 12]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="tk-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-ink">User Acquisition</h3>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-body-text">
              <span className="w-2 h-2 rounded-full bg-ink" /> New users
            </span>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E7E9EE" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} />
                <YAxis axisLine={false} tickLine={false} tick={axisTick} width={40} allowDecimals={false} />
                <Tooltip {...tooltipProps} />
                <Bar dataKey="users" fill="#14141F" barSize={14} radius={[12, 12, 12, 12]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Footer strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatSmall label="New Users Today" value={stats?.newUsersToday} icon={FiUsers} />
        <StatSmall label="Today Revenue" value={fmtMoney(stats?.todayRevenue)} icon={FiTrendingUp} />
        <StatSmall label="Conversations" value={stats?.totalConversations} icon={FiFileText} />
        <StatSmall label="Messages" value={stats?.totalMessages} icon={FiFileText} />
      </div>
    </div>
  );
};

export default Analytics;
