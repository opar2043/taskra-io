import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaBookmark,
  FaComments,
  FaMapMarkerAlt,
  FaRegBookmark,
  FaSearch,
  FaStar,
} from "react-icons/fa";
import useUser from "../../../Hooks/useUser";
import useAuth from "../../../Hooks/useAuth";
import useLoginUser from "../../../Hooks/useLoginUser";
import useSave from "../../../Hooks/useSave";
import useAxios from "../../../Hooks/useAxios";
import NoData from "../../../utils/NoData";
import Loading from "../../../Root/Loading";
import TutorialModal from "../../../DashboardTutorial/TutorialModal";

const FindFreelencer = () => {
  const { users, isLoading } = useUser();
  const { user } = useAuth();
  const { currentUser } = useLoginUser();
  const [saves, saveRefetch] = useSave();
  const axiosSecure = useAxios();
  const navigate = useNavigate();

  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [savingId, setSavingId] = useState(null);

  const freelancers = useMemo(
    () => (users || []).filter((u) => u.role === "professional"),
    [users],
  );

  // Unique locations and skills for the filter dropdowns
  const locations = useMemo(() => {
    const unique = [
      ...new Set(freelancers.map((f) => f.location).filter(Boolean)),
    ];
    return unique.sort();
  }, [freelancers]);

  const skills = useMemo(() => {
    const all = freelancers
      .map((f) => f.skills)
      .filter(Boolean)
      .flatMap((skill) => skill.split(",").map((s) => s.trim().toLowerCase()));
    return [...new Set(all)].sort();
  }, [freelancers]);

  const filteredFreelancers = useMemo(() => {
    return freelancers.filter((freelancer) => {
      const matchesLocation =
        !selectedLocation || freelancer.location === selectedLocation;

      const matchesSkill =
        !selectedSkill ||
        freelancer.skills
          ?.toLowerCase()
          .split(",")
          .map((s) => s.trim())
          .includes(selectedSkill.toLowerCase());

      const matchesSearch =
        !searchTerm ||
        freelancer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        freelancer.skills?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        freelancer.bio?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesLocation && matchesSkill && matchesSearch;
    });
  }, [freelancers, selectedLocation, selectedSkill, searchTerm]);

  if (isLoading) {
    return <Loading />;
  }

  const isSaved = (freelancerId) =>
    (saves || []).some(
      (s) => s.userEmail === user?.email && s.freelancerId === freelancerId,
    );

  const handleResetFilters = () => {
    setSelectedLocation("");
    setSelectedSkill("");
    setSearchTerm("");
  };

  const handleSave = async (freelancer) => {
    if (!user) {
      return toast.error("Please login first");
    }

    try {
      setSavingId(freelancer._id);
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
        toast.error("Already saved");
      } else {
        toast.error(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Something went wrong",
        );
      }
    } finally {
      setSavingId(null);
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

  return (
    <div className="tk-page">
      <TutorialModal
        componentName="FindFreelencer"
        title="Welcome to Find Freelancers"
        description="Discover and connect with talented professionals for your creative projects."
        listItems={[
          "Search professionals by name or skill",
          "Filter by location and specialty",
          "Save profiles you want to shortlist",
        ]}
      />

      {/* Header */}
      <div className="tk-card p-4">
        <p className="tk-eyebrow">
          Connect with talented professionals in your area
        </p>
        <h1 className="tk-page-title">Find Freelancers</h1>
      </div>

      {/* Filters */}
      <div className="tk-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-body-text/40" />
            <input
              type="text"
              placeholder="Search by name, skill or bio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="tk-input pl-10"
            />
          </div>

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="tk-input"
          >
            <option value="">All Locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>

          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="tk-input"
          >
            <option value="">All Skills</option>
            {skills.map((skill) => (
              <option key={skill} value={skill}>
                {skill.charAt(0).toUpperCase() + skill.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {(selectedLocation || selectedSkill || searchTerm) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-body-text/70">Active filters:</span>
            {searchTerm && (
              <span className="tk-badge-info">
                Search: {searchTerm}
                <button onClick={() => setSearchTerm("")} aria-label="Clear search">
                  ×
                </button>
              </span>
            )}
            {selectedLocation && (
              <span className="tk-badge-info">
                {selectedLocation}
                <button
                  onClick={() => setSelectedLocation("")}
                  aria-label="Clear location"
                >
                  ×
                </button>
              </span>
            )}
            {selectedSkill && (
              <span className="tk-badge-info">
                {selectedSkill.charAt(0).toUpperCase() + selectedSkill.slice(1)}
                <button
                  onClick={() => setSelectedSkill("")}
                  aria-label="Clear skill"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-primary hover:text-primary-hover"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold text-ink">
          {filteredFreelancers.length === 0
            ? "No Professionals Found"
            : `${filteredFreelancers.length} Freelancer${
                filteredFreelancers.length !== 1 ? "s" : ""
              } Available`}
        </h2>
      </div>

      {filteredFreelancers.length === 0 ? (
        <NoData
          title="No professionals found"
          message="Try adjusting your filters to see more results."
          action={
            <button onClick={handleResetFilters} className="tk-btn-primary">
              Clear All Filters
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFreelancers.map((pro) => {
            const saved = isSaved(pro._id);
            return (
              <div
                key={pro._id}
                className="tk-card p-6 flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={pro.photo}
                    alt={pro.name}
                    className="w-14 h-14 rounded-full object-cover border border-line-app"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-ink truncate">
                      {pro.name}
                    </h3>
                    {pro.location && (
                      <div className="flex items-center gap-1 text-xs text-body-text/70 mt-0.5">
                        <FaMapMarkerAlt />
                        {pro.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1 mt-1 text-sm text-ink">
                      <FaStar className="text-primary" />
                      {pro.rating || 5.0}
                    </div>
                  </div>
                  <button
                    onClick={() => handleSave(pro)}
                    disabled={saved || savingId === pro._id}
                    className={`tk-icon-btn ${
                      saved ? "text-primary" : "hover:text-primary"
                    }`}
                    title={saved ? "Already saved" : "Save to shortlist"}
                  >
                    {saved ? <FaBookmark /> : <FaRegBookmark />}
                  </button>
                </div>

                {pro.skills && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {pro.skills
                      .split(",")
                      .slice(0, 3)
                      .map((skill, i) => (
                        <span key={i} className="tk-badge-info">
                          {skill.trim()}
                        </span>
                      ))}
                    {pro.skills.split(",").length > 3 && (
                      <span className="tk-badge-neutral">
                        +{pro.skills.split(",").length - 3}
                      </span>
                    )}
                  </div>
                )}

                {pro.bio && (
                  <p className="mt-3 text-sm text-body-text leading-relaxed flex-1">
                    {pro.bio.slice(0, 90)}
                    {pro.bio.length > 90 ? "..." : ""}
                  </p>
                )}

                <div className="flex gap-2 mt-5">
                  <Link
                    to={`/view-freelencer/${pro._id}`}
                    className="tk-btn-secondary flex-1"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={() => handleMessage(pro._id)}
                    className="tk-btn-primary flex-1"
                  >
                    <FaComments size={13} />
                    Message
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FindFreelencer;
