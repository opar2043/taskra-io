import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import SignatureCanvas from "react-signature-canvas";
import {
  FaTimes,
  FaSignature,
  FaCheckCircle,
  FaTrashAlt,
  FaFileContract,
  FaUserShield,
  FaCalendarAlt,
  FaEnvelopeOpenText,
} from "react-icons/fa";
import toast from "react-hot-toast";
import useAxios from "../Hooks/useAxios";
import useInboxQuote from "../Hooks/useInboxQuote";

// Agreement view + e-sign modal for an inbox-quote.
// Signing PATCHes /inbox-quote/:id to "accepted" with the drawn signature.
// If onSigned is provided (client flow) the caller continues into payment.
const QuoteModal = ({ quote, onClose, onSigned }) => {
  const sigPad = useRef(null);
  const axiosSecure = useAxios();
  const [, refetch] = useInboxQuote();
  const [isSigning, setIsSigning] = useState(false);

  const clearSignature = () => sigPad.current?.clear();

  const handleSignAndAccept = async () => {
    if (sigPad.current?.isEmpty()) {
      return toast("Please draw your signature to accept the agreement.", {
        icon: "⚠️",
      });
    }

    try {
      setIsSigning(true);
      // toDataURL directly (trim-canvas is broken with React 19 builds).
      const signatureImage = sigPad.current.getCanvas().toDataURL("image/png");

      const updateData = {
        status: "accepted",
        signature: signatureImage,
        signedAt: new Date().toISOString(),
        clientAgreed: true,
      };

      await axiosSecure.patch(`/inbox-quote/${quote._id}`, updateData);
      refetch();

      // Client portal flow: signing and paying become a single flow.
      if (onSigned) {
        toast.success(
          "Redirecting you to secure checkout to complete your payment.",
        );
        onSigned(quote);
        return;
      }

      toast.success("The contract is now legally binding and signed.");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Could not finalize the agreement. Please try again.");
    } finally {
      setIsSigning(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl shadow-soft border border-line-app">
        {/* ── Header ── */}
        <div className="bg-primary px-6 md:px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3 text-white">
            <FaFileContract className="text-xl opacity-90" />
            <div>
              <h2 className="text-lg font-bold uppercase tracking-widest leading-none">
                Service Agreement
              </h2>
              <p className="text-[10px] opacity-80 font-semibold mt-1 uppercase">
                REF: {quote._id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-app-bg">
          {/* ── Top info grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="tk-card p-5">
              <p className="tk-eyebrow mb-2">Project Terms</p>
              <p className="text-sm font-semibold text-ink leading-relaxed">
                {quote.requirement}
              </p>
            </div>
            <div className="tk-card p-5">
              <p className="tk-eyebrow mb-2">Total Investment</p>
              <p className="text-2xl font-bold text-primary">£{quote.price}</p>
              <p className="text-[10px] text-body-text/70 font-semibold uppercase mt-1">
                Inclusive of all services
              </p>
            </div>
            <div className="tk-card p-5">
              <p className="tk-eyebrow mb-2">Target Completion</p>
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <FaCalendarAlt className="text-primary" />
                {new Date(quote.timeline).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* ── Legal terms ── */}
          <div className="tk-card p-6 md:p-8">
            <div className="flex items-center gap-2 mb-5">
              <FaUserShield className="text-primary" />
              <h3 className="tk-section-title text-ink">
                Legal Terms &amp; Conditions
              </h3>
            </div>
            <div className="text-sm text-body-text leading-loose whitespace-pre-wrap">
              {quote.legalTerms ||
                "Standard service terms apply to this project. Both parties agree to fulfill their obligations as outlined in the project requirements."}
            </div>
          </div>

          {/* ── Signature section ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div className="rounded-2xl bg-primary-tint border border-primary/15 p-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                  <FaCheckCircle /> Agreement Acceptance
                </h4>
                <p className="text-xs text-body-text font-medium leading-relaxed">
                  By providing a digital signature, the Client acknowledges they
                  have read, understood, and agreed to the terms of this
                  contract. This constitutes a legally binding agreement between{" "}
                  {quote.clientName} and the Service Provider.
                </p>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 tk-card italic text-xs text-body-text/80 font-medium">
                <FaEnvelopeOpenText className="text-primary shrink-0" />A copy
                of this signed agreement will be stored in your dashboard.
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="tk-eyebrow">Draw Signature Below</span>
                <button
                  onClick={clearSignature}
                  className="text-[10px] font-bold text-danger-text hover:opacity-80 flex items-center gap-1 uppercase"
                >
                  <FaTrashAlt size={10} /> Reset Pad
                </button>
              </div>
              <div className="bg-white border-2 border-dashed border-line-app rounded-2xl overflow-hidden h-48 relative">
                <SignatureCanvas
                  ref={sigPad}
                  penColor="#14141F"
                  canvasProps={{ className: "w-full h-full cursor-crosshair" }}
                />
                <div className="absolute bottom-4 right-4 pointer-events-none opacity-10">
                  <FaSignature size={48} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer actions ── */}
        <div className="bg-surface px-6 md:px-8 py-5 border-t border-line-app flex justify-end items-center gap-3">
          <button onClick={onClose} className="tk-btn-secondary">
            Review Later
          </button>
          <button
            onClick={handleSignAndAccept}
            disabled={isSigning}
            className="tk-btn-primary"
          >
            {isSigning ? (
              "Executing..."
            ) : (
              <>
                <FaSignature /> Sign &amp; Accept
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default QuoteModal;
