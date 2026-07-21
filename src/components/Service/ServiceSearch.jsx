import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUsers,
  FaClock,
  FaPhoneAlt,
  FaCheckCircle,
  FaEnvelope,
  FaStar,
  FaLock,
} from "react-icons/fa";
import {
  FiMapPin,
  FiChevronLeft,
  FiChevronRight,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiUser,
  FiImage,
} from "react-icons/fi";
import useAxios from "../Hooks/useAxios";
import useAuth from "../Hooks/useAuth";
import useLoginUser from "../Hooks/useLoginUser";
import toast from "react-hot-toast";
import { getFirebaseAuthError } from "../utils/firebaseErrors";
import { alertError } from "../utils/toastConfirm";
import { uploadImage } from "../utils/uploadImage";

const STEPS = [
  { id: 1, label: "Service" },
  { id: 2, label: "Details" },
  { id: 3, label: "Schedule" },
  { id: 4, label: "Scope" },
  { id: 5, label: "Confirm" },
];

const Stepper = ({ step }) => (
  <div className="flex items-start justify-between mb-8">
    {STEPS.map((s, i) => {
      const isCompleted = step > s.id;
      const isActive = step === s.id;
      return (
        <React.Fragment key={s.id}>
          <div className="flex flex-col items-center shrink-0">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
                ${
                  isCompleted
                    ? "bg-primary border-primary text-white"
                    : isActive
                    ? "bg-white border-primary text-primary ring-4 ring-primary/15"
                    : "bg-white border-line text-body-text/40"
                }`}
            >
              {isCompleted ? <FaCheckCircle /> : s.id}
            </div>
            <span
              className={`mt-1.5 text-[9px] sm:text-[11px] font-bold uppercase tracking-wide whitespace-nowrap
                ${isActive || isCompleted ? "text-ink" : "text-body-text/40"}`}
            >
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="flex-1 h-0.5 mx-1 sm:mx-2 mt-[18px] sm:mt-5 rounded-full bg-line relative">
              <div
                className={`absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-500 ${
                  isCompleted ? "w-full" : "w-0"
                }`}
              ></div>
            </div>
          )}
        </React.Fragment>
      );
    })}
  </div>
);

const ServiceSearch = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authTab, setAuthTab] = useState("login"); // login or register
  const [showPassword, setShowPassword] = useState(false);
  const axiosSecure = useAxios();
  const { user, handleLogin, handleRegister } = useAuth();
  const { currentUser } = useLoginUser() || {};
  const wizardRef = useRef(null);

  const [formData, setFormData] = useState({
    category: "",
    projectType: "",
    projectTypeOther: "",
    email: "",
    fullName: "",
    postCode: "",
    date: "",
    startTime: "",
    hours: "",
    jobDescription: "",
    location: "",
    phone: "",
    password: "",
  });
  const [registrationPhoto, setRegistrationPhoto] = useState(null);

  // Default values from current user if they exist (parity with the original
  // wizard: prefill the email field once the DB user record loads).
  useEffect(() => {
    if (currentUser?.email) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-shot prefill when the async user record arrives
      setFormData((prev) => ({ ...prev, email: currentUser.email }));
    }
  }, [currentUser]);

  const nextStep = () => {
    // Requirements for Step 1
    if (step === 1 && (!formData.category || !formData.postCode)) {
      return;
    }
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Client-side validation with friendly, field-specific messages.
  // Returns an error string, or null when everything is valid.
  const validateSubmission = () => {
    if (!user) {
      if (!formData.email?.trim()) return "Please enter your email address.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        return "Please enter a valid email address.";
      if (!formData.password) return "Please enter your password.";

      if (authTab === "register") {
        if (!formData.fullName?.trim()) return "Please enter your full name.";
        if (formData.password.length < 6)
          return "Password must be at least 6 characters long.";
        if (!registrationPhoto) return "Please upload a profile photo to register.";
      }
    }

    if (!formData.location?.trim())
      return "Please enter your location or venue address.";
    if (!formData.phone?.trim()) return "Please enter your phone number.";

    return null;
  };

  const handleSubmit = async () => {
    // Validate before doing any network work so users get instant feedback.
    const validationError = validateSubmission();
    if (validationError) {
      return alertError("Please check your details", validationError);
    }

    setIsSubmitting(true);

    try {
      let finalUserId = currentUser?._id || null;
      let finalName = currentUser?.name || formData.fullName || "Guest User";
      let finalEmail = currentUser?.email || formData.email;
      let finalPhoto = currentUser?.photo || "";

      // 1. If no user is logged in, authenticate first.
      if (!user) {
        if (authTab === "login") {
          // Perform Login
          try {
            await handleLogin(formData.email, formData.password);
            toast.success("Logged in successfully!");
          } catch (err) {
            return alertError(
              "Login failed",
              getFirebaseAuthError(err, "Invalid email or password.")
            );
          }
        } else {
          // Register the auth account FIRST — this validates the email is unique
          // and the password is strong, so those errors surface immediately
          // instead of being masked by a photo-upload failure.
          try {
            await handleRegister(formData.email, formData.password);
          } catch (err) {
            return alertError(
              "Registration failed",
              getFirebaseAuthError(err, "Registration failed. Please try again.")
            );
          }

          // Upload the profile photo. The account already exists, so a photo
          // failure is non-fatal — warn and continue with an empty photo.
          try {
            finalPhoto = await uploadImage(registrationPhoto);
          } catch (err) {
            console.error("Photo upload failed:", err);
            toast.error(
              "Photo couldn't be uploaded — you can add it later in Settings."
            );
          }

          const newUser = {
            name: formData.fullName || "Guest Client",
            email: formData.email,
            phone: formData.phone,
            photo: finalPhoto,
            location: formData.location || "Not specified",
            role: "client",
            createdAt: new Date(),
          };

          try {
            const userRes = await axiosSecure.post("/users", newUser);
            finalUserId = userRes.data?.insertedId || null;
            finalName = newUser.name;
            finalEmail = newUser.email;
            toast.success("Account created successfully!");
          } catch (err) {
            console.error("Failed to save user:", err);
            return alertError(
              "Could not finish sign-up",
              err.response?.data?.message ||
                "Your account was created but we couldn't save your profile. Please contact support."
            );
          }
        }
      }

      // 2. Construct job data
      const resolvedProjectType =
        formData.projectType === "Other"
          ? formData.projectTypeOther
          : formData.projectType;
      const jobData = {
        title: `${resolvedProjectType || formData.category} `,
        category: formData.category,
        projectType: resolvedProjectType,
        description: formData.jobDescription,
        price: "0",
        location: formData.location || formData.postCode,
        postCode: formData.postCode,
        eventDate: formData.date,
        phone: formData.phone,
        name: finalName,
        email: finalEmail,
        client_email: finalEmail,
        photo: finalPhoto,
        role: "client",
        client_id: finalUserId,
        status: "open",
        time: formData.hours,
        createdAt: new Date().toISOString(),
        additionalInfo: `Start Time: ${formData.startTime}, Duration: ${formData.hours} hours`,
      };

      // 3. Post the job
      await axiosSecure.post("/jobs", jobData);

      // 4. Send Automated Emails
      try {
        // Send Job Posted Confirmation Email
        await axiosSecure.post("/api/emails/job-posted", {
          clientEmail: finalEmail,
          clientName: finalName,
          jobData: jobData,
        });

        // If user just registered, send Welcome Email
        if (!user && authTab === "register") {
          await axiosSecure.post("/api/emails/welcome", {
            clientEmail: finalEmail,
            clientName: finalName,
          });
        }
      } catch (emailError) {
        console.error("Automated Email Error:", emailError);
        // We don't want to fail the whole submission if email fails
      }

      toast.success("Job request sent successfully!");
      setStep(6);

      // Redirect to the dashboard with a full page load rather than an in-app
      // navigate. A freshly registered user isn't in the cached `users` list
      // yet (and the new job isn't in the cached `jobs` list), so an SPA
      // navigate lands on a role-less, empty dashboard. A hard reload
      // re-bootstraps Firebase auth and refetches every query, so the client
      // dashboard shows up correctly with the job that was just posted.
      setTimeout(() => {
        window.location.href = "/dashboard/my-jobs";
      }, 2500);
    } catch (error) {
      console.error("Submission Error:", error);
      alertError(
        "Something went wrong",
        error.response?.data?.message ||
          error.message ||
          "Failed to post your project. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-3 py-3 border border-line rounded-xl text-[15px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium bg-white text-ink placeholder:text-body-text/50";
  const iconInputClass =
    "w-full pl-9 pr-3 py-3 border border-line rounded-xl text-[15px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium bg-white text-ink placeholder:text-body-text/50";
  const labelClass =
    "block text-[11px] font-bold text-body-text/70 uppercase tracking-wider mb-1.5";
  const backBtnClass =
    "flex-1 btn-pill-outline !py-3 !px-4 text-body-text";
  const nextBtnClass = "flex-1 btn-pill !py-3 !px-4";

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full"
          >
            <div className="flex flex-col md:flex-row items-stretch bg-white border border-line rounded-2xl shadow-soft overflow-hidden p-2 gap-2">
              <div className="flex-1 relative md:border-r border-line/70">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full h-12 pl-3 pr-8 text-[15px] outline-none bg-transparent appearance-none text-ink font-medium"
                >
                  <option value="">Select Service</option>
                  <option value="Photography">Photography</option>
                  <option value="Videography">Videography</option>
                  <option value="Both">Both</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-body-text/60">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
              <div className="flex-1 relative flex items-center px-3 md:border-r border-line/70">
                <FiMapPin className="text-primary mr-2 shrink-0" />
                <input
                  type="text"
                  name="postCode"
                  value={formData.postCode}
                  onChange={handleInputChange}
                  placeholder="Postcode"
                  className="w-full h-12 text-[15px] outline-none bg-transparent text-ink placeholder:text-body-text/50"
                />
              </div>
              <button
                onClick={nextStep}
                disabled={!formData.category || !formData.postCode}
                className="btn-pill !py-0 h-12 px-8 active:scale-95"
              >
                Search
              </button>
            </div>
            <p className="mt-4 text-xs text-body-text/70 text-center font-medium">
              Popular: Wedding Photography, Portrait, Event Coverage
            </p>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="font-display text-2xl font-semibold text-ink text-center tracking-tight">
              Project Details
            </h2>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>What service do you require?</label>
                <div className="relative">
                  <select
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleInputChange}
                    className={`${inputClass} appearance-none pr-9`}
                  >
                    <option value="">Select a service</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Pre-ceremonial parties">Pre-ceremonial parties</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Music Video">Music Video</option>
                    <option value="Headshot">Headshot</option>
                    <option value="UGC Content Creator (TikTok, Reels & Product Videos)">
                      UGC Content Creator (TikTok, Reels & Product Videos)
                    </option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-body-text/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
                {formData.projectType === "Other" && (
                  <input
                    type="text"
                    name="projectTypeOther"
                    value={formData.projectTypeOther}
                    onChange={handleInputChange}
                    placeholder="Please describe the service you require"
                    className={`mt-2 ${inputClass}`}
                  />
                )}
              </div>
              <div>
                <label className={labelClass}>Full Name</label>
                <div className="relative">
                  <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-body-text/50 text-xs" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className={iconInputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-body-text/50 text-xs" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className={iconInputClass}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={prevStep} className={backBtnClass}>
                <FiChevronLeft /> Back
              </button>
              <button
                disabled={
                  !formData.projectType ||
                  (formData.projectType === "Other" && !formData.projectTypeOther) ||
                  !formData.email ||
                  !formData.fullName
                }
                onClick={nextStep}
                className={nextBtnClass}
              >
                Next <FiChevronRight />
              </button>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="font-display text-2xl font-semibold text-ink text-center tracking-tight">
              Schedule
            </h2>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Event Date</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-body-text/50 text-xs" />
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={iconInputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Start Time</label>
                <div className="relative">
                  <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-body-text/50 text-xs" />
                  <select
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className={`${iconInputClass} appearance-none`}
                  >
                    <option value="">Select time</option>
                    {[...Array(24)].map((_, i) => {
                      const hour = i % 12 === 0 ? 12 : i % 12;
                      const ampm = i < 12 ? "AM" : "PM";
                      const time = `${hour}:00 ${ampm}`;
                      return (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={prevStep} className={backBtnClass}>
                <FiChevronLeft /> Back
              </button>
              <button
                disabled={!formData.date || !formData.startTime}
                onClick={nextStep}
                className={nextBtnClass}
              >
                Next <FiChevronRight />
              </button>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="font-display text-2xl font-semibold text-ink text-center tracking-tight">
              Project Scale
            </h2>
            <div className="space-y-3">
              <div>
                <label className={`${labelClass} flex items-center gap-1.5`}>
                  <FaClock className="text-primary" /> Duration (Hours)
                </label>
                <input
                  type="number"
                  name="hours"
                  value={formData.hours}
                  onChange={handleInputChange}
                  placeholder="e.g., 4"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>More about the job description</label>
                <textarea
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleInputChange}
                  placeholder="Describe your event, style preferences, or any special requests..."
                  rows="4"
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={prevStep} className={backBtnClass}>
                <FiChevronLeft /> Back
              </button>
              <button
                disabled={!formData.hours || !formData.jobDescription}
                onClick={nextStep}
                className={nextBtnClass}
              >
                Next <FiChevronRight />
              </button>
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="font-display text-2xl font-semibold text-ink text-center tracking-tight">
              Final Details
            </h2>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Specific Location / Address</label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-body-text/50 text-xs" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter city or venue address"
                    className={iconInputClass}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Phone Number</label>
                <div className="relative">
                  <FaPhoneAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-body-text/50 text-xs" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+44 7123 456789"
                    className={iconInputClass}
                  />
                </div>
              </div>

              {!user && (
                <div className="mt-4 pt-4 border-t border-line">
                  <div className="flex mb-4 bg-cream rounded-full p-1">
                    {["login", "register"].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setAuthTab(tab)}
                        className={`flex-1 py-2 rounded-full capitalize font-bold text-xs transition-all ${
                          authTab === tab
                            ? "bg-primary text-white shadow-sm"
                            : "text-body-text"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {authTab === "register" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="relative">
                          <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-body-text/50" />
                          <input
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Full Name"
                            className={iconInputClass}
                          />
                        </div>
                        <label className="md:col-span-1 flex items-center gap-2 px-3 py-3 border border-dashed border-line rounded-xl text-sm cursor-pointer hover:border-primary hover:bg-primary-tint/50 transition-colors">
                          <FiImage className="text-primary shrink-0" />
                          <span
                            className={`truncate font-medium ${
                              registrationPhoto ? "text-ink" : "text-body-text/50"
                            }`}
                          >
                            {registrationPhoto ? registrationPhoto.name : "Upload photo"}
                          </span>
                          <input
                            type="file"
                            onChange={(e) => setRegistrationPhoto(e.target.files[0])}
                            accept="image/*"
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-body-text/50" />
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email Address"
                        className={iconInputClass}
                      />
                    </div>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-body-text/50" />
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder={authTab === "login" ? "Enter password" : "Create password"}
                        className={`${iconInputClass} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-body-text/50 hover:text-ink"
                      >
                        {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-primary-tint border border-primary/20 rounded-xl p-3 text-[11px] text-primary text-center font-medium leading-relaxed">
                By posting, you agree to our terms. Your request will be shared with top
                rated professionals matching your criteria.
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={prevStep} className={backBtnClass}>
                <FiChevronLeft /> Back
              </button>
              <button
                disabled={
                  !formData.location ||
                  !formData.phone ||
                  isSubmitting ||
                  (!user &&
                    (!formData.email ||
                      !formData.password ||
                      (authTab === "register" && !registrationPhoto)))
                }
                onClick={handleSubmit}
                className="flex-1 btn-pill !py-3 !px-4 active:scale-95"
              >
                {isSubmitting ? "Processing..." : "Post Job"} <FaCheckCircle />
              </button>
            </div>
          </motion.div>
        );
      case 6:
        return (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-6 space-y-4"
          >
            <div className="w-16 h-16 bg-success-bg text-success-text rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <FaCheckCircle size={32} />
            </div>
            <h2 className="font-display text-3xl font-semibold text-ink tracking-tight">
              Request Received!
            </h2>
            <p className="text-sm text-body-text font-medium">
              Professional {formData.category.toLowerCase()}s will contact you shortly via
              email.
              {user && (
                <>
                  <br />
                  Redirecting to your dashboard...
                </>
              )}
            </p>
            {user && (
              <div className="w-24 h-1 bg-line rounded-full mx-auto overflow-hidden relative mt-6">
                <motion.div
                  className="absolute left-0 top-0 h-full bg-success-text"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5 }}
                />
              </div>
            )}
            {!user && (
              <div className="mt-8 pt-6 border-t border-line flex flex-col items-center gap-3">
                <p className="text-xs text-body-text/70 font-bold uppercase tracking-widest">
                  Post another request?
                </p>
                <button
                  onClick={() => setStep(1)}
                  className="text-primary font-black text-[10px] uppercase tracking-widest hover:text-primary-hover transition-colors"
                >
                  Start New Search
                </button>
              </div>
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="relative bg-cream overflow-hidden">
      {/* Subtle editorial decorations */}
      <div className="dot-grid absolute top-10 right-8 w-40 h-40 opacity-40 pointer-events-none hidden lg:block" />
      <div className="dot-grid absolute bottom-10 left-6 w-28 h-28 opacity-30 pointer-events-none hidden lg:block" />
      {/* soft radial glow behind the headline */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[780px] h-[420px] bg-primary/[0.06] blur-3xl rounded-full pointer-events-none" />

<div className="relative max-w-6xl mx-auto px-5 md:px-8 pt-10 md:pt-12 min-h-[70vh] flex flex-col justify-center">
        {/* ---------------- Hero: text-only, centered ---------------- */}
        {step < 6 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
className="text-center mb-8 md:mb-8"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-1.5 mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              <FaStar size={11} /> Photography &amp; Videography
            </span>
<h1 className="mk-h1 text-4xl md:text-5xl lg:text-6xl xl:text-[64px] leading-[1.05] mb-5 mx-auto max-w-4xl">
              Discover top-rated creatives tailored to your vision
            </h1>
<p className="mk-lead mx-auto max-w-2xl mb-6 text-base md:text-lg">
              Tell us what you need and get free quotes within minutes from vetted local
              photographers &amp; videographers.
            </p>


          </motion.div>
        )}

        {/* ---------------- Lead-capture wizard (premium card) ---------------- */}
        <motion.div
          ref={wizardRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
className="mx-auto max-w-4xl -mt-2"
        >
          <div className="relative rounded-[28px] bg-white border border-line ring-1 ring-black/[0.02] shadow-[0_30px_80px_-30px_rgba(20,20,31,0.30)] overflow-hidden">
            {/* Premium header strip */}
            {step < 6 && (
              <div className="flex items-center justify-between px-6 md:px-8 pt-6 pb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm">
                    <FaCheckCircle size={16} />
                  </span>
                  <div>
                    <p className="font-bold text-ink text-[15px] leading-tight">Post your job</p>
                    <p className="text-[11px] text-body-text/70 leading-tight">
                      Free &amp; takes under a minute
                    </p>
                  </div>
                </div>
                <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-body-text/60">
                  <FaLock className="text-primary" size={11} /> Secure
                </span>
              </div>
            )}

            <div className="px-6 md:px-8 pb-8 pt-4">
              {/* Step indicator (hidden on the hero search + success screens) */}
              {step > 1 && step < 6 && <Stepper step={step} />}

              <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
            </div>

            {/* Bottom trust rail */}
            {step < 6 && (
              <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 border-t border-line bg-cream/50 px-6 py-3.5">
                {["100% Free", "No obligation", "Vetted pros"].map((label) => (
                  <span
                    key={label}
                    className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-body-text/70"
                  >
                    <FaCheckCircle className="text-primary" size={11} /> {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceSearch;
