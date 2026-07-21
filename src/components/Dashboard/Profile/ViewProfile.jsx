import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaBriefcase,
  FaCheckCircle,
  FaEnvelope,
  FaExternalLinkAlt,
  FaImages,
  FaMapMarkerAlt,
  FaMapPin,
  FaPhone,
} from "react-icons/fa";
import useAxios from "../../Hooks/useAxios";
import Loading from "../../Root/Loading";
import NoData from "../../utils/NoData";

// Read-only view of another user's profile (fetched by id from the route).
// The original was a stub; this fills it in following the Profile page layout.
const ViewProfile = () => {
  const { profileid } = useParams();
  const axiosSecure = useAxios();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    axiosSecure
      .get(`/users/${profileid}`)
      .then((res) => setProfileUser(res.data))
      .catch(() => setProfileUser(null))
      .finally(() => setLoading(false));
  }, [profileid, axiosSecure]);

  if (loading) return <Loading />;

  if (!profileUser) {
    return (
      <div className="tk-page">
        <NoData
          title="Profile not found"
          message="This user does not exist or could not be loaded."
        />
      </div>
    );
  }

  const isPro = profileUser.role === "professional";

  return (
    <div className="tk-page">
      {/* Header card */}
      <div className="tk-card p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <img
            src={profileUser.photo || "https://via.placeholder.com/150"}
            alt={profileUser.name}
            className="w-28 h-28 rounded-full border-4 border-primary-tint object-cover shrink-0"
          />
          <div className="flex-1 text-center sm:text-left min-w-0">
            <h1 className="text-2xl font-bold text-ink flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              {profileUser.name}
              {profileUser.isVerified && (
                <span className="tk-badge-success">
                  <FaCheckCircle /> Verified
                </span>
              )}
            </h1>
            <span className="tk-badge-info mt-2 capitalize">{profileUser.role}</span>
            <div className="flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-2 mt-4 text-sm text-body-text">
              {profileUser.email && (
                <span className="flex items-center gap-2">
                  <FaEnvelope className="text-primary" /> {profileUser.email}
                </span>
              )}
              {profileUser.phone && (
                <span className="flex items-center gap-2">
                  <FaPhone className="text-primary" /> {profileUser.phone}
                </span>
              )}
              {profileUser.location && (
                <span className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-primary" /> {profileUser.location}
                </span>
              )}
            </div>
          </div>
          {isPro && (
            <Link to={`/view-freelencer/${profileUser._id}`} className="tk-btn-primary shrink-0">
              <FaExternalLinkAlt /> Public Profile
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Details */}
        <div className="tk-card p-6">
          <h3 className="text-base font-semibold text-ink mb-4">Details</h3>
          <div className="space-y-4">
            {profileUser.businessName && (
              <div>
                <p className="tk-eyebrow mb-1">Business</p>
                <p className="text-sm font-semibold text-ink">{profileUser.businessName}</p>
              </div>
            )}
            {profileUser.skills && (
              <div>
                <p className="tk-eyebrow mb-2">Skills</p>
                <span className="tk-badge-info capitalize">{profileUser.skills}</span>
              </div>
            )}
            {profileUser.services && (
              <div>
                <p className="tk-eyebrow mb-1">Services</p>
                <p className="text-sm text-body-text">{profileUser.services}</p>
              </div>
            )}
            {profileUser.coverage_area && (
              <div>
                <p className="tk-eyebrow mb-1">Coverage Area</p>
                <p className="text-sm font-semibold text-ink flex items-center gap-2">
                  <FaMapPin className="text-primary" /> {profileUser.coverage_area} miles
                </p>
              </div>
            )}
            {profileUser.bio && (
              <div>
                <p className="tk-eyebrow mb-1">About</p>
                <p className="text-sm text-body-text leading-relaxed">{profileUser.bio}</p>
              </div>
            )}
            {profileUser.description && (
              <div>
                <p className="tk-eyebrow mb-1">Description</p>
                <p className="text-sm text-body-text leading-relaxed">{profileUser.description}</p>
              </div>
            )}
            {!profileUser.businessName &&
              !profileUser.skills &&
              !profileUser.services &&
              !profileUser.bio &&
              !profileUser.description && (
                <p className="text-sm text-body-text/60">No additional details provided.</p>
              )}
          </div>
        </div>

        {/* Portfolio + packages */}
        <div className="lg:col-span-2 space-y-4">
          {profileUser.portfolioImages?.length > 0 && (
            <div className="tk-card p-6">
              <h3 className="text-base font-semibold text-ink flex items-center gap-2 mb-4">
                <FaImages className="text-primary" /> Portfolio
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {profileUser.portfolioImages.map((image, index) => (
                  <div key={index} className="aspect-square rounded-xl overflow-hidden bg-app-bg">
                    <img
                      src={image}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {profileUser.servicePackages?.some((pkg) => pkg.name) && (
            <div className="tk-card p-6">
              <h3 className="text-base font-semibold text-ink flex items-center gap-2 mb-4">
                <FaBriefcase className="text-primary" /> Service Packages
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {profileUser.servicePackages.map((pkg, index) =>
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
                        <p className="text-sm text-body-text flex-1">{pkg.description}</p>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}

          {!profileUser.portfolioImages?.length &&
            !profileUser.servicePackages?.some((pkg) => pkg.name) && (
              <NoData
                title="No public work yet"
                message="This user has not added portfolio content or service packages."
              />
            )}
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
