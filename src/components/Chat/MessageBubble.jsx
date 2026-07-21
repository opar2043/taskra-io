import { useState } from "react";
import { BsCheckAll } from "react-icons/bs";
import {
  FaThumbtack,
  FaCalendarAlt,
  FaChevronRight,
  FaRegTrashAlt,
  FaPen,
} from "react-icons/fa";

const FALLBACK_AVATAR = "https://getleadcrm.com/images/1679395214.jpg";

// Pinned agreement banner shown under the chat header (latest quote message).
export const PinnedQuoteBanner = ({ quote, onClick }) => {
  if (!quote) return null;

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 bg-surface border-b border-line-app cursor-pointer hover:bg-primary-tint/40 transition-colors group"
    >
      <div className="shrink-0 w-7 h-7 rounded-lg bg-primary-tint flex items-center justify-center">
        <FaThumbtack size={11} className="text-primary -rotate-45" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">
          Pinned Quote
        </p>
        <div className="flex items-center gap-3 text-xs text-body-text/80 font-medium">
          <span className="font-semibold text-ink shrink-0">
            £{quote.price}
          </span>
          <span className="w-1 h-1 rounded-full bg-line-app shrink-0" />
          <span className="flex items-center gap-1 shrink-0">
            <FaCalendarAlt size={9} className="text-primary" />
            {new Date(quote.timeline).toLocaleDateString("en-GB", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="w-1 h-1 rounded-full bg-line-app shrink-0" />
          <span className="truncate">{quote.requirement}</span>
        </div>
      </div>

      <FaChevronRight
        size={11}
        className="shrink-0 text-body-text/30 group-hover:text-primary transition-colors"
      />
    </div>
  );
};

// One chat message. Own = primary-tint bubble, other = white card.
// Hover actions (own, non-deleted): edit inline + soft delete.
// Quote-type messages render an agreement card that opens the quote modal.
const MessageBubble = ({
  message,
  isOwn,
  showMeta,
  onDelete,
  onEdit,
  onOpenQuote,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(message.text || "");

  const timeStr = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isQuote = message.type === "quote" && message.quote;
  const isEdited = !!message.updatedAt && !message.isDeleted;

  const startEdit = () => {
    setDraft(message.text || "");
    setIsEditing(true);
  };

  const saveEdit = () => {
    const body = draft.trim();
    if (body && body !== message.text) onEdit?.(message._id, body);
    setIsEditing(false);
  };

  return (
    <div
      className={`flex items-end gap-2.5 group
        ${isOwn ? "flex-row-reverse" : "flex-row"}
        ${showMeta ? "mt-4" : "mt-1"}`}
    >
      {/* Avatar (only on the first message of a sender group) */}
      <div className="shrink-0 w-9">
        {showMeta ? (
          <img
            src={message.senderPhoto || FALLBACK_AVATAR}
            alt={message.senderName || "avatar"}
            className="w-9 h-9 rounded-xl object-cover ring-2 ring-line-app"
          />
        ) : (
          <div className="w-9" />
        )}
      </div>

      {/* Column */}
      <div
        className={`flex flex-col max-w-[78%] md:max-w-[65%] min-w-0 ${
          isOwn ? "items-end" : "items-start"
        }`}
      >
        {!isOwn && showMeta && (
          <span className="text-xs font-semibold text-primary mb-1 ml-1">
            {message.senderName || "Unknown"}
          </span>
        )}

        <div className="relative">
          {/* Hover actions: edit + delete on own, non-deleted messages */}
          {isOwn && !message.isDeleted && !isEditing && (
            <div className="absolute top-1/2 -translate-y-1/2 -left-[4.5rem] flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-10">
              {!isQuote && onEdit && (
                <button
                  onClick={startEdit}
                  title="Edit message"
                  className="w-7 h-7 rounded-full bg-surface border border-line-app shadow-sm flex items-center justify-center text-body-text hover:border-primary/40 hover:text-primary transition-colors"
                >
                  <FaPen size={11} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(message._id)}
                  title="Delete message"
                  className="w-7 h-7 rounded-full bg-surface border border-line-app shadow-sm flex items-center justify-center text-body-text hover:border-danger-text/40 hover:text-danger-text transition-colors"
                >
                  <FaRegTrashAlt size={12} />
                </button>
              )}
            </div>
          )}

          {/* Bubble */}
          <div
            className={`relative px-4 py-3 ${
              isOwn
                ? "bg-primary-tint text-ink rounded-3xl rounded-br-lg border border-primary/15"
                : "bg-surface text-ink rounded-3xl rounded-bl-lg border border-line-app shadow-soft"
            }`}
          >
            {message.isDeleted ? (
              <p className="text-sm italic text-body-text/50">
                Message deleted
              </p>
            ) : isEditing ? (
              /* Inline edit */
              <div className="w-56 max-w-full">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      saveEdit();
                    }
                    if (e.key === "Escape") setIsEditing(false);
                  }}
                  rows={2}
                  autoFocus
                  className="w-full rounded-xl border border-line-app bg-white p-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
                <div className="flex justify-end gap-2 mt-1.5">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-xs font-semibold text-body-text/70 hover:text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    className="text-xs font-semibold text-primary hover:text-primary-hover"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : isQuote ? (
              /* Quote / agreement card inside the bubble */
              <div
                onClick={() => onOpenQuote?.(message.quote)}
                className="cursor-pointer rounded-xl p-3 border bg-white border-line-app hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-1 mb-2 text-primary/70">
                  <FaThumbtack size={9} className="-rotate-45" />
                  <span className="text-[10px] font-bold uppercase tracking-wide">
                    Quote &amp; Agreement
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      Project Quote
                    </p>
                    <p className="text-xs mt-1 text-body-text/80">
                      Budget: £{message.quote.price} ·{" "}
                      {new Date(message.quote.timeline).toLocaleDateString(
                        "en-GB",
                        { month: "short", day: "numeric", year: "numeric" },
                      )}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full shrink-0 bg-primary-tint text-primary">
                    View
                    <FaChevronRight size={8} />
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                {message.text}
              </p>
            )}

            {/* Timestamp + edited marker + tick */}
            {!isEditing && (
              <div className="flex items-center justify-end gap-1 mt-1">
                {isEdited && (
                  <span className="text-[10px] italic text-body-text/50">
                    edited
                  </span>
                )}
                <span className="text-[10px] font-medium text-body-text/50">
                  {timeStr}
                </span>
                {isOwn && (
                  <BsCheckAll size={14} className="text-primary/60 shrink-0" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
