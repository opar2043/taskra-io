import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../Hooks/useAxios";
import Loading from "../Root/Loading";

// CMS-driven steps (GET /how-it-works, sorted by `order` on the backend).
// Alternating two-column (image + text) layout, per the original folder design.
const HowItWorks = () => {
  const axiosPublic = useAxios();

  const { data: steps = [], isLoading } = useQuery({
    queryKey: ["how-it-works"],
    queryFn: async () => {
      const { data } = await axiosPublic.get("/how-it-works");
      return data;
    },
  });

  if (isLoading) {
    return <Loading />;
  }

  if (steps.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl w-full md:w-11/12 mx-auto px-5 md:px-8">
        {/* Heading */}
        <div className="text-center mb-16 md:mb-24">
          <span className="mk-eyebrow">Simple Process</span>
          <h2 className="mk-h2 md:text-5xl mt-3">How It Works</h2>
          <p className="text-body-text mt-4 max-w-xl mx-auto text-base md:text-lg">
            Hire trusted photographers &amp; videographers in just a few simple steps.
          </p>
        </div>

        {/* Steps — alternating */}
        <div className="space-y-20 md:space-y-28">
          {steps.map((step, index) => {
            const reverse = step.reverse ?? index % 2 === 1;
            const number = String(index + 1).padStart(2, "0");
            return (
              <div
                key={step._id || index}
                className={`grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center ${
                  reverse ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                {/* Text */}
                <div className="order-2 md:order-none">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-display text-5xl md:text-6xl font-semibold text-primary/30 leading-none">
                      {number}
                    </span>
                    <span className="hidden sm:block h-[2px] w-12 bg-primary/40" />
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-semibold text-ink mb-4 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-body-text text-base md:text-lg leading-relaxed mb-6">
                    {step.description}
                  </p>
                  {step.ctaLabel && step.ctaTo && (
                    <Link
                      to={step.ctaTo}
                      className="inline-flex items-center gap-2 text-sm font-bold text-ink border-b-2 border-primary pb-1 hover:gap-3 hover:text-primary transition-all"
                    >
                      {step.ctaLabel} <FiArrowRight size={16} />
                    </Link>
                  )}
                </div>

                {/* Image — signature framed treatment */}
                <div className="order-1 md:order-none">
                  <div className="relative group">
                    <div className="absolute -inset-3 md:-inset-4 rounded-3xl bg-primary-tint rotate-2 -z-10" />
                    {step.image ? (
                      <div className="frame-img aspect-[4/3] overflow-hidden">
                        <img
                          src={step.image}
                          alt={step.alt || step.title}
                          loading="lazy"
                          className="group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    ) : (
                      <div className="frame-img aspect-[4/3] flex items-center justify-center bg-cream">
                        <span className="font-display text-6xl font-semibold text-primary/30">
                          {number}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
