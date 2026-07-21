import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiEye,
  FiTrash2,
  FiEdit2,
  FiMapPin,
  FiCalendar,
  FiX,
  FiPlus,
  FiCheckCircle,
  FiClock,
  FiLayers,
} from "react-icons/fi";
import { MdCategory } from "react-icons/md";
import useQuote from "../../../Hooks/useQuote";
import useAuth from "../../../Hooks/useAuth";
import useAxios from "../../../Hooks/useAxios";
import { confirmToast } from "../../../utils/toastConfirm";
import Loading from "../../../Root/Loading";
import NoData from "../../../utils/NoData";
import TutorialModal from "../../../DashboardTutorial/TutorialModal";

const emptyPackage = () => ({
  id: Date.now(),
  name: "",
  price: "",
  description: "",
});

const Proposal = () => {
  const [quote, refetch, isLoading] = useQuote();
  const { user } = useAuth();
  const axiosSecure = useAxios();

  const [sortBy, setSortBy] = useState("newest");
  const [editing, setEditing] = useState(null); // the proposal being edited
  const [viewing, setViewing] = useState(null); // the proposal detail modal

  // Edit form state (mirrors the marketplace proposal form)
  const [proposalType, setProposalType] = useState("flat");
  const [bid, setBid] = useState("");
  const [comment, setComment] = useState("");
  const [packages, setPackages] = useState([emptyPackage()]);
  const [addons, setAddons] = useState([]);
  const [saving, setSaving] = useState(false);

  const myProposals = useMemo(() => {
    const mine =
      (quote || []).filter((q) => q?.freelancer_email === user?.email) || [];
    const sorted = [...mine];
    if (sortBy === "newest")
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === "highest")
      sorted.sort((a, b) => Number(b.bid || 0) - Number(a.bid || 0));
    if (sortBy === "lowest")
      sorted.sort((a, b) => Number(a.bid || 0) - Number(b.bid || 0));
    return sorted;
  }, [quote, user, sortBy]);

  /* ---------------- withdraw ---------------- */
  const handleWithdraw = async (id) => {
    if (
      await confirmToast({
        title: "Withdraw Proposal?",
        message: "Your bid will be removed from this job. This cannot be undone.",
        confirmText: "Yes, withdraw",
        danger: true,
      })
    ) {
      try {
        const res = await axiosSecure.delete(`/quote/${id}`);
        if (res.data.deletedCount > 0) {
          toast.success("Proposal withdrawn.");
          refetch();
        }
      } catch {
        toast.error("Could not withdraw proposal.");
      }
    }
  };

  /* ---------------- edit ---------------- */
  const openEdit = (p) => {
    setEditing(p);
    setProposalType(p.proposalType || "flat");
    setBid(p.bid || "");
    setComment(p.comment || "");
    setPackages(p.packages?.length ? p.packages : [emptyPackage()]);
    setAddons(p.addons?.length ? p.addons : []);
  };

  const updatePackage = (id, field, value) =>
    setPackages((prev) =>
      prev.map((pk) => (pk.id === id ? { ...pk, [field]: value } : pk))
    );
  const updateAddon = (id, field, value) =>
    setAddons((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const payload = {
      ...editing,
      bid: proposalType === "flat" ? bid : packages[0]?.price || 0,
      proposalType,
      packages: proposalType === "tiered" ? packages : [],
      addons: proposalType === "tiered" ? addons : [],
      comment,
    };
    delete payload._id; // never PATCH the id itself
    try {
      await axiosSecure.patch(`/quote/${editing._id}`, payload);
      toast.success("Proposal updated successfully");
      setEditing(null);
      refetch();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const StatusBadge = ({ p }) =>
    p.accepted ? (
      <span className="tk-badge-success">
        <FiCheckCircle /> Accepted
      </span>
    ) : (
      <span className="tk-badge-warning">
        <FiClock /> Pending
      </span>
    );

  if (isLoading) return <Loading />;

  return (
    <div className="tk-page">
      <TutorialModal
        componentName="Proposal"
        title="Welcome to your Proposals page"
        description="This is where you will find all the proposals you have submitted to clients. Track their status, refine your bids, or withdraw them."
        listItems={[
          "Track flat-rate and package proposals",
          "Edit a bid before it is accepted",
          "Withdraw proposals you no longer want",
        ]}
      />

      {/* Header */}
      <div className="tk-card p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="tk-eyebrow mb-1">Your Dashboard</p>
          <h1 className="tk-page-title">My Proposals</h1>
          <p className="text-sm text-body-text mt-1 max-w-2xl">
            Review and manage every bid you have submitted to clients.
          </p>
        </div>
        <div className="hidden lg:block">
          <div className="rounded-2xl border border-line-app px-6 py-4 text-center">
            <div className="text-3xl font-semibold text-ink">
              {myProposals.length}
            </div>
            <div className="text-xs text-body-text/70 mt-1">Total Proposals</div>
          </div>
        </div>
      </div>

      {myProposals.length > 0 ? (
        <>
          {/* Filter / sort bar */}
          <div className="tk-card p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <MdCategory className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-ink">
                All Proposals ({myProposals.length})
              </span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="tk-input w-auto cursor-pointer"
            >
              <option value="newest">Sort by: Newest First</option>
              <option value="highest">Sort by: Highest Bid</option>
              <option value="lowest">Sort by: Lowest Bid</option>
            </select>
          </div>

          {/* Table */}
          <div className="tk-table-wrap">
            <div className="overflow-x-auto">
              <table className="tk-table">
                <thead className="tk-thead">
                  <tr>
                    <th className="tk-th text-left">Job Title</th>
                    <th className="tk-th text-left">Category</th>
                    <th className="tk-th text-left">Location</th>
                    <th className="tk-th text-left">Bid</th>
                    <th className="tk-th text-left">Type</th>
                    <th className="tk-th text-left">Status</th>
                    <th className="tk-th text-left">Submitted</th>
                    <th className="tk-th text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myProposals.map((proposal) => (
                    <tr key={proposal._id} className="tk-row">
                      <td className="tk-td">
                        <div className="font-semibold text-ink">
                          {proposal.job?.title || "N/A"}
                        </div>
                        <div className="text-sm text-body-text/70 line-clamp-1 mt-1 max-w-xs">
                          {proposal.comment}
                        </div>
                      </td>
                      <td className="tk-td">
                        <span className="tk-badge-info">
                          <MdCategory />
                          {proposal?.job?.category || "N/A"}
                        </span>
                      </td>
                      <td className="tk-td">
                        <div className="flex items-center gap-2 text-body-text">
                          <FiMapPin className="text-primary flex-shrink-0" />
                          <span className="text-sm">
                            {proposal.job?.location}
                          </span>
                        </div>
                      </td>
                      <td className="tk-td">
                        <div className="font-semibold text-ink">
                          £{proposal.accepted && proposal.finalPrice
                            ? proposal.finalPrice
                            : proposal?.bid || "N/A"}
                        </div>
                        {proposal.accepted && proposal.selectedPackage && (
                          <div className="text-[11px] text-body-text/70 mt-0.5">
                            {proposal.selectedPackage}
                          </div>
                        )}
                      </td>
                      <td className="tk-td">
                        {proposal.proposalType === "tiered" ? (
                          <button
                            onClick={() => setViewing(proposal)}
                            className="tk-badge-neutral hover:bg-primary-tint hover:text-primary transition-colors"
                            title="View packages"
                          >
                            <FiLayers /> {proposal.packages?.length || 0} Packages
                          </button>
                        ) : (
                          <span className="tk-badge-neutral">Flat Rate</span>
                        )}
                      </td>
                      <td className="tk-td">
                        <StatusBadge p={proposal} />
                      </td>
                      <td className="tk-td">
                        <div className="flex items-center gap-2 text-body-text">
                          <FiCalendar className="text-primary flex-shrink-0" />
                          <span className="text-sm whitespace-nowrap">
                            {proposal.createdAt
                              ? new Date(proposal.createdAt).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "—"}
                          </span>
                        </div>
                      </td>
                      <td className="tk-td">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/view-jobs/${proposal.jobId}`}
                            title="View job"
                            className="tk-icon-btn bg-primary-tint text-primary hover:bg-primary hover:text-white"
                          >
                            <FiEye size={14} />
                          </Link>
                          {!proposal.accepted && (
                            <button
                              onClick={() => openEdit(proposal)}
                              title="Edit proposal"
                              className="tk-icon-btn bg-app-bg text-ink hover:bg-primary hover:text-white"
                            >
                              <FiEdit2 size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleWithdraw(proposal._id)}
                            title="Withdraw"
                            className="tk-icon-btn bg-danger-bg text-danger-text hover:bg-danger-text hover:text-white"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <NoData
          title="No Proposals Yet"
          message="You haven't submitted any proposals yet. Browse open projects in your area and place your first bid."
          action={
            <Link to="/dashboard/browse-jobs" className="tk-btn-primary">
              Browse Projects
            </Link>
          }
        />
      )}

      {/* -------- Packages detail modal (tiered proposals) -------- */}
      {viewing && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4">
          <div className="tk-card w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-line-app flex justify-between items-center">
              <div>
                <h3 className="text-base font-semibold text-ink">
                  Package Proposal
                </h3>
                <p className="text-xs text-body-text/70 mt-0.5">
                  {viewing.job?.title}
                </p>
              </div>
              <button className="tk-icon-btn" onClick={() => setViewing(null)}>
                <FiX size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="tk-section-title">Tiered Packages</p>
              {(viewing.packages || []).map((pkg) => (
                <div
                  key={pkg.id}
                  className="rounded-xl border border-line-app p-4 flex items-start justify-between gap-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">{pkg.name}</p>
                    <p className="text-xs text-body-text mt-1">
                      {pkg.description}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary whitespace-nowrap">
                    £{pkg.price}
                  </span>
                </div>
              ))}
              {(viewing.addons || []).length > 0 && (
                <>
                  <p className="tk-section-title pt-2">Optional Add-ons</p>
                  {viewing.addons.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between rounded-xl bg-app-bg/70 px-4 py-2.5"
                    >
                      <span className="text-sm text-ink">{a.name}</span>
                      <span className="text-sm font-semibold text-primary">
                        £{a.price}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------- Edit modal (flat vs tiered, same structure as submit form) -------- */}
      {editing && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4">
          <form
            onSubmit={handleUpdate}
            className="tk-card w-full max-w-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="px-6 py-4 border-b border-line-app flex justify-between items-center sticky top-0 bg-surface z-10">
              <div>
                <h3 className="text-base font-semibold text-ink">
                  Edit Proposal
                </h3>
                <p className="text-xs text-body-text/70 mt-0.5">
                  {editing.job?.title}
                </p>
              </div>
              <button
                type="button"
                className="tk-icon-btn"
                onClick={() => setEditing(null)}
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Proposal type toggle */}
              <div className="flex bg-app-bg p-1 rounded-xl border border-line-app">
                <button
                  type="button"
                  onClick={() => setProposalType("flat")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    proposalType === "flat"
                      ? "bg-white text-primary shadow-sm"
                      : "text-body-text hover:text-ink"
                  }`}
                >
                  Flat Rate
                </button>
                <button
                  type="button"
                  onClick={() => setProposalType("tiered")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    proposalType === "tiered"
                      ? "bg-primary text-white shadow-sm"
                      : "text-body-text hover:text-ink"
                  }`}
                >
                  Interactive Packages
                </button>
              </div>

              {proposalType === "flat" ? (
                <div>
                  <label className="tk-label">
                    Your Bid Amount <span className="text-danger-text">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-body-text/60 font-semibold">
                      £
                    </span>
                    <input
                      type="number"
                      value={bid}
                      onChange={(e) => setBid(e.target.value)}
                      className="tk-input pl-8"
                      placeholder="0.00"
                      required={proposalType === "flat"}
                      min="1"
                      step="0.01"
                    />
                  </div>
                  {editing.job?.price > 0 && (
                    <p className="text-xs text-body-text/70 mt-2">
                      Client's budget: £{editing.job.price}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="tk-label mb-0">Tiered Packages</label>
                    <button
                      type="button"
                      onClick={() =>
                        setPackages((prev) => [...prev, emptyPackage()])
                      }
                      className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
                    >
                      <FiPlus /> Add Package
                    </button>
                  </div>
                  {packages.map((pkg, idx) => (
                    <div
                      key={pkg.id}
                      className="p-4 border border-line-app rounded-xl space-y-3 bg-app-bg/50"
                    >
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={pkg.name}
                          onChange={(e) =>
                            updatePackage(pkg.id, "name", e.target.value)
                          }
                          placeholder="Package Name (e.g., Standard)"
                          className="tk-input flex-1"
                          required
                        />
                        <div className="relative w-28 shrink-0">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body-text/60 font-semibold text-sm">
                            £
                          </span>
                          <input
                            type="number"
                            value={pkg.price}
                            onChange={(e) =>
                              updatePackage(pkg.id, "price", e.target.value)
                            }
                            placeholder="0.00"
                            className="tk-input pl-7"
                            required
                            min="1"
                          />
                        </div>
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setPackages((prev) =>
                                prev.filter((p) => p.id !== pkg.id)
                              )
                            }
                            className="tk-icon-btn text-danger-text shrink-0"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={pkg.description}
                        onChange={(e) =>
                          updatePackage(pkg.id, "description", e.target.value)
                        }
                        placeholder="Short description of what's included..."
                        className="tk-input"
                        required
                      />
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-2">
                    <label className="tk-label mb-0">Optional Add-ons</label>
                    <button
                      type="button"
                      onClick={() =>
                        setAddons((prev) => [
                          ...prev,
                          { id: Date.now(), name: "", price: "" },
                        ])
                      }
                      className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
                    >
                      <FiPlus /> Add Extra
                    </button>
                  </div>
                  {addons.map((addon) => (
                    <div key={addon.id} className="flex gap-3">
                      <input
                        type="text"
                        value={addon.name}
                        onChange={(e) =>
                          updateAddon(addon.id, "name", e.target.value)
                        }
                        placeholder="Add-on Name (e.g., Drone Footage)"
                        className="tk-input flex-1"
                        required
                      />
                      <div className="relative w-28 shrink-0">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body-text/60 font-semibold text-sm">
                          £
                        </span>
                        <input
                          type="number"
                          value={addon.price}
                          onChange={(e) =>
                            updateAddon(addon.id, "price", e.target.value)
                          }
                          placeholder="0.00"
                          className="tk-input pl-7"
                          required
                          min="1"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setAddons((prev) =>
                            prev.filter((a) => a.id !== addon.id)
                          )
                        }
                        className="tk-icon-btn text-danger-text shrink-0"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Cover letter */}
              <div>
                <label className="tk-label">
                  Cover Letter <span className="text-danger-text">*</span>
                </label>
                <textarea
                  rows="5"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Explain why you're the best fit for this project..."
                  className="tk-input h-auto py-3 resize-none"
                  required
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-line-app flex justify-end gap-3 sticky bottom-0 bg-surface">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="tk-btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" disabled={saving} className="tk-btn-primary">
                {saving ? "Updating..." : "Update Proposal"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Proposal;
