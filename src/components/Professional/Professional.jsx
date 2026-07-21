import TaskraBanner from "./TaskraBanner";
import Quality from "./Quality";
import StatBanner from "./StatBanner";
import ProfessionalReview from "./ProfessionalReview";

// Public "for professionals" landing page (/professional).
const Professional = () => {
  return (
    <div>
      <TaskraBanner />
      <Quality />
      <StatBanner />
      <ProfessionalReview />
    </div>
  );
};

export default Professional;
