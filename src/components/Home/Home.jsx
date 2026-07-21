import ServiceSearch from "../Service/ServiceSearch";
import FeaturedCreatives from "./FeaturedCreatives";
import HowItWorks from "./HowItWorks";
import Jobs from "../Jobs/FreelenceJob";
import WhyChooseTaskra from "./WhyChooseTaskra";
import ProfessionalReview from "../Professional/ProfessionalReview";
import AboutSection from "./AboutSection";
import Faq from "./Faq";

const Home = () => {
  return (
    <div>
      <ServiceSearch />
      <FeaturedCreatives />
      <HowItWorks />
      <Jobs />
      <WhyChooseTaskra />
      <ProfessionalReview />
      <AboutSection />
      <Faq />
    </div>
  );
};

export default Home;
