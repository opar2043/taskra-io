import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaBell,
  FaBriefcase,
  FaCalendarAlt,
  FaInbox,
  FaMapMarkerAlt,
} from "react-icons/fa";
import toast from "react-hot-toast";
import useAuth from "../../Hooks/useAuth";
import useAxios from "../../Hooks/useAxios";
import useNotifications from "../../Hooks/useNotifications";

/* ── helpers ───────────────────────────────────────── */
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// Bell button + dropdown of the latest job notifications.
const NotificationBar = () => {
  const { user } = useAuth();
  const email = user?.email;
  const axiosSecure = useAxios();
  const navigate = useNavigate();

  const [notifications = [], refetchNotifications, isLoading] = useNotifications(email);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Unread badge count — GET /jobs/notifications/unread/:email → { count }
  const fetchUnreadCount = useCallback(() => {
    if (!email) return;
    axiosSecure
      .get(`/jobs/notifications/unread/${email}`)
      .then((res) => setUnreadCount(res.data?.count || 0))
      .catch(() => {});
  }, [axiosSecure, email]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    if (!email) return;
    try {
      await axiosSecure.patch(`/notifications/${email}/mark-read`);
      refetchNotifications();
      fetchUnreadCount();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Could not mark notifications as read");
    }
  };

  const handleJobClick = (notification) => {
    const targetId = notification.jobId || notification.job?._id || notification._id;
    if (targetId) navigate(`/view-jobs/${targetId}`);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className={`relative w-9 h-9 rounded-full flex items-center justify-center text-ink/70 hover:bg-white hover:text-primary transition-colors ${
          open ? "text-primary bg-white" : ""
        }`}
      >
        <FaBell className="text-lg" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-[3px] bg-primary rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2.5 w-[min(370px,calc(100vw-2rem))] tk-card z-50 overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-line-app flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary-tint flex items-center justify-center">
                <FaBell className="text-primary text-[13px]" />
              </div>
              <div className="leading-none">
                <p className="text-[13px] font-semibold text-ink">Notifications</p>
                <p className="text-[11px] text-body-text/70 mt-0.5">
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] font-semibold text-primary hover:text-primary-hover transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <span className="w-7 h-7 rounded-full border-[3px] border-primary-tint border-t-primary animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <div className="w-14 h-14 rounded-full bg-app-bg flex items-center justify-center">
                  <FaInbox className="text-body-text/30 text-2xl" />
                </div>
                <p className="text-[13px] text-body-text/70 font-medium">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-line-app">
                {notifications.map((job) => {
                  const isUnread = !job.isRead;
                  return (
                    <div
                      key={job._id}
                      onClick={() => handleJobClick(job)}
                      className={`group relative flex gap-3.5 px-5 py-3.5 cursor-pointer transition-colors hover:bg-app-bg/70 ${
                        isUnread ? "bg-primary-tint/40" : "bg-surface"
                      }`}
                    >
                      {isUnread && (
                        <span className="absolute left-0 top-3 bottom-3 w-[3px] bg-primary rounded-r-full" />
                      )}

                      {/* Icon */}
                      <div className="w-9 h-9 shrink-0 rounded-xl bg-primary-tint flex items-center justify-center mt-0.5">
                        <FaBriefcase className="text-sm text-primary" />
                      </div>

                      {/* Body */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-[13px] font-semibold text-ink truncate leading-snug group-hover:text-primary transition-colors">
                            {job.title}
                          </p>
                          <span className="text-[10px] text-body-text/60 whitespace-nowrap mt-0.5 shrink-0">
                            {timeAgo(job.createdAt)}
                          </span>
                        </div>

                        {job.category && (
                          <span className="tk-badge-info mb-2">{job.category}</span>
                        )}

                        {/* Meta row */}
                        <div className="flex items-center gap-3 flex-wrap">
                          {job.price && (
                            <span className="text-[12px] font-bold text-ink">
                              £{parseFloat(job.price).toLocaleString()}
                            </span>
                          )}
                          {job.location && (
                            <span className="flex items-center gap-[3px] text-[11px] text-body-text/70">
                              <FaMapMarkerAlt className="text-[9px]" />
                              {job.location}
                            </span>
                          )}
                          {job.eventDate && (
                            <span className="flex items-center gap-[3px] text-[11px] text-body-text/70">
                              <FaCalendarAlt className="text-[9px]" />
                              {new Date(job.eventDate).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Hover arrow */}
                      <div className="shrink-0 self-center opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                        <FaArrowRight className="text-primary text-[10px]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3.5 border-t border-line-app bg-app-bg/60 flex items-center justify-between">
            <span className="text-[11px] text-body-text/70">
              Latest {notifications.length} jobs
            </span>
            <button
              onClick={() => {
                navigate("/view-alljobs");
                setOpen(false);
              }}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:text-primary-hover transition-colors group"
            >
              View all jobs
              <FaArrowRight className="text-[9px] transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBar;
