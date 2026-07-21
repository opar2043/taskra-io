import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import useJobs from "../Hooks/useJobs";
import JobsCard from "./JobsCard";
import NoData from "../utils/NoData";
import Loading from "../Root/Loading";

// Home-page "latest jobs" section. Self-fetching — no props required.
const FreelenceJob = () => {
  const [jobs, , isLoading] = useJobs();

  if (isLoading) return <Loading />;

  const openJobs = (jobs || []).filter((job) => job.status !== "completed").slice(0, 12);

  return (
    <section className="bg-cream py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-6 w-full">
        {/* Heading */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="mk-eyebrow mb-2">Marketplace</p>
            <h2 className="mk-h2">Freelance Jobs</h2>
            <p className="mk-lead mt-2 max-w-xl">
              Discover photography &amp; videography projects posted by verified clients.
            </p>
          </div>
          <Link to="/view-alljobs" className="btn-pill-outline self-start md:self-auto">
            View all jobs <FiArrowRight />
          </Link>
        </div>

        {/* Cards */}
        {openJobs.length === 0 ? (
          <NoData
            title="No jobs found"
            message="There are no open jobs right now. Please check back soon."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {openJobs.map((job) => (
              <JobsCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FreelenceJob;
