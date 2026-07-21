import { useState } from "react";
import { FiX } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import toast from "react-hot-toast";
import useAxios from "../Hooks/useAxios";
import useLoginUser from "../Hooks/useLoginUser";
import useReview from "../Hooks/useReview";

const ReviewModal = ({ isOpen, onClose, freelancer }) => {
  const axiosSecure = useAxios();
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState("");
  const { currentUser } = useLoginUser();
  const [, refetchReviews] = useReview();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validation
    if (!comment || !rating) {
      return toast.error("Please fill all fields");
    }

    if (rating < 1 || rating > 5) {
      return toast.error("Rating must be between 1-5");
    }

    const reviewData = {
      freelancerId: freelancer._id,
      freelancerName: freelancer.name,
      image: freelancer.photo,
      category: freelancer.skills,
      reviewerEmail: currentUser?.email,
      reviewerName: currentUser?.name,
      comment,
      rating: parseInt(rating),
      createdAt: new Date(),
    };

    try {
      const res = await axiosSecure.post("/reviews", reviewData);

      if (res.data) {
        toast.success("Review submitted successfully!");
        setComment("");
        setRating("");
        refetchReviews();
        onClose();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to submit review");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl border border-line shadow-soft p-7 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-body-text hover:bg-primary-tint hover:text-primary transition"
          aria-label="Close"
        >
          <FiX size={18} />
        </button>

        <p className="mk-eyebrow mb-1.5">Leave a review</p>
        <h2 className="font-display text-2xl font-semibold text-ink mb-5">
          Review {freelancer?.name}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review..."
            className="w-full rounded-2xl border border-line bg-white p-4 text-sm text-ink placeholder:text-body-text/50 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition resize-none"
            rows={4}
          />

          {/* Star picker */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className={`text-2xl transition ${
                  rating >= star ? "text-primary" : "text-line"
                } hover:scale-110`}
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
              >
                <FaStar />
              </button>
            ))}
            {rating && (
              <span className="text-sm font-semibold text-ink ml-2">{rating}/5</span>
            )}
          </div>

          <button type="submit" className="btn-pill w-full">
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
