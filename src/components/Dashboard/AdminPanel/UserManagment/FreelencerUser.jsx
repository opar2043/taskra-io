import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiTrash2,
  FiMail,
  FiPhone,
  FiMapPin,
  FiSearch,
  FiStar,
  FiCamera,
  FiCheckCircle,
  FiAward,
  FiMessageCircle,
  FiSlash,
  FiUserCheck,
} from "react-icons/fi";
import useUser from "../../../Hooks/useUser";
import useAxios from "../../../Hooks/useAxios";
import useLoginUser from "../../../Hooks/useLoginUser";
import { confirmToast } from "../../../utils/toastConfirm";
import NoData from "../../../utils/NoData";
import Loading from "../../../Root/Loading";
import TutorialModal from "../../../DashboardTutorial/TutorialModal";

const avatarFallback = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}&background=FE6D06&color=fff&size=96`;

const FreelancerUser = () => {
  const { users, isLoading, refetch } = useUser();
  const [search, setSearch] = useState("");
  const axiosSecure = useAxios();
  const { currentUser } = useLoginUser();
  const navigate = useNavigate();

  if (isLoading) return <Loading />;

  const handleMessage = async (receiverId) => {
    if (!currentUser?._id) return toast.error("Please login first");
    try {
      const res = await axiosSecure.post("/conversations", {
        senderId: currentUser._id,
        receiverId,
      });
      navigate(`/chat/${res.data._id}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to open chat");
    }
  };

  const freelancers = (users || [])
    .filter((u) => u.role === "professional")
    .filter(
      (u) =>
        !search ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.location?.toLowerCase().includes(search.toLowerCase())
    );

  const handleBlockUser = async (user) => {
    const action = user.isBlock ? "Unblock" : "Block";
    if (
      await confirmToast({
        title: `Are you sure you want to ${action} this professional?`,
        message: `This user will ${user.isBlock ? "regain" : "lose"} access to the platform.`,
        confirmText: `Yes, ${action} them!`,
        danger: true,
      })
    ) {
      try {
        await axiosSecure.patch(`/users/${user._id}`, { isBlock: !user.isBlock });
        refetch();
        toast.success(`Professional has been ${action.toLowerCase()}ed.`);
      } catch (error) {
        console.log(error);
        toast.error(`Failed to ${action.toLowerCase()} user.`);
      }
    }
  };

  const handleToggleRole = async (user) => {
    const newRole = user.role === "client" ? "professional" : "client";
    if (
      await confirmToast({
        title: `Change role to ${newRole}?`,
        message: `The user will now have ${newRole} permissions.`,
        confirmText: "Yes, change it!",
        danger: true,
      })
    ) {
      try {
        await axiosSecure.patch(`/users/${user._id}`, { role: newRole });
        refetch();
        toast.success("User role has been changed.");
      } catch (error) {
        toast.error("Failed to update role.");
        console.log(error);
      }
    }
  };

  const handleApproveVerification = async (user) => {
    if (
      await confirmToast({
        title: "Verify Professional?",
        message: `Mark ${user.name} as a Verified Professional?`,
        confirmText: "Yes, verify!",
        danger: false,
      })
    ) {
      try {
        await axiosSecure.patch(`/users/${user._id}`, { isVerified: true });
        refetch();
        toast.success("Professional is now a Verified Professional.");
      } catch (error) {
        toast.error("Failed to verify.");
        console.log(error);
      }
    }
  };

  const handleRemoveUser = async (userId) => {
    if (
      await confirmToast({
        title: "Are you sure?",
        message: "This Professional will be permanently removed!",
        confirmText: "Yes, delete it!",
        danger: true,
      })
    ) {
      try {
        await axiosSecure.delete(`/users/${userId}`);
        refetch();
        toast.success("Professional has been removed.");
      } catch (error) {
        toast.error("Failed to delete user.");
        console.log(error);
      }
    }
  };

  return (
    <div className="tk-page">
      <TutorialModal
        componentName="FreelencerUser"
        title="Welcome to the Professional Pool"
        description="Manage and verify the creative professionals on the platform."
        listItems={[
          "Search and review professional accounts",
          "Approve verification for eligible pros",
          "Message, block or remove professionals",
        ]}
      />

      {/* Nav Row */}
      <div className="tk-card p-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="tk-page-title">Professional Pool</h1>
          <p className="tk-eyebrow mt-0.5">Talent Management Console</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-body-text/50 z-10" />
            <input
              type="text"
              placeholder="Search talent..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="tk-input w-full pl-10"
            />
          </div>
          <span className="tk-badge-info flex items-center gap-2 shrink-0">
            <FiCamera size={14} /> {freelancers.length}
          </span>
        </div>
      </div>

      {/* Performance Table */}
      {freelancers.length === 0 ? (
        <NoData
          title="No talent discovered"
          message="No professional accounts match this search."
        />
      ) : (
        <div className="tk-table-wrap">
          <div className="overflow-x-auto">
            <table className="tk-table">
              <thead className="tk-thead">
                <tr>
                  <th className="tk-th">Professional Account</th>
                  <th className="tk-th">Comm Link</th>
                  <th className="tk-th">Zone</th>
                  <th className="tk-th text-center">Tier Status</th>
                  <th className="tk-th text-right">Moderation</th>
                </tr>
              </thead>
              <tbody>
                {freelancers.map((user) => (
                  <tr key={user._id} className="tk-row">
                    <td className="tk-td">
                      <div className="flex items-center gap-4">
                        <Link
                          to={`/view-freelencer/${user._id}`}
                          className="relative block hover:opacity-80 transition-opacity shrink-0"
                        >
                          <img
                            src={user.photo || avatarFallback(user.name)}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover border border-line-app"
                          />
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-white border-2 border-white">
                            <FiStar size={8} />
                          </span>
                        </Link>
                        <div>
                          <Link to={`/view-freelencer/${user._id}`}>
                            <p className="font-semibold text-ink text-sm whitespace-nowrap hover:text-primary transition-colors">
                              {user.name}
                            </p>
                          </Link>
                          <p className="tk-eyebrow mt-0.5">Pro Creative</p>
                        </div>
                      </div>
                    </td>
                    <td className="tk-td">
                      <div className="space-y-1">
                        <p className="text-sm text-body-text flex items-center gap-2 truncate max-w-[170px]">
                          <FiMail className="text-body-text/50 shrink-0" /> {user.email}
                        </p>
                        <p className="text-xs text-body-text/70 flex items-center gap-2">
                          <FiPhone className="text-body-text/50 shrink-0" /> {user.phone || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="tk-td">
                      <div className="flex items-center gap-2 text-sm text-body-text">
                        <FiMapPin className="text-body-text/50" size={12} />
                        {user.location || "UK Mainland"}
                      </div>
                    </td>
                    <td className="tk-td text-center">
                      {user.isVerified ? (
                        <span className="tk-badge-success inline-flex items-center gap-1">
                          <FiAward size={11} /> Verified
                        </span>
                      ) : user.profileCompletion === 100 ? (
                        <span className="tk-badge-warning inline-flex items-center">
                          Ready for Review
                        </span>
                      ) : (
                        <span className="tk-badge-info inline-flex items-center">
                          {user.profileCompletion || 0}% Complete
                        </span>
                      )}
                    </td>
                    <td className="tk-td text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleRole(user)}
                          className="tk-icon-btn hover:bg-primary-tint hover:text-primary"
                          title="Toggle Role"
                        >
                          <FiUserCheck size={14} />
                        </button>
                        {!user.isVerified && user.profileCompletion === 100 && (
                          <button
                            onClick={() => handleApproveVerification(user)}
                            className="tk-icon-btn text-success-text hover:bg-success-bg"
                            title="Approve Verification"
                          >
                            <FiCheckCircle size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleMessage(user._id)}
                          className="tk-icon-btn text-primary hover:bg-primary-tint"
                          title="Message User"
                        >
                          <FiMessageCircle size={14} />
                        </button>
                        <button
                          onClick={() => handleBlockUser(user)}
                          className={`tk-icon-btn ${
                            user.isBlock
                              ? "bg-danger-bg text-danger-text"
                              : "hover:bg-danger-bg hover:text-danger-text"
                          }`}
                          title={user.isBlock ? "Unblock User" : "Block User"}
                        >
                          <FiSlash size={14} />
                        </button>
                        <button
                          onClick={() => handleRemoveUser(user._id)}
                          className="tk-icon-btn text-danger-text hover:bg-danger-bg"
                          title="Delete"
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
      )}
    </div>
  );
};

export default FreelancerUser;
