import React, { useState, useMemo } from "react";
import {
  FiCalendar,
  FiFilter,
  FiSearch,
  FiUser,
  FiCheckCircle,
} from "react-icons/fi";
import { FaCheckDouble, FaProjectDiagram } from "react-icons/fa";
import useInboxQuote from "../../../Hooks/useInboxQuote";
import useLoginUser from "../../../Hooks/useLoginUser";
import Loading from "../../../Root/Loading";
import TutorialModal from "../../../DashboardTutorial/TutorialModal";

const CompleteProject = () => {
  const [inboxquote, , isLoading] = useInboxQuote();
  const { currentUser } = useLoginUser() || {};

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  // Completed = pipeline cards paid & confirmed ("confirm" status)
  const completedProjectsList = useMemo(() => {
    if (!Array.isArray(inboxquote)) return [];
    return inboxquote.filter(
      (p) => p.freelancerId === currentUser?._id && p.status === "confirm"
    );
  }, [inboxquote, currentUser]);

  const filteredProjects = useMemo(() => {
    let filtered = [...completedProjectsList];
    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.requirement?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const now = new Date();
    if (dateFilter === "today") {
      filtered = filtered.filter(
        (project) =>
          new Date(project.createdAt).toDateString() === now.toDateString()
      );
    } else if (dateFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(
        (project) => new Date(project.createdAt) >= weekAgo
      );
    } else if (dateFilter === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(
        (project) => new Date(project.createdAt) >= monthAgo
      );
    }
    return filtered;
  }, [completedProjectsList, searchTerm, dateFilter]);

  const totalValue = filteredProjects.reduce(
    (sum, project) => sum + Number(project.price || 0),
    0
  );

  if (isLoading) return <Loading />;

  return (
    <div className="tk-page">
      <TutorialModal
        componentName="CompleteProject"
        title="Welcome to Completed Projects"
        description="This is where you will find the history of all the partnerships you have successfully completed."
        listItems={[
          "Review past projects",
          "Check total assets from completed projects",
          "Filter records by timeline",
        ]}
      />

      {/* Header */}
      <div className="tk-card p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="tk-page-title flex items-center gap-2">
            <FaCheckDouble className="text-primary" />
            Completed Projects
          </h1>
          <p className="tk-eyebrow mt-1">
            Full record of successfully completed partnerships.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right border-r border-line-app pr-6 mr-2 hidden sm:block">
            <p className="tk-eyebrow mb-1">Total Assets</p>
            <p className="text-xl font-semibold text-ink leading-none">
              £{totalValue.toLocaleString()}
            </p>
          </div>
          <span className="tk-badge-info text-sm px-4 py-2">
            <FaProjectDiagram /> {completedProjectsList.length} Finished
          </span>
        </div>
      </div>

      {/* Control strip */}
      <div className="tk-card p-4 flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <div className="relative flex-1 w-full group">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-body-text/40 z-10 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search archive by client..."
            className="tk-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 tk-eyebrow whitespace-nowrap">
            <FiFilter /> Period
          </div>
          <select
            className="tk-input w-auto cursor-pointer"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Past Seven Days</option>
            <option value="month">Current Month</option>
          </select>
        </div>
      </div>

      {/* Catalogue */}
      <div className="tk-table-wrap min-h-[400px]">
        {filteredProjects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="tk-table">
              <thead className="tk-thead">
                <tr>
                  <th className="tk-th w-12 text-center">SL</th>
                  <th className="tk-th">Client</th>
                  <th className="tk-th">Requirement</th>
                  <th className="tk-th text-center">Completion</th>
                  <th className="tk-th text-center">Earnings</th>
                  <th className="tk-th text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project, idx) => (
                  <tr key={project._id} className="tk-row group">
                    <td className="tk-td text-center text-body-text/60">
                      {idx + 1}
                    </td>
                    <td className="tk-td">
                      <div className="flex items-center gap-3">
                        {project.clientPhoto ? (
                          <img
                            src={project.clientPhoto}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border border-line-app"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-app-bg flex items-center justify-center text-body-text/40 border border-line-app group-hover:bg-primary-tint group-hover:text-primary transition-colors">
                            <FiUser size={13} />
                          </div>
                        )}
                        <p className="text-sm font-semibold text-ink leading-none">
                          {project.clientName}
                        </p>
                      </div>
                    </td>
                    <td className="tk-td">
                      <p className="text-sm text-body-text line-clamp-1 max-w-sm">
                        {project.requirement || "Service Fulfillment"}
                      </p>
                    </td>
                    <td className="tk-td text-center">
                      <div className="flex items-center justify-center gap-2 text-sm text-body-text whitespace-nowrap">
                        <FiCalendar className="text-body-text/40" size={11} />
                        {new Date(
                          project.updatedAt || project.timeline
                        ).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="tk-td text-center">
                      <p className="font-semibold text-ink">£{project.price}</p>
                    </td>
                    <td className="tk-td text-right">
                      <span className="tk-badge-success">
                        <FiCheckCircle /> Paid
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 bg-app-bg rounded-full flex items-center justify-center mb-6 border border-line-app">
              <FaCheckDouble className="text-3xl text-body-text/30" />
            </div>
            <h3 className="text-lg font-semibold text-body-text">
              No Completed Projects Yet
            </h3>
            <p className="text-sm text-body-text/70 mt-1">
              Confirmed and paid projects will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompleteProject;
