import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaSpinner,
} from "react-icons/fa";
import { FiPlusCircle } from "react-icons/fi";
import useJobs from "../../../Hooks/useJobs";
import useAxios from "../../../Hooks/useAxios";
import useLoginUser from "../../../Hooks/useLoginUser";
import { confirmToast } from "../../../utils/toastConfirm";
import NoData from "../../../utils/NoData";
import Loading from "../../../Root/Loading";
import TutorialModal from "../../../DashboardTutorial/TutorialModal";

const statusBadge = (status) => {
  if (status === "completed") return "tk-badge-success";
  if (status === "cancelled") return "tk-badge-error";
  if (status === "pending") return "tk-badge-warning";
  return "tk-badge-info"; // open / active
};

const MyJobs = () => {
  const [jobs, refetch, isLoading] = useJobs();
  const { currentUser } = useLoginUser();
  const axiosSecure = useAxios();
  const navigate = useNavigate();
  const [updatingId, setUpdatingId] = useState(null);

  if (isLoading) {
    return <Loading />;
  }

  const myJobs = [...(jobs || [])]
    .filter(
      (job) =>
        job?.email === currentUser?.email ||
        job?.client_email === currentUser?.email ||
        currentUser?._id === job?.client_id,
    )
    .reverse();

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const handleDelete = async (id) => {
    const confirmed = await confirmToast({
      title: "Delete this job?",
      message: "The listing and its proposals will no longer be visible.",
      confirmText: "Yes, delete",
      danger: true,
    });
    if (!confirmed) return;

    try {
      await axiosSecure.delete(`/jobs/${id}`);
      toast.success("Job deleted successfully!");
      refetch();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Something went wrong!",
      );
    }
  };

  const handleComplete = async (job) => {
    try {
      setUpdatingId(job._id);
      const newStatus = job.status === "completed" ? "pending" : "completed";
      const res = await axiosSecure.patch(`/jobs/${job._id}`, {
        status: newStatus,
      });

      if (res.data?.modifiedCount > 0 || res.data?.success) {
        toast.success(
          newStatus === "completed"
            ? "Job marked as completed!"
            : "Job marked as pending!",
        );
        refetch();
      } else {
        toast.error("Failed to update job!");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Something went wrong!",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="tk-page">
      <TutorialModal
        componentName="MyJobs"
        title="Welcome to My Posted Jobs"
        description="Manage and track every job you have posted, all in one place."
        listItems={[
          "Edit the details of any listing",
          "Mark jobs as active or completed",
          "Delete jobs you no longer need",
        ]}
      />

      {/* Header */}
      <div className="tk-card p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <p className="tk-eyebrow">Manage and track all your posted jobs</p>
          <h1 className="tk-page-title">My Posted Jobs</h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/post-job")}
            title="Post a new job"
            className="tk-btn-primary"
          >
            <FiPlusCircle size={14} />
            Post Job
          </button>
          <div className="text-xs font-medium text-body-text/70">
            {myJobs?.length || 0} Total Listings
          </div>
        </div>
      </div>

      {/* Table */}
      {myJobs?.length === 0 ? (
        <NoData
          title="No jobs posted yet"
          message="Post your first job to start receiving proposals from professionals."
          action={
            <Link to="/dashboard/post-job" className="tk-btn-primary">
              <FiPlusCircle size={14} />
              Post a Job
            </Link>
          }
        />
      ) : (
        <div className="tk-table-wrap">
          <div className="overflow-x-auto">
            <table className="tk-table">
              <thead>
                <tr className="tk-thead">
                  <th className="tk-th w-12 text-center">SL</th>
                  <th className="tk-th">Job Title</th>
                  <th className="tk-th">Category</th>
                  <th className="tk-th text-center">Budget</th>
                  <th className="tk-th">Location</th>
                  <th className="tk-th">Event Date</th>
                  <th className="tk-th text-center">Status</th>
                  <th className="tk-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myJobs?.map((job, index) => (
                  <tr key={job._id} className="tk-row group">
                    <td className="tk-td-muted text-center">{index + 1}</td>
                    <td className="tk-td">
                      <div className="text-sm font-semibold text-ink leading-tight">
                        {job.title?.length > 30
                          ? job.title.slice(0, 30) + "..."
                          : job.title}
                      </div>
                      <div className="text-[11px] text-body-text/70 mt-1">
                        ID: #{job._id.slice(-6).toUpperCase()}
                      </div>
                    </td>
                    <td className="tk-td">
                      <span className="tk-badge-info">
                        {job.category?.length > 18
                          ? job.category.slice(0, 18) + "..."
                          : job.category}
                      </span>
                    </td>
                    <td className="tk-td text-center">
                      <div className="font-semibold text-ink">
                        £{Number(job.price)?.toLocaleString()}
                      </div>
                    </td>
                    <td className="tk-td whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-sm text-ink">
                        <FaMapMarkerAlt className="text-body-text/40" size={10} />
                        <span>{job.location}</span>
                      </div>
                      <div className="text-[11px] text-body-text/70 ml-4">
                        {job.postCode}
                      </div>
                    </td>
                    <td className="tk-td">
                      <div className="flex items-center gap-1.5 text-sm text-body-text">
                        <FaCalendarAlt className="text-body-text/40" size={10} />
                        <span>
                          {job.eventDate ? formatDate(job.eventDate) : "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="tk-td text-center">
                      <span className={statusBadge(job.status)}>
                        {job.status || "open"}
                      </span>
                    </td>
                    <td className="tk-td text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleComplete(job)}
                          disabled={updatingId === job._id}
                          title={
                            job.status === "completed"
                              ? "Mark as pending"
                              : "Mark as completed"
                          }
                          className={`px-3 h-9 text-[11px] font-semibold rounded-xl border transition-colors disabled:opacity-50 ${
                            job.status === "completed"
                              ? "border-success-bg text-success-text bg-success-bg hover:bg-success-text hover:text-white"
                              : "border-line-app text-body-text bg-app-bg hover:bg-primary hover:text-white"
                          }`}
                        >
                          {updatingId === job._id ? (
                            <FaSpinner className="text-[10px] animate-spin" />
                          ) : job.status === "completed" ? (
                            "Completed"
                          ) : (
                            "Active"
                          )}
                        </button>
                        <Link
                          to={`/dashboard/edit-job/${job._id}`}
                          className="w-9 h-9 rounded-xl bg-primary-tint text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
                          title="Edit Job"
                        >
                          <FaEdit size={12} />
                        </Link>
                        <button
                          onClick={() => handleDelete(job._id)}
                          disabled={updatingId === job._id}
                          className="w-9 h-9 rounded-xl bg-danger-bg text-danger-text hover:bg-danger-text hover:text-white flex items-center justify-center transition-colors"
                          title="Delete Job"
                        >
                          <FaTrash size={12} />
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

export default MyJobs;
