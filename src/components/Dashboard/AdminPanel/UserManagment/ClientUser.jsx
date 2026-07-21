import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiTrash2,
  FiMail,
  FiPhone,
  FiMapPin,
  FiSearch,
  FiUsers,
  FiCheckCircle,
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
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}&background=FE6D06&color=fff&size=80`;

const ClientUser = () => {
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

  const clients = (users || [])
    .filter((u) => u.role === "client" && !u.isFreelancer)
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
        title: `Are you sure you want to ${action} this user?`,
        message: `This user will ${user.isBlock ? "regain" : "lose"} access to the platform.`,
        confirmText: `Yes, ${action} them!`,
        danger: true,
      })
    ) {
      try {
        await axiosSecure.patch(`/users/${user._id}`, { isBlock: !user.isBlock });
        refetch();
        toast.success(`User has been ${action.toLowerCase()}ed.`);
      } catch {
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
      } catch {
        toast.error("Failed to update role.");
      }
    }
  };

  const handleRemoveUser = async (userId) => {
    if (
      await confirmToast({
        title: "Are you sure?",
        message: "This user will be permanently removed from the system!",
        confirmText: "Yes, delete it!",
        danger: true,
      })
    ) {
      try {
        await axiosSecure.delete(`/users/${userId}`);
        refetch();
        toast.success("User has been removed.");
      } catch {
        toast.error("Failed to delete user.");
      }
    }
  };

  return (
    <div className="tk-page">
      <TutorialModal
        componentName="ClientUser"
        title="Welcome to the Client Database"
        description="Manage every client account registered on the platform."
        listItems={[
          "Search and review client profiles",
          "Switch roles or message a client",
          "Block or remove client accounts",
        ]}
      />

      {/* Control Bar */}
      <div className="tk-card p-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="tk-page-title">Client Database</h1>
          <p className="tk-eyebrow mt-0.5">User Management Console</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-body-text/50 z-10" />
            <input
              type="text"
              placeholder="Find client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="tk-input w-full pl-10"
            />
          </div>
          <span className="tk-badge-info flex items-center gap-2 shrink-0">
            <FiUsers size={14} /> {clients.length}
          </span>
        </div>
      </div>

      {/* Main Table */}
      {clients.length === 0 ? (
        <NoData title="No clients found" message="No client accounts match this search." />
      ) : (
        <div className="tk-table-wrap">
          <div className="overflow-x-auto">
            <table className="tk-table">
              <thead className="tk-thead">
                <tr>
                  <th className="tk-th">Client Profile</th>
                  <th className="tk-th">Contact Details</th>
                  <th className="tk-th">Location</th>
                  <th className="tk-th text-center">Authentication</th>
                  <th className="tk-th text-right">Moderation</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((user) => (
                  <tr key={user._id} className="tk-row">
                    <td className="tk-td">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/view-freelencer/${user._id}`}
                          className="relative shrink-0 block hover:opacity-80 transition-opacity"
                        >
                          <img
                            src={user.photo || avatarFallback(user.name)}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover border border-line-app shadow-sm"
                          />
                          <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border-2 border-white rounded-full" />
                        </Link>
                        <div>
                          <Link to={`/view-freelencer/${user._id}`}>
                            <p className="font-semibold text-ink text-sm hover:text-primary transition-colors">
                              {user.name}
                            </p>
                          </Link>
                          <p className="text-xs text-body-text/70 mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="tk-td">
                      <div className="space-y-1">
                        <p className="text-sm text-body-text flex items-center gap-2">
                          <FiMail size={11} className="text-body-text/50 shrink-0" /> {user.email}
                        </p>
                        <p className="text-xs text-body-text/70 flex items-center gap-2">
                          <FiPhone size={10} className="text-body-text/50 shrink-0" />{" "}
                          {user.phone || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="tk-td">
                      <div className="flex items-center gap-2 text-sm text-body-text">
                        <FiMapPin className="text-body-text/50" size={12} />
                        {user.location || "UK / Global"}
                      </div>
                    </td>
                    <td className="tk-td text-center">
                      {user.isBlock ? (
                        <span className="tk-badge-error inline-flex items-center gap-1">
                          <FiSlash size={10} /> Blocked
                        </span>
                      ) : (
                        <span className="tk-badge-info inline-flex items-center gap-1 capitalize">
                          <FiCheckCircle size={10} /> {user.role} Verified
                        </span>
                      )}
                    </td>
                    <td className="tk-td text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleRole(user)}
                          className="tk-icon-btn hover:bg-primary-tint hover:text-primary"
                          title="Switch Role"
                        >
                          <FiUserCheck size={14} />
                        </button>
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

export default ClientUser;
