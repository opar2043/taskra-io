import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiTrash2, FiPlus, FiEdit2, FiX, FiSave } from "react-icons/fi";
import useAxios from "../../../Hooks/useAxios";
import { confirmToast } from "../../../utils/toastConfirm";
import NoData from "../../../utils/NoData";
import TutorialModal from "../../../DashboardTutorial/TutorialModal";

const FaqAdmin = () => {
  const axiosPublic = useAxios();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");

  const { data: faqs = [], refetch } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const { data } = await axiosPublic.get("/faqs");
      return data;
    },
    // Admin panel must always reflect live DB state, not the 5-min global cache.
    staleTime: 0,
    refetchOnMount: "always",
  });

  const handleAddFaq = async (e) => {
    e.preventDefault();
    if (!question || !answer) return toast.error("Please fill all fields");
    try {
      await axiosPublic.post("/faqs", { question, answer });
      toast.success("FAQ added successfully!");
      setQuestion("");
      setAnswer("");
      refetch();
    } catch {
      toast.error("Failed to add FAQ");
    }
  };

  const handleDelete = async (id) => {
    if (
      await confirmToast({
        title: "Delete this FAQ?",
        message: "It will disappear from the public FAQ section.",
        confirmText: "Yes, delete it!",
        danger: true,
      })
    ) {
      try {
        await axiosPublic.delete(`/faqs/${id}`);
        toast.success("FAQ deleted!");
        refetch();
      } catch {
        toast.error("Failed to delete FAQ");
      }
    }
  };

  const handleEdit = (faq) => {
    setEditingId(faq._id);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
  };

  const handleUpdate = async (id) => {
    try {
      await axiosPublic.put(`/faqs/${id}`, {
        question: editQuestion,
        answer: editAnswer,
      });
      toast.success("FAQ updated!");
      setEditingId(null);
      refetch();
    } catch {
      toast.error("Failed to update FAQ");
    }
  };

  return (
    <div className="tk-page max-w-5xl mx-auto">
      <TutorialModal
        componentName="FaqAdmin"
        title="Welcome to Manage FAQs"
        description="Create and maintain the frequently asked questions shown to visitors."
        listItems={[
          "Add new question and answer pairs",
          "Edit existing FAQ entries",
          "Delete FAQs that are out of date",
        ]}
      />

      {/* Create card */}
      <div className="tk-card overflow-hidden">
        <div className="px-6 py-5 sm:px-8 border-b border-line-app">
          <h2 className="tk-page-title">Manage FAQs</h2>
          <p className="text-sm text-body-text mt-1">
            Create and modify frequently asked questions for the home page.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <form onSubmit={handleAddFaq} className="space-y-5">
            <div>
              <label className="tk-label">Question</label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. How does Taskra work?"
                className="tk-input"
              />
            </div>
            <div>
              <label className="tk-label">Answer</label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Provide a detailed answer..."
                rows="4"
                className="tk-input h-auto py-3 resize-none"
              ></textarea>
            </div>
            <button type="submit" className="tk-btn-primary">
              <FiPlus /> Add FAQ
            </button>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq._id} className="tk-card p-6 transition-shadow hover:shadow-md">
            {editingId === faq._id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editQuestion}
                  onChange={(e) => setEditQuestion(e.target.value)}
                  className="tk-input"
                />
                <textarea
                  value={editAnswer}
                  onChange={(e) => setEditAnswer(e.target.value)}
                  className="tk-input h-auto py-3 resize-none"
                  rows="3"
                ></textarea>
                <div className="flex gap-3">
                  <button onClick={() => handleUpdate(faq._id)} className="tk-btn-primary">
                    <FiSave /> Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="tk-btn-secondary">
                    <FiX /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-base font-semibold text-ink mb-2">{faq.question}</h3>
                  <p className="text-body-text whitespace-pre-line leading-relaxed text-sm">
                    {faq.answer}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(faq)}
                    className="tk-icon-btn text-primary hover:bg-primary-tint"
                    title="Edit"
                  >
                    <FiEdit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(faq._id)}
                    className="tk-icon-btn text-danger-text hover:bg-danger-bg"
                    title="Delete"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {faqs.length === 0 && (
          <NoData
            title="No FAQs added yet"
            message="Add your first question above to populate the public FAQ section."
          />
        )}
      </div>
    </div>
  );
};

export default FaqAdmin;
