import { useState } from "react";
import {
  IoChatbubblesOutline,
  IoSearchOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { BsCircleFill } from "react-icons/bs";
import { confirmToast } from "../utils/toastConfirm";

const FALLBACK_AVATAR = "https://getleadcrm.com/images/1679395214.jpg";

// Left inbox pane: search + conversation rows (avatar, name, last message,
// updated time) + current-user footer. Deleting a head asks via confirmToast.
const ConversationList = ({
  conversations,
  setSelectedChat,
  currentUser,
  selectedChat,
  onDeleteConversation,
}) => {
  const [search, setSearch] = useState("");

  const filtered = (conversations || []).filter((conv) => {
    const other = conv.memberDetails?.find((m) => m._id !== currentUser?._id);
    return other?.name?.toLowerCase().includes(search.toLowerCase()) ?? true;
  });

  const handleDelete = async (e, conv) => {
    // Stop the row's onClick from selecting the chat we're deleting.
    e.stopPropagation();
    const other = conv.memberDetails?.find((m) => m._id !== currentUser?._id);
    if (
      await confirmToast({
        title: "Delete conversation?",
        message: `Your chat with ${other?.name || "this user"} and all its messages will be permanently removed.`,
        confirmText: "Delete",
        danger: true,
      })
    ) {
      onDeleteConversation?.(conv._id);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-surface">
      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4 border-b border-line-app">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-primary-tint text-primary flex items-center justify-center">
            <IoChatbubblesOutline size={18} />
          </div>
          <div>
            <h2 className="text-ink font-semibold text-lg leading-tight">
              Messages
            </h2>
            <p className="text-xs text-body-text/70 font-medium">
              {conversations?.length || 0} conversations
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <IoSearchOutline
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-body-text/50 pointer-events-none"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages..."
            className="tk-input pl-9"
          />
        </div>
      </div>

      {/* ── Conversation rows ── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {filtered.length === 0 && (
          <div className="text-center text-body-text/70 text-sm py-12">
            No conversations found
          </div>
        )}

        {filtered.map((conv) => {
          const other = conv.memberDetails?.find(
            (m) => m._id !== currentUser?._id,
          );
          const isSelected = selectedChat?._id === conv._id;
          const hasUnread = conv.unreadCount > 0;

          return (
            <div
              key={conv._id}
              onClick={() => setSelectedChat(conv)}
              className={`relative flex items-center gap-3 px-3 py-3 rounded-2xl cursor-pointer transition-colors group border
                ${
                  isSelected
                    ? "bg-primary-tint border-primary/20"
                    : "border-transparent hover:bg-app-bg"
                }`}
            >
              {/* Delete conversation (inbox head) */}
              <button
                onClick={(e) => handleDelete(e, conv)}
                title="Delete conversation"
                className="absolute top-2 right-2 z-10 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-danger-text hover:bg-danger-bg"
              >
                <IoTrashOutline size={15} />
              </button>

              {/* Avatar */}
              <img
                src={other?.photo || FALLBACK_AVATAR}
                alt={other?.name || "avatar"}
                className={`w-12 h-12 rounded-2xl object-cover shrink-0 ring-2 ${
                  isSelected ? "ring-primary/30" : "ring-line-app"
                }`}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p
                    className={`text-sm font-semibold truncate ${
                      isSelected ? "text-primary" : "text-ink"
                    }`}
                  >
                    {other?.name || "Unknown User"}
                  </p>
                  <span className="text-[10px] font-medium shrink-0 ml-2 text-body-text/60">
                    {conv.updatedAt
                      ? new Date(conv.updatedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs truncate text-body-text/70">
                    {conv.lastMessage || "No messages yet"}
                  </p>
                  {hasUnread && !isSelected && (
                    <span className="shrink-0 min-w-[18px] h-[18px] bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Current user footer ── */}
      {currentUser && (
        <div className="px-4 py-4 border-t border-line-app bg-app-bg/60">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={currentUser.photo || FALLBACK_AVATAR}
                alt="me"
                className="w-10 h-10 rounded-2xl object-cover ring-2 ring-primary/20"
              />
              <BsCircleFill
                size={10}
                className="absolute bottom-0.5 right-0.5 text-success-text"
                style={{ filter: "drop-shadow(0 0 2px white)" }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink truncate">
                {currentUser.name || "You"}
              </p>
              <p className="text-xs text-success-text font-medium">
                Active now
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationList;
