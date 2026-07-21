import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

import useAuth from "../Hooks/useAuth";
import useAxios from "../Hooks/useAxios";
import { uploadImage } from "../utils/uploadImage";
import { firebaseError } from "../utils/firebaseErrors";
import { alertError } from "../utils/toastConfirm";

const LOGO = "https://i.ibb.co/G4k8xvLB/taskra-logo.png";

const Register = ({ isModal = false, onClose = null }) => {
  const { handleRegister } = useAuth();
  const navigate = useNavigate();
  const axiosSecure = useAxios();
  const queryClient = useQueryClient();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab] = useState("professional");
  const [isFreelanceOptIn, setIsFreelanceOptIn] = useState(true);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target;

    // Each stage runs in order and reports its own relevant error, so the
    // user always sees what actually went wrong.
    try {
      // 1) Register with Firebase FIRST — validates the email is unique and
      //    the password is strong before we spend time on the photo upload.
      try {
        await handleRegister(form.email.value, form.password.value);
      } catch (err) {
        return alertError(
          "Registration failed",
          firebaseError(err, "Registration failed. Please try again.")
        );
      }

      // 2) Upload the profile photo. The Firebase account already exists, so
      //    a photo failure is non-fatal — warn and continue with an empty
      //    photo (it can be added later in Settings).
      let photoUrl = "";
      try {
        photoUrl = await uploadImage(form.photo.files[0]);
      } catch (err) {
        console.error("Photo upload failed:", err);
        toast.error("Photo couldn't be uploaded — you can add it later in Settings.");
      }

      // 3) Save the user record in our backend.
      const user = {
        name: form.name.value,
        businessName: form.businessName.value,
        email: form.email.value,
        phone: form.phone.value,
        photo: photoUrl,
        location: form.location.value,
        role: isFreelanceOptIn ? "professional" : "client",
        isFreelancer: isFreelanceOptIn,
        skills: isFreelanceOptIn ? form.skills.value : "",
        bio: isFreelanceOptIn ? form.bio.value : "",

        // AUTO CREATE EMPTY FREELANCER FIELDS
        website: tab === "professional" ? "" : "",
        services: tab === "professional" ? "" : "",
        description: tab === "professional" ? "" : "",
        facebook: tab === "professional" ? "" : "",
        youtube: tab === "professional" ? "" : "",
        instagram: tab === "professional" ? "" : "",

        portfolioImages: tab === "professional" ? [] : [],
        videoLinks: tab === "professional" ? [] : [],
        isBlock: false,
        createdAt: new Date(),
      };

      try {
        await axiosSecure.post("/users", user);
      } catch (err) {
        console.error("Failed to save user:", err);
        return alertError(
          "Could not finish setup",
          err.response?.data?.message ||
            "Your account was created but we couldn't save your profile. Please contact support."
        );
      }

      // Send welcome email (fire-and-forget).
      axiosSecure
        .post("/api/emails/welcome", {
          clientEmail: user.email,
          clientName: user.name,
          role: user.role,
        })
        .catch((emailErr) => console.error("Failed to send welcome email:", emailErr));

      // Refetch the users list so the new account is in cache before the
      // dashboard mounts (stale 5-min cache otherwise).
      queryClient.invalidateQueries({ queryKey: ["users"] });

      toast.success("Account created successfully!");
      onClose?.();
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-body-text/50 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition";
  const labelClass = "block text-sm font-medium text-ink mb-1.5";

  const formContent = (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl bg-white rounded-2xl border border-line shadow-soft overflow-hidden relative"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close button for modal mode */}
      {isModal && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ink hover:bg-primary-tint p-2 rounded-full transition z-50"
          aria-label="Close"
        >
          <FiX size={22} />
        </button>
      )}

      {/* Header */}
      <div className="bg-cream border-b border-line px-8 py-8 text-center">
        <img src={LOGO} alt="Taskra" className="h-10 w-auto mx-auto mb-4" />
        <p className="mk-eyebrow mb-1.5">Create your account</p>
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">
          Join the Taskra community
        </h2>
        <p className="text-sm text-body-text mt-2">
          Professional registration for photographers, videographers and clients
        </p>
      </div>

      <div className="p-8">
        <form onSubmit={handleSignUp} className="space-y-4">
          {/* Full Name & Business Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Full Name <span className="text-danger-text">*</span>
              </label>
              <input name="name" placeholder="John Doe" className={inputClass} required />
            </div>

            <div>
              <label className={labelClass}>
                Business Name <span className="text-danger-text">*</span>
              </label>
              <input
                name="businessName"
                placeholder="Doe Studios"
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Email Address <span className="text-danger-text">*</span>
              </label>
              <input
                name="email"
                type="email"
                placeholder="john@example.com"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>
                Phone Number <span className="text-danger-text">*</span>
              </label>
              <input
                name="phone"
                type="tel"
                placeholder="+44 7700 900000"
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Photo, Post Code & Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>
                Profile Photo <span className="text-danger-text">*</span>
              </label>
              <input
                type="file"
                name="photo"
                accept="image/*"
                required
                className="w-full text-sm text-body-text border border-line rounded-xl file:mr-3 file:py-2.5 file:px-4 file:rounded-l-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover cursor-pointer"
              />
            </div>

            <div>
              <label className={labelClass}>
                Post Code <span className="text-danger-text">*</span>
              </label>
              <input
                name="postcode"
                type="text"
                placeholder="SW1A 1AA"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>
                Location <span className="text-danger-text">*</span>
              </label>
              <input name="location" placeholder="London, UK" className={inputClass} required />
            </div>
          </div>

          {/* Professional details */}
          <div className="bg-primary-tint border border-primary/20 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-sm font-semibold text-ink">Professional&apos;s Details</h3>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-ink">Do you freelance?</span>
                <label className="flex items-center gap-2 text-sm text-body-text cursor-pointer">
                  <input
                    type="radio"
                    name="freelanceStatus"
                    checked={isFreelanceOptIn === true}
                    onChange={() => setIsFreelanceOptIn(true)}
                    className="accent-primary"
                  />
                  Yes
                </label>
                <label className="flex items-center gap-2 text-sm text-body-text cursor-pointer">
                  <input
                    type="radio"
                    name="freelanceStatus"
                    checked={isFreelanceOptIn === false}
                    onChange={() => setIsFreelanceOptIn(false)}
                    className="accent-primary"
                  />
                  No
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Skills */}
              <div>
                <label className={labelClass}>
                  Skills {isFreelanceOptIn && <span className="text-danger-text">*</span>}
                </label>
                <select
                  name="skills"
                  className={`${inputClass} appearance-none bg-white`}
                  required={isFreelanceOptIn}
                >
                  <option value="">Select Your Skill</option>
                  <option value="photography">Photography</option>
                  <option value="videography">Videography</option>
                  <option value="both">Both (Photo &amp; Video)</option>
                </select>
              </div>

              {/* Coverage Area */}
              <div>
                <label className={labelClass}>
                  Coverage Area {isFreelanceOptIn && <span className="text-danger-text">*</span>}
                </label>
                <select
                  name="coverage"
                  className={`${inputClass} appearance-none bg-white`}
                  required={isFreelanceOptIn}
                >
                  <option value="100+">100+ miles</option>
                  {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((mile) => (
                    <option key={mile} value={mile}>
                      {mile} miles
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className={labelClass}>
                Short Bio {isFreelanceOptIn && <span className="text-danger-text">*</span>}
              </label>
              <textarea
                name="bio"
                rows="3"
                placeholder="Tell us about your experience and what makes you unique..."
                className={`${inputClass} resize-none`}
                required={isFreelanceOptIn}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className={labelClass}>
              Password <span className="text-danger-text">*</span>
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 6 characters"
                className={`${inputClass} pr-10`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-body-text/60 hover:text-ink transition"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            <p className="text-xs text-body-text/70 mt-1">Must be at least 6 characters long</p>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="btn-pill w-full mt-6">
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Creating Account…
              </>
            ) : (
              "Create Account"
            )}
          </button>

          {/* Sign in link */}
          <p className="text-center text-sm text-body-text pt-3">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </motion.div>
  );

  if (isModal) {
    return (
      <div
        className="fixed inset-0 z-[9999] bg-ink/60 backdrop-blur-sm overflow-y-auto flex items-start justify-center p-4 py-10"
        onClick={onClose}
      >
        {formContent}
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-cream flex items-center justify-center px-4 py-16">
      {formContent}
    </section>
  );
};

export default Register;
