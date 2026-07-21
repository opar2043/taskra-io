import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaBookmark,
  FaRegBookmark,
  FaUserCircle,
  FaEnvelope,
  FaBriefcase,
  FaMapPin,
  FaCamera,
  FaShieldAlt,
  FaFileInvoice,
  FaHandshake,
  FaTruck,
  FaMoneyBillWave,
  FaComments,
  FaPlus,
  FaTrashAlt,
} from "react-icons/fa";

import useAxios from "../Hooks/useAxios";
import useLoginUser from "../Hooks/useLoginUser";
import useQuote from "../Hooks/useQuote";
import useClient from "../Hooks/useClient";
import Loading from "../Root/Loading";
import { confirmToast } from "../utils/toastConfirm";
import ProposalCard from "./ProposalCard";

const ViewJobs = () => {
  const { id } = useParams();
  const axiosSecure = useAxios();
  const { currentUser } = useLoginUser();
  const [job, setJob] = useState(null);
  const [quote, refetch] = useQuote();
  const [isSaved, setIsSaved] = useState(false);

  const [bid, setBid] = useState("");
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const isclient = useClient();
  const navigate = useNavigate();

  const [proposalType, setProposalType] = useState("flat");
  const [packages, setPackages] = useState([
    { id: 1, name: "Standard Package", price: "", description: "" },
  ]);
  const [addons, setAddons] = useState([]);

  const addPackage = () =>
    setPackages([...packages, { id: Date.now(), name: "", price: "", description: "" }]);
  const updatePackage = (pkgId, field, value) =>
    setPackages(packages.map((p) => (p.id === pkgId ? { ...p, [field]: value } : p)));
  const removePackage = (pkgId) => setPackages(packages.filter((p) => p.id !== pkgId));

  const addAddon = () => setAddons([...addons, { id: Date.now(), name: "", price: "" }]);
  const updateAddon = (aId, field, value) =>
    setAddons(addons.map((a) => (a.id === aId ? { ...a, [field]: value } : a)));
  const removeAddon = (aId) => setAddons(addons.filter((a) => a.id !== aId));

  useEffect(() => {
    axiosSecure.get(`/jobs/${id}`).then((res) => setJob(res.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!job) return <Loading />;

  const filteredQuotes = quote?.filter((q) => q.jobId === id) || [];

  const alreadyBid = filteredQuotes.some((q) => q.freelancer_id === currentUser?._id);

  // Accepted proposal (if any)
  const acceptedProposal = filteredQuotes.find((q) => q.accepted);

  // Workflow stages based on job status
  const workflowStages = [
    { label: "Project Posted", icon: FaBriefcase, status: "completed" },
    {
      label: "Proposals Received",
      icon: FaEnvelope,
      status: filteredQuotes.length > 0 ? "completed" : "pending",
    },
    {
      label: "Professional Accepted",
      icon: FaHandshake,
      status: acceptedProposal ? "completed" : "pending",
    },
    {
      label: "In Progress",
      icon: FaCamera,
      status: job.status === "in-progress" ? "active" : "pending",
    },
    {
      label: "Delivered",
      icon: FaTruck,
      status: job.status === "delivered" ? "completed" : "pending",
    },
    {
      label: "Payment & Review",
      icon: FaMoneyBillWave,
      status: job.status === "completed" ? "completed" : "pending",
    },
  ];

  /* SUBMIT / UPDATE proposal */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (alreadyBid && !editingId) return toast.error("You already submitted a proposal");

    const payload = {
      jobId: id,
      client_id: job.client_id,
      bid: proposalType === "flat" ? bid : packages[0]?.price || 0,
      proposalType,
      packages: proposalType === "tiered" ? packages : [],
      addons: proposalType === "tiered" ? addons : [],
      comment,
      freelancer_id: currentUser._id,
      freelancer_name: currentUser.name,
      freelancer_photo: currentUser.photo,
      freelancer_location: currentUser.location,
      freelancer_email: currentUser.email,
      freelancer_role: currentUser.role,
      createdAt: new Date(),
      job,
    };

    try {
      if (editingId) {
        await axiosSecure.patch(`/quote/${editingId}`, payload);
        toast.success("Proposal updated successfully");
      } else {
        await axiosSecure.post("/quote", payload);
        toast.success("Proposal submitted successfully");
      }

      setBid("");
      setComment("");
      setEditingId(null);
      setProposalType("flat");
      setPackages([{ id: Date.now(), name: "Standard Package", price: "", description: "" }]);
      setAddons([]);
      refetch();
    } catch {
      toast.error("Something went wrong");
    }
  };

  /* EDIT */
  const handleEdit = (p) => {
    setBid(p.bid || "");
    setComment(p.comment || "");
    setEditingId(p._id);
    setProposalType(p.proposalType || "flat");
    if (p.packages?.length) setPackages(p.packages);
    if (p.addons?.length) setAddons(p.addons);
    toast("Editing mode enabled", { icon: "✏️" });
  };

  /* DELETE */
  const handleDelete = async (qid) => {
    if (
      await confirmToast({
        title: "Delete Proposal?",
        message: "This action cannot be undone",
        confirmText: "Yes, delete it",
        danger: true,
      })
    ) {
      await axiosSecure.delete(`/quote/${qid}`);
      toast.success("Proposal deleted");
      refetch();
    }
  };

  /* ACCEPT */
  const handleAccept = async (p, finalPrice = null, pkgName = null, selectedAddons = null) => {
    const priceToAccept = finalPrice || p.bid;
    if (
      await confirmToast({
        title: "Accept this Professional?",
        message: `You're about to accept ${p.freelancer_name} for £${priceToAccept}${pkgName ? ` (${pkgName})` : ""}`,
        confirmText: "Yes, accept",
        danger: true,
      })
    ) {
      await axiosSecure.patch(`/quote/${p._id}`, {
        accepted: true,
        finalPrice: priceToAccept,
        selectedPackage: pkgName || "Standard",
        selectedAddons: selectedAddons || [],
      });
      await axiosSecure.patch(`/jobs/${id}`, { status: "in-progress" });

      toast.success("Professional accepted. You can now proceed with the project.");
      refetch();
    }
  };

  // Relative time helper
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
    ];
    for (let i of intervals) {
      const count = Math.floor(seconds / i.seconds);
      if (count > 0) return `${count}${i.label[0]} ago`;
    }
    return "just now";
  };

  const handleSave = async (data) => {
    try {
      const payload = {
        ...data,
        userEmail: currentUser.email,
      };

      const res = await axiosSecure.post("/save-jobs", payload);

      if (res.data.insertedId || res.data.success) {
        setIsSaved(true);
        toast.success("Job saved successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to save job");
    }
  };

  const handleMessage = async (freelancerId) => {
    if (!currentUser?._id) return;

    try {
      const res = await axiosSecure.post("/conversations", {
        senderId: currentUser._id,
        receiverId: freelancerId,
      });
      navigate(`/chat/${res.data._id}`);
    } catch (error) {
      console.error(error);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-body-text/50 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition";

  return (
    <div className="min-h-screen bg-cream py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Workflow progress tracker */}
        <div className="bg-white border border-line rounded-2xl shadow-soft p-6 mb-6 overflow-x-auto">
          <h3 className="font-display text-lg font-semibold text-ink mb-6">Project Workflow</h3>
          <div className="flex items-center justify-between relative min-w-[560px]">
            {/* Progress line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-line rounded-full -z-0">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{
                  width: `${(workflowStages.filter((s) => s.status === "completed").length / workflowStages.length) * 100}%`,
                }}
              />
            </div>

            {workflowStages.map((stage, index) => (
              <div key={index} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-all ${
                    stage.status === "completed"
                      ? "bg-primary text-white shadow-md"
                      : stage.status === "active"
                        ? "bg-primary text-white shadow-md animate-pulse"
                        : "bg-cream border border-line text-body-text/60"
                  }`}
                >
                  <stage.icon className="text-sm" />
                </div>
                <p
                  className={`text-xs text-center max-w-[100px] ${
                    stage.status === "completed" || stage.status === "active"
                      ? "text-ink font-semibold"
                      : "text-body-text/60"
                  }`}
                >
                  {stage.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT - Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* JOB DETAILS CARD */}
            <div className="bg-white border border-line rounded-2xl shadow-soft overflow-hidden">
              {/* Header with client info */}
              <div className="bg-cream border-b border-line p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Link to={`/view-freelencer/${job.client_id}`}>
                      <img
                        src={job.photo || "https://placehold.co/150"}
                        alt={job.name}
                        className="w-16 h-16 rounded-xl object-cover border border-line shadow-sm"
                      />
                    </Link>
                    <div className="text-ink">
                      <h3 className="font-display font-semibold text-lg">{job.name}</h3>
                      <p className="text-sm text-body-text flex items-center gap-2 mt-1">
                        <FaMapMarkerAlt className="text-xs text-primary" />
                        {job.client_location}, {job.postCode}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-xs bg-white border border-line text-body-text px-3 py-1 rounded-full font-medium">
                          Client
                        </span>
                        {job.clientVerified && (
                          <span
                            className="text-xs bg-success-bg text-success-text px-3 py-1 rounded-full font-semibold inline-flex items-center gap-1"
                            title={
                              job.clientVerifiedReason === "payment"
                                ? "Verified client — completed a payment"
                                : "Verified client — confirmed contact details"
                            }
                          >
                            <FaCheckCircle className="text-xs" /> Verified
                          </span>
                        )}
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-semibold ${
                            job.status === "closed" || job.status === "completed"
                              ? "bg-danger-bg text-danger-text"
                              : job.status === "in-progress"
                                ? "bg-primary-tint text-primary"
                                : "bg-success-bg text-success-text"
                          }`}
                        >
                          {job.status === "in-progress"
                            ? "In Progress"
                            : job.status === "completed"
                              ? "Completed"
                              : job.status === "closed"
                                ? "Closed"
                                : "Open"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSave(job)}
                    className="btn-pill !py-2.5 !px-5 text-sm self-start"
                  >
                    {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                    {isSaved ? "Saved" : "Save Job"}
                  </button>
                </div>
              </div>

              {/* Job content */}
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-5">
                  <h2 className="font-display text-2xl font-semibold text-ink">{job.title}</h2>
                  <span className="text-xs text-body-text bg-cream border border-line px-3 py-1 rounded-full whitespace-nowrap">
                    {timeAgo(job.createdAt)}
                  </span>
                </div>

                {/* Key details grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="border border-line p-4 rounded-2xl hover:border-primary transition">
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <FaMapPin className="text-sm" />
                      <span className="text-xs font-bold uppercase tracking-wide">Location</span>
                    </div>
                    <p className="text-sm font-semibold text-ink">{job.location}</p>
                  </div>

                  <div className="border border-line p-4 rounded-2xl hover:border-primary transition">
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <FaMoneyBillWave className="text-sm" />
                      <span className="text-xs font-bold uppercase tracking-wide">Pay</span>
                    </div>
                    <p className="text-sm font-semibold text-ink">
                      {job.price == 0 ? "To be discussed" : `£${job.price}`}
                    </p>
                  </div>

                  <div className="border border-line p-4 rounded-2xl hover:border-primary transition">
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <FaCalendarAlt className="text-sm" />
                      <span className="text-xs font-bold uppercase tracking-wide">Event Date</span>
                    </div>
                    <p className="text-sm font-semibold text-ink">{job.eventDate}</p>
                  </div>

                  <div className="border border-line p-4 rounded-2xl hover:border-primary transition">
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <FaBriefcase className="text-sm" />
                      <span className="text-xs font-bold uppercase tracking-wide">Category</span>
                    </div>
                    <p className="text-sm font-semibold text-ink">{job.category}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="border-t border-line pt-6">
                  <h3 className="font-display text-lg font-semibold text-ink mb-3 flex items-center gap-2">
                    <FaFileInvoice className="text-primary" />
                    Project Description
                  </h3>
                  <p className="text-body-text leading-relaxed whitespace-pre-line">
                    {job.description}
                  </p>
                </div>

                {/* Additional info */}
                <div className="mt-6 pt-6 border-t border-line">
                  <h3 className="font-display text-lg font-semibold text-ink mb-4">
                    Additional Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-cream rounded-xl">
                      <div className="icon-chip !w-10 !h-10">
                        <FaClock className="text-sm" />
                      </div>
                      <div>
                        <p className="text-xs text-body-text/70 font-medium">Posted on</p>
                        <p className="font-semibold text-ink text-sm">
                          {new Date(job.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-cream rounded-xl">
                      <div className="icon-chip !w-10 !h-10">
                        <FaComments className="text-sm" />
                      </div>
                      <div>
                        <p className="text-xs text-body-text/70 font-medium">Proposals</p>
                        <p className="font-semibold text-ink text-sm">
                          {filteredQuotes.length} submitted
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PROPOSALS SECTION */}
            <div className="bg-white border border-line rounded-2xl shadow-soft overflow-hidden">
              <div className="bg-cream px-6 py-4 border-b border-line">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-semibold text-ink flex items-center gap-2">
                    <FaEnvelope className="text-primary" />
                    Proposals ({filteredQuotes.length})
                  </h3>
                  {acceptedProposal && (
                    <span className="text-sm text-success-text font-semibold flex items-center gap-2 bg-success-bg px-3 py-1 rounded-full">
                      <FaCheckCircle />
                      Professional Accepted
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                {filteredQuotes.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-primary-tint text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FaEnvelope className="text-2xl" />
                    </div>
                    <h4 className="text-lg font-semibold text-ink mb-2">No proposals yet</h4>
                    <p className="text-sm text-body-text">
                      Be the first to submit a proposal for this project
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {filteredQuotes.map((p) => (
                    <ProposalCard
                      key={p._id}
                      p={p}
                      job={job}
                      currentUser={currentUser}
                      isClient={isclient}
                      handleMessage={handleMessage}
                      handleEdit={handleEdit}
                      handleDelete={handleDelete}
                      handleAccept={handleAccept}
                      timeAgo={timeAgo}
                      acceptedProposal={acceptedProposal}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR - proposal form (hidden, matching the original flow) */}
          <div className="lg:col-span-1 hidden">
            <div className="bg-white border border-line rounded-2xl shadow-soft sticky top-24 overflow-hidden">
              {/* Header */}
              <div className="bg-primary p-6 text-white">
                <h3 className="font-display text-xl font-semibold mb-2">
                  {editingId ? "Edit Your Proposal" : "Submit a Proposal"}
                </h3>
                <p className="text-sm opacity-90">
                  {editingId
                    ? "Update your bid and message"
                    : alreadyBid
                      ? "You've already submitted a proposal"
                      : "Place your best bid to win this job"}
                </p>
              </div>

              {/* Form */}
              {!currentUser ? (
                <div className="p-6 text-center space-y-4">
                  <div className="w-20 h-20 bg-primary-tint text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaUserCircle size={40} />
                  </div>
                  <h4 className="text-lg font-semibold text-ink">Sign up or Log in</h4>
                  <p className="text-sm text-body-text">
                    You must sign up or log in to submit a proposal for this project.
                  </p>
                  <Link to="/register" className="btn-pill w-full">
                    Sign Up Now
                  </Link>
                  <p className="text-xs text-body-text mt-2">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary font-bold hover:underline">
                      Log in
                    </Link>
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* Proposal type toggle */}
                  <div className="flex bg-cream p-1 rounded-full border border-line">
                    <button
                      type="button"
                      onClick={() => setProposalType("flat")}
                      className={`flex-1 py-2 text-sm font-bold transition-all rounded-full ${
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
                      className={`flex-1 py-2 text-sm font-bold transition-all rounded-full ${
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
                      <label className="block text-sm font-bold text-ink mb-2">
                        Your Bid Amount <span className="text-danger-text">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-body-text font-bold">
                          £
                        </span>
                        <input
                          type="number"
                          value={bid}
                          onChange={(e) => setBid(e.target.value)}
                          placeholder="0.00"
                          className={`${inputClass} !pl-8`}
                          required={proposalType === "flat"}
                          min="1"
                          step="0.01"
                          disabled={alreadyBid && !editingId}
                        />
                      </div>
                      <p className="text-xs text-body-text mt-2 font-medium">
                        Client&apos;s budget: £{job.price}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-bold text-ink">Tiered Packages</label>
                        <button
                          type="button"
                          onClick={addPackage}
                          className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"
                        >
                          <FaPlus /> Add Package
                        </button>
                      </div>
                      {packages.map((pkg, idx) => (
                        <div
                          key={pkg.id}
                          className="p-4 border border-line rounded-2xl space-y-3 bg-cream"
                        >
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={pkg.name}
                              onChange={(e) => updatePackage(pkg.id, "name", e.target.value)}
                              placeholder="Package Name (e.g., Standard)"
                              className={`${inputClass} flex-1`}
                              required
                            />
                            <div className="relative w-28">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body-text font-bold text-sm">
                                £
                              </span>
                              <input
                                type="number"
                                value={pkg.price}
                                onChange={(e) => updatePackage(pkg.id, "price", e.target.value)}
                                placeholder="0.00"
                                className={`${inputClass} !pl-6 !pr-2`}
                                required
                                min="1"
                              />
                            </div>
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => removePackage(pkg.id)}
                                className="text-danger-text hover:opacity-70 p-2"
                              >
                                <FaTrashAlt />
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            value={pkg.description}
                            onChange={(e) => updatePackage(pkg.id, "description", e.target.value)}
                            placeholder="Short description of what's included..."
                            className={inputClass}
                            required
                          />
                        </div>
                      ))}

                      <div className="flex items-center justify-between pt-2">
                        <label className="block text-sm font-bold text-ink">Optional Add-ons</label>
                        <button
                          type="button"
                          onClick={addAddon}
                          className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"
                        >
                          <FaPlus /> Add Extra
                        </button>
                      </div>
                      {addons.map((addon) => (
                        <div key={addon.id} className="flex gap-3">
                          <input
                            type="text"
                            value={addon.name}
                            onChange={(e) => updateAddon(addon.id, "name", e.target.value)}
                            placeholder="Add-on Name (e.g., Drone Footage)"
                            className={`${inputClass} flex-1`}
                            required
                          />
                          <div className="relative w-28">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body-text font-bold text-sm">
                              £
                            </span>
                            <input
                              type="number"
                              value={addon.price}
                              onChange={(e) => updateAddon(addon.id, "price", e.target.value)}
                              placeholder="0.00"
                              className={`${inputClass} !pl-6 !pr-2`}
                              required
                              min="1"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAddon(addon.id)}
                            className="text-danger-text hover:opacity-70 p-2"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Cover letter */}
                  <div>
                    <label className="block text-sm font-bold text-ink mb-2">
                      Cover Letter <span className="text-danger-text">*</span>
                    </label>
                    <textarea
                      rows="5"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Explain why you're the best fit for this project..."
                      className={`${inputClass} resize-none`}
                      required
                      disabled={alreadyBid && !editingId}
                    />
                    <p className="text-xs text-body-text mt-2 font-medium">
                      {comment.length}/500 characters
                    </p>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="btn-pill w-full"
                    disabled={alreadyBid && !editingId}
                  >
                    {editingId ? "Update Proposal" : alreadyBid ? "Already Submitted" : "Send Proposal"}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setBid("");
                        setComment("");
                      }}
                      className="btn-pill-outline w-full"
                    >
                      Cancel Editing
                    </button>
                  )}
                </form>
              )}

              {/* Tips */}
              <div className="bg-cream p-6 border-t border-line">
                <h4 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
                  <FaShieldAlt className="text-primary" />
                  Tips for Success
                </h4>
                <ul className="space-y-2 text-xs text-body-text">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5 font-bold">•</span>
                    <span className="font-medium">Be competitive but realistic with your pricing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5 font-bold">•</span>
                    <span className="font-medium">Highlight your relevant experience and skills</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5 font-bold">•</span>
                    <span className="font-medium">Respond promptly if the client has questions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5 font-bold">•</span>
                    <span className="font-medium">Keep your profile and portfolio updated</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewJobs;
