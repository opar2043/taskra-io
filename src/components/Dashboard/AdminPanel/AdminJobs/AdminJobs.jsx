import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiBriefcase,
  FiTrash2,
  FiEye,
  FiSearch,
  FiMapPin,
  FiCalendar,
} from "react-icons/fi";
import useJobs from "../../../Hooks/useJobs";
import useAxios from "../../../Hooks/useAxios";
import { confirmToast } from "../../../utils/toastConfirm";
import NoData from "../../../utils/NoData";
import Loading from "../../../Root/Loading";
import TutorialModal from "../../../DashboardTutorial/TutorialModal";

const STATUS_OPTIONS = ["open", "pending", "completed", "cancelled"];

const statusBadge = (status) => {
  const map = {
    open: "tk-badge-info",
    pending: "tk-badge-warning",
    completed: "tk-badge-success",
    cancelled: "tk-badge-error",
  };
  return map[status?.toLowerCase()] || "tk-badge-neutral";
};

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const AdminJobs = () => {
  const [jobs, refetch, isLoading] = useJobs();
  const axiosSecure = useAxios();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  if (isLoading) return <Loading />;

  const filtered = (jobs || [])
    .filter((job) => {
      if (statusFilter === "all") return true;
      return (job.status || "open").toLowerCase() === statusFilter;
    })
    .filter(
      (job) =>
        !search ||
        job.title?.toLowerCase().includes(search.toLowerCase()) ||
        job.category?.toLowerCase().includes(search.toLowerCase()) ||
        job.location?.toLowerCase().includes(search.toLowerCase()) ||
        job.email?.toLowerCase().includes(search.toLowerCase())
    );

  const handleStatusChange = async (job, status) => {
    if (!status || status === job.status) return;
    try {
      await axiosSecure.patch(`/jobs/${job._id}`, { status });
      toast.success(`Job marked as ${status}.`);
      refetch();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update job status."
      );
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (
      await confirmToast({
        title: "Delete this job?",
        message: "This listing will be permanently removed from the marketplace.",
        confirmText: "Yes, delete it!",
        danger: true,
      })
    ) {
      try {
        await axiosSecure.delete(`/jobs/${jobId}`);
        refetch();
        toast.success("Job has been removed.");
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to delete job."
        );
      }
    }
  };

  return (
    <div className="tk-page">
      <TutorialModal
        componentName="AdminJobs"
        title="Welcome to Marketplace Jobs"
        description="Moderate every job listing posted across the platform from this console."
        listItems={[
          "Search and browse all active listings",
          "Change listing status inline",
          "Remove listings that break the rules",
        ]}
      />

      {/* Header / control bar */}
      <div className="tk-card p-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <p className="tk-eyebrow">Moderation console for all listings.</p>
          <h1 className="tk-page-title flex items-center gap-2">
            <FiBriefcase className="text-primary" />
            Marketplace Jobs
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-body-text/50 z-10" />
            <input
              type="text"
              placeholder="Find a job..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="tk-input w-full pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="tk-input sm:w-40 capitalize"
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
          <span className="tk-badge-neutral self-center shrink-0">
            {filtered.length} Listed
          </span>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <NoData
          title="No jobs found"
          message="No listings match the current search and filter."
        />
      ) : (
        <div className="tk-table-wrap">
          <div className="overflow-x-auto">
            <table className="tk-table">
              <thead className="tk-thead">
                <tr>
                  <th className="tk-th">Job Information</th>
                  <th className="tk-th">Category</th>
                  <th className="tk-th">Budget</th>
                  <th className="tk-th">Location</th>
                  <th className="tk-th">Timeline</th>
                  <th className="tk-th">Status</th>
                  <th className="tk-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((job) => (
                  <tr key={job._id} className="tk-row">
                    <td className="tk-td">
                      <div className="space-y-1">
                        <p className="font-semibold text-ink whitespace-nowrap">{job.title}</p>
                        <p className="text-[10px] font-semibold text-body-text/60 uppercase tracking-widest">
                          ID: {job._id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                    </td>
                    <td className="tk-td">
                      <span className="tk-badge-info">{job.category || "General"}</span>
                    </td>
                    <td className="tk-td">
                      <p className="font-semibold text-ink leading-tight">
                        £{job.price?.toLocaleString() || "0"}
                      </p>
                      <p className="text-[10px] text-body-text/60 font-medium">GBP Total</p>
                    </td>
                    <td className="tk-td">
                      <div className="flex items-center gap-1.5 text-body-text">
                        <FiMapPin className="shrink-0" />
                        {job.location || "Remote"}
                      </div>
                    </td>
                    <td className="tk-td">
                      <div className="flex items-center gap-1.5 text-body-text whitespace-nowrap">
                        <FiCalendar className="shrink-0" />
                        {job.eventDate ? formatDate(job.eventDate) : "TBD"}
                      </div>
                    </td>
                    <td className="tk-td">
                      <div className="flex flex-col gap-1.5">
                        <span className={`${statusBadge(job.status || "open")} capitalize w-fit`}>
                          {job.status || "open"}
                        </span>
                        <select
                          value={job.status || "open"}
                          onChange={(e) => handleStatusChange(job, e.target.value)}
                          className="tk-input h-8 w-32 text-xs capitalize"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s} className="capitalize">
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="tk-td text-right">
                      <div className="flex justify-end gap-1.5">
                        <Link
                          to={`/view-jobs/${job._id}`}
                          className="tk-icon-btn text-primary"
                          title="View"
                        >
                          <FiEye size={15} />
                        </Link>
                        <button
                          onClick={() => handleDeleteJob(job._id)}
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

      {/* Footer info */}
      <div className="flex justify-between items-center tk-eyebrow px-2">
        <span>Platform Records Management</span>
        <span>
          {filtered.length} of {jobs?.length || 0} jobs
        </span>
      </div>
    </div>
  );
};

export default AdminJobs;
