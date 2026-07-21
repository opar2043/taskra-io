import { FiArrowRight, FiCamera, FiCheckCircle } from "react-icons/fi";
import { BsPeopleFill, BsHeartFill } from "react-icons/bs";
import { Link } from "react-router-dom";
import About from "../Root/About";

const STORY_IMG =
  "https://plus.unsplash.com/premium_photo-1674389991678-0836ca77c7f7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGhvdG9ncmFwaHl8ZW58MHx8MHx8fDA%3D";

// Founder story section. Rendered on the home page and standalone at /about-us
// (where, like the original, it is followed by the full About page).
const AboutSection = () => {
  return (
    <section className="relative bg-cream py-20 md:py-28 overflow-hidden" id="about">
      {/* Editorial decorations */}
      <div className="dot-grid absolute top-14 right-8 w-40 h-40 opacity-40 pointer-events-none hidden lg:block" />
      <div className="dot-grid absolute bottom-16 left-6 w-28 h-28 opacity-30 pointer-events-none hidden lg:block" />

      <div className="max-w-7xl mx-auto px-5 md:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <span className="mk-eyebrow mb-4 block">Our Story</span>
          <h2 className="mk-h1 mb-6">
            Empowering Creatives to Grow Your <span className="text-primary">Business</span>
          </h2>
          <p className="mk-lead">
            Bridging the gap between exceptional creative professionals and clients looking
            for the perfect match.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Image side */}
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <div className="lg:sticky lg:top-32 relative">
              <div className="absolute -inset-4 rounded-3xl bg-primary-tint -rotate-2 pointer-events-none" />
              <div className="frame-img relative aspect-[4/5] overflow-hidden group">
                <img
                  src={STORY_IMG}
                  alt="Photographer capturing a moment"
                  loading="lazy"
                  className="group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Founded card */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur rounded-2xl shadow-soft border border-line px-5 py-4 text-center w-[70%]">
                <div className="w-10 h-10 mx-auto rounded-xl bg-primary-tint flex items-center justify-center mb-2">
                  <BsHeartFill size={18} className="text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-ink mb-1">
                  Founded in '25
                </h3>
                <p className="text-body-text text-xs font-medium leading-snug">
                  Designed to empower both creatives and customers with a seamless
                  experience.
                </p>
              </div>

              {/* Community badge */}
              <div className="absolute -bottom-8 -right-2 lg:-right-8 bg-white rounded-2xl shadow-soft border border-line px-5 py-4 flex items-center gap-4 z-20">
                <div className="icon-chip !w-12 !h-12 !bg-primary-tint !text-primary">
                  <BsPeopleFill size={22} />
                </div>
                <div>
                  <p className="font-display font-semibold text-ink text-xl">Community</p>
                  <p className="text-body-text text-sm font-medium">Growing Fast</p>
                </div>
              </div>
            </div>
          </div>

          {/* Story content */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <p className="text-ink text-xl font-medium leading-relaxed mb-6 first-letter:font-display first-letter:text-6xl first-letter:font-semibold first-letter:text-ink first-letter:mr-2 first-letter:float-left first-letter:mt-1">
              Founded in 2025, Taskra was built from a real passion for creativity and years
              of experience in the photography and videography industry.
            </p>

            <p className="text-body-text text-[1.05rem] leading-[1.8] mb-8">
              Growing up in a photography household, I spent years watching my dad work as a
              wedding photographer and videographer — travelling to shoots, capturing
              unforgettable moments, and building relationships with clients. Today, I'm
              also watching my younger brothers follow the same creative path.
            </p>

            {/* Pull quote */}
            <div className="relative my-10 pl-6 border-l-4 border-primary">
              <p className="font-display text-xl md:text-2xl text-ink font-medium italic leading-snug py-2">
                "Being surrounded by this industry showed me both sides of the experience. I
                saw how talented creatives struggled to consistently find new opportunities,
                and how customers often spent hours or even days searching for the right
                person for an important event or project."
              </p>
            </div>

            <h3 className="mk-h2 !text-2xl md:!text-3xl mt-12 mb-6">
              That's why we created Taskra.
            </h3>

            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-primary-tint p-1.5 rounded-full text-primary shrink-0">
                  <FiCheckCircle size={20} />
                </div>
                <p className="text-body-text text-[1.05rem] leading-[1.7]">
                  <strong className="text-ink font-bold">Our goal is simple:</strong> make
                  it easier for creatives to find work, and easier for customers to find
                  trusted professionals for the moments that matter most.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-line bg-white shadow-soft">
                <p className="text-ink text-[1.05rem] leading-[1.7] font-medium">
                  Whether it's a wedding photographer, a videographer for a music video, or
                  a UGC creator for TikTok content, Taskra connects people with talented
                  creatives quickly and stress-free.
                </p>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 bg-primary-tint p-1.5 rounded-full text-primary shrink-0">
                  <FiCheckCircle size={20} />
                </div>
                <p className="text-body-text text-[1.05rem] leading-[1.7]">
                  We believe finding the right creative professional shouldn't feel
                  complicated or uncertain. Customers deserve an easy way to book quality
                  talent they can trust, and creatives deserve better access to real
                  opportunities.
                </p>
              </div>
            </div>

            {/* Statement card */}
            <div className="bg-primary-tint border border-primary/15 rounded-3xl p-8 md:p-10 mb-10 shadow-soft relative overflow-hidden">
              <div className="dot-grid absolute inset-0 opacity-30" />
              <p className="text-ink text-xl font-medium leading-relaxed relative z-10">
                At <span className="text-primary font-bold">Taskra</span>, we're building a
                platform that supports both — helping creatives grow their careers while
                making life easier for customers looking for exceptional work.
              </p>
            </div>

            {/* Footer row */}
            <div className="pt-8 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="icon-chip">
                  <FiCamera size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-ink text-base">Founding Team</h4>
                  <p className="text-xs text-primary uppercase tracking-[0.2em] font-bold mt-1">
                    Creator Focused
                  </p>
                </div>
              </div>

              <Link to="/register" className="btn-pill w-full sm:w-auto">
                Join Taskra Today <FiArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Full about page follows the story, as in the original /about-us layout */}
      <About />
    </section>
  );
};

export default AboutSection;
