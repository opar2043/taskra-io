import { FaStar } from "react-icons/fa";
import { FiMapPin } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../Hooks/useAxios";
import Loading from "../Root/Loading";

// "Popular destinations" style grid of the platform's highlighted creatives.
// Data is managed from the admin panel (GET /featured-creatives, sorted by `order`).
const FeaturedCreatives = () => {
  const axiosPublic = useAxios();

  const { data: featured = [], isLoading } = useQuery({
    queryKey: ["featured-creatives"],
    queryFn: async () => {
      const { data } = await axiosPublic.get("/featured-creatives");
      return data;
    },
  });

  if (isLoading) {
    return <Loading />;
  }

  if (featured.length === 0) return null;

  return (
    <section className="relative py-20 md:py-28 bg-white overflow-hidden">
      <div className="dot-grid absolute top-12 left-6 w-32 h-32 opacity-40 pointer-events-none hidden lg:block" />

      <div className="max-w-7xl mx-auto px-5 md:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-16">
          <span className="mk-eyebrow mb-3 block">Handpicked Talent</span>
          <h2 className="mk-h2 mb-4">Featured Creatives</h2>
          <p className="mk-lead !text-base md:!text-lg">
            Work with the most highly-rated photographers and videographers on our
            platform.
          </p>
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {featured.map((creative) => (
            <article key={creative._id} className="group flex flex-col">
              {/* Framed photo with floating rating pill */}
              <div className="relative">
                <div className="frame-img aspect-[4/5] overflow-hidden">
                  <img
                    src={creative.photo || "https://via.placeholder.com/300"}
                    alt={creative.name}
                    loading="lazy"
                    className="group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="absolute top-5 right-5 bg-white/95 backdrop-blur-sm text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-soft">
                  <FaStar /> {creative.rating || "5.0"}
                </div>
              </div>

              <div className="pt-5 px-1 flex flex-col items-start gap-2">
                <h3 className="font-display text-xl font-semibold text-ink">
                  {creative.name}
                </h3>
                {creative.skills && (
                  <span className="inline-flex items-center rounded-full bg-primary-tint text-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                    {creative.skills}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream px-3 py-1 text-xs font-semibold text-body-text">
                  <FiMapPin className="text-primary" />
                  {creative.location || "UK"}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCreatives;
