import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FaBookmark, FaEye, FaMapMarkerAlt, FaTrash } from "react-icons/fa";
import useSave from "../../../Hooks/useSave";
import useAuth from "../../../Hooks/useAuth";
import useAxios from "../../../Hooks/useAxios";
import { confirmToast } from "../../../utils/toastConfirm";
import NoData from "../../../utils/NoData";
import Loading from "../../../Root/Loading";
import TutorialModal from "../../../DashboardTutorial/TutorialModal";

const SaveFreelence = () => {
  const [save, refetch, isLoading] = useSave();
  const { user } = useAuth();
  const axiosSecure = useAxios();

  if (isLoading) {
    return <Loading />;
  }

  // GET /save returns ALL rows — keep only this client's shortlist
  const savedFreelancers = (save || []).filter(
    (s) => s.userEmail == user?.email,
  );

  const handleRemove = async (id) => {
    if (!id) return;

    const confirmed = await confirmToast({
      title: "Are you sure?",
      message: "This freelancer will be removed from your saved list.",
      confirmText: "Yes, remove",
      danger: true,
    });
    if (!confirmed) return;

    try {
      const res = await axiosSecure.delete(`/save/${id}`);
      if (res.data.deletedCount && res.data.deletedCount > 0) {
        toast.success("Freelancer Removed");
        refetch();
      } else {
        toast.error("Freelancer not found or invalid ID.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Could not remove freelancer.",
      );
    }
  };

  const profileLink = (freelancer) =>
    `/view-freelencer/${freelancer.freelancerId || freelancer._id}`;

  return (
    <div className="tk-page">
      <TutorialModal
        componentName="SaveFreelence"
        title="Welcome to Saved Freelancers"
        description="Keep all the professionals you have bookmarked in one convenient list."
        listItems={[
          "Revisit professionals you shortlisted",
          "View full profiles at any time",
          "Remove freelancers you no longer need",
        ]}
      />

      {/* Header */}
      <div className="tk-card p-4">
        <p className="tk-eyebrow">
          Your bookmarked professionals for future reference
        </p>
        <div className="flex items-center gap-3">
          <FaBookmark className="text-xl text-primary" />
          <h1 className="tk-page-title">Saved Freelancers</h1>
        </div>
      </div>

      {savedFreelancers.length === 0 ? (
        <NoData
          title="No Saved Freelancers Yet"
          message="Start saving freelancers you're interested in working with."
          action={
            <Link to="/dashboard/find-freelancers" className="tk-btn-primary">
              Browse Freelancers
            </Link>
          }
        />
      ) : (
        <div>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-ink">
              {savedFreelancers.length} Saved Freelancer
              {savedFreelancers.length !== 1 ? "s" : ""}
            </h2>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block tk-table-wrap">
            <div className="overflow-x-auto">
              <table className="tk-table">
                <thead>
                  <tr className="tk-thead">
                    <th className="tk-th">Freelancer</th>
                    <th className="tk-th">Skills</th>
                    <th className="tk-th">Location</th>
                    <th className="tk-th text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {savedFreelancers.map((freelancer) => (
                    <tr key={freelancer._id} className="tk-row">
                      <td className="tk-td">
                        <Link
                          to={profileLink(freelancer)}
                          className="flex items-center gap-4 group"
                        >
                          <img
                            src={freelancer.freelancerPhoto || freelancer.photo}
                            alt={freelancer.freelancerName || freelancer.name}
                            className="w-12 h-12 rounded-full object-cover border border-line-app group-hover:border-primary transition-colors"
                          />
                          <div>
                            <p className="font-semibold text-ink group-hover:text-primary transition-colors">
                              {freelancer.name || freelancer.freelancerName}
                            </p>
                            <p className="text-xs text-body-text/70">
                              {freelancer.email || freelancer.freelancerEmail}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="tk-td">
                        <div className="flex flex-wrap gap-2">
                          {freelancer.skills
                            ?.split(",")
                            .slice(0, 2)
                            .map((skill, index) => (
                              <span key={index} className="tk-badge-info">
                                {skill.trim()}
                              </span>
                            ))}
                          {freelancer.skills?.split(",").length > 2 && (
                            <span className="tk-badge-neutral">
                              +{freelancer.skills.split(",").length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="tk-td">
                        <div className="flex items-center gap-2 text-ink">
                          <FaMapMarkerAlt className="text-body-text/40" />
                          <span className="text-sm">{freelancer.location}</span>
                        </div>
                      </td>
                      <td className="tk-td">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={profileLink(freelancer)}
                            className="w-9 h-9 rounded-xl bg-primary-tint text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
                            title="View profile"
                          >
                            <FaEye size={13} />
                          </Link>
                          <button
                            onClick={() => handleRemove(freelancer._id)}
                            className="w-9 h-9 rounded-xl bg-danger-bg text-danger-text hover:bg-danger-text hover:text-white flex items-center justify-center transition-colors"
                            title="Remove from saved"
                          >
                            <FaTrash size={13} />
                          </button>
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
            {savedFreelancers.map((freelancer) => (
              <div key={freelancer._id} className="tk-card p-5">
                <Link
                  to={profileLink(freelancer)}
                  className="flex items-center gap-4 mb-4"
                >
                  <img
                    src={freelancer.freelancerPhoto || freelancer.photo}
                    alt={freelancer.freelancerName || freelancer.name}
                    className="w-14 h-14 rounded-full object-cover border border-line-app"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-ink">
                      {freelancer.name || freelancer.freelancerName}
                    </h3>
                    <p className="text-sm text-body-text/70 flex items-center gap-1 mt-1">
                      <FaMapMarkerAlt className="text-xs" />
                      {freelancer.location}
                    </p>
                  </div>
                </Link>

                {freelancer.skills && (
                  <div className="mb-4">
                    <p className="text-xs text-body-text/70 mb-2 font-medium">
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {freelancer.skills.split(",").map((skill, index) => (
                        <span key={index} className="tk-badge-info">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Link
                    to={profileLink(freelancer)}
                    className="tk-btn-primary flex-1"
                  >
                    <FaEye />
                    View Profile
                  </Link>
                  <button
                    onClick={() => handleRemove(freelancer._id)}
                    className="tk-btn-secondary text-danger-text border-danger-bg hover:bg-danger-bg"
                  >
                    <FaTrash />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SaveFreelence;
