import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaBriefcase,
  FaInfoCircle,
  FaSpinner,
} from "react-icons/fa";
import useAxios from "../../../Hooks/useAxios";
import Loading from "../../../Root/Loading";

const CATEGORIES = [
  "Wedding",
  "Pre-ceremonial parties",
  "Commercial",
  "Real Estate",
  "Music Video",
  "Headshot",
  "UGC Content Creator (TikTok, Reels & Product Videos)",
  "Other",
];

const EditJobs = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxios();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [jobData, setJobData] = useState({
    title: "",
    category: "",
    description: "",
    price: "",
    location: "",
    postCode: "",
    eventDate: "",
  });

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const res = await axiosSecure.get(`/jobs/${id}`);
        const job = res.data;

        // Format date for input field (YYYY-MM-DD)
        const formattedDate = job.eventDate
          ? new Date(job.eventDate).toISOString().split("T")[0]
          : "";

        setJobData({
          title: job.title || "",
          category: job.category || "",
          description: job.description || "",
          price: job.price || "",
          location: job.location || "",
          postCode: job.postCode || "",
          eventDate: formattedDate,
        });
      } catch (error) {
        console.error("Error fetching job:", error);
        toast.error("Failed to load job data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobData();
  }, [id, axiosSecure]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axiosSecure.patch(`/jobs/${id}`, jobData);
      toast.success("Job updated successfully!");
      setTimeout(() => {
        navigate("/dashboard/my-jobs");
      }, 1000);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to update job. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  // Keep legacy category values selectable even if not in the current list
  const categoryOptions =
    jobData.category && !CATEGORIES.includes(jobData.category)
      ? [jobData.category, ...CATEGORIES]
      : CATEGORIES;

  return (
    <div className="tk-page">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard/my-jobs")}
          className="flex items-center gap-2 text-sm text-body-text hover:text-ink transition-colors"
        >
          <FaArrowLeft />
          <span>Back to My Jobs</span>
        </button>

        {/* Header */}
        <div>
          <p className="tk-eyebrow">
            Update your job details to attract the right professional
          </p>
          <h1 className="tk-page-title">Edit Job</h1>
        </div>

        {/* Main Form Card */}
        <div className="tk-card overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {/* Job Details */}
              <div>
                <h2 className="text-base font-semibold text-ink mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded bg-primary" />
                  Job Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="tk-label">
                      Project Title <span className="text-danger-text">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={jobData.title}
                      onChange={handleChange}
                      placeholder="e.g., Wedding Photography in Central London"
                      required
                      className="tk-input"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="tk-label">
                        Category <span className="text-danger-text">*</span>
                      </label>
                      <select
                        name="category"
                        value={jobData.category}
                        onChange={handleChange}
                        required
                        className="tk-input"
                      >
                        <option value="">Select category</option>
                        {categoryOptions.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="tk-label">
                        Pay (GBP) <span className="text-danger-text">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body-text/70 text-sm">
                          £
                        </span>
                        <input
                          type="number"
                          name="price"
                          value={jobData.price}
                          onChange={handleChange}
                          placeholder="1,500"
                          required
                          min="0"
                          step="0.01"
                          className="tk-input pl-7"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="tk-label">
                      Project Description{" "}
                      <span className="text-danger-text">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={jobData.description}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Describe your project, requirements, style preferences, and deliverables..."
                      required
                      className="tk-input h-auto py-2.5 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Location & Schedule */}
              <div>
                <h2 className="text-base font-semibold text-ink mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded bg-primary" />
                  Location &amp; Schedule
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="tk-label">
                      City / Location <span className="text-danger-text">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={jobData.location}
                      onChange={handleChange}
                      placeholder="London"
                      required
                      className="tk-input"
                    />
                  </div>

                  <div>
                    <label className="tk-label">
                      Post Code <span className="text-danger-text">*</span>
                    </label>
                    <input
                      type="text"
                      name="postCode"
                      value={jobData.postCode}
                      onChange={handleChange}
                      placeholder="SW1A 1AA"
                      required
                      className="tk-input"
                    />
                  </div>

                  <div>
                    <label className="tk-label">
                      Event Date <span className="text-danger-text">*</span>
                    </label>
                    <input
                      type="date"
                      name="eventDate"
                      value={jobData.eventDate}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="tk-input"
                    />
                  </div>
                </div>
              </div>

              {/* Info Alert */}
              <div className="rounded-xl bg-primary-tint border border-primary/20 p-4">
                <div className="flex gap-3">
                  <FaInfoCircle className="text-primary mt-0.5 shrink-0" />
                  <div className="text-sm text-body-text">
                    <p className="font-medium text-ink mb-1">
                      Updating this job
                    </p>
                    <p className="text-xs">
                      Changes will be visible to all professionals immediately.
                      Make sure all information is accurate before saving.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-app-bg/70 border-t border-line-app flex justify-between items-center">
              <button
                type="button"
                onClick={() => navigate("/dashboard/my-jobs")}
                className="tk-btn-secondary"
              >
                Discard Changes
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="tk-btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin text-sm" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FaBriefcase className="text-sm" />
                    Update Job
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Job ID Info Card */}
        <div className="tk-card p-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-ink mb-1">
              Job Information
            </h3>
            <p className="text-xs text-body-text/70">
              Job ID:{" "}
              <span className="font-mono">#{id.slice(-8).toUpperCase()}</span>
            </p>
          </div>
          <div className="text-xs text-body-text/70">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditJobs;
