import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";

const stats = [
  { value: "10,000+", label: "Verified Creatives" },
  { value: "50,000+", label: "Projects Completed" },
  { value: "UK-Wide", label: "Nationwide Coverage" },
];

const principles = [
  {
    title: "Tell us what you need",
    desc: "Share your exact requirements and event details in seconds — no lengthy forms, no friction.",
  },
  {
    title: "Get matched instantly",
    desc: "Receive responses from professionals who genuinely align with your vision and budget.",
  },
  {
    title: "Choose with confidence",
    desc: "Compare portfolios, read real reviews, and book the perfect creative — completely stress-free.",
  },
];

export default function About() {
  return (
    <div className="bg-white selection:bg-primary selection:text-white">
      {/* ── HERO — centered serif, no image ───────────────────────── */}
      <section className="relative bg-cream px-6 pt-28 pb-24 lg:pt-36 lg:pb-28 overflow-hidden">
        <div className="dot-grid absolute -top-4 left-6 w-40 h-40 opacity-40 pointer-events-none hidden lg:block" />
        <div className="dot-grid absolute bottom-8 right-8 w-32 h-32 opacity-30 pointer-events-none hidden lg:block" />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[620px] h-[380px] bg-primary/[0.05] blur-3xl rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <span className="mk-eyebrow">Our Story</span>
          <h1 className="mk-h1 lg:text-7xl mt-5 mb-7">
            Crafting connections between vision and creativity.
          </h1>
          <p className="mk-lead mx-auto max-w-2xl">
            Every moment deserves to be captured with precision and professionalism. Finding the
            perfect photographer or videographer should feel seamless, not stressful.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] font-bold uppercase tracking-widest text-body-text/70">
            {["Founded 2025", "UK-Wide", "Verified Creatives"].map((t, i) => (
              <span key={t} className="flex items-center gap-6">
                {i > 0 && <span className="w-1 h-1 rounded-full bg-primary" />}
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── MANIFESTO — asymmetric two-column ─────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24 lg:py-28 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <span className="mk-eyebrow">What we do</span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-[1.1] mt-4">
              Designed for both sides of the lens.
            </h2>
            <div className="w-16 h-1 bg-primary rounded-full mt-8" />
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7 space-y-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-primary font-black text-sm tracking-widest">FOR CLIENTS</span>
              <span className="flex-1 h-px bg-line" />
            </div>
            <p className="text-lg text-body-text leading-relaxed">
              Find the perfect photographer or videographer for any occasion. Browse verified
              profiles, compare curated portfolios, and book with complete confidence — all in one
              accessible place.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-primary font-black text-sm tracking-widest">FOR CREATIVES</span>
              <span className="flex-1 h-px bg-line" />
            </div>
            <p className="text-lg text-body-text leading-relaxed">
              Showcase your stunning work, attract serious clients, and scale your creative
              business. Taskra consistently connects you with real opportunities that understand
              your craft.
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS — soft branded band ─────────────────────────────── */}
      <section className="bg-primary-tint">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-primary/15">
          {stats.map((s) => (
            <div key={s.label} className="py-8 md:py-0 md:px-10 text-center">
              <p className="font-display text-5xl lg:text-6xl font-semibold text-primary tracking-tight">
                {s.value}
              </p>
              <p className="mt-3 text-sm uppercase tracking-widest text-ink/60 font-medium">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRINCIPLES — numbered rows ────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24 lg:py-28">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <span className="mk-eyebrow">The Process</span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-tight mt-4">
              Simple steps to your match.
            </h2>
          </div>
          <p className="text-body-text text-lg max-w-sm leading-relaxed">
            We've stripped away the complexity. Three easy steps to book or be booked.
          </p>
        </div>

        <div className="border-t border-line">
          {principles.map((p, i) => (
            <div
              key={p.title}
              className="group grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline py-10 border-b border-line hover:bg-cream/60 transition-colors -mx-6 px-6"
            >
              <span className="md:col-span-2 font-display text-4xl md:text-5xl font-semibold text-primary/30 group-hover:text-primary transition-colors">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="md:col-span-4 text-2xl font-bold text-ink">{p.title}</h3>
              <p className="md:col-span-6 text-lg text-body-text leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MISSION + CTA ─────────────────────────────────────────── */}
      <section className="bg-cream px-6 py-24">
        <div className="max-w-5xl mx-auto text-center">
          <span className="mk-eyebrow">Our Mission</span>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-ink leading-tight mt-5 mb-4 max-w-3xl mx-auto">
            To redefine how people discover and book visual creators.
          </h2>
          <p className="mk-lead mx-auto max-w-xl mb-10">
            Faster, reliable, and exceptionally high-quality — for everyone on both sides of the
            lens.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-pill">
              Post a Job <FiArrowUpRight />
            </Link>
            <Link to="/professional" className="btn-pill-outline">
              Join as Creative
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
