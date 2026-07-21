import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiMessageSquare,
  FiBook,
} from "react-icons/fi";
import {
  FaSave,
  FaImages,
  FaVideo,
  FaCalendarAlt,
  FaBriefcase,
  FaCheckCircle,
  FaTrophy,
  FaGlobe,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaPinterest,
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
} from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import useUser from "../Hooks/useUser";
import useAxios from "../Hooks/useAxios";
import useAuth from "../Hooks/useAuth";
import useReview from "../Hooks/useReview";
import useSave from "../Hooks/useSave";
import useLoginUser from "../Hooks/useLoginUser";
import Loading from "../Root/Loading";
import ReviewModal from "./ReviewModal";
import ReviewCard from "../Review/ReviewCard";

const ViewFreelencer = () => {
  const { users, isLoading } = useUser();
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxios();
  const { user } = useAuth();
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [review] = useReview();
  const [save, saveRefetch] = useSave();
  const filterReview = (review && review.filter((r) => r.freelancerId == id)) || [];
  const { currentUser } = useLoginUser();

  // Has the logged-in user already saved this professional?
  const isSaved = !!save?.some((s) => s.freelancerId === id && s.userEmail === user?.email);

  // Average rating across this freelancer's reviews
  const reviewCount = filterReview.length;
  const avgRating =
    reviewCount > 0
      ? filterReview.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviewCount
      : 0;

  const renderStars = (value = 0) => {
    const stars = [];
    const full = Math.floor(value);
    const half = value - full >= 0.5;
    for (let i = 0; i < full; i++) stars.push(<FaStar key={`f-${i}`} className="text-primary" />);
    if (half) stars.push(<FaStarHalfAlt key="half" className="text-primary" />);
    const remaining = 5 - full - (half ? 1 : 0);
    for (let i = 0; i < remaining; i++)
      stars.push(<FaRegStar key={`e-${i}`} className="text-primary" />);
    return stars;
  };

  const handleSave = async (freelancer) => {
    if (!user) {
      return toast.error("Please login first");
    }

    try {
      const payload = {
        freelancerId: freelancer._id,
        freelancerName: freelancer.name,
        freelancerEmail: freelancer.email,
        freelancerPhoto: freelancer.photo,
        role: freelancer.role,
        skills: freelancer.skills,
        location: freelancer.location,
        userEmail: user.email,
      };

      const res = await axiosSecure.post("/save", payload);

      if (res.data.insertedId) {
        toast.success("Professional saved successfully!");
        saveRefetch();
      }
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || "Already saved");
      } else {
        toast.error("Something went wrong");
      }
    }
  };

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

  if (isLoading) return <Loading />;

  const freelancer = users?.find((u) => u._id == id);

  if (!freelancer) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h2 className="mk-h2 mb-4">Freelancer Not Found</h2>
          <button onClick={() => navigate("/search-professional")} className="btn-pill">
            Back to Professionals
          </button>
        </div>
      </div>
    );
  }

  const tierStyle = (tier) =>
    tier === "Bronze"
      ? "bg-amber-700/10 text-amber-900 border-b border-amber-700/20"
      : tier === "Silver"
        ? "bg-slate-300/20 text-slate-700 border-b border-slate-300/40"
        : "bg-primary-tint text-primary border-b border-primary/20";

  return (
    <div className="min-h-screen bg-cream py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Profile header */}
        <div className="bg-white rounded-2xl border border-line shadow-soft p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Profile image */}
            <div className="flex-shrink-0">
              <div className="frame-img w-40 h-40 rotate-1">
                <img src={freelancer.photo} alt={freelancer.name} />
              </div>
            </div>

            {/* Profile info */}
            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <p className="mk-eyebrow mb-1">Professional profile</p>
                  <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink mb-2">
                    {freelancer.businessName || freelancer.name || "Not given"}
                  </h1>
                  <p className="text-body-text mb-3">{freelancer.bio}</p>

                  {/* Average rating */}
                  <div className="flex items-center gap-2 mb-2">
                    {reviewCount > 0 ? (
                      <>
                        <div className="flex items-center gap-1 text-lg">
                          {renderStars(avgRating)}
                        </div>
                        <span className="font-bold text-ink">{avgRating.toFixed(1)}</span>
                        <span className="text-sm text-body-text/70">
                          ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-body-text/50 italic">
                        No reviews given yet
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleSave(freelancer)}
                  disabled={currentUser?.role !== "client" || isSaved}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold whitespace-nowrap transition ${
                    isSaved
                      ? "bg-success-bg text-success-text cursor-default"
                      : currentUser?.role === "client"
                        ? "bg-primary text-white hover:bg-primary-hover shadow-sm"
                        : "bg-cream border border-line text-body-text/50 cursor-not-allowed"
                  }`}
                >
                  {isSaved ? (
                    <>
                      <FaCheckCircle /> Saved
                    </>
                  ) : (
                    <>
                      <FaSave /> Save Me
                    </>
                  )}
                </button>
              </div>

              {/* Skills tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {freelancer.skills?.split(",").map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-1.5 bg-primary-tint uppercase text-primary rounded-full text-xs font-bold tracking-wide"
                  >
                    {skill.trim() == "both" ? "Video & Photography" : skill.trim()}
                  </span>
                ))}
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="icon-chip">
                    <FiMapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-body-text/70">Location</p>
                    <p className="font-semibold text-ink text-sm">
                      {freelancer.location || "Not given"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="icon-chip">
                    <FiMapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-body-text/70">Coverage Area</p>
                    <p className="font-semibold text-ink text-sm">
                      {freelancer.coverage_area} km
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="icon-chip">
                    <FiBriefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-body-text/70">Role</p>
                    <p className="font-semibold text-ink text-sm capitalize">{freelancer.role}</p>
                  </div>
                </div>

                {/* Profile completion / verification */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      freelancer.isVerified ? "bg-success-bg" : "bg-primary-tint"
                    }`}
                  >
                    <FaCheckCircle
                      className={`w-5 h-5 ${
                        freelancer.isVerified ? "text-success-text" : "text-primary"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-body-text/70">Status</p>
                    <p className="font-semibold text-sm capitalize flex items-center gap-2">
                      {freelancer.isVerified ? (
                        <span className="text-success-text flex items-center gap-1">
                          Verified <FaTrophy className="text-primary text-xs" />
                        </span>
                      ) : (
                        <span className="text-primary">
                          {freelancer.profileCompletion || 0}% Complete
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact + About */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="flex flex-col gap-8">
            {/* Contact details */}
            <div className="bg-white rounded-2xl border border-line shadow-soft p-6 md:p-8 h-fit">
              <h2 className="font-display text-2xl font-semibold text-ink mb-6 flex items-center">
                <FiMail className="w-6 h-6 mr-3 text-primary" />
                Contact Information
              </h2>

              <div className="space-y-4">
                {freelancer.businessEmail && (
                  <div className="flex items-start gap-4 p-4 bg-cream rounded-xl hover:bg-primary-tint transition">
                    <div className="icon-chip !w-10 !h-10">
                      <FiMail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-body-text/70 mb-1">Business Email</p>
                      <a
                        href={`mailto:${freelancer.businessEmail}`}
                        className="text-ink font-medium hover:text-primary transition break-all text-sm"
                      >
                        {freelancer.businessEmail}
                      </a>
                    </div>
                  </div>
                )}

                {freelancer.businessPhone && (
                  <div className="flex items-start gap-4 p-4 bg-cream rounded-xl hover:bg-primary-tint transition">
                    <div className="icon-chip !w-10 !h-10">
                      <FiPhone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-body-text/70 mb-1">Business Phone</p>
                      <a
                        href={`tel:${freelancer.businessPhone}`}
                        className="text-ink font-medium hover:text-primary transition text-sm"
                      >
                        {freelancer.businessPhone}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4 p-4 bg-cream rounded-xl hover:bg-primary-tint transition">
                  <div className="icon-chip !w-10 !h-10">
                    <FiMapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-body-text/70 mb-1">Location</p>
                    <p className="text-ink font-medium text-sm">
                      {freelancer.location || "Not given"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social links */}
            {(freelancer.website ||
              freelancer.facebook ||
              freelancer.instagram ||
              freelancer.youtube ||
              freelancer.tiktok ||
              freelancer.pinterest) && (
              <div className="bg-white rounded-2xl border border-line shadow-soft p-6 md:p-8 h-fit">
                <h2 className="font-display text-2xl font-semibold text-ink mb-6 flex items-center">
                  <FaGlobe className="w-6 h-6 mr-3 text-primary" />
                  Online Presence
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {freelancer.website && (
                    <a
                      href={freelancer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-cream rounded-xl hover:bg-primary-tint transition text-ink hover:text-primary"
                    >
                      <FaGlobe className="text-primary" size={18} />
                      <span className="font-medium text-sm">Website</span>
                    </a>
                  )}
                  {freelancer.facebook && (
                    <a
                      href={freelancer.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-cream rounded-xl hover:bg-primary-tint transition text-ink hover:text-primary"
                    >
                      <FaFacebook className="text-primary" size={18} />
                      <span className="font-medium text-sm">Facebook</span>
                    </a>
                  )}
                  {freelancer.instagram && (
                    <a
                      href={freelancer.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-cream rounded-xl hover:bg-primary-tint transition text-ink hover:text-primary"
                    >
                      <FaInstagram className="text-primary" size={18} />
                      <span className="font-medium text-sm">Instagram</span>
                    </a>
                  )}
                  {freelancer.youtube && (
                    <a
                      href={freelancer.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-cream rounded-xl hover:bg-primary-tint transition text-ink hover:text-primary"
                    >
                      <FaYoutube className="text-primary" size={18} />
                      <span className="font-medium text-sm">YouTube</span>
                    </a>
                  )}
                  {freelancer.tiktok && (
                    <a
                      href={freelancer.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-cream rounded-xl hover:bg-primary-tint transition text-ink hover:text-primary"
                    >
                      <FaTiktok className="text-primary" size={18} />
                      <span className="font-medium text-sm">TikTok</span>
                    </a>
                  )}
                  {freelancer.pinterest && (
                    <a
                      href={freelancer.pinterest}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-cream rounded-xl hover:bg-primary-tint transition text-ink hover:text-primary"
                    >
                      <FaPinterest className="text-primary" size={18} />
                      <span className="font-medium text-sm">Pinterest</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* About */}
          <div className="bg-white rounded-2xl border border-line shadow-soft p-6 md:p-8">
            <h2 className="font-display text-2xl font-semibold text-ink mb-6 flex items-center">
              <FiBriefcase className="w-6 h-6 mr-3 text-primary" />
              About
            </h2>
            <p className="text-body-text leading-relaxed mb-6 whitespace-pre-wrap">
              {freelancer.bio}
            </p>
            {freelancer.description && (
              <p className="text-body-text/90 mb-6 whitespace-pre-wrap mt-2">
                {freelancer.description}
              </p>
            )}

            <div className="border-t border-line pt-6">
              <h3 className="text-lg font-semibold text-ink mb-4">Skills &amp; Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {freelancer.skills?.split(",").map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-1.5 bg-primary-tint uppercase text-primary rounded-full text-xs font-bold tracking-wide"
                  >
                    {skill.trim() == "both" ? "Video & Photography" : skill.trim()}
                  </span>
                ))}
              </div>
            </div>

            {freelancer.services && (
              <div className="border-t border-line pt-6 mt-6">
                <h3 className="text-lg font-semibold text-ink mb-4">Services Offered</h3>
                <div className="flex flex-wrap gap-2">
                  {freelancer.services?.split(",").map((service, index) => (
                    <span
                      key={index}
                      className="px-4 py-1.5 bg-primary-tint uppercase text-primary rounded-full text-xs font-bold tracking-wide"
                    >
                      {service.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-line pt-6 mt-6">
              <h3 className="text-lg font-semibold text-ink mb-4">Service Area</h3>
              <div className="flex items-center gap-3 p-4 bg-primary-tint rounded-xl">
                <FiMapPin className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-body-text">Available within a radius of</p>
                  <p className="text-xl font-bold text-primary">
                    {freelancer.coverage_area} kilometers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service packages (tiered) */}
        {freelancer?.servicePackages && freelancer.servicePackages.length > 0 && (
          <div className="bg-white rounded-2xl border border-line shadow-soft p-6 md:p-8 mb-8">
            <h2 className="font-display text-2xl font-semibold text-ink mb-6 flex items-center">
              <FaBriefcase className="w-6 h-6 mr-3 text-primary" />
              Service Packages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {freelancer.servicePackages.map((pkg, index) =>
                pkg.name ? (
                  <div
                    key={index}
                    className="flex flex-col border border-line rounded-2xl overflow-hidden hover:shadow-md transition-all"
                  >
                    <div className={`py-4 text-center ${tierStyle(pkg.tier)}`}>
                      <h4 className="font-black text-sm tracking-widest uppercase">{pkg.tier}</h4>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h5 className="font-display font-semibold text-ink text-lg mb-2">
                        {pkg.name}
                      </h5>
                      <div className="mb-4">
                        <span className="text-2xl font-bold text-primary">£{pkg.price}</span>
                      </div>
                      <p className="text-sm text-body-text flex-1 mb-4">{pkg.description}</p>
                      <div className="mt-auto flex items-center gap-2 text-sm text-ink font-medium bg-cream p-2.5 rounded-xl justify-center border border-line">
                        <FaCalendarAlt className="text-primary" />
                        Delivery: {pkg.deliveryTime} Days
                      </div>
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}

        {/* Portfolio images */}
        {freelancer?.portfolioImages && freelancer.portfolioImages.length > 0 && (
          <div className="bg-white rounded-2xl border border-line shadow-soft p-6 md:p-8 mb-8">
            <h2 className="font-display text-2xl font-semibold text-ink mb-6 flex items-center">
              <FaImages className="w-6 h-6 mr-3 text-primary" />
              Portfolio Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
              {freelancer.portfolioImages.map((image, index) => (
                <div key={index} className="frame-img aspect-square overflow-hidden">
                  <img
                    src={image}
                    alt={`${freelancer.name} Portfolio ${index + 1}`}
                    className="hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video portfolio */}
        {freelancer?.videoLinks && freelancer.videoLinks.length > 0 && (
          <div className="bg-white rounded-2xl border border-line shadow-soft p-6 md:p-8 mb-8">
            <h2 className="font-display text-2xl font-semibold text-ink mb-6 flex items-center">
              <FaVideo className="w-6 h-6 mr-3 text-primary" />
              Video Portfolio
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {freelancer.videoLinks.map((video, index) => {
                const getYouTubeId = (url) => {
                  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                  const match = url.match(regExp);
                  return match && match[2].length === 11 ? match[2] : null;
                };

                const videoId = getYouTubeId(video);
                const thumbnailUrl = videoId
                  ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                  : "https://placehold.co/480x360?text=Video";

                return (
                  <a
                    key={index}
                    href={video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-video rounded-2xl overflow-hidden shadow-soft hover:shadow-lg transition-all duration-300 block bg-cream border border-line"
                  >
                    <img
                      src={thumbnailUrl}
                      alt={`${freelancer.name} Video ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-ink/30 group-hover:bg-ink/40 transition-all duration-300 flex items-center justify-center">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[14px] border-l-white border-b-8 border-b-transparent ml-1"></div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="bg-white rounded-2xl border border-line shadow-soft p-6 md:p-8 mb-8">
          <h2 className="mk-h2 !text-2xl mb-6">Ready to work together?</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => handleMessage(freelancer._id)} className="btn-pill flex-1">
              <FiMessageSquare className="w-5 h-5" />
              Send Message
            </button>
            {/* Review — enabled for clients only */}
            <button
              onClick={() => setIsReviewOpen(true)}
              disabled={currentUser?.role !== "client"}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-full border px-8 py-3.5 text-[15px] font-bold tracking-wide transition ${
                currentUser?.role === "client"
                  ? "border-primary text-primary hover:bg-primary-tint"
                  : "border-line text-body-text/50 cursor-not-allowed"
              }`}
            >
              <FiBook className="w-5 h-5" />
              Review
            </button>
          </div>
        </div>
      </div>

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        freelancer={freelancer}
      />

      {/* Reviews section */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <p className="mk-eyebrow mb-2">Testimonials</p>
            <h2 className="mk-h2 flex items-center gap-3">
              <FaStar className="text-primary" />
              Client Reviews
            </h2>
            <p className="text-body-text text-sm mt-1">
              What clients say about {freelancer.name}
            </p>
          </div>

          {reviewCount > 0 && (
            <div className="flex items-center gap-3 bg-white border border-line rounded-2xl px-4 py-2.5 w-fit shadow-soft">
              <span className="font-display text-3xl font-semibold text-ink">
                {avgRating.toFixed(1)}
              </span>
              <div>
                <div className="flex items-center gap-0.5 text-sm">{renderStars(avgRating)}</div>
                <p className="text-xs text-body-text/70 mt-0.5">
                  Based on {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>
          )}
        </div>

        {reviewCount > 0 ? (
          <Swiper
            slidesPerView={1.1}
            spaceBetween={16}
            loop={filterReview.length > 3}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{ clickable: true }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            modules={[Pagination, Autoplay]}
            className="pb-10"
          >
            {filterReview.map((rev, index) => (
              <SwiperSlide key={index} className="h-auto">
                <ReviewCard rev={rev} />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-line mb-10">
            <FaRegStar className="w-12 h-12 mx-auto mb-3 text-line" />
            <h3 className="text-lg font-semibold text-ink mb-1">No reviews given yet</h3>
            <p className="text-body-text text-sm">
              Be the first client to leave a review for {freelancer.name}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewFreelencer;
