import { FaBullseye, FaChartLine, FaBolt, FaUsers } from "react-icons/fa";
import { Link } from "react-router-dom";

const STATS = [
  { icon: <FaBullseye size={20} />, title: "10,000s", desc: "leads a day" },
  { icon: <FaChartLine size={20} />, title: "£1M+", desc: "daily business done on Taskra" },
  { icon: <FaBolt size={20} />, title: "1,000+", desc: "services offered" },
  { icon: <FaUsers size={20} />, title: "500K+", desc: "small businesses" },
];

const StatBanner = () => {
  return (
    <section className="relative bg-cream overflow-hidden">
      <div className="dot-grid absolute bottom-10 right-8 w-32 h-32 opacity-40 pointer-events-none hidden lg:block" />

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="flex flex-col gap-5">
            <span className="mk-eyebrow">The Marketplace</span>
            <h2 className="mk-h2">Join a buzzing marketplace</h2>

            <p className="mk-lead max-w-md">
              Hundreds of thousands of small businesses have found new customers on Taskra
            </p>

            <Link to="/register" className="btn-pill w-fit mt-2">
              Join Them
            </Link>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-4 md:gap-5">
            {STATS.map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center text-center gap-3 rounded-2xl bg-white border border-line p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
              >
                <div className="icon-chip !bg-primary-tint !text-primary">{item.icon}</div>

                <h3 className="font-display text-2xl md:text-4xl font-semibold text-ink">
                  {item.title}
                </h3>

                <p className="text-sm font-medium text-body-text">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatBanner;
