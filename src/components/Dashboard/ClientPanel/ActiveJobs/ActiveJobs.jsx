import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaClock,
  FaCreditCard,
  FaFileInvoiceDollar,
  FaSearch,
  FaSignature,
} from "react-icons/fa";
import useInboxQuote from "../../../Hooks/useInboxQuote";
import useLoginUser from "../../../Hooks/useLoginUser";
import QuoteModal from "../../../Chat/QuoteModal";
import NoData from "../../../utils/NoData";
import Loading from "../../../Root/Loading";
import TutorialModal from "../../../DashboardTutorial/TutorialModal";

const statusBadge = (status) => {
  if (status === "accepted" || status === "confirm") return "tk-badge-success";
  if (status === "pending") return "tk-badge-warning";
  if (status === "completed") return "tk-badge-info";
  return "tk-badge-neutral";
};

const statusLabel = (status) => {
  if (status === "accepted" || status === "confirm") return "Executed";
  if (status === "pending") return "Signature Required";
  if (status === "completed") return "Completed";
  return status;
};

const ActiveJobs = () => {
  const [inboxquote, , isLoading] = useInboxQuote() || [];
  const { currentUser, isLoading: userLoading } = useLoginUser();
  const navigate = useNavigate();
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceSort, setPriceSort] = useState("default");

  // Client's projects come from the CRM pipeline (inbox-quote), matched by clientId
  const pending = useMemo(() => {
    return inboxquote?.filter((p) => p.clientId == currentUser?._id) || [];
  }, [inboxquote, currentUser]);

  const filteredProjects = useMemo(() => {
    let filtered = [...pending];
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.requirement?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (priceSort === "low-high")
      filtered.sort((a, b) => Number(a.price) - Number(b.price));
    if (priceSort === "high-low")
      filtered.sort((a, b) => Number(b.price) - Number(a.price));
    return filtered;
  }, [pending, searchTerm, priceSort]);

  if (isLoading || userLoading) {
    return <Loading />;
  }

  const renderAction = (project, fullWidth = false) => {
    const width = fullWidth ? " w-full" : "";
    if (project.status === "pending") {
      return (
        <button
          onClick={() => {
            setSelectedQuote(project);
            setIsQuoteModalOpen(true);
          }}
          className={`tk-btn-primary${width}`}
        >
          <FaSignature /> Sign &amp; Pay
        </button>
      );
    }
    if (project.status === "accepted" || project.status === "inprogress") {
      return (
        <Link to={`/payment/${project._id}`} className={`tk-btn-primary${width}`}>
          <FaCreditCard /> Pay &amp; Start
        </Link>
      );
    }
    if (project.status === "completed" || project.status === "confirm") {
      return (
        <Link to="/dashboard/invoice" className={`tk-btn-secondary${width}`}>
          <FaFileInvoiceDollar size={14} /> View Invoice
        </Link>
      );
    }
    return (
      <span className="text-xs font-medium text-body-text/50 italic">
        Workflow Locked
      </span>
    );
  };

  return (
    <div className="tk-page">
      <TutorialModal
        componentName="ActiveJobs"
        title="Welcome to your Client Portal"
        description="Track every project you have hired for and stay on top of what needs your attention."
        listItems={[
          "Monitor the status of active agreements",
          "Sign quotes and complete payments",
          "View invoices for finished projects",
        ]}
      />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <p className="tk-eyebrow">
            Manage your active agreements and production
          </p>
          <h1 className="tk-page-title">Client Portal</h1>
        </div>
        <div className="tk-card px-8 py-4 text-center">
          <p className="tk-eyebrow mb-1">Active Projects</p>
          <p className="text-2xl font-semibold text-primary">{pending.length}</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="tk-card p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-body-text/40" />
          <input
            type="text"
            placeholder="Search your projects..."
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
          Value Sort{" "}
          {priceSort === "low-high" ? "↑" : priceSort === "high-low" ? "↓" : ""}
        </button>
      </div>

      {filteredProjects.length === 0 ? (
        <NoData
          title="No active projects"
          message={
            searchTerm
              ? "No projects match your search. Try a different keyword."
              : "Projects appear here once a professional sends you a quote through the pipeline."
          }
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block tk-table-wrap">
            <div className="overflow-x-auto">
              <table className="tk-table">
                <thead>
                  <tr className="tk-thead">
                    <th className="tk-th">Agreement Ref</th>
                    <th className="tk-th">Project Details</th>
                    <th className="tk-th text-center">Status</th>
                    <th className="tk-th text-center">Value</th>
                    <th className="tk-th text-right">Portal Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr key={project._id} className="tk-row group">
                      <td className="tk-td">
                        <span className="text-xs font-mono font-semibold text-body-text/70">
                          #{project._id?.slice(-12).toUpperCase()}
                        </span>
                        <p className="text-[11px] text-primary font-medium mt-1">
                          Digital Contract Active
                        </p>
                      </td>
                      <td className="tk-td">
                        <div className="flex flex-col gap-1 max-w-xs">
                          <span className="text-sm font-semibold text-ink group-hover:text-primary transition-colors">
                            {project.requirement?.slice(0, 60)}...
                          </span>
                          <span className="text-xs text-body-text/70">
                            By Professional ID: {project.freelancerId?.slice(-6)}
                          </span>
                        </div>
                      </td>
                      <td className="tk-td text-center">
                        <span className={statusBadge(project.status)}>
                          {project.status === "accepted" ||
                          project.status === "confirm" ? (
                            <FaCheckCircle />
                          ) : (
                            <FaClock />
                          )}
                          {statusLabel(project.status)}
                        </span>
                      </td>
                      <td className="tk-td text-center font-semibold text-ink">
                        £{parseFloat(project.price).toLocaleString()}
                      </td>
                      <td className="tk-td text-right">
                        <div className="flex justify-end">
                          {renderAction(project)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredProjects.map((project) => (
              <div key={project._id} className="tk-card p-5">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[11px] font-medium text-primary">
                    Project Ref #{project._id?.slice(-6).toUpperCase()}
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    £{parseFloat(project.price).toLocaleString()}
                  </span>
                </div>
                <div className="mb-3">
                  <span className={statusBadge(project.status)}>
                    {statusLabel(project.status)}
                  </span>
                </div>
                <p className="text-sm text-body-text mb-4 leading-relaxed">
                  {project.requirement}
                </p>
                {renderAction(project, true)}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Signature Modal — signing continues straight into payment */}
      {isQuoteModalOpen && selectedQuote && (
        <QuoteModal
          quote={selectedQuote}
          onClose={() => {
            setIsQuoteModalOpen(false);
            setSelectedQuote(null);
          }}
          onSigned={(signed) => {
            setIsQuoteModalOpen(false);
            setSelectedQuote(null);
            navigate(`/payment/${signed._id}`);
          }}
        />
      )}
    </div>
  );
};

export default ActiveJobs;
