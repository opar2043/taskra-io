import { useState } from "react";
import toast from "react-hot-toast";
import { FaBriefcase, FaSpinner, FaInfoCircle } from "react-icons/fa";
import useAxios from "../../../Hooks/useAxios";
import useLoginUser from "../../../Hooks/useLoginUser";
import TutorialModal from "../../../DashboardTutorial/TutorialModal";

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

const NEXT_STEPS = [
  "Professionals review your job and submit proposals",
  "Compare portfolios, rates, and reviews",
  "Hire your favorite and start collaborating",
];

const PostJob = () => {
  const axiosSecure = useAxios();
  const { currentUser } = useLoginUser() || {};
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.target;

    const job = {
      title: form.title.value,
      category: form.category.value,
      description: form.description.value,
      price: form.price.value,
      location: form.location.value,
      postCode: form.postCode.value,
      eventDate: form.eventDate.value,
      time: form.time.value,
      name: currentUser?.name,
      client_email: currentUser?.email,
      photo: currentUser?.photo,
      role: currentUser?.role,
      client_location: currentUser?.location,
      status: "open",
      client_id: currentUser?._id,
      createdAt: new Date().toISOString(),
    };

    try {
      await axiosSecure.post("/jobs", job);
      toast.success("Job posted successfully!");
      form.reset();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to post job. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="tk-page">
      <TutorialModal
        componentName="PostJob"
        title="Welcome to Post a Job"
        description="Create a new listing to find the perfect photographer or videographer for your project."
        listItems={[
          "Add project title, category and budget",
          "Set the location, date and time",
          "Publish to start receiving proposals",
        ]}
      />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <p className="tk-eyebrow">
            Find the perfect photographer or videographer for your project
          </p>
          <h1 className="tk-page-title">Post a Job</h1>
        </div>

        {/* Main Form Card */}
        <div className="tk-card overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {/* Job Details Section */}
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
                      <select name="category" required className="tk-input">
                        <option value="">Select category</option>
                        {CATEGORIES.map((cat) => (
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
                      rows="4"
                      placeholder="Describe your project, requirements, style preferences, and deliverables..."
                      required
                      className="tk-input h-auto py-2.5 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Location & Schedule Section */}
              <div>
                <h2 className="text-base font-semibold text-ink mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded bg-primary" />
                  Location &amp; Schedule
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="tk-label">
                      City / Location <span className="text-danger-text">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
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
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="tk-input"
                    />
                  </div>

                  <div>
                    <label className="tk-label">
                      Time <span className="text-danger-text">*</span>
                    </label>
                    <input
                      type="text"
                      name="time"
                      placeholder="e.g. 7-12 & 11-5"
                      required
                      className="tk-input"
                    />
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="rounded-xl bg-app-bg border border-line-app p-4">
                <div className="flex gap-3">
                  <FaInfoCircle className="text-primary mt-0.5 shrink-0" />
                  <div className="text-sm text-body-text">
                    <p className="font-medium text-ink mb-1">
                      Tips for better results:
                    </p>
                    <ul className="space-y-0.5 text-xs">
                      <li>
                        • Be specific about deliverables (edited photos, raw
                        files, etc.)
                      </li>
                      <li>• Mention event duration and expected working hours</li>
                      <li>• Include references or style examples if possible</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-app-bg/70 border-t border-line-app flex justify-end">
              <button type="submit" disabled={isSubmitting} className="tk-btn-primary">
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin text-sm" />
                    Posting...
                  </>
                ) : (
                  <>
                    <FaBriefcase className="text-sm" />
                    Post Job
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Next Steps Card */}
        <div className="tk-card p-5">
          <h3 className="text-sm font-semibold text-ink mb-3">
            What happens next?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {NEXT_STEPS.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-tint text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <p className="text-sm text-body-text">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJob;
