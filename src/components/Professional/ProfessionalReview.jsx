import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaQuoteLeft,
} from "react-icons/fa";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import useReview from "../Hooks/useReview";
import Loading from "../Root/Loading";

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

const PER_PAGE = 3;

// Testimonials from the live reviews collection (GET /reviews via useReview).
// Supports both the shape saved by ReviewModal (reviewerName/comment/createdAt)
// and the legacy static shape (name/review/date).
const ProfessionalReview = () => {
  const [reviews, , isLoading] = useReview();
  const [page, setPage] = useState(0);

  if (isLoading) return <Loading />;

  const list = Array.isArray(reviews) ? reviews : [];
  if (list.length === 0) return null;

  const totalPages = Math.ceil(list.length / PER_PAGE);
  const visible = list.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  const avgRating = (
    list.reduce((sum, r) => sum + (r.rating || 0), 0) / list.length
  ).toFixed(1);

  const prev = () => setPage((p) => (p - 1 + totalPages) % totalPages);
  const next = () => setPage((p) => (p + 1) % totalPages);

  return (
    <section className="relative bg-cream py-20 md:py-24 overflow-hidden">
      <div className="dot-grid absolute top-12 left-8 w-32 h-32 opacity-40 pointer-events-none hidden lg:block" />

      <div className="max-w-7xl mx-auto px-5 md:px-8">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <span className="mk-eyebrow mb-3 block">Testimonials</span>
            <h2 className="mk-h2 mb-4">Customer Success Stories</h2>
            <p className="mk-lead !text-base md:!text-lg">
              Hear directly from small businesses that have grown with Taskra &mdash; real
              results, real people, real reviews.
            </p>
          </div>

          {/* Nav arrows */}
          {totalPages > 1 && (
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={prev}
                aria-label="Previous reviews"
                className="w-11 h-11 rounded-full border border-line bg-white text-ink flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-colors"
              >
                <FiChevronLeft size={20} />
              </button>
              <span className="text-sm font-semibold text-body-text tabular-nums">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={next}
                aria-label="Next reviews"
                className="w-11 h-11 rounded-full border border-line bg-white text-ink flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-colors"
              >
                <FiChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="mb-12 flex flex-wrap items-center gap-x-10 gap-y-4">
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl font-semibold text-ink">{avgRating}</span>
            <span className="text-sm text-body-text">Average rating</span>
          </div>
          <div className="hidden sm:block h-6 w-px bg-line" />
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl font-semibold text-ink">
              {list.length}+
            </span>
            <span className="text-sm text-body-text">Verified reviews</span>
          </div>
          <div className="hidden sm:block h-6 w-px bg-line" />
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl font-semibold text-ink">98%</span>
            <span className="text-sm text-body-text">Would recommend</span>
          </div>
        </div>

        {/* Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {visible.map((rev, index) => {
              const name = rev.reviewerName || rev.name || "Client";
              const image = rev.image || rev.reviewerPhoto;
              const date = rev.createdAt || rev.date;
              const rating = rev.rating || 0;
              const text = rev.comment || rev.review || "";
              const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                name
              )}&background=FE6D06&color=fff`;

              return (
                <article
                  key={rev._id || `${page}-${index}`}
                  className="group relative h-full overflow-hidden rounded-2xl bg-white border border-line shadow-soft p-7 flex flex-col gap-5 hover:border-primary/40 transition-colors"
                >
                  <FaQuoteLeft
                    className="absolute -top-2 -right-2 text-primary/5 group-hover:text-primary/10 transition-colors duration-500"
                    size={100}
                  />

                  {/* Header */}
                  <div className="flex items-center gap-4 relative z-10">
                    <img
                      src={image || fallbackAvatar}
                      alt={name}
                      onError={(e) => {
                        e.currentTarget.src = fallbackAvatar;
                      }}
                      className="h-14 w-14 rounded-full object-cover ring-2 ring-white shadow-soft"
                    />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-ink truncate">{name}</h4>
                      <p className="text-xs text-body-text/70">{formatDate(date)}</p>
                    </div>
                  </div>

                  {/* Star rating */}
                  <div className="flex items-center gap-1 text-primary relative z-10">
                    {renderStars(rating)}
                    <span className="ml-2 text-xs font-bold text-body-text">
                      {rating.toFixed ? rating.toFixed(1) : rating}
                    </span>
                  </div>

                  {/* Review text */}
                  <p className="text-body-text text-[15px] leading-relaxed relative z-10 flex-grow">
                    "{text}"
                  </p>

                  {rev.category && (
                    <span className="relative z-10 inline-flex w-fit items-center rounded-full bg-primary-tint text-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                      {rev.category}
                    </span>
                  )}
                </article>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ProfessionalReview;
