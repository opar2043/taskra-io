import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  FiPlus,
  FiTrash2,
  FiCopy,
  FiSave,
  FiClipboard,
} from "react-icons/fi";
import useAxios from "../../../Hooks/useAxios";
import useLoginUser from "../../../Hooks/useLoginUser";
import NoData from "../../../utils/NoData";
import TutorialModal from "../../../DashboardTutorial/TutorialModal";

// TODO: backend route missing — there is no DELETE /questionnaires/:id endpoint
// yet, so questionnaires cannot be deleted from the UI. Add the route in
// pixlo-backend/routes/questionnaires/ and wire a confirmToast + delete here.

const Questionnaires = () => {
  const { currentUser } = useLoginUser() || {};
  const axiosSecure = useAxios();

  const [isBuilding, setIsBuilding] = useState(false);

  // Builder state
  const [title, setTitle] = useState("New Questionnaire");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState([]);
  const [saving, setSaving] = useState(false);

  // GET /questionnaires/:freelancerId — all forms for this professional
  const { data: questionnaires = [], refetch } = useQuery({
    queryKey: ["questionnaires", currentUser?._id],
    enabled: !!currentUser?._id,
    queryFn: async () => {
      const res = await axiosSecure.get(`/questionnaires/${currentUser._id}`);
      return res.data || [];
    },
  });

  const addField = (type) => {
    setFields((prev) => [
      ...prev,
      {
        id: Date.now(),
        type,
        label: "New Question",
        required: false,
        options: type === "select" ? ["Option 1"] : [],
      },
    ]);
  };

  const updateField = (id, key, value) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [key]: value } : f))
    );
  };

  const removeField = (id) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSave = async () => {
    if (!title) return toast.error("Title is required");
    if (fields.length === 0) return toast.error("Add at least one question");

    setSaving(true);
    const payload = {
      freelancer_id: currentUser._id,
      title,
      description,
      fields,
      createdAt: new Date(),
    };

    try {
      await axiosSecure.post("/questionnaires", payload);
      toast.success("Questionnaire saved successfully!");
      setIsBuilding(false);
      setTitle("New Questionnaire");
      setDescription("");
      setFields([]);
      refetch();
    } catch {
      toast.error("Failed to save questionnaire.");
    } finally {
      setSaving(false);
    }
  };

  const copyLink = (id) => {
    const url = `${window.location.origin}/questionnaire/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="tk-page">
      <TutorialModal
        componentName="Questionnaires"
        title="Welcome to Questionnaires"
        description="This is where you can build and manage custom forms perfectly tailored to gather project details from your clients."
        listItems={[
          "Create unlimited questionnaires",
          "Add various field types (text, paragraph, etc.)",
          "Share form links easily with your clients",
        ]}
      />

      {/* Header */}
      <div className="tk-card p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="tk-eyebrow mb-1">Client Intake</p>
          <h1 className="tk-page-title">Custom Questionnaires</h1>
          <p className="text-sm text-body-text mt-1">
            Gather project details easily by sending forms to your clients.
          </p>
        </div>
        {!isBuilding && (
          <button
            onClick={() => setIsBuilding(true)}
            className="tk-btn-primary"
          >
            <FiPlus /> Create New Questionnaire
          </button>
        )}
      </div>

      {!isBuilding ? (
        questionnaires.length === 0 ? (
          <NoData
            title="No Questionnaires Yet"
            message="Create your first form to start collecting client details."
            action={
              <button
                onClick={() => setIsBuilding(true)}
                className="tk-btn-primary"
              >
                <FiPlus /> Create Questionnaire
              </button>
            }
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {questionnaires.map((q) => (
              <div
                key={q._id}
                className="tk-card p-5 hover:border-primary/40 transition-colors flex flex-col"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-tint text-primary flex items-center justify-center mb-4">
                  <FiClipboard size={18} />
                </div>
                <h3 className="text-base font-semibold text-ink mb-1.5">
                  {q.title}
                </h3>
                <p className="text-sm text-body-text mb-4 line-clamp-2 flex-1">
                  {q.description || "No description provided."}
                </p>
                <div className="flex items-center gap-2 text-xs text-body-text/70 mb-5 font-medium">
                  <span>{q.fields?.length || 0} questions</span>
                  <span>•</span>
                  <span>
                    Created {new Date(q.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => copyLink(q._id)}
                  className="tk-btn-secondary w-full hover:border-primary hover:text-primary"
                >
                  <FiCopy /> Copy Share Link
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        /* -------- Builder -------- */
        <div className="tk-card p-5 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
            <h2 className="text-lg font-semibold text-ink">
              Build Questionnaire
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => setIsBuilding(false)}
                className="tk-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="tk-btn-primary"
              >
                <FiSave /> {saving ? "Saving..." : "Save Questionnaire"}
              </button>
            </div>
          </div>

          <div className="space-y-5">
            {/* Header info */}
            <div className="rounded-2xl border border-line-app p-6 bg-app-bg/40">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xl font-semibold text-ink border-b-2 border-transparent hover:border-line-app focus:border-primary outline-none pb-2 mb-4 bg-transparent transition-colors"
                placeholder="Questionnaire Title"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm text-body-text border-2 border-transparent hover:border-line-app focus:border-primary outline-none p-2 rounded-xl resize-none bg-transparent transition-colors"
                placeholder="Add a description or instructions for your client..."
                rows="2"
              />
            </div>

            {/* Fields */}
            <div className="space-y-4">
              {fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="rounded-2xl border border-line-app p-6 relative group bg-surface"
                >
                  <button
                    onClick={() => removeField(field.id)}
                    className="absolute top-4 right-4 text-danger-text/60 hover:text-danger-text opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove question"
                  >
                    <FiTrash2 />
                  </button>

                  <div className="flex items-start gap-4 mb-4 pr-8">
                    <span className="w-7 h-7 rounded-full bg-primary-tint text-primary text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) =>
                        updateField(field.id, "label", e.target.value)
                      }
                      className="flex-1 text-base font-semibold text-ink border-b-2 border-line-app focus:border-primary outline-none pb-1 bg-transparent transition-colors"
                      placeholder="Question text..."
                    />
                  </div>

                  <div className="pl-11">
                    {field.type === "text" && (
                      <input
                        type="text"
                        disabled
                        placeholder="Short answer text"
                        className="w-full border-b border-line-app pb-1 bg-transparent text-sm text-body-text/50"
                      />
                    )}
                    {field.type === "textarea" && (
                      <textarea
                        disabled
                        placeholder="Long answer text"
                        className="w-full border-b border-line-app pb-1 bg-transparent resize-none text-sm text-body-text/50"
                        rows="2"
                      />
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-line-app pt-4">
                      <span className="tk-section-title">
                        {field.type === "textarea" ? "Long answer" : "Short answer"}
                      </span>
                      <label className="flex items-center gap-2 text-sm text-body-text cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) =>
                            updateField(field.id, "required", e.target.checked)
                          }
                          className="accent-[#FE6D06] rounded"
                        />
                        Required
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add field buttons */}
            <div className="rounded-2xl border border-dashed border-line-app p-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => addField("text")}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary bg-primary-tint rounded-xl hover:bg-primary hover:text-white transition-colors"
              >
                <FiPlus /> Short Answer
              </button>
              <button
                onClick={() => addField("textarea")}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary bg-primary-tint rounded-xl hover:bg-primary hover:text-white transition-colors"
              >
                <FiPlus /> Long Answer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questionnaires;
