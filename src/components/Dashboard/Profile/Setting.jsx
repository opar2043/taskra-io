import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaBriefcase,
  FaCamera,
  FaCheckCircle,
  FaCloudUploadAlt,
  FaEdit,
  FaGlobe,
  FaImages,
  FaLayerGroup,
  FaLink,
  FaMapMarkerAlt,
  FaPlus,
  FaSave,
  FaShieldAlt,
  FaSpinner,
  FaTimes,
  FaTrash,
  FaUser,
  FaVideo,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaPinterest,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { alertError, alertSuccess, confirmToast } from "../../utils/toastConfirm";
import useUser from "../../Hooks/useUser";
import useLoginUser from "../../Hooks/useLoginUser";
import useAxios from "../../Hooks/useAxios";
import { uploadImage } from "../../utils/uploadImage";
import Loading from "../../Root/Loading";
import TutorialModal from "../../DashboardTutorial/TutorialModal";

const DEFAULT_PACKAGES = [
  { tier: "Bronze", name: "Bronze", price: "", description: "", deliveryTime: "" },
  { tier: "Silver", name: "Silver", price: "", description: "", deliveryTime: "" },
  { tier: "Gold", name: "Gold", price: "", description: "", deliveryTime: "" },
];

const buildFormData = (currentUser) => ({
  name: currentUser?.name || "",
  businessName: currentUser?.businessName || "",
  email: currentUser?.email || "",
  businessEmail: currentUser?.businessEmail || "",
  businessPhone: currentUser?.businessPhone || "",
  phone: currentUser?.phone || "",
  location: currentUser?.location || "",
  bio: currentUser?.bio || "",
  skills: currentUser?.skills || "",
  coverage_area: currentUser?.coverage_area || "",
  photo: currentUser?.photo || "",
  facebook: currentUser?.facebook || "",
  instagram: currentUser?.instagram || "",
  youtube: currentUser?.youtube || "",
  description: currentUser?.description || "",
  website: currentUser?.website || "",
  tiktok: currentUser?.tiktok || "",
  pinterest: currentUser?.pinterest || "",
  services: currentUser?.services || "",
  portfolioImages: currentUser?.portfolioImages?.length ? currentUser.portfolioImages : [],
  videoLinks: currentUser?.videoLinks?.length ? currentUser.videoLinks : [],
  servicePackages: currentUser?.servicePackages?.length
    ? currentUser.servicePackages
    : DEFAULT_PACKAGES,
});

// Same checklist the backend expects — one point per completed section.
const completionChecks = (data) => [
  data.name?.trim(),
  data.email?.trim(),
  data.phone?.trim(),
  data.location?.trim(),
  data.photo?.trim(),
  data.businessEmail?.trim(),
  data.businessPhone?.trim(),
  data.skills?.trim(),
  String(data.coverage_area ?? "")?.trim(),
  data.services?.trim(),
  data.bio?.trim(),
  data.description?.trim(),
  data.portfolioImages?.some((img) => img.trim() !== ""),
  data.videoLinks?.some((vid) => vid.trim() !== ""),
  data.servicePackages?.some((pkg) => pkg.name?.trim() && String(pkg.price ?? "").trim() !== ""),
];

const calculateCompletion = (data) => {
  const checks = completionChecks(data);
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

// Compact circular progress ring for the identity bar.
const CompletionRing = ({ value, size = 58, stroke = 5 }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const done = value === 100;
  const color = done ? "var(--color-success-text)" : "var(--color-primary)";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} title={`Profile ${value}% complete`}>
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
          style={{ transition: "stroke-dashoffset .5s ease" }}
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center text-[11px] font-bold ${
          done ? "text-success-text" : "text-primary"
        }`}
      >
        {value}%
      </span>
    </div>
  );
};

// Section header inside the active panel (module scope keeps subtree mounted).
const SectionHeader = ({ icon, title, children }) => {
  const Icon = icon;
  return (
    <div className="flex items-center justify-between gap-3 mb-5">
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 rounded-xl bg-primary-tint text-primary flex items-center justify-center shrink-0">
          <Icon />
        </span>
        <h3 className="text-base sm:text-lg font-semibold text-ink">{title}</h3>
      </div>
      {children}
    </div>
  );
};

const Setting = () => {
  // Route param (/dashboard/settings/:profile) — the record edited is always
  // the logged-in user's own, matching the original behaviour.
  // eslint-disable-next-line no-unused-vars
  const { profile } = useParams();
  const { currentUser } = useLoginUser();
  const axiosSecure = useAxios();
  const { refetch } = useUser();
  const avatarInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState(buildFormData(currentUser));

  useEffect(() => {
    if (currentUser) setFormData(buildFormData(currentUser));
  }, [currentUser]);

  const currentCompletion = calculateCompletion(formData);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ── portfolio images ─────────────────────────────── */
  const handleAddPortfolioImage = () =>
    setFormData((prev) => ({ ...prev, portfolioImages: [...prev.portfolioImages, ""] }));

  const handlePortfolioImageChange = (index, value) =>
    setFormData((prev) => {
      const next = [...prev.portfolioImages];
      next[index] = value;
      return { ...prev, portfolioImages: next };
    });

  const handleRemovePortfolioImage = (index) =>
    setFormData((prev) => ({
      ...prev,
      portfolioImages: prev.portfolioImages.filter((_, i) => i !== index),
    }));

  // File → WebP → ImgBB → URL into the slot
  const handlePortfolioFileUpload = async (index, file) => {
    if (!file) return;
    setUploadingIndex(index);
    try {
      const url = await uploadImage(file);
      handlePortfolioImageChange(index, url);
      toast.success("Image uploaded");
    } catch (err) {
      console.error("Portfolio upload failed:", err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploadingIndex(null);
    }
  };

  /* ── avatar ───────────────────────────────────────────
     The avatar is a quick action: clicking the camera uploads AND saves the
     photo straight away (no need to be in edit mode), then refetches so the
     new photo appears everywhere — sidebar, topbar, profile — instantly. */
  const handlePhotoUpload = async (file) => {
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const url = await uploadImage(file);
      setFormData((prev) => ({ ...prev, photo: url }));
      await axiosSecure.patch(`/users/${currentUser._id}`, { photo: url });
      await refetch();
      toast.success("Profile photo updated!");
    } catch (err) {
      console.error("Photo upload failed:", err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  /* ── video links ──────────────────────────────────── */
  const handleAddVideoLink = () =>
    setFormData((prev) => ({ ...prev, videoLinks: [...prev.videoLinks, ""] }));

  const handleVideoLinkChange = (index, value) =>
    setFormData((prev) => {
      const next = [...prev.videoLinks];
      next[index] = value;
      return { ...prev, videoLinks: next };
    });

  const handleRemoveVideoLink = (index) =>
    setFormData((prev) => ({
      ...prev,
      videoLinks: prev.videoLinks.filter((_, i) => i !== index),
    }));

  /* ── service packages ─────────────────────────────── */
  const handleServicePackageChange = (index, field, value) =>
    setFormData((prev) => {
      const next = prev.servicePackages.map((pkg, i) =>
        i === index ? { ...pkg, [field]: value } : pkg
      );
      return { ...prev, servicePackages: next };
    });

  /* ── save / cancel ────────────────────────────────── */
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields!");
      return;
    }

    if (
      await confirmToast({
        title: "Update Profile?",
        message: "Are you sure you want to update your profile information?",
        confirmText: "Yes, Update!",
        danger: true,
      })
    ) {
      setIsLoading(true);
      try {
        const cleanedData = {
          ...formData,
          portfolioImages: formData.portfolioImages.filter((img) => img.trim() !== ""),
          videoLinks: formData.videoLinks.filter((video) => video.trim() !== ""),
          profileCompletion: calculateCompletion(formData),
        };

        await axiosSecure.patch(`/users/${currentUser._id}`, cleanedData);
        await refetch();
        setIsEditing(false);
        await alertSuccess("Profile updated!", "Your profile has been updated successfully.");
      } catch (error) {
        console.error("Error updating profile:", error);
        await alertError(
          "Update failed",
          "Something went wrong while updating your profile. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancel = async () => {
    if (
      await confirmToast({
        title: "Discard Changes?",
        message: "Are you sure you want to discard your changes?",
        confirmText: "Yes, Discard",
        danger: true,
      })
    ) {
      setFormData(buildFormData(currentUser));
      setIsEditing(false);
      toast.success("Changes discarded");
    }
  };

  if (!currentUser) return <Loading />;

  const isPro = currentUser.role === "professional";

  const inputClass =
    "tk-input disabled:bg-app-bg disabled:text-body-text/60 disabled:cursor-not-allowed";
  const textareaClass = `${inputClass} h-auto py-2.5 resize-none`;

  const tabs = [
    { id: "basic", label: "Basic Info", icon: FaUser, pro: false },
    { id: "professional", label: "Professional", icon: FaBriefcase, pro: true },
    { id: "portfolio", label: "Portfolio", icon: FaImages, pro: true },
    { id: "packages", label: "Packages", icon: FaLayerGroup, pro: true },
  ].filter((tab) => !tab.pro || isPro);

  return (
    <div className="tk-page">
      <TutorialModal
        componentName="account-settings"
        title="Account settings"
        description="Keep your profile complete — complete profiles get verified and win more work."
        listItems={[
          "Click Edit Profile to unlock the form",
          "Upload photos directly or paste image URLs",
          "Fill your tiered service packages with prices in £",
        ]}
      />

      {/* ── Light identity bar ─────────────────────────── */}
      <div className="tk-card p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          {/* Avatar (camera always clickable) */}
          <div className="relative shrink-0 mx-auto md:mx-0">
            <img
              src={formData.photo || currentUser.photo || "https://via.placeholder.com/150"}
              alt={currentUser.name}
              className="w-24 h-24 rounded-2xl object-cover border border-line-app"
            />
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handlePhotoUpload(e.target.files[0])}
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingPhoto}
              title="Upload new photo"
              className="absolute -bottom-2 -right-2 bg-primary text-white w-9 h-9 rounded-full shadow-soft flex items-center justify-center hover:bg-primary-hover transition disabled:opacity-60 disabled:cursor-not-allowed ring-2 ring-white"
            >
              {uploadingPhoto ? <FaSpinner className="animate-spin" /> : <FaCamera />}
            </button>
          </div>

          {/* Identity */}
          <div className="min-w-0 flex-1 text-center md:text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-ink truncate">
              {currentUser.businessName || currentUser.name || "Not given"}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
              <span className="tk-badge-info capitalize">
                <FaShieldAlt /> {currentUser.role}
              </span>
              {currentUser.isVerified && (
                <span className="tk-badge-success">
                  <FaCheckCircle /> Verified
                </span>
              )}
              {currentUser.location && (
                <span className="inline-flex items-center gap-1.5 text-xs text-body-text/70">
                  <FaMapMarkerAlt className="text-primary" /> {currentUser.location}
                </span>
              )}
            </div>
          </div>

          {/* Completion + actions */}
          <div className="flex items-center gap-5 justify-center md:justify-end">
            {isPro && <CompletionRing value={currentCompletion} />}

            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="tk-btn-primary">
                <FaEdit /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="tk-btn bg-white border border-danger-text/30 text-danger-text hover:bg-danger-bg"
                >
                  <FaTimes /> Cancel
                </button>
                <button
                  onClick={handleUpdateProfile}
                  disabled={isLoading}
                  className="tk-btn-primary"
                >
                  <FaSave /> {isLoading ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <p className="mt-4 pt-4 border-t border-line-app text-sm font-medium text-primary flex items-center gap-2 justify-center md:justify-start">
            <FaEdit /> Editing mode — changes save when you click Save
          </p>
        )}
      </div>

      {/* ── Tabbed body ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Tab nav */}
        <div className="lg:col-span-3 lg:sticky lg:top-6">
          <div className="tk-card p-3">
            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors shrink-0 ${
                      active
                        ? "bg-primary-tint text-primary"
                        : "text-body-text/80 hover:bg-app-bg hover:text-ink"
                    }`}
                  >
                    <Icon className={active ? "text-primary" : "text-body-text/50"} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active section */}
        <div className="lg:col-span-9">
          <form onSubmit={handleUpdateProfile} className="tk-card p-5 sm:p-7">
            {/* Basic Info */}
            {activeTab === "basic" && (
              <div>
                <SectionHeader icon={FaUser} title="Basic Information" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="tk-label">
                      Full Name <span className="text-danger-text">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                      className={inputClass}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="tk-label">Business Name</label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={inputClass}
                      placeholder="Enter your business name"
                    />
                  </div>

                  <div>
                    <label className="tk-label">
                      Email Address <span className="text-danger-text">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                      className={inputClass}
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label className="tk-label">
                      Phone Number <span className="text-danger-text">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                      className={inputClass}
                      placeholder="+44 7123 456789"
                    />
                  </div>

                  <div>
                    <label className="tk-label">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={inputClass}
                      placeholder="City, Country"
                    />
                  </div>

                  <div>
                    <label className="tk-label">Profile Photo URL</label>
                    <input
                      type="url"
                      name="photo"
                      value={formData.photo}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={inputClass}
                      placeholder="https://example.com/photo.jpg"
                    />
                    <p className="text-xs text-body-text/60 mt-1">
                      Or use the camera button on your avatar to upload.
                    </p>
                  </div>

                  <div>
                    <label className="tk-label">
                      Business Email Address <span className="text-danger-text">*</span>
                    </label>
                    <input
                      type="email"
                      name="businessEmail"
                      value={formData.businessEmail}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                      className={inputClass}
                      placeholder="your.business.email@example.com"
                    />
                  </div>

                  <div>
                    <label className="tk-label">Business Phone Number</label>
                    <input
                      type="tel"
                      name="businessPhone"
                      value={formData.businessPhone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={inputClass}
                      placeholder="+44 7123 456789"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Professional (details + social) */}
            {activeTab === "professional" && isPro && (
              <div className="space-y-10">
                <div>
                  <SectionHeader icon={FaBriefcase} title="Professional Details" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="tk-label">Skills</label>
                      <input
                        type="text"
                        name="skills"
                        value={formData.skills}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={inputClass}
                        placeholder="e.g., photography, web design"
                      />
                      <p className="text-xs text-body-text/60 mt-1">Separate skills with commas</p>
                    </div>
                    <div>
                      <label className="tk-label">Coverage Area (miles)</label>
                      <input
                        type="number"
                        name="coverage_area"
                        value={formData.coverage_area}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={inputClass}
                        placeholder="e.g., 50"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="tk-label">Services Offered</label>
                      <input
                        type="text"
                        name="services"
                        value={formData.services}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={inputClass}
                        placeholder="e.g., wedding photography, portrait sessions"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="tk-label">Short Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        rows="3"
                        className={textareaClass}
                        placeholder="Brief summary of your experience..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="tk-label">Detailed Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        rows="4"
                        className={textareaClass}
                        placeholder="Detailed description about your agency, capabilities, and experience..."
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <SectionHeader icon={FaGlobe} title="Social Media Links" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      { name: "website", label: "Website", Icon: FaGlobe, placeholder: "https://yourwebsite.com" },
                      { name: "facebook", label: "Facebook", Icon: FaFacebook, placeholder: "https://facebook.com/yourprofile" },
                      { name: "instagram", label: "Instagram", Icon: FaInstagram, placeholder: "https://instagram.com/yourprofile" },
                      { name: "youtube", label: "YouTube", Icon: FaYoutube, placeholder: "https://youtube.com/yourchannel" },
                      { name: "tiktok", label: "TikTok", Icon: FaTiktok, placeholder: "https://tiktok.com/@yourprofile" },
                      { name: "pinterest", label: "Pinterest", Icon: FaPinterest, placeholder: "https://pinterest.com/yourprofile" },
                    ].map((field) => (
                      <div key={field.name}>
                        <label className="tk-label flex items-center gap-2">
                          <field.Icon className="text-primary" /> {field.label}
                        </label>
                        <input
                          type="url"
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={inputClass}
                          placeholder={field.placeholder}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Portfolio (images + videos) */}
            {activeTab === "portfolio" && isPro && (
              <div className="space-y-10">
                <div>
                  <SectionHeader icon={FaImages} title="Portfolio Images">
                    {isEditing && (
                      <button
                        type="button"
                        onClick={handleAddPortfolioImage}
                        className="tk-btn-primary h-9"
                      >
                        <FaPlus /> Add Image
                      </button>
                    )}
                  </SectionHeader>

                  {formData.portfolioImages.length === 0 ? (
                    <div className="border-2 border-dashed border-line-app rounded-2xl py-10 text-center">
                      <FaImages className="mx-auto text-4xl text-body-text/20 mb-2" />
                      <p className="text-body-text/70 text-sm">No portfolio images yet.</p>
                      {isEditing && (
                        <p className="text-body-text/50 text-xs mt-1">
                          Click &quot;Add Image&quot; to upload a file or paste a link.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {formData.portfolioImages.map((image, index) => (
                        <div key={index} className="rounded-2xl border border-line-app bg-app-bg/50 p-3">
                          {/* Preview */}
                          <div className="aspect-video w-full rounded-xl overflow-hidden bg-app-bg mb-3 flex items-center justify-center relative">
                            {image ? (
                              <img
                                src={image}
                                alt={`Portfolio ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex flex-col items-center gap-1 text-body-text/30">
                                <FaImages className="text-3xl" />
                                <span className="text-[11px] font-medium">No image selected</span>
                              </div>
                            )}
                            {uploadingIndex === index && (
                              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                                <FaSpinner className="animate-spin text-primary text-2xl" />
                              </div>
                            )}
                          </div>

                          {/* Link input */}
                          <div className="relative mb-2">
                            <FaLink className="absolute left-3 top-1/2 -translate-y-1/2 text-body-text/40 text-xs" />
                            <input
                              type="url"
                              value={image}
                              onChange={(e) => handlePortfolioImageChange(index, e.target.value)}
                              disabled={!isEditing}
                              className={`${inputClass} pl-8 text-sm`}
                              placeholder={`Paste image URL ${index + 1}`}
                            />
                          </div>

                          {/* Upload file + remove */}
                          <div className="flex items-center gap-2">
                            <label
                              className={`flex-1 flex items-center justify-center gap-2 h-10 px-3 rounded-xl text-sm font-medium border transition ${
                                isEditing && uploadingIndex === null
                                  ? "bg-white border-primary/30 text-primary hover:bg-primary-tint cursor-pointer"
                                  : "bg-app-bg border-line-app text-body-text/40 cursor-not-allowed"
                              }`}
                            >
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={!isEditing || uploadingIndex !== null}
                                onChange={(e) => handlePortfolioFileUpload(index, e.target.files[0])}
                              />
                              <FaCloudUploadAlt />
                              {uploadingIndex === index ? "Uploading…" : "Upload file"}
                            </label>
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() => handleRemovePortfolioImage(index)}
                                className="w-10 h-10 rounded-xl bg-white border border-danger-text/30 text-danger-text flex items-center justify-center hover:bg-danger-bg transition"
                                title="Remove"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <SectionHeader icon={FaVideo} title="Video Portfolio">
                    {isEditing && (
                      <button
                        type="button"
                        onClick={handleAddVideoLink}
                        className="tk-btn-primary h-9"
                      >
                        <FaPlus /> Add Video
                      </button>
                    )}
                  </SectionHeader>
                  <div className="space-y-3">
                    {formData.videoLinks.length === 0 ? (
                      <div className="border-2 border-dashed border-line-app rounded-2xl py-8 text-center">
                        <FaVideo className="mx-auto text-3xl text-body-text/20 mb-2" />
                        <p className="text-body-text/70 text-sm">No video links added yet.</p>
                      </div>
                    ) : (
                      formData.videoLinks.map((video, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="relative flex-1">
                            <FaVideo className="absolute left-3 top-1/2 -translate-y-1/2 text-body-text/40 text-xs" />
                            <input
                              type="url"
                              value={video}
                              onChange={(e) => handleVideoLinkChange(index, e.target.value)}
                              disabled={!isEditing}
                              className={`${inputClass} pl-8`}
                              placeholder={`Video URL ${index + 1} (YouTube link)`}
                            />
                          </div>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => handleRemoveVideoLink(index)}
                              className="w-10 h-10 rounded-xl bg-white border border-danger-text/30 text-danger-text flex items-center justify-center hover:bg-danger-bg transition shrink-0"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Packages */}
            {activeTab === "packages" && isPro && (
              <div>
                <SectionHeader icon={FaLayerGroup} title="Service Packages" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {formData.servicePackages?.map((pkg, index) => (
                    <div
                      key={index}
                      className="border border-line-app rounded-2xl p-4 bg-app-bg/40 flex flex-col gap-3"
                    >
                      <h4 className="font-bold text-center text-primary tracking-wide uppercase text-sm">
                        {pkg.tier} Tier
                      </h4>
                      <div>
                        <label className="tk-label text-xs">Package Name</label>
                        <input
                          type="text"
                          value={pkg.name}
                          onChange={(e) => handleServicePackageChange(index, "name", e.target.value)}
                          disabled={!isEditing}
                          className={`${inputClass} text-sm`}
                        />
                      </div>
                      <div>
                        <label className="tk-label text-xs">Price (£)</label>
                        <input
                          type="number"
                          value={pkg.price}
                          onChange={(e) => handleServicePackageChange(index, "price", e.target.value)}
                          disabled={!isEditing}
                          className={`${inputClass} text-sm`}
                        />
                      </div>
                      <div>
                        <label className="tk-label text-xs">Delivery Time (Days)</label>
                        <input
                          type="text"
                          value={pkg.deliveryTime}
                          onChange={(e) =>
                            handleServicePackageChange(index, "deliveryTime", e.target.value)
                          }
                          disabled={!isEditing}
                          className={`${inputClass} text-sm`}
                        />
                      </div>
                      <div>
                        <label className="tk-label text-xs">Description</label>
                        <textarea
                          value={pkg.description}
                          onChange={(e) =>
                            handleServicePackageChange(index, "description", e.target.value)
                          }
                          disabled={!isEditing}
                          rows="2"
                          className={`${textareaClass} text-sm`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Setting;
