import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiSearch,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiBookmark,
  FiCheckCircle,
  FiArrowRight,
  FiLayers,
  FiCompass,
  FiZap,
  FiX,
} from "react-icons/fi";
import { FaBookmark } from "react-icons/fa";
import useJobs from "../../../Hooks/useJobs";
import useSaveJobs from "../../../Hooks/useSaveJobs";
import useLoginUser from "../../../Hooks/useLoginUser";
import useAxios from "../../../Hooks/useAxios";
import Loading from "../../../Root/Loading";
import NoData from "../../../utils/NoData";
import TutorialModal from "../../../DashboardTutorial/TutorialModal";

// Unified category list (same values as the marketplace job posts)
const unifiedCategories = [
  "All Projects",
  "Photography",
  "Videography",
  "Both",
  "Wedding",
  "Pre-ceremonial parties",
  "Commercial",
  "Real Estate",
  "Music Video",
  "Headshot",
  "UGC Content Creator (TikTok, Reels & Product Videos)",
  "Other",
];

// Quick-toggle chips for the most common lead types.
const quickCategories = ["Photography", "Videography", "Both"];

const BrowseJob = () => {
  const [jobs, , isLoading] = useJobs();
  const [savedJobs, refetchSaved] = useSaveJobs();
  const { currentUser } = useLoginUser() || {};
  const axiosSecure = useAxios();

  const [activeCategory, setActiveCategory] = useState("All Projects");
  const [sortBy, setSortBy] = useState("latest");
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  // Saved rows belonging to me (GET /save-jobs returns ALL rows — filter client-side)
  const mySaved = useMemo(
    () =>
      (savedJobs || []).filter((s) => s?.userEmail === currentUser?.email),
    [savedJobs, currentUser]
  );
  const isJobSaved = (jobId) => mySaved.some((s) => s._id === jobId);

  // Effective location defaults to my location; editing the input overrides it,
  // so the initial (empty) state reproduces the original "near me" filter exactly.
  const effectiveLocation = (locationFilter.trim() || currentUser?.location || "").toLowerCase();

  // Frontend matching: location + selected category (category OR legacy projectType)
  const matchedJobs = useMemo(() => {
    let list = [...(jobs || [])].reverse().filter((job) => {
      const locationMatch = job.location?.toLowerCase() === effectiveLocation;
      let categoryMatch = true;
      if (activeCategory !== "All Projects") {
        categoryMatch =
          job.category === activeCategory || job.projectType === activeCategory;
      }
      let searchMatch = true;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        searchMatch = `${job.title || ""} ${job.description || ""}`
          .toLowerCase()
          .includes(q);
      }
      return locationMatch && categoryMatch && searchMatch;
    });

    if (sortBy === "high") list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    if (sortBy === "low") list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));

    return list.slice(0, 15);
  }, [jobs, effectiveLocation, activeCategory, sortBy, search]);

  // KPI figures — always relative to my own location, independent of the filters.
  const nearYouCount = useMemo(
    () =>
      (jobs || []).filter(
        (job) =>
          job.location?.toLowerCase() === currentUser?.location?.toLowerCase()
      ).length,
    [jobs, currentUser]
  );
  const newTodayCount = useMemo(() => {
    const today = new Date().toDateString();
    return (jobs || []).filter((job) => {
      if (!job.createdAt) return false;
      const d = new Date(job.createdAt);
      return !isNaN(d) && d.toDateString() === today;
    }).length;
  }, [jobs]);

  const activeFilterCount =
    (search.trim() ? 1 : 0) +
    (locationFilter.trim() ? 1 : 0) +
    (activeCategory !== "All Projects" ? 1 : 0);

  const clearFilters = () => {
    setSearch("");
    setLocationFilter("");
    setActiveCategory("All Projects");
  };

  // Save a lead — no server-side dedupe on POST /save-jobs, so check first
  const handleSave = async (job) => {
    if (!currentUser?.email) return toast.error("Please log in first");
    if (isJobSaved(job._id)) {
      return toast("This job is already in your saved list.", { icon: "⚠️" });
    }
    try {
      const res = await axiosSecure.post("/save-jobs", {
        ...job,
        userEmail: currentUser.email,
      });
      if (res.data?.insertedId || res.data?.success || res.data?.acknowledged) {
        toast.success("Job saved to your list!");
        refetchSaved();
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to save job"
      );
    }
  };

  if (isLoading) return <Loading />;

  const stats = [
    { label: "Total Leads", value: jobs?.length || 0, icon: <FiLayers /> },
    { label: "Near You", value: nearYouCount, icon: <FiCompass /> },
    { label: "New Today", value: newTodayCount, icon: <FiZap /> },
  ];

  return (
    <div className="tk-page">
      <TutorialModal
        componentName="BrowseJob"
        title="Welcome to the Browse Projects page"
        description="This is where you will find all the available projects. You can filter and search for projects that match your skills."
        listItems={[
          "Filter by category",
          "Find projects in your location",
          "Sort by latest or budget",
        ]}
      />

      {/* Header */}
      <div>
        <p className="tk-eyebrow mb-1">Find Work</p>
        <h1 className="tk-page-title">Leads</h1>
        <p className="text-sm text-body-text mt-1">
          Fresh photography &amp; videography projects matched to your location.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="tk-card p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-body-text">{s.label}</p>
              <p className="text-2xl font-bold text-ink mt-1">{s.value}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-primary-tint text-primary flex items-center justify-center text-xl shrink-0">
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Filter toolbar */}
      <div className="tk-card p-4 md:p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search */}
          <div className="md:col-span-5 relative">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-body-text/60" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects…"
              className="tk-input pl-9"
            />
          </div>

          {/* Category select */}
          <div className="md:col-span-4">
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="tk-input"
            >
              {unifiedCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Location input */}
          <div className="md:col-span-3 relative">
            <FiMapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-body-text/60" />
            <input
              type="text"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder={currentUser?.location || "Location"}
              className="tk-input pl-9"
            />
          </div>
        </div>

        {/* Quick chips + sort + active count */}
        <div className="flex flex-wrap items-center gap-2">
          {quickCategories.map((cat) => {
            const on = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(on ? "All Projects" : cat)}
                className={`px-3.5 py-1.5 text-sm rounded-full border transition-colors ${
                  on
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-body-text border-line-app hover:border-primary hover:text-primary"
                }`}
              >
                {cat}
              </button>
            );
          })}

          <div className="flex items-center gap-2 ml-auto">
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-sm font-semibold text-body-text hover:text-primary transition-colors"
              >
                <FiX /> Clear ({activeFilterCount})
              </button>
            )}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="tk-input w-auto"
            >
              <option value="latest">Latest</option>
              <option value="high">Budget: High to Low</option>
              <option value="low">Budget: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads grid */}
      {matchedJobs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {matchedJobs.map((job) => {
            const saved = isJobSaved(job._id);
            return (
              <div key={job._id} className="tk-card p-5 flex flex-col h-full">
                {/* Top row: category pill + bookmark */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {job.category && (
                      <span className="tk-badge-info max-w-[150px] truncate">
                        {job.category.length > 22
                          ? job.category.slice(0, 20) + "…"
                          : job.category}
                      </span>
                    )}
                    {job.clientVerified && (
                      <FiCheckCircle
                        className="text-success-text shrink-0"
                        title={
                          job.clientVerifiedReason === "payment"
                            ? "Verified client — completed a payment"
                            : "Verified client — confirmed contact details"
                        }
                      />
                    )}
                  </div>
                  <button
                    onClick={() => handleSave(job)}
                    title={saved ? "Saved" : "Save job"}
                    className={`tk-icon-btn border border-line-app shrink-0 ${
                      saved ? "text-primary bg-primary-tint" : ""
                    }`}
                  >
                    {saved ? <FaBookmark size={14} /> : <FiBookmark size={16} />}
                  </button>
                </div>

                {/* Title */}
                <h2 className="text-[16px] font-semibold text-ink leading-snug mb-3">
                  {job.title}
                </h2>

                {/* Meta rows */}
                <div className="space-y-1.5 text-[13px] mb-4 flex-1">
                  <div className="flex items-center gap-2 text-body-text">
                    <FiMapPin className="text-primary shrink-0" size={14} />
                    <span className="truncate">{job.location || "TBA"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-body-text">
                    <FiCalendar className="text-primary shrink-0" size={14} />
                    <span className="truncate">{job.eventDate || "TBA"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-body-text">
                    <FiClock className="text-primary shrink-0" size={14} />
                    <span className="truncate">{job.time || job.hours || "TBA"}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-line-app pt-3 mt-auto gap-2">
                  <span className="text-sm font-semibold text-ink">
                    {Number(job.price) > 0 ? `£${job.price}` : "To be discussed"}
                  </span>
                  <Link
                    to={`/view-jobs/${job._id}`}
                    className="tk-btn-primary h-9 px-3.5 text-[13px]"
                  >
                    View &amp; Quote <FiArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <NoData
          title="No Projects Found"
          message="No open projects match your location and filters right now. Check back later for new opportunities."
        />
      )}
    </div>
  );
};

export default BrowseJob;
