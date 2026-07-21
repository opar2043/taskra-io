import { Link, useRouteError } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

const Error = () => {
  const error = useRouteError();

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="mk-eyebrow mb-4">Error {error?.status || ""}</p>
        <h1 className="mk-h2 mb-4">This page went out of frame.</h1>
        <p className="mk-lead mb-8">
          {error?.statusText || error?.message || "We couldn't find what you were looking for."}
        </p>
        <Link to="/" className="btn-pill">
          <FiArrowLeft /> Back to home
        </Link>
      </div>
    </div>
  );
};

export default Error;
