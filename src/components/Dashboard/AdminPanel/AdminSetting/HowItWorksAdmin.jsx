import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiTrash2, FiPlus, FiEdit2, FiSave, FiImage, FiLoader } from "react-icons/fi";
import useAxios from "../../../Hooks/useAxios";
import { uploadImage } from "../../../utils/uploadImage";
import { confirmToast } from "../../../utils/toastConfirm";
import NoData from "../../../utils/NoData";
import TutorialModal from "../../../DashboardTutorial/TutorialModal";

const emptyForm = {
  title: "",
  description: "",
  image: "",
  alt: "",
  order: 0,
  reverse: false,
  ctaLabel: "",
  ctaTo: "",
};

const HowItWorksAdmin = () => {
  const axiosPublic = useAxios();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { data: steps = [] } = useQuery({
    queryKey: ["how-it-works"],
    queryFn: async () => {
      const { data } = await axiosPublic.get("/how-it-works");
      return data;
    },
    // Admin panel must always reflect live DB state, not the 5-min global cache.
    staleTime: 0,
    refetchOnMount: "always",
  });

  // Invalidate the shared ["how-it-works"] cache so this admin list AND the
  // public home-page section both pick up the change immediately.
  const syncCache = () => queryClient.invalidateQueries({ queryKey: ["how-it-works"] });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // All uploads go through uploadImage() → WebP → ImgBB.
  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setFormData((prev) => ({ ...prev, image: url }));
      toast.success("Image uploaded");
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const buildPayload = () => ({
    title: formData.title.trim(),
    description: formData.description.trim(),
    image: formData.image,
    alt: formData.alt.trim(),
    order: Number(formData.order) || 0,
    reverse: !!formData.reverse,
    ctaLabel: formData.ctaLabel.trim(),
    ctaTo: formData.ctaTo.trim(),
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.image) {
      return toast.error("Title, description and image are required");
    }
    try {
      await axiosPublic.post("/how-it-works", buildPayload());
      toast.success("Step added!");
      setFormData(emptyForm);
      syncCache();
    } catch (err) {
      console.log(err);
      toast.error("Failed to add step");
    }
  };

  const startEditing = (s) => {
    setEditingId(s._id);
    setFormData({
      title: s.title || "",
      description: s.description || "",
      image: s.image || "",
      alt: s.alt || "",
      order: s.order ?? 0,
      reverse: !!s.reverse,
      ctaLabel: s.ctaLabel || "",
      ctaTo: s.ctaTo || "",
    });
  };

  const handleUpdate = async () => {
    if (!formData.title || !formData.description || !formData.image) {
      return toast.error("Title, description and image are required");
    }
    try {
      await axiosPublic.put(`/how-it-works/${editingId}`, buildPayload());
      toast.success("Step updated!");
      setEditingId(null);
      setFormData(emptyForm);
      syncCache();
    } catch (err) {
      console.log(err);
      toast.error("Failed to update step");
    }
  };

  const handleDelete = async (id) => {
    if (
      await confirmToast({
        title: "Remove this step?",
        message: "It will disappear from the public How It Works section.",
        confirmText: "Yes, remove it!",
        danger: true,
      })
    ) {
      try {
        await axiosPublic.delete(`/how-it-works/${id}`);
        toast.success("Step removed!");
        syncCache();
      } catch (err) {
        console.log(err);
        toast.error("Failed to delete step");
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(emptyForm);
  };

  return (
    <div className="tk-page max-w-5xl mx-auto">
      <TutorialModal
        componentName="HowItWorksAdmin"
        title='Welcome to Manage "How It Works"'
        description="Curate the step-by-step walkthrough shown on the home page."
        listItems={[
          "Add steps with a title, description and image",
          "Reorder steps with the order field",
          "Edit or remove steps at any time",
        ]}
      />

      {/* Form card */}
      <div className="tk-card overflow-hidden">
        <div className="px-6 py-5 sm:px-8 border-b border-line-app">
          <h2 className="tk-page-title">Manage "How It Works"</h2>
          <p className="text-sm text-body-text mt-1">
            Add, edit and reorder the steps shown in the "How It Works" section on the home
            page.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="tk-label">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Tell us what you need"
                className="tk-input"
              />
            </div>
            <div className="md:col-span-2">
              <label className="tk-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Describe this step..."
                className="tk-input h-auto py-3 resize-none"
              ></textarea>
            </div>
            <div>
              <label className="tk-label">Image alt text</label>
              <input
                type="text"
                name="alt"
                value={formData.alt}
                onChange={handleInputChange}
                placeholder="Describe the image"
                className="tk-input"
              />
            </div>
            <div>
              <label className="tk-label">Order</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                className="tk-input"
              />
            </div>
            <div>
              <label className="tk-label">CTA label (optional)</label>
              <input
                type="text"
                name="ctaLabel"
                value={formData.ctaLabel}
                onChange={handleInputChange}
                placeholder="e.g. Find a professional"
                className="tk-input"
              />
            </div>
            <div>
              <label className="tk-label">CTA link (optional)</label>
              <input
                type="text"
                name="ctaTo"
                value={formData.ctaTo}
                onChange={handleInputChange}
                placeholder="e.g. /search-professional"
                className="tk-input"
              />
            </div>

            <div className="flex items-center gap-3 mt-2">
              <input
                type="checkbox"
                name="reverse"
                checked={formData.reverse}
                onChange={handleInputChange}
                id="reverse"
                className="w-5 h-5 accent-primary"
              />
              <label htmlFor="reverse" className="text-sm font-medium text-ink">
                Reverse layout (image on left)
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="tk-label">Image</label>
              <div className="flex items-center gap-4">
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt="preview"
                    className="w-24 h-16 rounded-xl object-cover border border-line-app"
                  />
                ) : (
                  <div className="w-24 h-16 rounded-xl bg-app-bg flex items-center justify-center text-body-text/30 border border-line-app">
                    <FiImage />
                  </div>
                )}
                <label className="tk-btn-secondary text-primary cursor-pointer">
                  {uploading ? <FiLoader className="animate-spin" /> : <FiPlus />}
                  {uploading ? "Uploading..." : "Upload image (WebP)"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files?.[0])}
                  />
                </label>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              {editingId ? (
                <>
                  <button type="button" onClick={cancelEdit} className="tk-btn-secondary">
                    Cancel
                  </button>
                  <button type="button" onClick={handleUpdate} className="tk-btn-primary">
                    <FiSave /> Update Step
                  </button>
                </>
              ) : (
                <button type="button" onClick={handleAdd} className="tk-btn-primary">
                  <FiPlus /> Add Step
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Steps list */}
      {steps.length === 0 ? (
        <NoData
          title="No steps added yet"
          message="Add your first step above to build the walkthrough."
        />
      ) : (
        <div className="space-y-4">
          {steps.map((s, i) => (
            <div key={s._id} className="tk-card p-5 flex flex-col sm:flex-row gap-4 sm:items-center">
              <span className="text-3xl font-bold text-primary/30 shrink-0 w-10 text-center">
                {i + 1}
              </span>
              {s.image && (
                <img
                  src={s.image}
                  alt={s.alt || s.title}
                  className="w-24 h-16 rounded-xl object-cover border border-line-app shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-ink">{s.title}</h3>
                <p className="text-sm text-body-text/80 line-clamp-2">{s.description}</p>
                <p className="text-[10px] text-body-text/50 mt-1">
                  order {s.order ?? 0}
                  {s.reverse ? " · reversed" : ""}
                  {s.ctaLabel ? ` · CTA: ${s.ctaLabel}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => startEditing(s)}
                  className="tk-icon-btn text-primary hover:bg-primary-tint"
                  title="Edit"
                >
                  <FiEdit2 size={15} />
                </button>
                <button
                  onClick={() => handleDelete(s._id)}
                  className="tk-icon-btn text-danger-text hover:bg-danger-bg"
                  title="Delete"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HowItWorksAdmin;
