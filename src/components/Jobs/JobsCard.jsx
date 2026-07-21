import { Link } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { FiCalendar, FiMapPin, FiClock } from "react-icons/fi";
import useFreelancer from "../Hooks/useFreelencer";
import useAuth from "../Hooks/useAuth";

const JobsCard = ({ job }) => {
  const isfreelancer = useFreelancer();
  const { user } = useAuth() || {};

  return (
    <article className="bg-white border border-line rounded-2xl shadow-soft hover:shadow-md transition-shadow duration-300 p-5 flex flex-col h-full">
      {/* Header: client info */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={job.photo || "https://placehold.co/48"}
          alt={job.name || "User"}
          className="w-11 h-11 rounded-full object-cover border-2 border-cream shadow-sm"
        />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-ink leading-tight flex items-center gap-1 truncate">
            {job.name || "Unknown Client"}
            {job.clientVerified && (
              <FaCheckCircle
                className="text-success-text text-xs shrink-0"
                title={
                  job.clientVerifiedReason === "payment"
                    ? "Verified client — completed a payment"
                    : "Verified client — confirmed contact details"
                }
              />
            )}
          </p>
          {job.clientVerified ? (
            <span className="text-[10px] font-bold tracking-wider uppercase text-success-text inline-flex items-center gap-1">
              <FaCheckCircle className="text-[9px]" /> Verified Client
            </span>
          ) : (
            <span className="text-[10px] font-bold tracking-wider uppercase text-body-text/60">
              Client
            </span>
          )}
        </div>

        {/* Category pill */}
        {job.category && (
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary-tint text-primary font-bold tracking-wide uppercase shrink-0">
            {job.category.length > 30 ? job.category.slice(0, 15) + "..." : job.category}
          </span>
        )}
      </div>

      {/* Title */}
      <h2 className="font-display text-lg font-semibold text-ink mb-3 leading-snug">
        {job.title} Required
      </h2>

      {/* Key facts */}
      <div className="bg-cream rounded-xl p-3.5 mb-3 border border-line">
        <div className="text-[13px] space-y-1.5">
          <div className="flex items-center gap-2">
            <FiCalendar className="text-primary shrink-0" />
            <span className="font-semibold text-ink w-16 shrink-0">Date</span>
            <span className="text-body-text truncate">{job.eventDate || "TBA"}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiMapPin className="text-primary shrink-0" />
            <span className="font-semibold text-ink w-16 shrink-0">Location</span>
            <span className="text-body-text truncate">{job.location || "TBA"}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiClock className="text-primary shrink-0" />
            <span className="font-semibold text-ink w-16 shrink-0">Time</span>
            <span className="text-body-text truncate">{job.time || job.hours || "TBA"}</span>
          </div>
        </div>
      </div>

      {/* Description snippet */}
      <p className="text-body-text/80 text-[13px] line-clamp-2 leading-relaxed mb-4 flex-1">
        {job.description}
      </p>

      {/* Footer / actions */}
      <div className="flex items-center justify-between border-t border-line pt-3 mt-auto">
        <span className="text-xs font-medium text-body-text/60">
          Status: <span className="text-success-text font-semibold">Open</span>
        </span>

        {isfreelancer && (
          <Link
            to={`/view-jobs/${job._id}`}
            className="text-xs font-bold px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-hover transition-colors shadow-sm"
          >
            Apply Details
          </Link>
        )}

        {!user && (
          <Link
            to="/professional"
            className="text-xs font-bold px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-hover transition-colors shadow-sm"
          >
            Join as professional
          </Link>
        )}
      </div>
    </article>
  );
};

export default JobsCard;
