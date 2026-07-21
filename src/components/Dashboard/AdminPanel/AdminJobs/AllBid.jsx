import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiMapPin,
  FiCalendar,
  FiTrash2,
  FiEye,
  FiSearch,
} from "react-icons/fi";
import useQuote from "../../../Hooks/useQuote";
import useAxios from "../../../Hooks/useAxios";
import { confirmToast } from "../../../utils/toastConfirm";
import NoData from "../../../utils/NoData";
import Loading from "../../../Root/Loading";
import TutorialModal from "../../../DashboardTutorial/TutorialModal";

const AllProposal = () => {
  const [quote, refetch, isLoading] = useQuote();
  const axiosSecure = useAxios();
  const [search, setSearch] = useState("");

  if (isLoading) return <Loading />;

  const filtered = (quote || []).filter(
    (proposal) =>
      !search ||
      proposal.job?.title?.toLowerCase().includes(search.toLowerCase()) ||
      proposal.job?.category?.toLowerCase().includes(search.toLowerCase()) ||
      proposal.freelancer_location?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRemove = async (id) => {
    if (
      await confirmToast({
        title: "Are you sure?",
        message: "This proposal will be removed.",
        confirmText: "Yes, delete",
        danger: true,
      })
    ) {
      try {
        const res = await axiosSecure.delete(`/quote/${id}`);
        if (res.data.deletedCount > 0) {
          toast.success("Proposal removed.");
          refetch();
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Could not remove proposal."
        );
      }
    }
  };

  return (
    <div className="tk-page">
      <TutorialModal
        componentName="AllBid"
        title="Welcome to Proposals Received"
        description="Review every proposal and bid submitted across the marketplace."
        listItems={[
          "Search and filter all bids",
          "Inspect proposal amounts and details",
          "Remove proposals that are invalid",
        ]}
      />

      {/* Search & Header Row */}
      <div className="tk-card p-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <p className="tk-eyebrow">Manage and review all marketplace bids.</p>
          <h1 className="tk-page-title">Proposals Received</h1>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-body-text/50 text-sm z-10" />
            <input
              type="text"
              placeholder="Search bids..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="tk-input w-full pl-9"
            />
          </div>
          <span className="tk-badge-info shrink-0">{filtered.length} Total</span>
        </div>
      </div>

      {/* Main Table */}
      {filtered.length === 0 ? (
        <NoData
          title="No proposals in system"
          message="No bids match the current search."
        />
      ) : (
        <div className="tk-table-wrap">
          <div className="overflow-x-auto">
            <table className="tk-table">
              <thead className="tk-thead">
                <tr>
                  <th className="tk-th">Project Details</th>
                  <th className="tk-th">Category</th>
                  <th className="tk-th text-center">Amount</th>
                  <th className="tk-th text-center">Date</th>
                  <th className="tk-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((proposal) => (
                  <tr key={proposal._id} className="tk-row">
                    <td className="tk-td">
                      <div className="space-y-1">
                        <p className="font-semibold text-ink whitespace-nowrap">
                          {proposal.job?.title || "N/A"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-body-text/70">
                          <FiMapPin className="text-primary shrink-0" />
                          <span>{proposal.freelancer_location || "UK"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="tk-td">
                      <span className="tk-badge-info">
                        {proposal.job?.category || "Service"}
                      </span>
                    </td>
                    <td className="tk-td text-center">
                      <p className="font-semibold text-ink">£{proposal.bid}</p>
                      <p className="text-[10px] font-medium text-body-text/60 uppercase">
                        Fixed Bid
                      </p>
                    </td>
                    <td className="tk-td text-center">
                      <div className="flex items-center justify-center gap-1 text-xs text-body-text/70 whitespace-nowrap">
                        <FiCalendar className="shrink-0" />
                        {proposal.createdAt
                          ? new Date(proposal.createdAt).toLocaleDateString("en-GB")
                          : "—"}
                      </div>
                    </td>
                    <td className="tk-td text-right">
                      <div className="flex justify-end gap-2">
                        {proposal.job?._id ? (
                          <Link
                            to={`/view-jobs/${proposal.job._id}`}
                            className="tk-icon-btn text-primary"
                            title="View job"
                          >
                            <FiEye size={15} />
                          </Link>
                        ) : (
                          <button className="tk-icon-btn text-primary" title="View">
                            <FiEye size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(proposal._id)}
                          className="tk-icon-btn text-danger-text"
                          title="Delete"
                        >
                          <FiTrash2 size={15} />
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
    </div>
  );
};

export default AllProposal;
