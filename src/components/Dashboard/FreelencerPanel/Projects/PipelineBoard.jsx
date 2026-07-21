import React, { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiUser,
  FiClock,
  FiCheckCircle,
  FiArrowRight,
  FiFileText,
  FiCalendar,
  FiPlus,
  FiX,
  FiDollarSign,
} from "react-icons/fi";
import { FaGripVertical, FaFileInvoiceDollar, FaFileContract } from "react-icons/fa";
import useInboxQuote from "../../../Hooks/useInboxQuote";
import useLoginUser from "../../../Hooks/useLoginUser";
import useAxios from "../../../Hooks/useAxios";
import TutorialModal from "../../../DashboardTutorial/TutorialModal";

/* Pipeline stages — status values and titles match the original CRM board.
   "confirm" (paid) cards are grouped into the "complete" column. */
const COLUMNS = [
  { id: "pending", title: "Contract Sent", badge: "tk-badge-warning" },
  { id: "accepted", title: "Signed & Ready", badge: "tk-badge-success" },
  { id: "inprogress", title: "In Production", badge: "tk-badge-info" },
  { id: "complete", title: "Billing & Done", badge: "tk-badge-neutral" },
];

const statusLabel = (status) =>
  ({
    pending: "Awaiting Sign",
    accepted: "Ready",
    inprogress: "In Prod",
    complete: "Billing",
    confirm: "Paid",
  }[status] || status);

const statusBadge = (status) =>
  ({
    pending: "tk-badge-warning",
    accepted: "tk-badge-success",
    inprogress: "tk-badge-info",
    complete: "tk-badge-neutral",
    confirm: "tk-badge-success",
  }[status] || "tk-badge-neutral");

/* ------------------------------ Card ------------------------------ */

const SortableCard = ({ project, columnId, onOpen }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: project._id,
    data: { type: "Project", project, columnId },
  });

  const style = { transition, transform: CSS.Translate.toString(transform) };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white/60 border-2 border-dashed border-primary/30 rounded-xl p-3 h-[128px] opacity-60"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-surface p-3 rounded-xl border border-line-app shadow-sm hover:shadow-md hover:border-primary/30 transition-all group relative"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-app-bg rounded text-body-text/30 hover:text-body-text/70 transition-colors shrink-0"
          >
            <FaGripVertical size={10} />
          </div>
          <div className="w-6 h-6 rounded-full bg-primary-tint flex items-center justify-center text-primary shrink-0">
            <FiUser size={11} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-ink truncate max-w-[120px]">
              {project.clientName}
            </p>
            <p className="text-[10px] text-body-text/60 font-semibold">
              #{project._id.slice(-6).toUpperCase()}
            </p>
          </div>
        </div>
        <span className={statusBadge(project.status)}>
          {statusLabel(project.status)}
        </span>
      </div>

      <button
        onClick={() => onOpen(project)}
        className="w-full text-left space-y-1 mb-2"
      >
        <p className="text-xs text-body-text line-clamp-1">
          {project.requirement || project.projectName || "Project"}
        </p>
        <div className="flex items-center gap-2 text-[10px] text-body-text/60 font-semibold uppercase">
          <FiCalendar size={9} />
          {project.timeline
            ? new Date(project.timeline).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })
            : "TBA"}
        </div>
        <div className="text-[15px] font-semibold text-primary">
          £{Number(project.price || 0).toLocaleString()}
        </div>
      </button>

      <div className="border-t border-line-app pt-2 flex items-center justify-between">
        {columnId === "complete" ? (
          <Link
            to="/dashboard/invoice"
            className="text-[11px] font-semibold text-primary uppercase tracking-wide flex items-center gap-1 hover:underline"
          >
            Invoice <FiArrowRight size={10} />
          </Link>
        ) : (
          <button
            onClick={() => onOpen(project)}
            className="text-[11px] font-semibold text-body-text/60 uppercase tracking-wide hover:text-primary transition-colors"
          >
            Details
          </button>
        )}
      </div>
    </div>
  );
};

/* ------------------------------ Column ------------------------------ */

const KanbanColumn = ({ column, projects, id, onOpen }) => {
  const { setNodeRef } = useSortable({ id, data: { type: "Column", column } });

  return (
    <div className="flex flex-col min-w-[240px]">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-surface rounded-xl border border-line-app shadow-sm text-primary">
            {column.id === "complete" ? (
              <FaFileInvoiceDollar size={12} />
            ) : column.id === "pending" ? (
              <FiClock size={13} />
            ) : column.id === "accepted" ? (
              <FiCheckCircle size={13} />
            ) : (
              <FiFileText size={13} />
            )}
          </span>
          <h3 className="text-xs font-semibold text-ink uppercase tracking-wide">
            {column.title}
          </h3>
        </div>
        <span className="text-[10px] font-semibold text-body-text bg-app-bg px-2 py-0.5 rounded-full">
          {projects.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 min-h-[520px] bg-app-bg/70 border border-line-app rounded-2xl p-3 transition-all dot-grid"
      >
        <div className="space-y-2.5">
          <SortableContext
            items={projects.map((p) => p._id)}
            strategy={verticalListSortingStrategy}
          >
            {projects.map((project) => (
              <SortableCard
                key={project._id}
                project={project}
                columnId={column.id}
                onOpen={onOpen}
              />
            ))}
          </SortableContext>

          {projects.length === 0 && (
            <div className="py-16 flex flex-col items-center text-body-text/30 pointer-events-none">
              <FaFileContract size={22} />
              <p className="text-[9px] font-semibold uppercase tracking-widest mt-2">
                Empty Stage
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------ Board ------------------------------ */

const PipelineBoard = () => {
  const [inboxquote, refetch] = useInboxQuote() || [];
  const { currentUser } = useLoginUser() || {};
  const axiosSecure = useAxios();

  const [activeProject, setActiveProject] = useState(null);
  const [detail, setDetail] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [lead, setLead] = useState({
    clientName: "",
    clientEmail: "",
    requirement: "",
    price: "",
    timeline: "",
  });

  const projects = useMemo(() => {
    if (!Array.isArray(inboxquote)) return [];
    return inboxquote.filter((p) => p.freelancerId === currentUser?._id);
  }, [inboxquote, currentUser]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event) => {
    setActiveProject(projects.find((p) => p._id === event.active.id));
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveProject(null);
    if (!over) return;

    const isColumn = COLUMNS.find((c) => c.id === over.id);
    const targetStatus = isColumn
      ? over.id
      : projects.find((p) => p._id === over.id)?.status;

    const project = projects.find((p) => p._id === active.id);
    if (!project || !targetStatus || project.status === targetStatus) return;

    // A contract must be signed before it can leave the "Contract Sent" stage
    if (
      project.status === "pending" &&
      targetStatus !== "pending" &&
      !project.signature
    ) {
      toast.error("Client must sign the contract before moving to production.");
      return;
    }

    try {
      await axiosSecure.patch(`/inbox-quote/${active.id}`, {
        status: targetStatus,
      });
      // Status changes to accepted / inprogress / complete / confirm
      // trigger an automatic email to the client from the backend.
      if (["accepted", "inprogress", "complete", "confirm"].includes(targetStatus)) {
        toast.success(
          `Moved to "${COLUMNS.find((c) => c.id === targetStatus)?.title || targetStatus}" — the client has been emailed automatically.`
        );
      } else {
        toast.success("Pipeline updated.");
      }
      refetch();
    } catch {
      toast.error("Update failed");
    }
  };

  /* Add lead — POST /inbox-quote returns the full saved document */
  const handleAddLead = async (e) => {
    e.preventDefault();
    if (!currentUser?._id) return toast.error("Please log in first");
    setAdding(true);
    try {
      const res = await axiosSecure.post("/inbox-quote", {
        freelancerId: currentUser._id,
        clientEmail: lead.clientEmail,
        clientName: lead.clientName,
        clientPhoto: "",
        requirement: lead.requirement,
        price: Number(lead.price),
        timeline: lead.timeline,
        status: "pending",
        createdAt: new Date(),
      });
      if (res.data?._id || res.data?.insertedId) {
        toast.success("Lead added to your pipeline!");
        setShowAdd(false);
        setLead({
          clientName: "",
          clientEmail: "",
          requirement: "",
          price: "",
          timeline: "",
        });
        refetch();
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to add lead"
      );
    } finally {
      setAdding(false);
    }
  };

  const pipelineValue = projects.reduce(
    (acc, curr) => acc + (Number(curr.price) || 0),
    0
  );

  return (
    <div className="tk-page">
      <TutorialModal
        componentName="PipelineBoard"
        title="Welcome to Your Lead Pipeline"
        description="Keep every opportunity organised in one simple workflow."
        listItems={[
          "Move leads through each stage.",
          "See the value of your upcoming work.",
          "Never lose track of a potential booking",
        ]}
      />

      {/* Header */}
      <div className="tk-card p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="tk-eyebrow mb-1">Strategic CRM</p>
          <h1 className="tk-page-title">Lead Pipeline</h1>
          <p className="text-xs text-body-text/70 mt-1">
            Visualising {projects.length} active engagements
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-line-app px-5 py-3 flex items-center gap-4">
            <div className="text-right">
              <p className="text-[11px] font-semibold text-body-text/60 uppercase tracking-wide mb-0.5">
                Pipeline Value
              </p>
              <p className="text-lg font-semibold text-ink">
                £{pipelineValue.toLocaleString()}
              </p>
            </div>
            <div className="w-px h-6 bg-line-app" />
            <FaFileContract className="text-xl text-primary/30" />
          </div>
          <button onClick={() => setShowAdd(true)} className="tk-btn-primary">
            <FiPlus /> Add Lead
          </button>
        </div>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 pb-6">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              column={column}
              onOpen={setDetail}
              projects={projects.filter(
                (p) =>
                  p.status === column.id ||
                  (column.id === "complete" && p.status === "confirm")
              )}
            />
          ))}
        </div>

        <DragOverlay>
          {activeProject ? (
            <div className="bg-surface p-3 rounded-xl border-2 border-primary shadow-2xl scale-105 opacity-95 cursor-grabbing w-[240px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                  <FiUser size={11} />
                </div>
                <p className="text-xs font-semibold text-ink truncate">
                  {activeProject.clientName}
                </p>
              </div>
              <div className="text-sm font-semibold text-primary">
                £{Number(activeProject.price || 0).toLocaleString()}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* -------- Card detail modal -------- */}
      {detail && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4">
          <div className="tk-card w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-line-app flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-tint flex items-center justify-center text-primary">
                  <FiUser size={15} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-ink">
                    {detail.clientName}
                  </h3>
                  <p className="text-[11px] text-body-text/60 font-mono">
                    REF: {detail._id.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
              <button className="tk-icon-btn" onClick={() => setDetail(null)}>
                <FiX size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className={statusBadge(detail.status)}>
                  {statusLabel(detail.status)}
                </span>
                <span className="text-2xl font-semibold text-ink">
                  £{Number(detail.price || 0).toLocaleString()}
                </span>
              </div>

              <div className="rounded-xl bg-app-bg/70 border border-line-app p-4">
                <p className="tk-section-title mb-2">Scope of Work</p>
                <p className="text-sm text-ink leading-relaxed">
                  {detail.requirement || "No requirement recorded."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-line-app p-4">
                  <p className="tk-section-title mb-1">Project Date</p>
                  <p className="text-sm font-semibold text-ink flex items-center gap-2">
                    <FiCalendar className="text-primary" />
                    {detail.timeline
                      ? new Date(detail.timeline).toLocaleDateString()
                      : "TBA"}
                  </p>
                </div>
                <div className="rounded-xl border border-line-app p-4">
                  <p className="tk-section-title mb-1">Signature</p>
                  {detail.signature ? (
                    <img
                      src={detail.signature}
                      alt="Client signature"
                      className="max-h-10 object-contain"
                    />
                  ) : (
                    <p className="text-sm text-body-text/70">Not signed yet</p>
                  )}
                </div>
              </div>

              {(detail.status === "complete" || detail.status === "confirm") && (
                <Link to="/dashboard/invoice" className="tk-btn-primary w-full">
                  <FaFileInvoiceDollar /> View Invoice
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------- Add lead modal -------- */}
      {showAdd && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4">
          <form
            onSubmit={handleAddLead}
            className="tk-card w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="px-6 py-4 border-b border-line-app flex justify-between items-center">
              <h3 className="text-base font-semibold text-ink">
                Add Lead to Pipeline
              </h3>
              <button
                type="button"
                className="tk-icon-btn"
                onClick={() => setShowAdd(false)}
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="tk-label">Client Name</label>
                <input
                  type="text"
                  className="tk-input"
                  required
                  value={lead.clientName}
                  onChange={(e) =>
                    setLead((p) => ({ ...p, clientName: e.target.value }))
                  }
                  placeholder="e.g. Sarah Thompson"
                />
              </div>
              <div>
                <label className="tk-label">Client Email</label>
                <input
                  type="email"
                  className="tk-input"
                  required
                  value={lead.clientEmail}
                  onChange={(e) =>
                    setLead((p) => ({ ...p, clientEmail: e.target.value }))
                  }
                  placeholder="client@email.com"
                />
              </div>
              <div>
                <label className="tk-label">Project / Requirement</label>
                <textarea
                  rows="3"
                  className="tk-input h-auto py-3 resize-none"
                  required
                  value={lead.requirement}
                  onChange={(e) =>
                    setLead((p) => ({ ...p, requirement: e.target.value }))
                  }
                  placeholder="Describe the project scope..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="tk-label">Value</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-body-text/60 font-semibold flex items-center">
                      £
                    </span>
                    <input
                      type="number"
                      min="1"
                      className="tk-input pl-8"
                      required
                      value={lead.price}
                      onChange={(e) =>
                        setLead((p) => ({ ...p, price: e.target.value }))
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="tk-label">Project Date</label>
                  <input
                    type="date"
                    className="tk-input"
                    required
                    value={lead.timeline}
                    onChange={(e) =>
                      setLead((p) => ({ ...p, timeline: e.target.value }))
                    }
                  />
                </div>
              </div>
              <p className="text-xs text-body-text/70 flex items-start gap-2">
                <FiDollarSign className="text-primary mt-0.5 shrink-0" />
                New leads start in the "Contract Sent" stage. Moving a card to
                Signed, Production or Billing automatically emails the client.
              </p>
            </div>

            <div className="px-6 py-4 border-t border-line-app flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="tk-btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" disabled={adding} className="tk-btn-primary">
                {adding ? "Adding..." : "Add Lead"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PipelineBoard;
