import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiTrash2, FiPlus, FiEdit2, FiSave, FiStar, FiLoader } from "react-icons/fi";
import useAxios from "../../../Hooks/useAxios";
import useUser from "../../../Hooks/useUser";
import { uploadImage } from "../../../utils/uploadImage";
import { confirmToast } from "../../../utils/toastConfirm";
import NoData from "../../../utils/NoData";
import TutorialModal from "../../../DashboardTutorial/TutorialModal";

const emptyForm = {
  source: "manual", // "manual" | "user"
  userId: "",
  name: "",
  skills: "",
  location: "",
  photo: "",
  rating: "5.0",
  order: 0,
};

const FeaturedCreativesAdmin = () => {
  const axiosPublic = useAxios();
  const queryClient = useQueryClient();
  const { users } = useUser();
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const freelancers = (users || []).filter((u) => u.role === "professional");

  const { data: creatives = [] } = useQuery({
    queryKey: ["featured-creatives"],
    queryFn: async () => {
      const { data } = await axiosPublic.get("/featured-creatives");
      return data;
    },
    // Admin panel must always reflect live DB state, not the 5-min global cache.
    staleTime: 0,
    refetchOnMount: "always",
  });

  // Invalidate the shared ["featured-creatives"] cache so this admin list AND
  // the public home-page carousel both pick up the change immediately.
  const syncCache = () =>
    queryClient.invalidateQueries({ queryKey: ["featured-creatives"] });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // When admin picks an existing freelancer, prefill the card from their profile.
  const handleSelectFreelancer = (userId) => {
    const u = freelancers.find((f) => f._id === userId);
    if (!u) {
      setFormData((prev) => ({ ...prev, userId: "" }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      source: "user",
      userId: u._id,
      name: u.name || "",
      skills: u.skills || "",
      location: u.location || "",
      photo: u.photo || "",
    }));
  };

  // All uploads go through uploadImage() → WebP → ImgBB.
  const handlePhotoUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setFormData((prev) => ({ ...prev, photo: url }));
      toast.success("Image uploaded");
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const buildPayload = () => ({
    source: formData.source,
    userId: formData.source === "user" ? formData.userId : "",
    name: formData.name.trim(),
    skills: formData.skills.trim(),
    location: formData.location.trim(),
    photo: formData.photo,
    rating: formData.rating,
    order: Number(formData.order) || 0,
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.photo) {
      return toast.error("Name and photo are required");
    }
    try {
      await axiosPublic.post("/featured-creatives", buildPayload());
      toast.success("Featured creative added!");
      setFormData(emptyForm);
      syncCache();
    } catch (err) {
      console.log(err);
      toast.error("Failed to add creative");
    }
  };

  const startEditing = (c) => {
    setEditingId(c._id);
    setFormData({
      source: c.source || "manual",
      userId: c.userId || "",
      name: c.name || "",
      skills: c.skills || "",
      location: c.location || "",
      photo: c.photo || "",
      rating: c.rating || "5.0",
      order: c.order ?? 0,
    });
  };

  const handleUpdate = async () => {
    if (!formData.name || !formData.photo) {
      return toast.error("Name and photo are required");
    }
    try {
      await axiosPublic.put(`/featured-creatives/${editingId}`, buildPayload());
      toast.success("Featured creative updated!");
      setEditingId(null);
      setFormData(emptyForm);
      syncCache();
    } catch (err) {
      console.log(err);
      toast.error("Failed to update creative");
    }
  };

  const handleDelete = async (id) => {
    if (
      await confirmToast({
        title: "Remove this creative?",
        message: "It will be removed from the home-page carousel.",
        confirmText: "Yes, remove it!",
        danger: true,
      })
    ) {
      try {
        await axiosPublic.delete(`/featured-creatives/${id}`);
        toast.success("Creative removed!");
        syncCache();
      } catch (err) {
        console.log(err);
        toast.error("Failed to delete creative");
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(emptyForm);
  };

  return (
    <div className="tk-page max-w-6xl mx-auto">
      <TutorialModal
        componentName="FeaturedCreativesAdmin"
        title="Welcome to Featured Creatives"
        description="Curate the featured creatives carousel shown on the home page."
        listItems={[
          "Pick an existing professional or add a manual card",
          "Upload photos and set display order",
          "Edit or remove cards at any time",
        ]}
      />

      {/* Form card */}
      <div className="tk-card overflow-hidden">
        <div className="px-6 py-5 sm:px-8 border-b border-line-app">
          <h2 className="tk-page-title">Featured Creatives</h2>
          <p className="text-sm text-body-text mt-1">
            Curate the "Featured Creatives" carousel on the home page. Pick an existing
            professional or add a manual card.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {/* Source toggle */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, source: "manual", userId: "" }))
              }
              className={formData.source === "manual" ? "tk-btn-primary" : "tk-btn-secondary"}
            >
              Manual card
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, source: "user" }))}
              className={formData.source === "user" ? "tk-btn-primary" : "tk-btn-secondary"}
            >
              Select professional
            </button>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {formData.source === "user" && (
              <div className="md:col-span-2">
                <label className="tk-label">Choose a professional</label>
                <select
                  value={formData.userId}
                  onChange={(e) => handleSelectFreelancer(e.target.value)}
                  className="tk-input"
                >
                  <option value="">— Select —</option>
                  {freelancers.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name} {f.skills ? `· ${f.skills}` : ""}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-body-text/60 mt-1">
                  Fields below are prefilled from the profile — you can still tweak them.
                </p>
              </div>
            )}

            <div>
              <label className="tk-label">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Jane Doe"
                className="tk-input"
              />
            </div>
            <div>
              <label className="tk-label">Skills / Title</label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                placeholder="e.g. Wedding Photographer"
                className="tk-input"
              />
            </div>
            <div>
              <label className="tk-label">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g. London, UK"
                className="tk-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="tk-label">Rating</label>
                <input
                  type="text"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  placeholder="5.0"
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
            </div>

            <div className="md:col-span-2">
              <label className="tk-label">Photo</label>
              <div className="flex items-center gap-4">
                {formData.photo ? (
                  <img
                    src={formData.photo}
                    alt="preview"
                    className="w-16 h-16 rounded-xl object-cover border border-line-app"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-app-bg flex items-center justify-center text-body-text/30 border border-line-app">
                    <FiStar />
                  </div>
                )}
                <label className="tk-btn-secondary text-primary cursor-pointer">
                  {uploading ? <FiLoader className="animate-spin" /> : <FiPlus />}
                  {uploading ? "Uploading..." : "Upload image (WebP)"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
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
                    <FiSave /> Update
                  </button>
                </>
              ) : (
                <button type="button" onClick={handleAdd} className="tk-btn-primary">
                  <FiPlus /> Add Creative
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Cards grid */}
      {creatives.length === 0 ? (
        <NoData
          title="No featured creatives yet"
          message="Add your first creative above to populate the home-page carousel."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {creatives.map((c) => (
            <div key={c._id} className="tk-card overflow-hidden">
              <div className="h-40 overflow-hidden bg-app-bg">
                {c.photo && (
                  <img src={c.photo} alt={c.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-ink">{c.name}</h3>
                  <span className="text-xs font-semibold text-primary flex items-center gap-1">
                    <FiStar /> {c.rating || "5.0"}
                  </span>
                </div>
                <p className="text-sm text-primary font-semibold uppercase">{c.skills}</p>
                <p className="text-xs text-body-text/70 mt-1">{c.location}</p>
                <p className="text-[10px] text-body-text/50 mt-1">
                  {c.source === "user" ? "Linked profile" : "Manual card"} · order{" "}
                  {c.order ?? 0}
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => startEditing(c)}
                    className="tk-btn-secondary flex-1 text-primary"
                    title="Edit"
                  >
                    <FiEdit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="tk-btn-secondary flex-1 text-danger-text"
                    title="Delete"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedCreativesAdmin;
