import { FiInbox } from "react-icons/fi";

// Shared empty state so a screen is never blank when data is missing.
const NoData = ({ title = "Nothing here yet", message = "", action = null }) => {
  return (
    <div className="tk-card flex flex-col items-center justify-center text-center px-6 py-14">
      <div className="w-14 h-14 rounded-2xl bg-primary-tint text-primary flex items-center justify-center mb-4">
        <FiInbox size={26} />
      </div>
      <h3 className="text-lg font-semibold text-ink mb-1">{title}</h3>
      {message && (
        <p className="text-sm text-body-text/80 max-w-sm mb-4">{message}</p>
      )}
      {action}
    </div>
  );
};

export default NoData;
