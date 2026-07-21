import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiTrash2, FiPlus, FiEdit2, FiX, FiSave } from "react-icons/fi";
import useAxios from "../../../Hooks/useAxios";
import { confirmToast } from "../../../utils/toastConfirm";
import NoData from "../../../utils/NoData";
import TutorialModal from "../../../DashboardTutorial/TutorialModal";

// A single blank plan — features start as an empty, dynamically-editable list.
const emptyForm = {
  title: "",
  priceMonthly: "",
  priceYearly: "",
  brands: "1",
  users: "1",
  contactForms: "1",
  onlineBookingForms: "❌",
  activeJobs: "5",
  workflowAutomation: "❌",
  isRecommended: false,
  features: [], // [{ label: "Portfolio", value: "✅" }, ...]
};

const PricingAdmin = () => {
  const axiosPublic = useAxios();
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const { data: plans = [], refetch } = useQuery({
    queryKey: ["pricing-plans"],
    queryFn: async () => {
      const { data } = await axiosPublic.get("/pricing");
      return data;
    },
    // Admin panel must always reflect live DB state, not the 5-min global cache.
    staleTime: 0,
    refetchOnMount: "always",
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ---- Dynamic features handlers ----
  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, { label: "", value: "✅" }],
    }));
  };

  const removeFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleFeatureChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((feature, i) =>
        i === index ? { ...feature, [field]: value } : feature
      ),
    }));
  };

  const handleAddPlan = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.priceMonthly || !formData.priceYearly) {
      return toast.error("Please fill required fields (Title, Prices)");
    }
    try {
      await axiosPublic.post("/pricing", formData);
      toast.success("Pricing plan added!");
      setFormData(emptyForm);
      refetch();
    } catch (err) {
      toast.error("Failed to add pricing plan");
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    if (
      await confirmToast({
        title: "Delete this plan?",
        message: "It will be removed from the public pricing page.",
        confirmText: "Yes, delete it!",
        danger: true,
      })
    ) {
      try {
        await axiosPublic.delete(`/pricing/${id}`);
        toast.success("Plan deleted!");
        refetch();
      } catch (err) {
        toast.error("Failed to delete plan");
        console.log(err);
      }
    }
  };

  const startEditing = (plan) => {
    setEditingId(plan._id);
    setFormData({
      title: plan.title,
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      brands: plan.brands || "1",
      users: plan.users || "1",
      contactForms: plan.contactForms || "1",
      onlineBookingForms: plan.onlineBookingForms || "❌",
      activeJobs: plan.activeJobs || "5",
      workflowAutomation: plan.workflowAutomation || "❌",
      isRecommended: plan.isRecommended || false,
      features: Array.isArray(plan.features) ? plan.features : [],
    });
  };

  const handleUpdate = async () => {
    try {
      await axiosPublic.put(`/pricing/${editingId}`, formData);
      toast.success("Pricing plan updated!");
      setEditingId(null);
      setFormData(emptyForm);
      refetch();
    } catch (err) {
      toast.error("Failed to update plan");
      console.log(err);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(emptyForm);
  };

  return (
    <div className="tk-page max-w-6xl mx-auto">
      <TutorialModal
        componentName="PricingAdmin"
        title="Welcome to Manage Pricing Plans"
        description="Build and maintain the pricing matrix shown on the public pricing page."
        listItems={[
          "Add new plans with prices and limits",
          "Edit or delete existing plans",
          "Attach custom features to any plan",
        ]}
      />

      {/* Form card */}
      <div className="tk-card overflow-hidden">
        <div className="px-6 py-5 sm:px-8 border-b border-line-app">
          <h2 className="tk-page-title">Manage Pricing Plans</h2>
          <p className="text-sm text-body-text mt-1">
            Add or edit plans displayed on the pricing page.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="tk-label">Plan Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Starter"
                className="tk-input"
              />
            </div>
            <div>
              <label className="tk-label">Price (Monthly) £</label>
              <input
                type="number"
                name="priceMonthly"
                value={formData.priceMonthly}
                onChange={handleInputChange}
                placeholder="16"
                className="tk-input"
              />
            </div>
            <div>
              <label className="tk-label">Price (Yearly) £</label>
              <input
                type="number"
                name="priceYearly"
                value={formData.priceYearly}
                onChange={handleInputChange}
                placeholder="160"
                className="tk-input"
              />
            </div>
            <div>
              <label className="tk-label">Brands</label>
              <input
                type="text"
                name="brands"
                value={formData.brands}
                onChange={handleInputChange}
                className="tk-input"
              />
            </div>
            <div>
              <label className="tk-label">Users</label>
              <input
                type="text"
                name="users"
                value={formData.users}
                onChange={handleInputChange}
                className="tk-input"
              />
            </div>
            <div>
              <label className="tk-label">Contact Forms</label>
              <input
                type="text"
                name="contactForms"
                value={formData.contactForms}
                onChange={handleInputChange}
                className="tk-input"
              />
            </div>
            <div>
              <label className="tk-label">Online Booking (❌ or ✅ or number)</label>
              <input
                type="text"
                name="onlineBookingForms"
                value={formData.onlineBookingForms}
                onChange={handleInputChange}
                className="tk-input"
              />
            </div>
            <div>
              <label className="tk-label">Active Jobs</label>
              <input
                type="text"
                name="activeJobs"
                value={formData.activeJobs}
                onChange={handleInputChange}
                className="tk-input"
              />
            </div>
            <div>
              <label className="tk-label">Workflow Automation (❌ or ✅)</label>
              <input
                type="text"
                name="workflowAutomation"
                value={formData.workflowAutomation}
                onChange={handleInputChange}
                className="tk-input"
              />
            </div>
            <div className="flex items-center gap-3 mt-6">
              <input
                type="checkbox"
                name="isRecommended"
                checked={formData.isRecommended}
                onChange={handleInputChange}
                className="w-5 h-5 accent-primary"
                id="isRec"
              />
              <label htmlFor="isRec" className="text-sm font-medium text-ink">
                Recommended Plan (Highlight)
              </label>
            </div>

            {/* ---- Dynamic Custom Features ---- */}
            <div className="md:col-span-2 lg:col-span-3 border-t border-line-app pt-5 mt-2">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-ink">Custom Features</h3>
                  <p className="text-xs text-body-text/70">
                    Add extra features like Portfolio, Verified, Customer Reviews, etc.
                  </p>
                </div>
                <button type="button" onClick={addFeature} className="tk-btn-secondary text-primary">
                  <FiPlus /> Add Feature
                </button>
              </div>

              {formData.features.length === 0 ? (
                <p className="text-xs text-body-text/50 italic">No custom features added yet.</p>
              ) : (
                <div className="space-y-3">
                  {formData.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end"
                    >
                      <div className="flex-1">
                        <label className="tk-label text-xs">Feature Name</label>
                        <input
                          type="text"
                          value={feature.label}
                          onChange={(e) => handleFeatureChange(index, "label", e.target.value)}
                          placeholder="e.g. Portfolio"
                          className="tk-input"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="tk-label text-xs">Value (❌ / ✅ / number)</label>
                        <input
                          type="text"
                          value={feature.value}
                          onChange={(e) => handleFeatureChange(index, "value", e.target.value)}
                          placeholder="e.g. ✅"
                          className="tk-input"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="tk-btn-secondary text-danger-text shrink-0"
                        aria-label="Remove feature"
                      >
                        <FiX /> <span className="sm:hidden">Remove</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 mt-4">
              {editingId ? (
                <>
                  <button type="button" onClick={cancelEdit} className="tk-btn-secondary">
                    Cancel
                  </button>
                  <button type="button" onClick={handleUpdate} className="tk-btn-primary">
                    <FiSave /> Update Plan
                  </button>
                </>
              ) : (
                <button type="button" onClick={handleAddPlan} className="tk-btn-primary">
                  <FiPlus /> Add Plan
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Existing plans */}
      {plans.length === 0 ? (
        <NoData title="No plans yet" message="Add your first pricing plan above." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className={`tk-card p-6 relative ${
                plan.isRecommended ? "border-primary ring-1 ring-primary" : ""
              }`}
            >
              {plan.isRecommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  Recommended
                </span>
              )}
              <h3 className="text-lg font-semibold text-ink mb-2">{plan.title}</h3>
              <p className="text-2xl font-bold text-ink">
                £{plan.priceMonthly}
                <span className="text-sm text-body-text/70 font-medium">/mo</span>
              </p>
              <p className="text-sm text-body-text/70 mb-4">£{plan.priceYearly}/yr</p>
              <div className="space-y-2 text-sm text-body-text border-t border-line-app pt-4">
                <p>
                  <b className="text-ink">Brands:</b> {plan.brands}
                </p>
                <p>
                  <b className="text-ink">Users:</b> {plan.users}
                </p>
                <p>
                  <b className="text-ink">Contact Forms:</b> {plan.contactForms}
                </p>
                <p>
                  <b className="text-ink">Online Booking:</b> {plan.onlineBookingForms}
                </p>
                <p>
                  <b className="text-ink">Active Jobs:</b> {plan.activeJobs}
                </p>
                <p>
                  <b className="text-ink">Automation:</b> {plan.workflowAutomation}
                </p>
                {Array.isArray(plan.features) &&
                  plan.features.map((feature, i) => (
                    <p key={i}>
                      <b className="text-ink">{feature.label}:</b> {feature.value}
                    </p>
                  ))}
              </div>
              <div className="flex items-center gap-2 mt-6">
                <button
                  disabled={editingId === plan._id}
                  onClick={() => startEditing(plan)}
                  className="tk-btn-secondary flex-1 text-primary disabled:opacity-50"
                  title="Edit"
                >
                  <FiEdit2 size={15} />
                </button>
                <button
                  disabled={editingId === plan._id}
                  onClick={() => handleDelete(plan._id)}
                  className="tk-btn-secondary flex-1 text-danger-text disabled:opacity-50"
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

export default PricingAdmin;
