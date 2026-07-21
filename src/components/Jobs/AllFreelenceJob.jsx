import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiSearch,
  FiSliders,
  FiRefreshCw,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";
import useJobs from "../Hooks/useJobs";
import NoData from "../utils/NoData";
import Loading from "../Root/Loading";

const AllFreelenceJob = () => {
  const [jobs, , isLoading] = useJobs();

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    priceRange: "",
    location: "",
  });
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const categories = [...new Set(jobs?.map((job) => job.category) || [])];
  const locations = [...new Set(jobs?.map((job) => job.location) || [])];

  const handleReset = () => {
    setFilters({ search: "", category: "", priceRange: "", location: "" });
  };

  const filteredJobs = [...(jobs || [])].reverse().filter((job) => {
    if (filters.category && job.category !== filters.category) return false;
    if (filters.location && job.location !== filters.location) return false;
    if (filters.priceRange) {
      const price = parseInt(job.price);
      if (filters.priceRange === "low" && price > 200) return false;
      if (filters.priceRange === "medium" && (price <= 200 || price > 500)) return false;
      if (filters.priceRange === "high" && price <= 500) return false;
    }
    // Additive text search across title + description (new control from the blueprint).
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const hay = `${job.title || ""} ${job.description || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const sortedJobs =
    sortBy === "budget"
      ? [...filteredJobs].sort((a, b) => Number(b.price || 0) - Number(a.price || 0))
      : filteredJobs;

  const activeCount =
    (filters.search ? 1 : 0) +
    (filters.category ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.priceRange ? 1 : 0);

  return (
    <div className="min-h-screen bg-app-bg">
      {/* Slim page header */}
      <div className="bg-cream border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
          <p className="mk-eyebrow mb-3">Open Jobs</p>
          <h1 className="mk-h2 mb-3">Find your next booking</h1>
          <p className="mk-lead max-w-2xl">
            Browse live photography &amp; videography projects and apply to the ones that fit
            your craft.
          </p>
          <p className="mt-4 text-sm font-semibold text-primary">
            {jobs?.length || 0} open {jobs?.length === 1 ? "job" : "jobs"}
          </p>
        </div>
      </div>

      {/* Body: left filter rail + right results list */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {isLoading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters((s) => !s)}
              className="btn-pill-outline !py-3 lg:hidden"
            >
              <FiSliders />
              {showFilters ? "Hide filters" : "Show filters"}
              {activeCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-xs font-bold">
                  {activeCount}
                </span>
              )}
            </button>

            {/* LEFT — sticky filter rail */}
            <aside
              className={`lg:col-span-3 ${showFilters ? "block" : "hidden"} lg:block`}
            >
              <div className="tk-card p-5 lg:sticky lg:top-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiSliders className="text-primary" />
                    <span className="text-sm font-semibold text-ink">Filters</span>
                  </div>
                  {activeCount > 0 && (
                    <span className="tk-badge-info">{activeCount} active</span>
                  )}
                </div>

                {/* Search */}
                <div>
                  <label className="tk-label">Search</label>
                  <div className="relative">
                    <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-body-text/60" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) =>
                        setFilters({ ...filters, search: e.target.value })
                      }
                      placeholder="Job title or keyword"
                      className="tk-input pl-9"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="tk-label">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      setFilters({ ...filters, category: e.target.value })
                    }
                    className="tk-input"
                  >
                    <option value="">All categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="tk-label">Location</label>
                  <select
                    value={filters.location}
                    onChange={(e) =>
                      setFilters({ ...filters, location: e.target.value })
                    }
                    className="tk-input capitalize"
                  >
                    <option value="">All locations</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc} className="capitalize">
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Budget */}
                <div>
                  <label className="tk-label">Budget</label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) =>
                      setFilters({ ...filters, priceRange: e.target.value })
                    }
                    className="tk-input"
                  >
                    <option value="">Any budget</option>
                    <option value="low">Under £200</option>
                    <option value="medium">£200 - £500</option>
                    <option value="high">Above £500</option>
                  </select>
                </div>

                {/* Reset */}
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-body-text hover:text-primary transition-colors"
                >
                  <FiRefreshCw /> Reset filters
                </button>
              </div>
            </aside>

            {/* RIGHT — results list */}
            <section className="lg:col-span-9">
              {/* Top bar: count + sort */}
              <div className="flex items-center justify-between gap-4 mb-5">
                <p className="text-sm text-body-text">
                  <span className="font-bold text-ink">{sortedJobs.length}</span>{" "}
                  {sortedJobs.length === 1 ? "result" : "results"}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-body-text hidden sm:inline">Sort by</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="tk-input w-auto"
                  >
                    <option value="newest">Newest</option>
                    <option value="budget">Budget</option>
                  </select>
                </div>
              </div>

              {sortedJobs.length > 0 ? (
                <div className="space-y-4">
                  {sortedJobs.map((job) => (
                    <div
                      key={job._id}
                      className="bg-white border border-line rounded-2xl p-5 hover:shadow-soft transition-shadow flex flex-col sm:flex-row sm:items-start gap-4"
                    >
                      {/* Left: details */}
                      <div className="min-w-0 flex-1">
                        {job.category && (
                          <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary-tint text-primary font-bold tracking-wide uppercase inline-block mb-2">
                            {job.category.length > 30
                              ? job.category.slice(0, 28) + "…"
                              : job.category}
                          </span>
                        )}
                        <h3 className="font-semibold text-ink text-lg leading-snug mb-2">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-body-text mb-2">
                          <span className="inline-flex items-center gap-1.5">
                            <FiMapPin className="text-primary shrink-0" />
                            {job.location || "TBA"}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <FiCalendar className="text-primary shrink-0" />
                            {job.eventDate || "TBA"}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <FiClock className="text-primary shrink-0" />
                            {job.time || job.hours || "TBA"}
                          </span>
                        </div>
                        <p className="text-body-text/80 text-sm line-clamp-2 leading-relaxed">
                          {job.description}
                        </p>
                      </div>

                      {/* Right: budget + action */}
                      <div className="shrink-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:text-right sm:w-44 sm:border-l sm:border-line sm:pl-5">
                        <div>
                          <div className="text-lg font-bold text-ink leading-none">
                            {Number(job.price) > 0
                              ? `£${job.price}`
                              : "To be discussed"}
                          </div>
                          {job.clientVerified && (
                            <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-success-text">
                              <FiCheckCircle /> Verified
                            </span>
                          )}
                        </div>
                        <Link
                          to={`/view-jobs/${job._id}`}
                          className="btn-pill !px-5 !py-2.5 text-sm"
                        >
                          View &amp; Apply <FiArrowRight />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <NoData
                  title="No Opportunities Found"
                  message="We couldn't find any jobs matching your criteria. Try adjusting your filters to discover more opportunities."
                  action={
                    <button onClick={handleReset} className="btn-pill">
                      Clear All Filters
                    </button>
                  }
                />
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllFreelenceJob;
