import { FiShield, FiStar, FiClock, FiTrendingUp } from "react-icons/fi";

const FEATURES = [
  {
    icon: <FiShield size={22} />,
    title: "Verified Creators",
    desc: "Every professional is reviewed before joining.",
  },
  {
    icon: <FiStar size={22} />,
    title: "Trusted Reviews",
    desc: "Real feedback from real customers.",
  },
  {
    icon: <FiClock size={22} />,
    title: "Fast Responses",
    desc: "Hear back from creatives quickly.",
  },
  {
    icon: <FiTrendingUp size={22} />,
    title: "Transparent Pricing",
    desc: "Compare packages before booking.",
  },
];

const WhyChooseTaskra = () => {
  return (
    <section className="relative py-20 md:py-24 bg-white overflow-hidden">
      <div className="dot-grid absolute top-8 left-8 w-28 h-28 opacity-40 pointer-events-none hidden lg:block" />

      <div className="max-w-7xl mx-auto px-5 md:px-8">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="mk-eyebrow mb-3 block">The Taskra Difference</span>
          <h2 className="mk-h2 mb-4">Why Choose Taskra</h2>
          <p className="mk-lead !text-base md:!text-lg">
            Everything you need to hire creative professionals with confidence
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((item) => (
            <div
              key={item.title}
              className="bg-cream rounded-2xl border border-line p-8 flex flex-col items-start hover:shadow-soft hover:border-primary/40 transition-all"
            >
              <div className="icon-chip mb-6">{item.icon}</div>
              <h4 className="font-display text-lg font-semibold text-ink mb-2">
                {item.title}
              </h4>
              <p className="text-sm text-body-text leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseTaskra;
