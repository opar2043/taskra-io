import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBriefcase,
  FaCalendarAlt,
  FaChartLine,
  FaCheckCircle,
  FaEdit,
  FaEnvelope,
  FaExternalLinkAlt,
  FaFacebook,
  FaFileAlt,
  FaGlobe,
  FaImages,
  FaInstagram,
  FaMapMarkerAlt,
  FaMapPin,
  FaMoneyBillWave,
  FaPhone,
  FaPinterest,
  FaTiktok,
  FaUser,
  FaVideo,
  FaYoutube,
} from "react-icons/fa";
import Swal from "sweetalert2";
import useLoginUser from "../../Hooks/useLoginUser";
import useFrelencerStat from "../../Hooks/useFrelencerStat";
import useJobs from "../../Hooks/useJobs";
import Loading from "../../Root/Loading";
import NoData from "../../utils/NoData";
import TutorialModal from "../../DashboardTutorial/TutorialModal";

const fmtMoney = (n = 0) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

const getYouTubeId = (url = "") => {
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return match && match[2].length === 11 ? match[2] : null;
};

const SOCIALS = [
  { key: "facebook", Icon: FaFacebook, title: "Facebook" },
  { key: "instagram", Icon: FaInstagram, title: "Instagram" },
  { key: "youtube", Icon: FaYoutube, title: "YouTube" },
  { key: "website", Icon: FaGlobe, title: "Website" },
  { key: "tiktok", Icon: FaTiktok, title: "TikTok" },
  { key: "pinterest", Icon: FaPinterest, title: "Pinterest" },
];

// Large circular completion ring for the identity panel.
const CompletionRing = ({ value, size = 148, stroke = 10 }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const done = value === 100;
  const color = done ? "var(--color-success-text)" : "var(--color-primary)";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-bg-app)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (circumference * value) / 100}
          style={{ transition: "stroke-dashoffset .6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${done ? "text-success-text" : "text-primary"}`}>
          {value}%
        </span>
        <span className="tk-eyebrow mt-0.5">Complete</span>
      </div>
    </div>
  );
};

// View of the logged-in user's own profile.
const Profile = () => {
  const { currentUser, isLoading } = useLoginUser();
  const [dbStats] = useFrelencerStat(currentUser?.email);
  const [jobs] = useJobs();
  const navigate = useNavigate();

  const isFreelancer = currentUser?.role === "professional";
  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "owner";
  const isClient = currentUser?.role === "client";

  const myActivity = useMemo(
    () => (jobs || []).filter((job) => job.email === currentUser?.email),
    [jobs, currentUser?.email]
  );

  // Role-aware overview stats (fields per role in API_CONTRACT.md)
  const stats = isFreelancer
    ? [
        { label: "Projects Completed", value: dbStats?.completedProjects || 0, icon: FaBriefcase, link: "/dashboard/completed-projects" },
        { label: "Total Earnings", value: fmtMoney(dbStats?.totalEarnings), icon: FaMoneyBillWave, link: "/dashboard/earnings" },
        { label: "Bids Sent", value: dbStats?.bidsSent || 0, icon: FaFileAlt, link: "/dashboard/my-proposals" },
        { label: "Total Projects", value: dbStats?.totalProjects || 0, icon: FaChartLine, link: "/dashboard/my-proposals" },
      ]
    : isClient
      ? [
          { label: "Jobs Posted", value: dbStats?.jobsPosted || 0, icon: FaBriefcase, link: "/dashboard/my-jobs" },
          { label: "Active Projects", value: dbStats?.inprogressProjects || 0, icon: FaChartLine, link: "/dashboard/my-jobs" },
          { label: "Total Spent", value: fmtMoney(dbStats?.totalSpent), icon: FaMoneyBillWave, link: "/dashboard/invoice" },
          { label: "Quotes Received", value: dbStats?.quotesReceived || 0, icon: FaFileAlt, link: "/dashboard/my-jobs" },
        ]
      : [
          { label: "Total Users", value: dbStats?.totalUsers || 0, icon: FaUser, link: "/dashboard/clients" },
          { label: "Active Jobs", value: dbStats?.totalJobs || 0, icon: FaBriefcase, link: "/dashboard/all-jobs" },
          { label: "Total Revenue", value: fmtMoney(dbStats?.totalRevenue), icon: FaMoneyBillWave, link: "/dashboard/transactions" },
          { label: "Total Orders", value: dbStats?.totalOrders || 0, icon: FaChartLine, link: "/dashboard/orders" },
        ];

  const handleViewPortfolio = () => {
    const hasPortfolio =
      currentUser?.portfolioImages?.some((img) => img?.trim?.()) ||
      currentUser?.videoLinks?.some((vid) => vid?.trim?.());

    if (!hasPortfolio) {
      Swal.fire({
        icon: "info",
        title: "No portfolio yet",
        text: "Please add your portfolio from the settings page.",
        showCancelButton: true,
        confirmButtonText: "Go to Settings",
        cancelButtonText: "Close",
        confirmButtonColor: "#FE6D06",
        cancelButtonColor: "#6b7280",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          navigate(`/dashboard/settings/${currentUser?._id}`);
        }
      });
      return;
    }
    navigate(`/view-freelencer/${currentUser._id}`);
  };

  if (isLoading || !currentUser) return <Loading />;

  const completion = currentUser?.profileCompletion || 0;
  const socials = SOCIALS.filter((s) => currentUser?.[s.key]);
  const hasProDetails =
    isFreelancer &&
    (currentUser?.skills ||
      currentUser?.services ||
      currentUser?.coverage_area ||
      currentUser?.bio ||
      currentUser?.description);

  const contactRows = [
    { Icon: FaEnvelope, value: currentUser?.email },
    { Icon: FaPhone, value: currentUser?.phone },
    { Icon: FaMapMarkerAlt, value: currentUser?.location },
    {
      Icon: FaCalendarAlt,
      value: currentUser?.createdAt
        ? `Joined ${new Date(currentUser.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}`
        : null,
    },
  ].filter((row) => row.value);

  return (
    <div className="tk-page">
      <TutorialModal
        componentName="my-profile"
        title="Your profile"
        description="This is how your account looks from the inside."
        listItems={[
          "Check your profile completion to unlock verification",
          "Keep contact details and social links fresh",
          "Use Edit Profile to update anything",
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ── LEFT: identity panel ─────────────────────── */}
        <div className="lg:col-span-4 lg:sticky lg:top-6">
          <div className="tk-card p-6 flex flex-col items-center text-center">
            <img
              src={currentUser?.photo || "https://via.placeholder.com/150"}
              alt="Profile"
              className="w-28 h-28 rounded-full border-4 border-primary-tint object-cover"
            />
            <h1 className="mt-4 text-xl font-bold text-ink">{currentUser?.name}</h1>
            {currentUser?.businessName && (
              <p className="text-sm text-body-text/80 mt-0.5">{currentUser.businessName}</p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
              <span className="tk-badge-info capitalize">{currentUser?.role}</span>
              {currentUser?.isVerified && (
                <span className="tk-badge-success">
                  <FaCheckCircle /> Verified
                </span>
              )}
            </div>

            {/* Completion ring */}
            <div className="mt-6 flex flex-col items-center">
              <CompletionRing value={completion} />
              {currentUser?.profileCompletionMessage && (
                <p className="text-xs text-body-text/70 mt-3 max-w-xs leading-relaxed">
                  {currentUser.profileCompletionMessage}
                </p>
              )}
              {isFreelancer && completion === 100 && !currentUser?.isVerified && (
                <span className="tk-badge-warning mt-3">
                  <FaCheckCircle /> Ready for verification
                </span>
              )}
            </div>

            {/* Contact rows */}
            <div className="w-full mt-6 pt-5 border-t border-line-app space-y-3 text-left">
              {contactRows.map((row, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-body-text min-w-0">
                  <span className="w-8 h-8 rounded-lg bg-primary-tint text-primary flex items-center justify-center shrink-0">
                    <row.Icon className="text-xs" />
                  </span>
                  <span className="truncate">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Social links */}
            {socials.length > 0 && (
              <div className="w-full mt-5 pt-5 border-t border-line-app">
                <div className="flex flex-wrap justify-center gap-2">
                  {socials.map((social) => (
                    <a
                      key={social.key}
                      href={currentUser[social.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={social.title}
                      className="w-10 h-10 rounded-xl bg-app-bg text-body-text flex items-center justify-center hover:bg-primary-tint hover:text-primary transition-colors"
                    >
                      <social.Icon />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <Link
              to={`/dashboard/settings/${currentUser?._id}`}
              className="tk-btn-primary w-full mt-6"
            >
              <FaEdit /> Edit profile
            </Link>
          </div>
        </div>

        {/* ── RIGHT: content ───────────────────────────── */}
        <div className="lg:col-span-8 space-y-5">
          {/* Stat tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Link
                to={stat.link}
                key={stat.label}
                className="tk-card p-5 hover:border-primary transition-colors block"
              >
                <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center mb-3">
                  <stat.icon />
                </div>
                <p className="text-2xl font-bold text-ink mb-1">{stat.value}</p>
                <p className="text-xs text-body-text/70">{stat.label}</p>
              </Link>
            ))}
          </div>

          {/* Portfolio gallery (professionals) */}
          {isFreelancer && (
            <div className="tk-card p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-base font-semibold text-ink flex items-center gap-2">
                  <FaImages className="text-primary" /> Portfolio
                </h3>
                <button
                  type="button"
                  onClick={handleViewPortfolio}
                  className="text-sm font-semibold text-primary hover:text-primary-hover flex items-center gap-1.5"
                >
                  View public page <FaExternalLinkAlt className="text-xs" />
                </button>
              </div>
              {currentUser?.portfolioImages?.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {currentUser.portfolioImages.map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-xl overflow-hidden bg-app-bg border border-line-app"
                    >
                      <img
                        src={image}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-line-app rounded-2xl py-10 text-center">
                  <FaImages className="mx-auto text-4xl text-body-text/20 mb-2" />
                  <p className="text-body-text/70 text-sm">No portfolio images yet.</p>
                  <Link
                    to={`/dashboard/settings/${currentUser?._id}`}
                    className="tk-btn-primary h-9 mt-4"
                  >
                    Add portfolio
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Video portfolio (professionals) */}
          {isFreelancer && currentUser?.videoLinks?.length > 0 && (
            <div className="tk-card p-6">
              <h3 className="text-base font-semibold text-ink flex items-center gap-2 mb-4">
                <FaVideo className="text-primary" /> Video Portfolio
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentUser.videoLinks.map((video, index) => {
                  const videoId = getYouTubeId(video);
                  const thumbnailUrl = videoId
                    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                    : "https://via.placeholder.com/480x360?text=Video";
                  return (
                    <a
                      key={index}
                      href={video}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-video rounded-xl overflow-hidden block bg-app-bg"
                    >
                      <img
                        src={thumbnailUrl}
                        alt={`Video ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-ink/30 group-hover:bg-ink/40 transition-colors flex items-center justify-center">
                        <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-soft">
                          <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[14px] border-l-white border-b-8 border-b-transparent ml-1"></div>
                        </div>
                      </div>
                      <span className="absolute top-2.5 left-2.5 bg-primary text-white px-2.5 py-1 rounded-full text-[11px] font-semibold">
                        Video {index + 1}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Service packages (professionals) */}
          {isFreelancer && currentUser?.servicePackages?.some((pkg) => pkg.name) && (
            <div className="tk-card p-6">
              <h3 className="text-base font-semibold text-ink flex items-center gap-2 mb-4">
                <FaBriefcase className="text-primary" /> Service Packages
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentUser.servicePackages.map((pkg, index) =>
                  pkg.name ? (
                    <div
                      key={index}
                      className="flex flex-col border border-line-app rounded-2xl overflow-hidden"
                    >
                      <div className="py-3 text-center bg-primary-tint border-b border-line-app">
                        <h4 className="font-bold text-xs tracking-widest uppercase text-primary">
                          {pkg.tier}
                        </h4>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h5 className="font-semibold text-ink text-base mb-1">{pkg.name}</h5>
                        <span className="text-2xl font-bold text-primary mb-3">£{pkg.price}</span>
                        <p className="text-sm text-body-text flex-1 mb-4">{pkg.description}</p>
                        <div className="mt-auto flex items-center gap-2 text-xs text-body-text/70 font-medium bg-app-bg p-2 rounded-xl justify-center">
                          <FaCalendarAlt /> Delivery: {pkg.deliveryTime} days
                        </div>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Professional details (professionals) */}
          {hasProDetails && (
            <div className="tk-card p-6">
              <h3 className="text-base font-semibold text-ink mb-4">About</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {currentUser?.skills && (
                  <div>
                    <p className="tk-eyebrow mb-2">Skills</p>
                    <span className="tk-badge-info capitalize">{currentUser.skills}</span>
                  </div>
                )}
                {currentUser?.coverage_area && (
                  <div>
                    <p className="tk-eyebrow mb-1">Coverage Area</p>
                    <p className="text-sm font-semibold text-ink flex items-center gap-2">
                      <FaMapPin className="text-primary" /> {currentUser.coverage_area} miles
                    </p>
                  </div>
                )}
                {currentUser?.services && (
                  <div className="md:col-span-2">
                    <p className="tk-eyebrow mb-1">Services</p>
                    <p className="text-sm text-body-text">{currentUser.services}</p>
                  </div>
                )}
                {currentUser?.bio && (
                  <div className="md:col-span-2">
                    <p className="tk-eyebrow mb-1">About Me</p>
                    <p className="text-sm text-body-text leading-relaxed">{currentUser.bio}</p>
                  </div>
                )}
                {currentUser?.description && (
                  <div className="md:col-span-2">
                    <p className="tk-eyebrow mb-1">Description</p>
                    <p className="text-sm text-body-text leading-relaxed">
                      {currentUser.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent activity */}
          {myActivity.length > 0 ? (
            <div className="tk-card p-6">
              <h3 className="text-base font-semibold text-ink mb-4">
                {isFreelancer ? "Recent Projects" : isClient ? "Posted Jobs" : "Recent Activity"}
              </h3>
              <div className="space-y-3">
                {myActivity.slice(0, 4).map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between p-4 border border-line-app rounded-xl hover:bg-app-bg/70 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary-tint flex items-center justify-center text-primary shrink-0">
                        <FaBriefcase />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-ink truncate">{item.title}</h4>
                        <p className="text-xs text-body-text/70 truncate">
                          {item.location} · £{item.price}
                        </p>
                      </div>
                    </div>
                    <span className={item.status === "open" ? "tk-badge-success" : "tk-badge-warning"}>
                      {item.status}
                    </span>
                  </div>
                ))}
                {myActivity.length > 4 && (
                  <Link
                    to={isFreelancer ? "/dashboard/browse-jobs" : "/dashboard/my-jobs"}
                    className="block text-center text-sm font-semibold text-primary hover:text-primary-hover mt-2"
                  >
                    View all activity
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <NoData
              title="No activity yet"
              message={
                isFreelancer
                  ? "Start bidding on jobs to see your projects here."
                  : isClient
                    ? "Post your first job to find talented professionals."
                    : "Platform activity will appear here."
              }
              action={
                !isAdmin ? (
                  <Link
                    to={isClient ? "/dashboard/post-job" : "/dashboard/browse-jobs"}
                    className="tk-btn-primary"
                  >
                    {isClient ? "Post a Job" : "Find Jobs"}
                  </Link>
                ) : null
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
