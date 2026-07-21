import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoPaperPlaneOutline,
  IoChatbubblesOutline,
  IoArrowBackOutline,
  IoDocumentTextOutline,
} from "react-icons/io5";
import { BsCircleFill } from "react-icons/bs";
import toast from "react-hot-toast";
import MessageBubble, { PinnedQuoteBanner } from "./MessageBubble";
import ChatModal from "./ChatModal";
import QuoteModal from "./QuoteModal";
import { confirmToast } from "../utils/toastConfirm";

const FALLBACK_AVATAR = "https://getleadcrm.com/images/1679395214.jpg";

// Right pane: header (other member + quote actions), pinned quote banner,
// message thread grouped by sender, and the composer.
const ChatWindow = ({
  conversation,
  messages,
  socket,
  currentUser,
  pinnedQuote,
  onBack,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
}) => {
  const [newMessage, setNewMessage] = useState("");
  // Quote creation form (ChatModal)
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  // Agreement view/sign modal (QuoteModal) — opened from banner or a quote bubble
  const [viewedQuote, setViewedQuote] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-app-bg gap-4 h-full">
        <div className="w-20 h-20 rounded-3xl bg-primary-tint flex items-center justify-center">
          <IoChatbubblesOutline size={38} className="text-primary/60" />
        </div>
        <div className="text-center">
          <p className="text-ink text-lg font-semibold">Your Messages</p>
          <p className="text-body-text/70 text-sm mt-1">
            Select a conversation to start chatting
          </p>
        </div>
      </div>
    );
  }

  const otherUser = conversation.memberDetails?.find(
    (m) => m._id !== currentUser?._id,
  );

  const handleSend = () => {
    if (!newMessage.trim() || !conversation || !currentUser) return;
    onSendMessage?.(newMessage);
    setNewMessage("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (
      await confirmToast({
        title: "Delete message?",
        message: "This message will be removed for everyone in the chat.",
        confirmText: "Delete",
        danger: true,
      })
    ) {
      onDeleteMessage?.(messageId);
    }
  };

  const hasText = newMessage.trim().length > 0;

  return (
    <div className="flex-1 flex flex-col bg-app-bg overflow-hidden w-full h-full">
      {/* ── Chat header ── */}
      <div className="flex items-center gap-3 px-4 md:px-6 py-3.5 bg-surface border-b border-line-app shrink-0">
        {/* Mobile back button */}
        <button
          onClick={onBack}
          className="md:hidden tk-icon-btn -ml-2"
          title="Back to conversations"
        >
          <IoArrowBackOutline size={20} />
        </button>

        <div className="relative shrink-0">
          <img
            src={otherUser?.photo || FALLBACK_AVATAR}
            alt={otherUser?.name || "avatar"}
            className="w-11 h-11 rounded-2xl object-cover ring-2 ring-primary/20"
          />
          <BsCircleFill
            size={10}
            className="absolute bottom-0.5 right-0.5 text-success-text"
            style={{ filter: "drop-shadow(0 0 3px white)" }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-ink font-semibold text-base truncate">
            {otherUser?.name || "Unknown User"}
          </h3>
          <p className="text-success-text text-xs font-medium flex items-center gap-1">
            <BsCircleFill size={6} />
            Online
          </p>
        </div>

        {/* Send a quote & contract */}
        <button
          onClick={() => setIsQuoteModalOpen(true)}
          className="tk-btn-secondary h-9 px-3"
          title="Send a quote & contract"
        >
          <IoDocumentTextOutline size={16} />
          <span className="hidden sm:inline">New quote</span>
        </button>
        {/* View the latest pinned quote */}
        <button
          onClick={() => {
            if (pinnedQuote) setViewedQuote(pinnedQuote);
            else toast("No quote available yet", { icon: "⚠️" });
          }}
          className="tk-icon-btn"
          title="View pinned quote"
        >
          <IoDocumentTextOutline size={18} className="text-primary" />
        </button>
      </div>

      <PinnedQuoteBanner
        quote={pinnedQuote}
        onClick={() => setViewedQuote(pinnedQuote)}
      />

      {/* ── Messages thread ── */}
      <div className="flex-1 overflow-y-auto px-3 md:px-6 py-5 space-y-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-60">
            <IoChatbubblesOutline size={44} className="text-primary/40" />
            <p className="text-body-text/70 text-sm">
              No messages yet. Say hello!
            </p>
          </div>
        )}

        {messages.map((msg, i) => {
          const prevMsg = messages[i - 1];
          const showMeta = !prevMsg || prevMsg.senderId !== msg.senderId;
          return (
            <MessageBubble
              key={msg._id || msg.createdAt}
              message={msg}
              isOwn={msg.senderId === currentUser?._id}
              showMeta={showMeta}
              onDelete={handleDeleteMessage}
              onEdit={onEditMessage}
              onOpenQuote={(quote) => setViewedQuote(quote)}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Composer ── */}
      <div className="px-3 md:px-5 py-4 bg-surface border-t border-line-app shrink-0">
        <div className="flex items-end gap-2 md:gap-3 bg-app-bg rounded-2xl border border-line-app px-3 md:px-4 py-2.5 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary focus-within:bg-white transition">
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              autoResize();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-ink placeholder:text-body-text/50 leading-relaxed max-h-28 py-1.5"
          />
          <button
            onClick={handleSend}
            disabled={!hasText}
            title="Send"
            className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              hasText
                ? "bg-primary text-white hover:bg-primary-hover"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            <IoPaperPlaneOutline size={17} />
          </button>
        </div>
        <p className="text-center text-[10px] text-body-text/40 mt-2 font-medium tracking-wide">
          Enter to send · Shift + Enter for new line
        </p>
      </div>

      {/* ── Quote creation form (New quote) ── */}
      <ChatModal
        socket={socket}
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        conversation={conversation}
        currentUser={currentUser}
      />

      {/* ── Agreement view / sign modal ── */}
      {viewedQuote && (
        <QuoteModal
          quote={viewedQuote}
          onClose={() => setViewedQuote(null)}
          // Only the client continues straight into payment after signing.
          onSigned={
            viewedQuote.clientId === currentUser?._id
              ? (signed) => {
                  setViewedQuote(null);
                  navigate(`/payment/${signed._id}`);
                }
              : undefined
          }
        />
      )}
    </div>
  );
};

export default ChatWindow;
