import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FiTrendingUp,
  FiCalendar,
  FiCheckCircle,
  FiBarChart2,
  FiFileText,
  FiArrowUp,
} from "react-icons/fi";
import { FaMoneyBillWave, FaHistory } from "react-icons/fa";
import useAuth from "../../../Hooks/useAuth";
import useLoginUser from "../../../Hooks/useLoginUser";
import useFrelencerStat from "../../../Hooks/useFrelencerStat";
import useOrders from "../../../Hooks/useOrders";
import Loading from "../../../Root/Loading";
import TutorialModal from "../../../DashboardTutorial/TutorialModal";

const fmtMoney = (n = 0) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);

/* Dark rounded tooltip (shared chart style from the design system) */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-line-app text-ink rounded-xl px-4 py-3 shadow-lift text-xs space-y-1.5">
      <p className="font-semibold text-body-text/70 uppercase tracking-wide">
        {label}
      </p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="flex items-center gap-2 font-semibold">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: {fmtMoney(entry.value)}
        </p>
      ))}
    </div>
  );
};

const Earning = () => {
  const { user } = useAuth();
  const { currentUser } = useLoginUser() || {};
  const [stats, , statsLoading] = useFrelencerStat(user?.email);
  const [orders, , ordersLoading] = useOrders();

  // Orders that belong to me (the professional on the order item)
  const myOrders = useMemo(() => {
    if (!Array.isArray(orders) || !currentUser?._id) return [];
    return orders
      .filter((o) => o?.item?.freelancerId === currentUser._id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, currentUser]);

  // Last 6 months: total earnings (primary) vs average order value (comparison)
  const chartData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        month: d.toLocaleDateString("en-GB", { month: "short" }),
        earnings: 0,
        count: 0,
      });
    }
    myOrders.forEach((o) => {
      const d = new Date(o.createdAt);
      const bucket = months.find(
        (m) => m.key === `${d.getFullYear()}-${d.getMonth()}`
      );
      if (bucket) {
        bucket.earnings += Number(o.total) || 0;
        bucket.count += 1;
      }
    });
    return months.map((m) => ({
      month: m.month,
      earnings: Math.round(m.earnings),
      avgOrder: m.count ? Math.round(m.earnings / m.count) : 0,
    }));
  }, [myOrders]);

  if (statsLoading || ordersLoading) return <Loading />;

  const cards = [
    {
      label: "Total Earnings",
      value: fmtMoney(stats?.totalEarnings),
      icon: FaMoneyBillWave,
      trend: "Lifetime income",
    },
    {
      label: "Average Order",
      value: fmtMoney(stats?.averageOrderValue),
      icon: FiTrendingUp,
      trend: "Per project average",
    },
    {
      label: "Today's Earnings",
      value: fmtMoney(stats?.todayEarnings),
      icon: FiCalendar,
      trend: "Earnings for today",
    },
    {
      label: "Completed Projects",
      value: stats?.completedProjects || 0,
      icon: FiCheckCircle,
      trend: "Total successfully delivered",
    },
  ];

  return (
    <div className="tk-page">
      <TutorialModal
        componentName="Earning"
        title="Welcome to the Earnings Dashboard"
        description="This is where you can track all your financial metrics, income, and payment history securely."
        listItems={[
          "View your lifetime and daily earnings",
          "Check average order values",
          "Manage your payouts and transactions",
        ]}
      />

      {/* Header */}
      <div className="tk-card p-4 md:p-5">
        <h1 className="tk-page-title">Earnings Overview</h1>
        <p className="text-sm text-body-text mt-1">
          Track your income, project value, and payment history.
        </p>
      </div>

      {/* KPI stat row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <div key={idx} className="tk-card p-5 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-xl bg-primary-tint flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <card.icon className="text-primary text-lg" />
            </div>
            <p className="text-2xl font-semibold text-ink mb-1">{card.value}</p>
            <p className="text-xs text-body-text/80">{card.label}</p>
            <p className="text-[11px] text-body-text/60 mt-2">{card.trend}</p>
          </div>
        ))}
      </div>

      {/* Chart row */}
      <div className="tk-card p-5 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-ink flex items-center gap-2">
              <FiBarChart2 className="text-primary" />
              Monthly Income
            </h3>
            <p className="text-xs text-body-text/70 mt-0.5">
              Earnings vs average order value, last 6 months
            </p>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={6}>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="#E7E9EE"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#4B4B57", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#4B4B57", fontSize: 12 }}
                tickFormatter={(v) => `£${v}`}
                width={56}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "rgba(20,20,31,0.04)" }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, color: "#4B4B57" }}
              />
              {/* Capsule bars: primary orange series + ink comparison series */}
              <Bar
                dataKey="earnings"
                name="Earnings"
                fill="#FE6D06"
                radius={[12, 12, 12, 12]}
                barSize={14}
              />
              <Bar
                dataKey="avgOrder"
                name="Avg order value"
                fill="#14141F"
                radius={[12, 12, 12, 12]}
                barSize={14}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent income table */}
        <div className="lg:col-span-2 tk-card overflow-hidden">
          <div className="px-6 py-4 border-b border-line-app flex justify-between items-center bg-app-bg/60">
            <h3 className="tk-section-title flex items-center gap-2">
              <FaHistory className="text-primary" />
              Recent Income
            </h3>
          </div>
          {myOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="tk-table">
                <thead className="tk-thead">
                  <tr>
                    <th className="tk-th">Client</th>
                    <th className="tk-th">Category</th>
                    <th className="tk-th text-center">Date</th>
                    <th className="tk-th text-center">Amount</th>
                    <th className="tk-th text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myOrders.slice(0, 8).map((order) => (
                    <tr key={order._id} className="tk-row">
                      <td className="tk-td font-semibold">
                        {order.userName || order.userEmail}
                      </td>
                      <td className="tk-td">
                        <span className="tk-badge-neutral">
                          {order.category || "Project"}
                        </span>
                      </td>
                      <td className="tk-td text-center whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="tk-td text-center font-semibold">
                        {fmtMoney(Number(order.total) || 0)}
                      </td>
                      <td className="tk-td text-right">
                        <span
                          className={
                            order.status === "completed" ||
                            order.status === "confirmed"
                              ? "tk-badge-success"
                              : order.status === "cancelled"
                              ? "tk-badge-error"
                              : "tk-badge-warning"
                          }
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-body-text/70">
              <FiFileText className="text-4xl mx-auto mb-3 opacity-20" />
              <p className="text-sm">
                Detailed transaction history will appear once you complete your
                next order.
              </p>
            </div>
          )}
        </div>

        {/* Payout method / tips */}
        <div className="space-y-6">
          <div className="bg-white border border-line-app text-ink p-6 rounded-2xl shadow-soft relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-semibold text-lg mb-2 text-ink">Payout Method</h3>
              <p className="text-sm text-body-text mb-4">
                Your current payout method is set to Mollie Pay.
              </p>
              <div className="bg-app-bg p-3 rounded-xl border border-line-app">
                <p className="text-xs font-mono text-ink">XXXX-XXXX-XXXX-4242</p>
              </div>
              <button className="mt-6 w-full py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors">
                Manage Payouts
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
          </div>

          <div className="bg-primary-tint border border-primary/15 p-6 rounded-2xl">
            <h4 className="font-semibold text-ink text-sm flex items-center gap-2 mb-2">
              <FiArrowUp className="text-primary" />
              Boost Your Earnings
            </h4>
            <p className="text-xs text-body-text leading-relaxed">
              Professionals with a complete portfolio and at least 5 reviews earn
              up to 40% more per project.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earning;
