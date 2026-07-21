import { useState } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";

import ProfileCard from "./ProfileCard";
import ProfessionalStoryBanner from "./ProfessionalStoryBanner";
import useUser from "../Hooks/useUser";
import useSave from "../Hooks/useSave";
import useAuth from "../Hooks/useAuth";
import useLoginUser from "../Hooks/useLoginUser";
import useAxios from "../Hooks/useAxios";
import Loading from "../Root/Loading";

const HERO_IMG =
  "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=1600&auto=format&fit=crop&fm=webp";

const ukCities = [
  "London", "Manchester", "Birmingham", "Liverpool", "Leeds", "Sheffield",
  "Nottingham", "Leicester", "Coventry", "Derby", "Bristol", "Bath",
  "Reading", "Oxford", "Cambridge", "Milton Keynes", "Luton", "Watford",
  "Slough", "Southampton", "Portsmouth", "Brighton", "Bournemouth", "Exeter",
  "Plymouth", "Cardiff", "Swansea", "Newport", "Edinburgh", "Glasgow",
  "Aberdeen", "Dundee", "Perth", "Inverness", "Newcastle", "Sunderland",
  "Middlesbrough", "York", "Hull", "Bradford", "Wakefield",
];

const SearchFreelencer = () => {
  const { users, isLoading } = useUser();
  const { user } = useAuth();
  const { currentUser } = useLoginUser() || {};
  const [save, saveRefetch] = useSave();
  const axiosSecure = useAxios();

  // Start with the user's location by default (or a city passed via route state)
  const locationData = useLocation();
  const searchCityParam = locationData.state?.searchCity;
  const [query, setQuery] = useState(searchCityParam || null);
  const [inputValue, setInputValue] = useState(searchCityParam || "");
  const [category, setCategory] = useState("");

  // Adopt a new searchCity delivered via route state (adjust-state-during-render
  // pattern — avoids a cascading setState-in-effect).
  const [prevParam, setPrevParam] = useState(searchCityParam);
  if (searchCityParam !== prevParam) {
    setPrevParam(searchCityParam);
    setQuery(searchCityParam || null);
    setInputValue(searchCityParam || "");
  }

  // Effective query: explicit choice → route param → user's own location → UK.
  // Deriving it means the user's location applies automatically once it loads.
  const searchQuery = query || currentUser?.location || "UK";

  if (isLoading) return <Loading />;

  const freelancers =
    (users &&
      users.filter((u) => {
        const isFreelancer = u.role === "professional" || u.isFreelancer === true;
        const matchesLocation = searchQuery
          ? u.location?.toLowerCase().includes(searchQuery.toLowerCase())
          : true;
        const matchesCategory = category
          ? u.skills === category || u.skills === "both"
          : true;
        return isFreelancer && matchesLocation && matchesCategory;
      })) ||
    [];

  const handleSearch = () => {
    setQuery(inputValue);
  };

  const handleCityClick = (city) => {
    setQuery(city);
    setInputValue(city);
    const resultsSection = document.getElementById("search-results");
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Save-to-shortlist (POST /save; duplicate → 400 "Already saved")
  const handleSave = async (freelancer) => {
    if (!user) return toast.error("Please login first");

    try {
      const payload = {
        freelancerId: freelancer._id,
        freelancerName: freelancer.name,
        freelancerEmail: freelancer.email,
        freelancerPhoto: freelancer.photo,
        role: freelancer.role,
        skills: freelancer.skills,
        location: freelancer.location,
        userEmail: user.email,
      };

      const res = await axiosSecure.post("/save", payload);

      if (res.data.insertedId) {
        toast.success("Professional saved to your shortlist!");
        saveRefetch();
      }
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || "Already saved");
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const isProSaved = (proId) =>
    !!save?.some((s) => s.freelancerId === proId && s.userEmail === user?.email);

  return (
    <div className="w-full bg-white">
      {/* Hero banner */}
      <div
        className="relative h-[340px] md:h-[400px] bg-cover bg-center flex items-center"
        style={{ backgroundImage: `url('${HERO_IMG}')` }}
      >
        <div className="absolute inset-0 bg-ink/60" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <p className="mk-eyebrow !text-white/80 mb-3">Find talent</p>
          <h1 className="font-display text-3xl md:text-5xl font-semibold leading-tight mb-8">
            Find a Photographer or Videographer Near You
          </h1>

          <div className="bg-white rounded-full flex flex-col sm:flex-row items-stretch sm:items-center p-2 gap-2 max-w-2xl mx-auto shadow-lg">
            <input
              type="text"
              placeholder="Search by city (e.g. London)"
              className="flex-1 px-5 py-2.5 text-ink text-sm outline-none rounded-full bg-transparent placeholder:text-body-text/50"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2.5 rounded-full bg-cream text-sm font-medium text-ink outline-none cursor-pointer"
              >
                <option value="">All categories</option>
                <option value="photography">Photography</option>
                <option value="videography">Videography</option>
                <option value="both">Photo &amp; Video</option>
              </select>
              <FiChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink" />
            </div>
            <button onClick={handleSearch} className="btn-pill !py-2.5 !px-6 text-sm">
              <FaSearch />
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Results */}
        <div id="search-results" className="py-12 md:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
            <div>
              <p className="mk-eyebrow mb-2">Professionals</p>
              <h2 className="mk-h2">
                {searchQuery &&
                currentUser?.location &&
                searchQuery.toLowerCase() === currentUser.location.toLowerCase()
                  ? "Available in Your Area"
                  : `Available in ${searchQuery}`}
              </h2>
            </div>
            {searchQuery &&
              currentUser?.location &&
              searchQuery.toLowerCase() !== currentUser.location.toLowerCase() && (
                <button
                  onClick={() => {
                    setQuery(currentUser.location);
                    setInputValue("");
                  }}
                  className="text-sm font-semibold text-primary hover:underline self-start"
                >
                  Back to Your Area
                </button>
              )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {freelancers.length > 0 ? (
              freelancers.map((pro) => {
                const isDifferentArea =
                  currentUser?.location &&
                  pro.location &&
                  !pro.location.toLowerCase().includes(currentUser.location.toLowerCase()) &&
                  !currentUser.location.toLowerCase().includes(pro.location.toLowerCase());

                return (
                  <div key={pro._id} className="relative group">
                    {isDifferentArea && (
                      <div className="absolute top-2 right-2 z-10 bg-primary-tint text-primary text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm opacity-90 group-hover:opacity-100 transition-opacity">
                        OUTSIDE YOUR AREA
                      </div>
                    )}
                    <ProfileCard
                      professional={pro}
                      onSave={handleSave}
                      isSaved={isProSaved(pro._id)}
                    />
                    {isDifferentArea && (
                      <p className="mt-1 text-[10px] text-body-text/70 italic px-1">
                        * This professional is available but not in your immediate area.
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-16 bg-cream rounded-2xl border-2 border-dashed border-line">
                <div className="flex flex-col items-center gap-3">
                  <FaMapMarkerAlt className="text-4xl text-body-text/30" />
                  <p className="text-ink text-lg font-semibold">
                    No professionals found in &ldquo;{searchQuery}&rdquo;.
                  </p>
                  <p className="text-body-text text-sm">
                    Try searching for a different city or nearby location.
                  </p>
                  <button
                    onClick={() => {
                      setQuery(currentUser?.location || "UK");
                      setInputValue("");
                    }}
                    className="btn-pill mt-2"
                  >
                    Reset to My Area
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <ProfessionalStoryBanner />

        {/* Browse by location */}
        <div className="py-12">
          <p className="mk-eyebrow mb-2">Locations</p>
          <h3 className="mk-h2 !text-2xl md:!text-3xl mb-6">
            Browse professionals by location
          </h3>

          <div className="flex flex-wrap gap-2.5">
            {ukCities.map((city) => (
              <button
                key={city}
                onClick={() => handleCityClick(city)}
                className="flex items-center gap-1.5 bg-cream border border-line rounded-full px-3.5 py-1.5 cursor-pointer hover:border-primary hover:text-primary transition text-xs font-medium text-ink"
              >
                <FaMapMarkerAlt className="text-primary" />
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFreelencer;
