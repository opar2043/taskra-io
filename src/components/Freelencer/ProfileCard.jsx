import { FaStar, FaCheckCircle } from "react-icons/fa";
import { FiMapPin, FiBookmark } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useLoginUser from "../Hooks/useLoginUser";
import useAxios from "../Hooks/useAxios";

// Public professional card. `onSave` / `isSaved` are optional — when provided
// (e.g. by SearchFreelencer) a save-to-shortlist button is shown.
const ProfileCard = ({ professional, onSave = null, isSaved = false }) => {
  const { name, photo, skills, location, rating, bio, _id } = professional || {};
  const { currentUser } = useLoginUser();
  const axiosSecure = useAxios();
  const navigate = useNavigate();

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

  const skillLabel = skills === "both" ? "Photo & Video" : skills;

  return (
    <article className="bg-white border border-line rounded-2xl shadow-soft p-5 flex flex-col h-full transition hover:shadow-md">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="frame-img !p-1.5 w-[72px] h-[72px] shrink-0">
          <img
            src={photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "P")}&background=FE6D06&color=fff`}
            alt={name}
            className="w-full h-full"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-semibold text-ink truncate">{name}</h3>

          {location && (
            <span className="inline-flex items-center gap-1 mt-1 text-xs text-body-text bg-cream border border-line rounded-full px-2.5 py-1">
              <FiMapPin className="text-primary" />
              {location}
            </span>
          )}

          <div className="flex items-center gap-1.5 mt-2 text-sm text-ink font-semibold">
            <FaStar className="text-primary" />
            {rating || 5.0}
          </div>
        </div>

        {skills && (
          <span className="text-[10px] text-primary bg-primary-tint px-2.5 py-1.5 font-bold rounded-full uppercase tracking-wide shrink-0">
            {skillLabel}
          </span>
        )}
      </div>

      {/* Bio */}
      <p className="mt-4 text-sm text-body-text leading-relaxed flex-1">
        {bio ? `${bio.slice(0, 90)}...` : ""}
      </p>

      {/* CTAs */}
      <div className="flex gap-2 mt-5">
        <Link
          to={`/view-freelencer/${_id}`}
          className="flex-1 rounded-full border border-line py-2 text-sm font-semibold text-ink hover:border-primary hover:text-primary transition text-center"
        >
          View Profile
        </Link>
        <button
          onClick={() => handleMessage(_id)}
          className="flex-1 rounded-full border border-line py-2 text-sm font-semibold text-ink hover:border-primary hover:text-primary transition text-center"
        >
          Message
        </button>
        {onSave && (
          <button
            onClick={() => onSave(professional)}
            disabled={isSaved}
            title={isSaved ? "Already in your shortlist" : "Save to shortlist"}
            className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition ${
              isSaved
                ? "bg-success-bg text-success-text cursor-default"
                : "border border-line text-ink hover:border-primary hover:text-primary"
            }`}
          >
            {isSaved ? <FaCheckCircle /> : <FiBookmark />}
          </button>
        )}
      </div>
    </article>
  );
};

export default ProfileCard;
