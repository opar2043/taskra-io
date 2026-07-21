import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiClock,
  FiSearch,
  FiUser,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";
import {
  FaSortAmountDown,
  FaSortAmountUp,
  FaFileContract,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import useInboxQuote from "../../../Hooks/useInboxQuote";
import useLoginUser from "../../../Hooks/useLoginUser";
import useAxios from "../../../Hooks/useAxios";
import { confirmToast } from "../../../utils/toastConfirm";
import Loading from "../../../Root/Loading";
import TutorialModal from "../../../DashboardTutorial/TutorialModal";

const PendingProject = () => {
  const [inboxquote, refetch, isLoading] = useInboxQuote() || [];
  const { currentUser } = useLoginUser() || {};
  const axiosSecure = useAxios();
  const [searchTerm, setSearchTerm] = useState("");
  const [priceSort, setPriceSort] = useState("default");

  // Active pipeline: pending / accepted / inprogress cards belonging to me
  const pending = useMemo(() => {
    if (!Array.isArray(inboxquote)) return [];
    return inboxquote.filter(
      (p) =>
        p.freelancerId === currentUser?._id &&
        (p.status === "pending" ||
          p.status === "inprogress" ||
          p.status === "accepted")
    );
  }, [inboxquote, currentUser]);

  const filteredProjects = useMemo(() => {
    let filtered = [...pending];
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p._id.includes(searchTerm)
      );
    }
    if (priceSort === "low-high")
      filtered.sort((a, b) => Number(a.price) - Number(b.price));
    if (priceSort === "high-low")
      filtered.sort((a, b) => Number(b.price) - Number(a.price));
    return filtered;
  }, [pending, searchTerm, priceSort]);

  const handleStatusUpdate = async (project) => {
    const nextStatusMap = {
      accepted: "inprogress",
      inprogress: "complete",
      pending: "accepted",
    };
    const nextStatus = nextStatusMap[project.status] || "inprogress";
    const statusLabel =
      nextStatus === "inprogress" ? "Start Production" : "Mark as Complete";

    if (
      await confirmToast({
        title: "Update Project Status?",
        message: `Moving this project to "${statusLabel}". The client will be notified by email automatically.`,
        confirmText: "Confirm",
        danger: true,
      })
    ) {
      try {
        await axiosSecure.patch(`/inbox-quote/${project._id}`, {
          status: nextStatus,
        });
        // accepted / inprogress / complete / confirm all auto-email the client
        toast.success("Status updated — client emailed automatically.");
        refetch();
      } catch {
        toast.error("Operation failed");
      }
    }
  };

  const StatusBadge = ({ status }) => {
    if (status === "accepted")
      return (
        <span className="tk-badge-success">
          <FiCheckCircle /> Contract Signed
        </span>
      );
    if (status === "inprogress")
      return (
        <span className="tk-badge-info">
          <FiClock /> In Production
        </span>
      );
    if (status === "completed" || status === "confirm")
      return (
        <span className="tk-badge-success">
          <FiCheckCircle /> Project Completed
        </span>
      );
    return (
      <span className="tk-badge-warning">
        <FiClock /> Pending Review
      </span>
    );
  };

  const ActionButton = ({ project }) => {
    if (project.status === "completed" || project.status === "confirm")
      return (
        <Link to="/dashboard/invoice" className="tk-btn-primary">
          <FaFileInvoiceDollar size={12} /> View Invoice
        </Link>
      );
    return (
      <button
        disabled={project.status === "pending"}
        onClick={() => handleStatusUpdate(project)}
        className={
          project.status === "pending"
            ? "tk-btn-secondary opacity-60 cursor-not-allowed"
            : project.status === "inprogress"
            ? "tk-btn-dark"
            : "tk-btn-primary"
        }
      >
        {project.status === "accepted"
          ? "Start Production"
          : project.status === "inprogress"
          ? "Mark Complete"
          : "Awaiting Sign"}
        {project.status !== "pending" && <FiArrowRight size={12} />}
      </button>
    );
  };

  if (isLoading) return <Loading />;

  return (
    <div className="tk-page">
      <TutorialModal
        componentName="PendingProject"
        title="Welcome to Project Pipeline"
        description="This is where you will find all your pending or active projects. You can manage their statuses and move them through your workflow."
        listItems={[
          "Accept new proposals",
          "Start production on projects",
          "Mark projects as completed",
        ]}
      />

      {/* Stats header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="tk-card p-4 md:p-6">
          <p className="tk-eyebrow mb-1">Active Pipeline</p>
          <p className="text-2xl font-semibold text-ink">{pending.length}</p>
        </div>
        <div className="tk-card p-4 md:p-6">
          <p className="tk-eyebrow mb-1">Signed</p>
          <p className="text-2xl font-semibold text-primary">
            {pending.filter((p) => p.status === "accepted").length}
          </p>
        </div>
        <div className="tk-card p-4 md:p-6 col-span-2 flex items-center justify-between">
          <div>
            <h1 className="tk-page-title">Project Pipeline</h1>
            <p className="tk-eyebrow mt-1">Studio workflow mode active</p>
          </div>
          <FaFileContract className="text-2xl md:text-3xl text-body-text/20" />
        </div>
      </div>

      {/* Control bar */}
      <div className="tk-card p-4 flex flex-col sm:flex-row gap-3 md:gap-4">
        <div className="relative flex-1 group">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-body-text/40 text-sm transition-colors group-focus-within:text-primary z-10" />
          <input
            type="text"
            placeholder="Search projects or clients..."
            className="tk-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() =>
            setPriceSort(priceSort === "low-high" ? "high-low" : "low-high")
          }
          className="tk-btn-secondary"
        >
          Sort Price{" "}
          {priceSort === "low-high" ? <FaSortAmountUp /> : <FaSortAmountDown />}
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block tk-table-wrap min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="tk-table">
            <thead className="tk-thead">
              <tr>
                <th className="tk-th w-12 text-center">#</th>
                <th className="tk-th">Client & Agreement</th>
                <th className="tk-th text-center">Status</th>
                <th className="tk-th text-center">Timeline</th>
                <th className="tk-th text-center">Value</th>
                <th className="tk-th text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, idx) => (
                  <tr key={project._id} className="tk-row">
                    <td className="tk-td text-center text-body-text/40">
                      {idx + 1}
                    </td>
                    <td className="tk-td">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 font-semibold text-ink">
                          <FiUser className="text-primary/50 shrink-0" size={13} />
                          {project.clientName}
                        </div>
                        <span className="text-xs text-body-text/60 font-mono mt-1 uppercase">
                          ID: #{project._id.slice(-12).toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="tk-td text-center">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="tk-td text-center">
                      <span className="text-sm text-body-text">
                        {new Date(project.timeline).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="tk-td text-center">
                      <span className="font-semibold text-ink">
                        £{project.price}
                      </span>
                    </td>
                    <td className="tk-td text-right">
                      <div className="flex justify-end">
                        <ActionButton project={project} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4 text-body-text/30">
                      <FaFileContract size={64} />
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-body-text/60">
                        Pipeline Empty
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 sm:hidden">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project, idx) => (
            <div key={project._id} className="tk-card overflow-hidden">
              <div className="px-4 py-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-body-text/40">
                      #{idx + 1}
                    </span>
                    <FiUser className="text-primary/50 shrink-0" size={12} />
                    <span className="text-sm font-semibold text-ink truncate">
                      {project.clientName}
                    </span>
                  </div>
                  <p className="text-[10px] text-body-text/60 font-mono uppercase mt-1 pl-8">
                    #{project._id.slice(-12).toUpperCase()}
                  </p>
                </div>
                <StatusBadge status={project.status} />
              </div>

              <div className="border-t border-line-app px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-body-text">
                  <FiClock size={12} />
                  <span className="text-xs">
                    {new Date(project.timeline).toLocaleDateString()}
                  </span>
                </div>
                <span className="font-semibold text-ink">£{project.price}</span>
              </div>

              <div className="border-t border-line-app px-4 py-3">
                <ActionButton project={project} />
              </div>
            </div>
          ))
        ) : (
          <div className="tk-card py-20 text-center">
            <div className="flex flex-col items-center gap-4 text-body-text/30">
              <FaFileContract size={48} />
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-body-text/60">
                Pipeline Empty
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingProject;
