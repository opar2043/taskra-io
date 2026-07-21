import { useState } from "react";
import { createPortal } from "react-dom";
import useAxios from "../Hooks/useAxios";
import toast from "react-hot-toast";
import {
  FaFileAlt,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaTimes,
} from "react-icons/fa";

const DEFAULT_TERMS =
  "1. PAYMENT: A non-refundable deposit is required to secure the date. 2. CANCELLATION: Cancellations within 48 hours will incur a fee. 3. USAGE: The freelancer retains copyright unless otherwise agreed.";

// Quote & contract creation form (opened from the chat header "New quote").
// POSTs the agreement to /inbox-quote (returns the saved doc), then sends a
// type:"quote" chat message over the socket so the room sees it in realtime.
const ChatModal = ({ isOpen, onClose, conversation, currentUser, socket }) => {
  const [requirement, setRequirement] = useState("");
  const [price, setPrice] = useState("");
  const [timeline, setTimeline] = useState("");
  const [legalTerms, setLegalTerms] = useState(DEFAULT_TERMS);
  const [isSending, setIsSending] = useState(false);
  const axiosSecure = useAxios();

  if (!isOpen) return null;

  const otherMemberId = conversation.members.find(
    (memberId) => memberId !== currentUser._id,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Determine who is the freelancer and who is the client.
    const isFreelancer = currentUser.role === "professional";

    const quoteData = {
      conversationId: conversation._id,
      freelancerId: isFreelancer ? currentUser._id : otherMemberId,
      clientId: isFreelancer ? otherMemberId : currentUser._id,
      clientName: isFreelancer ? "Client" : currentUser.name, // updated by receiver
      clientPhoto: isFreelancer ? "" : currentUser.photo,
      requirement,
      price: Number(price),
      timeline,
      legalTerms,
      status: "pending",
      createdAt: new Date(),
    };

    try {
      setIsSending(true);
      const res = await axiosSecure.post("/inbox-quote", quoteData);

      const quoteMessage = {
        conversationId: conversation._id,
        senderId: currentUser._id,
        senderName: currentUser.name,
        senderPhoto: currentUser.photo,
        text: "📄 Quote & Contract Sent",
        type: "quote",
        quote: res.data,
        createdAt: new Date(),
        isDeleted: false,
      };

      socket.current?.emit("sendMessage", quoteMessage);
      toast.success("Quote & Contract sent successfully!");

      onClose();
      setRequirement("");
      setPrice("");
      setTimeline("");
      setLegalTerms(DEFAULT_TERMS);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create quote");
    } finally {
      setIsSending(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-soft border border-line-app overflow-hidden">
        {/* ── Header ── */}
        <div className="bg-app-bg px-6 md:px-8 py-6 border-b border-line-app flex justify-between items-center">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-ink">
              Create Professional Agreement
            </h2>
            <p className="text-sm text-body-text/80 mt-1">
              Combine your quote and legal contract into one document.
            </p>
          </div>
          <button
            onClick={onClose}
            className="tk-icon-btn"
            title="Close"
            type="button"
          >
            <FaTimes />
          </button>
        </div>

        {/* ── Body ── */}
        <form
          onSubmit={handleSubmit}
          className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto"
        >
          {/* Scope of work */}
          <div className="space-y-2">
            <label className="tk-label flex items-center gap-2">
              <FaFileAlt className="text-primary" /> Scope of Work
            </label>
            <textarea
              required
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              className="tk-input h-auto py-3 resize-none"
              rows={3}
              placeholder="Describe the project scope and deliverables..."
            />
          </div>

          {/* Price & date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="tk-label flex items-center gap-2">
                <FaMoneyBillWave className="text-primary" /> Total Price
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-body-text/60 font-semibold">
                  £
                </span>
                <input
                  type="number"
                  required
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="tk-input pl-8 font-semibold"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="tk-label flex items-center gap-2">
                <FaCalendarAlt className="text-primary" /> Project Date
              </label>
              <input
                type="date"
                required
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="tk-input"
              />
            </div>
          </div>

          {/* Legal terms */}
          <div className="space-y-2">
            <label className="tk-label flex items-center gap-2">
              <FaFileAlt className="text-primary" /> Contract Terms &amp;
              Conditions
            </label>
            <textarea
              required
              value={legalTerms}
              onChange={(e) => setLegalTerms(e.target.value)}
              className="tk-input h-auto py-3 resize-none text-body-text"
              rows={6}
              placeholder="Paste your legal terms, cancellation policy, and payment schedule here..."
            />
          </div>

          {/* ── Actions ── */}
          <div className="pt-5 border-t border-line-app flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="tk-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="tk-btn-primary"
            >
              {isSending ? "Sending..." : "Send Agreement"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default ChatModal;
