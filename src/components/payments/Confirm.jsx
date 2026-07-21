import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiCheckCircle, FiArrowRight, FiGrid } from "react-icons/fi";
import useAxios from "../Hooks/useAxios";

// Mollie redirects here with ?id=<agreement (inbox-quote) _id>. Because the
// Mollie webhook is disabled, we advance the agreement status to "confirm"
// here so the project moves forward automatically once the client lands on
// the success page (the backend also emails the client on this transition).
const Confirm = () => {
  const navigate = useNavigate();
  const axiosSecure = useAxios();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const agreementId = searchParams.get("id");
    if (!agreementId) return;
    axiosSecure
      .patch(`/inbox-quote/${agreementId}`, { status: "confirm" })
      .catch((err) =>
        console.error("Failed to confirm agreement status:", err),
      );
  }, [searchParams, axiosSecure]);

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center px-4">
      <div className="tk-card p-10 max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-7">
          <div className="w-20 h-20 rounded-full bg-success-bg flex items-center justify-center">
            <FiCheckCircle className="text-success-text" size={38} />
          </div>
        </div>

        {/* Badge */}
        <span className="tk-badge-success uppercase tracking-widest mb-4">
          Payment Confirmed
        </span>

        <h1 className="text-2xl font-bold text-ink mb-3 mt-2">
          Your order is placed!
        </h1>

        <p className="text-sm text-body-text/80 leading-relaxed mb-6">
          Thank you for your payment. Your agreement has been confirmed and
          your professional has been notified — track progress and next steps
          from your dashboard.
        </p>

        <div className="border-t border-line-app mb-6" />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="tk-btn-secondary flex-1"
          >
            <FiGrid size={15} />
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate("/")}
            className="tk-btn-primary flex-1"
          >
            Continue Browsing
            <FiArrowRight size={15} />
          </button>
        </div>

        <p className="text-xs text-body-text/70 mt-6">
          Questions?{" "}
          <span
            className="underline cursor-pointer text-primary"
            onClick={() => navigate("/contact")}
          >
            Contact support
          </span>
        </p>
      </div>
    </div>
  );
};

export default Confirm;
