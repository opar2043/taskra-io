import { FaStar, FaRegStar, FaStarHalfAlt, FaQuoteLeft } from "react-icons/fa";
import { motion } from "framer-motion";

const renderStars = (rating = 0) => {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  for (let i = 0; i < full; i++) stars.push(<FaStar key={`f-${i}`} size={14} />);
  if (half) stars.push(<FaStarHalfAlt key="half" size={14} />);
  const remaining = 5 - full - (half ? 1 : 0);
  for (let i = 0; i < remaining; i++) stars.push(<FaRegStar key={`e-${i}`} size={14} />);
  return stars;
};

const formatDate = (date) => {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return date;
  }
};

const ReviewCard = ({ rev }) => {
  const r = rev || {};
  // Support both the shape saved by ReviewModal (reviewerName/comment/createdAt)
  // and the legacy shape (name/review/date).
  const name = r.reviewerName || r.name || "Client";
  const image = r.image || r.reviewerPhoto;
  const date = r.createdAt || r.date;
  const rating = r.rating || 0;
  const review = r.comment || r.review || "";
  const category = r.category;

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group relative h-full overflow-hidden rounded-2xl bg-white border border-line p-7 flex flex-col gap-5 shadow-soft hover:border-primary/40 transition-colors duration-300"
    >
      {/* Decorative quote */}
      <FaQuoteLeft
        className="absolute -top-2 -right-2 text-primary/5 group-hover:text-primary/10 transition-colors duration-500"
        size={110}
      />

      {/* Header */}
      <div className="flex items-center gap-4 relative z-10">
        <img
          src={
            image ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FE6D06&color=fff`
          }
          alt={name}
          onError={(e) => {
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FE6D06&color=fff`;
          }}
          className="h-14 w-14 rounded-full object-cover ring-2 ring-cream shadow-md"
        />

        <div className="min-w-0">
          <h4 className="font-display font-semibold text-ink truncate">{name}</h4>
          <p className="text-xs text-body-text/70">{formatDate(date)}</p>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 relative z-10">
        <div className="flex items-center gap-1 text-primary">{renderStars(rating)}</div>
        <span className="text-sm font-semibold text-ink">{Number(rating).toFixed(1)}</span>
      </div>

      {/* Review */}
      <p className="text-[15px] text-body-text leading-relaxed relative z-10 line-clamp-5 italic">
        &ldquo;{review}&rdquo;
      </p>

      {/* Divider */}
      <div className="relative z-10 h-px w-full bg-gradient-to-r from-primary/40 via-primary/10 to-transparent" />

      {/* Category */}
      {category && (
        <span className="relative z-10 mt-auto w-fit rounded-full bg-primary-tint px-3 py-1 text-xs font-semibold text-primary capitalize">
          {category === "both" ? "Photo & Video" : category}
        </span>
      )}
    </motion.article>
  );
};

export default ReviewCard;
