import { motion } from "framer-motion";
import {
  FaTimes,
  FaCamera,
  FaVideo,
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";

// Professional application modal. Presentational, as in the original — the
// submit button was never wired to an endpoint there either.
// TODO: backend route missing — no professional-application endpoint exists;
// full sign-up currently happens on /register.
const JoinForm = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const inputClass =
    "w-full px-3.5 py-2.5 bg-cream border border-line rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all duration-200 text-sm text-ink placeholder:text-body-text/50";
  const labelClass =
    "flex items-center gap-2 text-xs font-bold text-ink uppercase tracking-wider mb-1.5";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm"></div>

      {/* Modal container */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl max-h-[95vh] flex flex-col"
      >
        <div className="relative bg-white rounded-2xl shadow-soft flex flex-col overflow-hidden border border-line">
          {/* Header */}
          <div className="relative bg-cream border-b border-line px-6 py-5 shrink-0 overflow-hidden">
            <div className="dot-grid absolute inset-0 opacity-25" />

            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 text-body-text/60 hover:text-ink hover:rotate-90 transition-all duration-300 z-10"
            >
              <FaTimes size={18} />
            </button>

            <div className="relative">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="icon-chip !w-9 !h-9 !rounded-xl">
                  <FaCamera className="text-base" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-ink tracking-tight">
                  Join Taskra
                </h3>
              </div>
              <p className="text-body-text/70 text-xs ml-11 font-medium">
                Elevate your creative journey
              </p>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          </div>

          {/* Scrollable form content */}
          <div className="flex-1 overflow-y-auto">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="px-6 py-6"
            >
              <form className="space-y-4">
                {/* Full Name */}
                <motion.div variants={itemVariants}>
                  <label className={labelClass}>
                    <FaUser className="text-primary text-[10px]" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Enter your full name"
                  />
                </motion.div>

                {/* City & Post Code */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>
                      <FaMapMarkerAlt className="text-primary text-[10px]" />
                      City
                    </label>
                    <input type="text" className={inputClass} placeholder="City" />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <FaMapMarkerAlt className="text-primary text-[10px]" />
                      Post Code
                    </label>
                    <input type="text" className={inputClass} placeholder="Code" />
                  </div>
                </motion.div>

                {/* Mobile Number */}
                <motion.div variants={itemVariants}>
                  <label className={labelClass}>
                    <FaPhone className="text-primary text-[10px]" />
                    Mobile Number
                  </label>
                  <input type="tel" className={inputClass} placeholder="+44 7700 900000" />
                </motion.div>

                {/* WhatsApp Number */}
                <motion.div variants={itemVariants}>
                  <label className={labelClass}>
                    <IoLogoWhatsapp className="text-primary text-xs" />
                    WhatsApp Number
                  </label>
                  <input type="tel" className={inputClass} placeholder="+44 7700 900000" />
                </motion.div>

                {/* Email Address */}
                <motion.div variants={itemVariants}>
                  <label className={labelClass}>
                    <FaEnvelope className="text-primary text-[10px]" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    className={inputClass}
                    placeholder="your.email@example.com"
                  />
                </motion.div>

                {/* Service selection */}
                <motion.div variants={itemVariants}>
                  <label className={`${labelClass} mb-2`}>
                    <FaCamera className="text-primary text-[10px]" />
                    Select Service
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="relative cursor-pointer">
                      <input type="radio" name="service" className="peer sr-only" />
                      <div className="px-3 py-3.5 bg-cream border border-line rounded-xl peer-checked:border-primary peer-checked:bg-primary-tint transition-all duration-200 hover:border-primary/50 text-center">
                        <FaCamera className="text-lg text-body-text mb-1.5 mx-auto" />
                        <p className="text-xs font-semibold text-ink">Photo</p>
                      </div>
                    </label>

                    <label className="relative cursor-pointer">
                      <input type="radio" name="service" className="peer sr-only" />
                      <div className="px-3 py-3.5 bg-cream border border-line rounded-xl peer-checked:border-primary peer-checked:bg-primary-tint transition-all duration-200 hover:border-primary/50 text-center">
                        <FaVideo className="text-lg text-body-text mb-1.5 mx-auto" />
                        <p className="text-xs font-semibold text-ink">Video</p>
                      </div>
                    </label>

                    <label className="relative cursor-pointer">
                      <input type="radio" name="service" className="peer sr-only" />
                      <div className="px-3 py-3.5 bg-cream border border-line rounded-xl peer-checked:border-primary peer-checked:bg-primary-tint transition-all duration-200 hover:border-primary/50 text-center">
                        <div className="flex justify-center gap-1 mb-1.5">
                          <FaCamera className="text-sm text-body-text" />
                          <FaVideo className="text-sm text-body-text" />
                        </div>
                        <p className="text-xs font-semibold text-ink">Both</p>
                      </div>
                    </label>
                  </div>
                </motion.div>

                {/* Submit */}
                <motion.div variants={itemVariants} className="pt-2">
                  <button type="submit" className="btn-pill w-full">
                    Submit Application
                  </button>
                </motion.div>

                {/* Terms */}
                <motion.p
                  variants={itemVariants}
                  className="text-center text-[11px] text-body-text/70 pt-1"
                >
                  By submitting, you agree to our{" "}
                  <span className="text-primary hover:underline cursor-pointer font-medium">
                    Terms &amp; Conditions
                  </span>
                </motion.p>
              </form>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default JoinForm;
