import React, { useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
// html2canvas-pro supports modern CSS color functions (oklch/lab/lch) that
// DaisyUI's theme uses. The original "html2canvas" throws on oklch().
import html2canvas from "html2canvas-pro";
import SignatureCanvas from "react-signature-canvas";
import {
  FaFileContract,
  FaSignature,
  FaShieldAlt,
  FaGavel,
  FaDownload,
} from "react-icons/fa";
import {
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiUser,
  FiArrowRight,
  FiX,
  FiPlus,
  FiSend,
  FiTrash2,
} from "react-icons/fi";
import useInboxQuote from "../../../Hooks/useInboxQuote";
import useLoginUser from "../../../Hooks/useLoginUser";
import useAxios from "../../../Hooks/useAxios";
import Loading from "../../../Root/Loading";
import TutorialModal from "../../../DashboardTutorial/TutorialModal";

const TASKRA_LOGO = "https://i.ibb.co/G4k8xvLB/taskra-logo.png";

const DEFAULT_TERMS =
  "1. PAYMENT: A non-refundable deposit is required to secure the date. 2. CANCELLATION: Cancellations within 48 hours will incur a fee. 3. USAGE: The freelancer retains copyright unless otherwise agreed.";

const Agreements = () => {
  const navigate = useNavigate();
  const [inboxquote, refetch, isLoading] = useInboxQuote();
  const { currentUser } = useLoginUser() || {};
  const axiosSecure = useAxios();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [showSignPad, setShowSignPad] = useState(false);
  const contractRef = useRef(null);
  const sigPad = useRef(null);

  const agreements = useMemo(() => {
    if (!Array.isArray(inboxquote)) return [];
    const isAdmin = currentUser?.role === "admin";
    if (isAdmin) return inboxquote;
    const isFreelancer = currentUser?.role === "professional";
    const myId = String(currentUser?._id || "");
    const myEmail = (currentUser?.email || "").toLowerCase();
    return inboxquote.filter((p) => {
      if (isFreelancer) {
        if (myId && String(p.freelancerId) === myId) return true;
        if (myEmail && String(p.freelancerEmail || "").toLowerCase() === myEmail) return true;
        return false;
      }
      if (myId && String(p.clientId) === myId) return true;
      if (myEmail && String(p.clientEmail || "").toLowerCase() === myEmail) return true;
      return false;
    });
  }, [inboxquote, currentUser]);

  const filtered = useMemo(() => {
    return agreements.filter(
      (a) =>
        a.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a._id?.includes(searchTerm)
    );
  }, [agreements, searchTerm]);

  const isExecuted = (a) => a.status === "accepted" || a.status === "confirm";

  /* -------- Send to client (POST /api/emails/send, {{token}} template) -------- */
  const handleSendToClient = async (agreement) => {
    const targetEmail = agreement.clientEmail;
    if (!targetEmail) {
      return toast.error(
        "No client email on record for this agreement. Share it via chat instead."
      );
    }
    setIsSending(true);
    try {
      await axiosSecure.post("/api/emails/send", {
        clientEmail: targetEmail,
        clientName: agreement.clientName || "Valued Client",
        subjectTemplate: "Contract for {{project_name}}",
        bodyTemplate:
          "Hi {{client_name}},\n\nWe are almost there! To finalize your booking for {{project_name}}, please review and sign the attached service agreement (value £" +
          (agreement.price || 0) +
          ").\n\nOnce signed, your date will be officially reserved. Let me know if you have any questions about the agreement.\n\nBest,\n{{my_name}}\n{{studio_name}}",
        freelancerEmail: currentUser?.email,
        freelancerName: currentUser?.name || "Taskra Professional",
        studioName: currentUser?.studioName || "Taskra Studio",
        projectName: agreement.requirement?.slice(0, 60) || "your project",
      });
      toast.success(`Agreement sent to ${agreement.clientName || targetEmail}!`);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to send agreement"
      );
    } finally {
      setIsSending(false);
    }
  };

  /* -------- Sign & execute (react-signature-canvas) -------- */
  const handleSignAndExecute = async () => {
    if (sigPad.current?.isEmpty()) {
      return toast("Please draw a signature to execute the agreement.", {
        icon: "⚠️",
      });
    }
    try {
      setIsSigning(true);
      const signatureImage = sigPad.current.getCanvas().toDataURL("image/png");
      await axiosSecure.patch(`/inbox-quote/${selectedAgreement._id}`, {
        status: "accepted",
        signature: signatureImage,
        signedAt: new Date().toISOString(),
        clientAgreed: true,
      });
      // status → accepted auto-emails the client from the backend
      toast.success(
        "Agreement executed — the client has been notified by email."
      );
      setShowSignPad(false);
      setSelectedAgreement(null);
      refetch();
    } catch {
      toast.error("Could not finalize the agreement. Please try again.");
    } finally {
      setIsSigning(false);
    }
  };

  /* -------- PDF export (jsPDF + html2canvas-pro) -------- */
  const handleDownloadPDF = async () => {
    if (!contractRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(contractRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(
        `Taskra_Contract_${selectedAgreement._id.slice(-8).toUpperCase()}.pdf`
      );
    } catch (error) {
      console.error("PDF Export failed:", error);
      toast.error("PDF export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="tk-page">
      <TutorialModal
        componentName="Agreements"
        title="Welcome to the Legal Agreements page"
        description="This is where you will find all your Contracts and Legal Agreements. You can securely build, sign, send and export your agreements here."
        listItems={[
          "Build and send new contracts",
          "Collect e-signatures securely",
          "Export executed contracts as PDF",
        ]}
      />

      {/* Header */}
      <div className="tk-card p-4 md:p-5 flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 tk-eyebrow">
            <FaShieldAlt className="text-primary text-sm" />
            <span>Secured Contract Vault</span>
          </div>
          <h1 className="tk-page-title">Legal Agreements</h1>
          <p className="text-xs text-body-text max-w-md leading-relaxed">
            Central repository for all executed and pending service agreements
            between you and your clients.
          </p>
          <button
            onClick={() => navigate("/dashboard/find-freelancers")}
            className="tk-btn-primary mt-2"
          >
            <FiPlus /> New Agreement
          </button>
        </div>

        <div className="flex gap-4">
          <div className="rounded-2xl border border-line-app p-5 text-center min-w-[130px]">
            <p className="text-xs text-body-text/70 mb-2">Executed</p>
            <p className="text-2xl font-semibold text-primary">
              {agreements.filter(isExecuted).length}
            </p>
          </div>
          <div className="rounded-2xl border border-line-app p-5 text-center min-w-[130px]">
            <p className="text-xs text-body-text/70 mb-2">Pending</p>
            <p className="text-2xl font-semibold text-pending-text">
              {agreements.filter((a) => a.status === "pending").length}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-2xl">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-body-text/40 z-10" />
        <input
          type="text"
          placeholder="Search by Client Name or Contract Reference..."
          className="tk-input pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Documents table */}
      <div className="tk-table-wrap">
        <div className="overflow-x-auto">
          <table className="tk-table">
            <thead className="tk-thead">
              <tr>
                <th className="tk-th">Document Details</th>
                <th className="tk-th">Signatory</th>
                <th className="tk-th text-center">Status & Proof</th>
                <th className="tk-th text-right">Vault Access</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((agreement) => (
                  <tr key={agreement._id} className="tk-row group">
                    <td className="tk-td">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-semibold text-ink group-hover:text-primary transition-colors">
                          Project: {agreement.requirement?.slice(0, 35) || "—"}
                          {agreement.requirement?.length > 35 && "…"}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-body-text/70 font-mono">
                          <span className="bg-app-bg px-2 py-0.5 rounded-full">
                            REF: {agreement._id.slice(-10).toUpperCase()}
                          </span>
                          <span className="text-ink font-semibold">
                            Value: £{agreement.price}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="tk-td">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-tint flex items-center justify-center text-primary">
                          <FiUser size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-ink">
                            {agreement.clientName}
                          </span>
                          <span className="text-[11px] text-body-text/70">
                            Signatory
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="tk-td text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span
                          className={
                            isExecuted(agreement)
                              ? "tk-badge-success"
                              : "tk-badge-warning"
                          }
                        >
                          {isExecuted(agreement) ? (
                            <FiCheckCircle />
                          ) : (
                            <FiClock />
                          )}
                          {isExecuted(agreement) ? "Binding" : "Awaiting"}
                        </span>
                        {agreement.signedAt && (
                          <span className="text-[11px] text-body-text/70">
                            Executed:{" "}
                            {new Date(agreement.signedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="tk-td text-right">
                      <div className="flex justify-end gap-2">
                        {!isExecuted(agreement) && (
                          <button
                            onClick={() => handleSendToClient(agreement)}
                            disabled={isSending}
                            className="tk-btn-secondary"
                            title="Email this agreement to the client"
                          >
                            <FiSend size={12} /> Send
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedAgreement(agreement);
                            setShowSignPad(false);
                          }}
                          className="tk-btn-primary"
                        >
                          View <FiArrowRight size={10} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-32 text-center">
                    <div className="flex flex-col items-center gap-6 text-body-text/40">
                      <FaFileContract size={72} />
                      <p className="text-sm font-semibold uppercase tracking-[0.4em]">
                        Vault Empty
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* -------- Agreement detail modal -------- */}
      {selectedAgreement && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal header */}
            <div className="px-6 md:px-8 py-5 border-b border-line-app flex justify-between items-center bg-app-bg/60">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary text-white rounded-xl">
                  <FaGavel size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink uppercase tracking-wide">
                    Contractual Record
                  </h3>
                  <p className="text-[11px] text-body-text/70 mt-0.5 font-mono">
                    REF: {selectedAgreement._id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAgreement(null)}
                className="tk-icon-btn"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Contract body (captured for PDF) */}
            <div
              ref={contractRef}
              className="flex-1 overflow-y-auto p-8 md:p-10 space-y-8 bg-white"
            >
              {/* Taskra letterhead */}
              <div className="flex items-center justify-between border-b-2 border-[#FE6D06] pb-5">
                <img
                  src={TASKRA_LOGO}
                  alt="Taskra"
                  crossOrigin="anonymous"
                  className="h-9 object-contain"
                />
                <div className="text-right">
                  <p className="text-[10px] font-semibold text-[#4B4B57] uppercase tracking-widest">
                    Service Agreement
                  </p>
                  <p className="text-[10px] text-[#4B4B57] mt-0.5">
                    Issued{" "}
                    {selectedAgreement.createdAt
                      ? new Date(
                          selectedAgreement.createdAt
                        ).toLocaleDateString("en-GB")
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Party info */}
              <div className="grid grid-cols-2 gap-10">
                <div>
                  <p className="text-[10px] font-semibold text-[#FE6D06] uppercase tracking-widest mb-3">
                    Service Recipient
                  </p>
                  <p className="text-lg font-semibold text-[#14141F]">
                    {selectedAgreement.clientName}
                  </p>
                  <p className="text-xs text-[#4B4B57] mt-1">
                    Legally identified through secure digital verification.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold text-[#4B4B57] uppercase tracking-widest mb-3">
                    Investment Value
                  </p>
                  <p className="text-3xl font-semibold text-[#14141F]">
                    £{selectedAgreement.price}
                  </p>
                  <p className="text-[10px] text-[#FE6D06] font-semibold uppercase mt-1">
                    Full Production Balance
                  </p>
                </div>
              </div>

              {/* Scope */}
              <div className="p-6 bg-[#F5F6F8] border border-[#E7E9EE] rounded-xl">
                <p className="text-[10px] font-semibold text-[#4B4B57] uppercase tracking-widest mb-3">
                  Scope of Work
                </p>
                <p className="text-sm text-[#14141F] leading-relaxed font-medium">
                  {selectedAgreement.requirement}
                </p>
              </div>

              {/* Legal terms */}
              <div>
                <p className="text-[10px] font-semibold text-[#4B4B57] uppercase tracking-widest mb-4">
                  Contractual Provisions
                </p>
                <div className="text-sm text-[#4B4B57] font-medium leading-loose border-l-4 border-[#FE6D06]/25 pl-6 italic whitespace-pre-wrap">
                  {selectedAgreement.legalTerms ||
                    "Standard Taskra Terms and Conditions apply to this agreement."}
                </div>
              </div>

              {/* Execution proof */}
              <div className="pt-8 border-t border-[#E7E9EE] grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <p className="text-[10px] font-semibold text-[#4B4B57] uppercase tracking-widest mb-4">
                    Digital Execution Proof
                  </p>
                  {selectedAgreement.signature ? (
                    <div className="border border-[#E7E9EE] rounded-xl p-4 bg-white shadow-inner flex flex-col items-center">
                      <img
                        src={selectedAgreement.signature}
                        alt="Signature Proof"
                        className="max-h-24 object-contain"
                      />
                      <div className="w-full h-px bg-[#E7E9EE] my-3" />
                      <p className="text-[10px] font-semibold text-[#4B4B57] uppercase">
                        Signed & Sealed
                      </p>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-[#E7E9EE] rounded-xl py-10 flex flex-col items-center justify-center opacity-60">
                      <FaSignature className="text-[#4B4B57]/40 text-3xl mb-2" />
                      <p className="text-[10px] font-semibold uppercase text-[#4B4B57] tracking-widest">
                        Signature Pending
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-[#F5F6F8] rounded-xl">
                    <span className="text-[10px] font-semibold text-[#4B4B57] uppercase">
                      Agreement Status
                    </span>
                    <span className="text-[10px] font-semibold text-[#FE6D06] uppercase">
                      {selectedAgreement.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-[#F5F6F8] rounded-xl">
                    <span className="text-[10px] font-semibold text-[#4B4B57] uppercase">
                      Execution Date
                    </span>
                    <span className="text-[10px] font-semibold text-[#14141F] uppercase">
                      {selectedAgreement.signedAt
                        ? new Date(
                            selectedAgreement.signedAt
                          ).toLocaleDateString()
                        : "Unsigned"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-[#FE6D06] rounded-xl">
                    <span className="text-[10px] font-semibold text-white/70 uppercase">
                      Binding Code
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-white">
                      {selectedAgreement._id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Signature pad (collect e-signature on unsigned agreements) */}
            {showSignPad && !selectedAgreement.signature && (
              <div className="px-8 py-5 border-t border-line-app bg-app-bg/50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-semibold text-body-text/70 uppercase tracking-widest">
                    Draw Signature Below
                  </span>
                  <button
                    onClick={() => sigPad.current?.clear()}
                    className="text-[11px] font-semibold text-danger-text hover:underline flex items-center gap-1 uppercase"
                  >
                    <FiTrash2 size={11} /> Reset Pad
                  </button>
                </div>
                <div className="bg-white border-2 border-dashed border-line-app rounded-xl overflow-hidden h-36 relative">
                  <SignatureCanvas
                    ref={sigPad}
                    penColor="#14141F"
                    canvasProps={{ className: "w-full h-full cursor-crosshair" }}
                  />
                  <div className="absolute bottom-3 right-3 pointer-events-none opacity-10">
                    <FaSignature size={40} />
                  </div>
                </div>
              </div>
            )}

            {/* Modal footer */}
            <div className="px-6 md:px-8 py-5 bg-app-bg/60 border-t border-line-app flex flex-wrap justify-end gap-3">
              {!selectedAgreement.signature &&
                (showSignPad ? (
                  <button
                    disabled={isSigning}
                    onClick={handleSignAndExecute}
                    className="tk-btn-dark"
                  >
                    <FaSignature />{" "}
                    {isSigning ? "Executing..." : "Execute Agreement"}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSignPad(true)}
                    className="tk-btn-dark"
                  >
                    <FaSignature /> Sign Agreement
                  </button>
                ))}
              <button
                disabled={isExporting}
                onClick={handleDownloadPDF}
                className="tk-btn-secondary"
              >
                <FaDownload size={12} />{" "}
                {isExporting ? "Exporting..." : "Export as PDF"}
              </button>
              <button
                onClick={() => setSelectedAgreement(null)}
                className="tk-btn-primary"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Agreements;
