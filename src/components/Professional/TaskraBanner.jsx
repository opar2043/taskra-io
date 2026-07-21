import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaStar, FaCheckCircle } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";

const BANNER_IMG =
  "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cGhvdG9ncmFwaHl8ZW58MHx8MHx8fDA%3D";

const TAGS = [
  "Photographer",
  "Videographer",
  "Commercial",
  "Social Media Content",
  "Pre Ceremonial Parties",
  "Music Video",
  "Corporate Real Estate",
];

const TaskraBanner = () => {
  return (
    <section className="relative bg-cream overflow-hidden">
      <div className="dot-grid absolute top-14 left-8 w-36 h-36 opacity-40 pointer-events-none hidden lg:block" />

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-16 justify-between">
          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex-1 max-w-xl flex flex-col gap-5"
          >
            <span className="mk-eyebrow">For Professionals</span>
            <h1 className="mk-h1">Win local jobs and grow your business</h1>
            <p className="mk-lead">View Opportunities to Your Area</p>

            {/* Navigates to the full Register page for professional sign-up */}
            <Link
              to="/register"
              className="flex items-center justify-between cursor-pointer rounded-full border border-line bg-white px-5 py-3.5 text-sm text-body-text shadow-soft hover:border-primary transition-colors group"
            >
              Click &amp; Fill The Form as Professional
              <span className="text-primary font-bold inline-flex items-center gap-1.5">
                Get Started
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            {/* Tags */}
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mt-4">
              {TAGS.map((tag) => (
                <li
                  key={tag}
                  className="flex items-center gap-2 text-sm text-body-text font-medium"
                >
                  <FaCheckCircle className="text-primary shrink-0" />
                  {tag}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative flex-1 max-w-md w-full"
          >
            <div className="absolute -inset-4 rounded-3xl bg-primary-tint rotate-2 pointer-events-none" />
            <div className="frame-img relative h-[420px] md:h-[460px]">
              <img src={BANNER_IMG} alt="Photographer working" loading="lazy" />
            </div>

            <h2 className="absolute top-8 left-8 font-display text-3xl font-semibold text-white drop-shadow-md">
              Join Taskra
            </h2>

            {/* Trust card */}
            <div className="absolute -bottom-6 left-6 bg-white/95 backdrop-blur-md border border-line rounded-2xl p-4 w-[260px] shadow-soft">
              <h4 className="flex items-center gap-2 text-ink font-bold mb-2">
                <FaStar className="text-primary" /> Trustpilot
              </h4>

              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="bg-primary p-2 rounded-md">
                    <FaStar className="text-white text-sm" />
                  </span>
                ))}
              </div>

              <p className="text-xs text-body-text font-semibold">
                Trust Score 4.8 | Reviews 30,000+
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TaskraBanner;
