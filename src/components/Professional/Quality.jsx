import {
  FaBullseye,
  FaFilter,
  FaBolt,
  FaUserCheck,
  FaMoneyBillWave,
  FaShieldAlt,
} from "react-icons/fa";

const FEATURES = [
  {
    icon: <FaBullseye size={20} />,
    title: "Get quality leads",
    desc: "View leads locally or nationwide. Set what type of leads you want",
  },
  {
    icon: <FaFilter size={20} />,
    title: "Choose your leads",
    desc: "Get Hired Guarantee on first leads. Keep 100% of what you earn",
  },
  {
    icon: <FaBolt size={20} />,
    title: "Real-time delivery",
    desc: "Get leads sent to you instantly",
  },
  {
    icon: <FaUserCheck size={20} />,
    title: "Verified contacts",
    desc: "Unlock verified contact details",
  },
  {
    icon: <FaMoneyBillWave size={20} />,
    title: "Keep your earnings",
    desc: "No commission or hidden fees",
  },
  {
    icon: <FaShieldAlt size={20} />,
    title: "Hire with confidence",
    desc: "Get Hired Guarantee on first leads",
  },
];

const Quality = () => {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="mk-eyebrow mb-3 block">Built For Creatives</span>
          <h2 className="mk-h2">Everything you need to win work</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-line bg-cream p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft hover:border-primary/40"
            >
              <div className="icon-chip mb-5 transition-transform duration-300 group-hover:scale-110">
                {item.icon}
              </div>

              <h3 className="font-display text-lg font-semibold text-ink mb-2">
                {item.title}
              </h3>

              <p className="text-sm text-body-text leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Quality;
