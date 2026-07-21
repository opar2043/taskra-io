import React from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiEye,
  FiTrash2,
  FiArchive,
  FiBriefcase,
  FiMapPin,
  FiCalendar,
  FiChevronRight,
} from "react-icons/fi";
import { MdCategory } from "react-icons/md";
import useSaveJobs from "../../../Hooks/useSaveJobs";
import useLoginUser from "../../../Hooks/useLoginUser";
import useAxios from "../../../Hooks/useAxios";
import { confirmToast } from "../../../utils/toastConfirm";
import Loading from "../../../Root/Loading";
import NoData from "../../../utils/NoData";
import TutorialModal from "../../../DashboardTutorial/TutorialModal";

const SaveJobs = () => {
  const [savejobs, refetch, isLoading] = useSaveJobs();
  const { currentUser } = useLoginUser() || {};
  const axiosSecure = useAxios();

  if (isLoading) return <Loading />;

  // GET /save-jobs returns ALL rows — keep only mine
  const userSaveJobs =
    (savejobs || []).filter((s) => s?.userEmail === currentUser?.email) || [];

  const handleRemove = async (id) => {
    if (
      await confirmToast({
        title: "Remove from Saved?",
        message: "You can always save it again later from the job board.",
        confirmText: "Remove",
        danger: true,
      })
    ) {
      try {
        const res = await axiosSecure.delete(`/save-jobs/${id}`);
        if (res.data.deletedCount > 0) {
          toast.success("Job has been removed from your list.");
          refetch();
        }
      } catch {
        toast.error("Could not remove job.");
      }
    }
  };

  return (
    <div className="tk-page">
      <TutorialModal
        componentName="SaveJobs"
        title="Welcome to your Wishlisted Jobs"
        description="This is where you will find all the projects you have saved. Keep an eye on them and submit your proposals when ready!"
        listItems={[
          "View full job insights",
          "Remove jobs from your archive",
          "Track budgets and event dates",
        ]}
      />

      {/* Header */}
      <div className="tk-card p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="tk-page-title flex items-center gap-2">
            <FiArchive className="text-primary" />
            Wishlisted Jobs
          </h1>
          <p className="tk-eyebrow mt-1">
            Archive of projects you plan to bid on
          </p>
        </div>
        <span className="tk-badge-info text-sm px-4 py-2">
          <FiBriefcase /> {userSaveJobs.length} Saved
        </span>
      </div>

      {/* Table */}
      {userSaveJobs.length > 0 ? (
        <div className="tk-table-wrap">
          <div className="overflow-x-auto">
            <table className="tk-table">
              <thead className="tk-thead">
                <tr>
                  <th className="tk-th w-12 text-center">SL</th>
                  <th className="tk-th text-left">Job Title</th>
                  <th className="tk-th text-left">Category</th>
                  <th className="tk-th text-center">Budget</th>
                  <th className="tk-th text-center">Event Date</th>
                  <th className="tk-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userSaveJobs.map((job, idx) => (
                  <tr key={job._id} className="tk-row group">
                    <td className="tk-td-muted text-center">{idx + 1}</td>
                    <td className="tk-td">
                      <div className="space-y-1">
                        <p className="font-semibold text-ink text-sm group-hover:text-primary transition-colors">
                          {job.title}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-body-text/70">
                          <FiMapPin className="text-primary" size={11} />
                          <span>{job.location}</span>
                        </div>
                      </div>
                    </td>
                    <td className="tk-td">
                      <span className="tk-badge-neutral">
                        <MdCategory className="text-primary" />
                        {job.category}
                      </span>
                    </td>
                    <td className="tk-td text-center">
                      <p className="text-sm font-semibold text-ink">
                        £{job.price}
                      </p>
                    </td>
                    <td className="tk-td text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2 text-xs text-body-text/70">
                        <FiCalendar className="text-body-text/40" size={11} />
                        {new Date(job.eventDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="tk-td text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/view-jobs/${job._id}`}
                          className="tk-icon-btn bg-primary-tint text-primary hover:bg-primary hover:text-white"
                          title="View job"
                        >
                          <FiEye size={14} />
                        </Link>
                        <button
                          onClick={() => handleRemove(job._id)}
                          className="tk-icon-btn bg-danger-bg text-danger-text hover:bg-danger-text hover:text-white"
                          title="Remove from saved"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <NoData
          title="Workspace Clean"
          message="Check the community job board to start building your wishlist of potential projects."
          action={
            <Link to="/dashboard/browse-jobs" className="tk-btn-primary">
              Find Work <FiChevronRight />
            </Link>
          }
        />
      )}
    </div>
  );
};

export default SaveJobs;
