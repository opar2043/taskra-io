import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiSend, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import useAxios from "../../../Hooks/useAxios";
import Loading from "../../../Root/Loading";

/* Public client-facing fill page (route /questionnaire/:id) —
   rendered inside the public Root layout, styled with the marketing mood. */
const PublicQuestionnaire = () => {
  const { id } = useParams();
  const axiosSecure = useAxios();
  const [questionnaire, setQuestionnaire] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchQ = async () => {
      try {
        const res = await axiosSecure.get(`/questionnaires/single/${id}`);
        setQuestionnaire(res.data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchQ();
  }, [id, axiosSecure]);

  const handleChange = (fieldId, value) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const missing = (questionnaire?.fields || []).filter(
      (f) => f.required && !answers[f.id]
    );
    if (missing.length > 0) {
      return toast.error("Please fill in all required fields.");
    }

    setSubmitting(true);
    try {
      await axiosSecure.post(`/questionnaires/submit/${id}`, { answers });
      setSubmitted(true);
    } catch {
      toast.error("Failed to submit form. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  if (notFound || !questionnaire) {
    return (
      <div className="min-h-[60vh] bg-cream flex items-center justify-center p-4">
        <div className="max-w-md w-full frame-img text-center">
          <div className="bg-white rounded-xl p-10">
            <div className="w-16 h-16 bg-danger-bg text-danger-text rounded-full flex items-center justify-center mx-auto mb-6">
              <FiAlertCircle className="text-3xl" />
            </div>
            <h2 className="mk-h2 mb-2">Form Not Found</h2>
            <p className="text-body-text mb-6">
              This questionnaire link is invalid or no longer available. Please
              check with the professional who sent it to you.
            </p>
            <Link to="/" className="btn-pill">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-[60vh] bg-cream flex items-center justify-center p-4">
        <div className="max-w-md w-full frame-img text-center">
          <div className="bg-white rounded-xl p-10">
            <div className="w-16 h-16 bg-success-bg text-success-text rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="text-3xl" />
            </div>
            <h2 className="mk-h2 mb-2">Thank You!</h2>
            <p className="text-body-text">
              Your answers have been submitted successfully. We'll be in touch
              soon.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-14 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Form header */}
        <div className="text-center mb-10">
          <p className="mk-eyebrow mb-3">Project Questionnaire</p>
          <h1 className="mk-h2 mb-3">{questionnaire.title}</h1>
          {questionnaire.description && (
            <p className="mk-lead max-w-xl mx-auto">
              {questionnaire.description}
            </p>
          )}
        </div>

        <div className="bg-white p-6 md:p-10 rounded-2xl shadow-soft border border-line">
          <form onSubmit={handleSubmit} className="space-y-8">
            {(questionnaire.fields || []).map((field, idx) => (
              <div key={field.id} className="space-y-2.5">
                <label className="flex items-start gap-3 text-base font-semibold text-ink">
                  <span className="w-7 h-7 rounded-full bg-primary-tint text-primary text-sm font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span>
                    {field.label}
                    {field.required && (
                      <span className="text-danger-text ml-1">*</span>
                    )}
                  </span>
                </label>

                <div className="pl-10">
                  {field.type === "text" && (
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-line rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-sm"
                      placeholder="Your answer"
                      value={answers[field.id] || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                    />
                  )}

                  {field.type === "textarea" && (
                    <textarea
                      rows="4"
                      className="w-full px-4 py-3 border border-line rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all resize-none text-sm"
                      placeholder="Your answer"
                      value={answers[field.id] || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                    />
                  )}
                </div>
              </div>
            ))}

            <div className="pt-6 border-t border-line">
              <button
                type="submit"
                disabled={submitting}
                className="btn-pill w-full sm:w-auto"
              >
                <FiSend /> {submitting ? "Submitting..." : "Submit Answers"}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-body-text/60 mt-6">
          Powered by <span className="font-bold text-primary">Taskra</span>
        </p>
      </div>
    </div>
  );
};

export default PublicQuestionnaire;
