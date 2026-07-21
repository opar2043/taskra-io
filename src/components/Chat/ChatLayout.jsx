import { useState, useRef, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import toast from "react-hot-toast";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import { connectSkt } from "../Hooks/connectSkt";
import useLoginUser from "../Hooks/useLoginUser";
import useAxios from "../Hooks/useAxios";

const LOGO = "https://i.ibb.co/G4k8xvLB/taskra-logo.png";

// Standalone full-screen chat at /chat/:id.
// :id is either a conversation _id to preselect (navigations after
// POST /conversations) or the current user's _id (dashboard "Messages" links,
// where nothing matches and no chat is preselected) — same as pixlo-frontend.
// HTTP is the source of truth (serverless prod); the socket is an enhancement.
const ChatLayout = () => {
  const { id } = useParams();
  const { currentUser } = useLoginUser();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const socket = useRef();
  const axiosSecure = useAxios();

  useEffect(() => {
    socket.current = connectSkt();
    return () => {
      socket.current?.disconnect();
    };
  }, []);

  // Load the inbox for the logged-in user; preselect the conversation from the URL.
  useEffect(() => {
    if (!currentUser?._id) return;
    axiosSecure
      .get(`/conversations/${currentUser._id}`)
      .then((res) => {
        setConversations(res.data);
        if (id) {
          const found = res.data.find((c) => c._id === id);
          if (found) setSelectedChat(found);
        }
      })
      .catch(console.error);
  }, [currentUser, id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Join the socket room + load the message history for the open conversation.
  useEffect(() => {
    if (!selectedChat?._id) return;
    socket.current?.emit("joinConversation", selectedChat._id);
    axiosSecure
      .get(`/messages/${selectedChat._id}`)
      .then((res) => setMessages(res.data))
      .catch(console.error);
  }, [selectedChat]); // eslint-disable-line react-hooks/exhaustive-deps

  // Realtime enhancement: receive / edit / delete broadcasts.
  useEffect(() => {
    const s = socket.current;
    if (!s) return;

    // Only for the open conversation, never a duplicate (e.g. our own echo).
    const onReceive = (msg) => {
      if (
        selectedChat?._id &&
        String(msg.conversationId) !== String(selectedChat._id)
      ) {
        return;
      }
      setMessages((prev) =>
        prev.some((m) => String(m._id) === String(msg._id))
          ? prev
          : [...prev, msg],
      );
    };

    const onEdited = ({ messageId, text, updatedAt }) => {
      setMessages((prev) =>
        prev.map((m) =>
          String(m._id) === String(messageId) ? { ...m, text, updatedAt } : m,
        ),
      );
    };

    const onDeleted = (messageId) => {
      setMessages((prev) =>
        prev.map((m) =>
          String(m._id) === String(messageId) ? { ...m, isDeleted: true } : m,
        ),
      );
    };

    s.on("receiveMessage", onReceive);
    s.on("messageEdited", onEdited);
    s.on("messageDeleted", onDeleted);
    return () => {
      s.off("receiveMessage", onReceive);
      s.off("messageEdited", onEdited);
      s.off("messageDeleted", onDeleted);
    };
  }, [selectedChat]);

  // Persist over HTTP (source of truth); the backend best-effort broadcasts
  // the saved doc over the socket for the other member.
  const handleSendMessage = async (text) => {
    const body = text?.trim();
    if (!body || !selectedChat?._id || !currentUser?._id) return;
    try {
      const res = await axiosSecure.post("/messages", {
        conversationId: selectedChat._id,
        senderId: currentUser._id,
        text: body,
      });
      const saved = res.data;
      setMessages((prev) =>
        prev.some((m) => String(m._id) === String(saved._id))
          ? prev
          : [...prev, saved],
      );
      // Keep the sidebar preview + ordering in sync without a refetch.
      setConversations((prev) =>
        prev.map((c) =>
          c._id === selectedChat._id
            ? { ...c, lastMessage: body, updatedAt: new Date() }
            : c,
        ),
      );
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error("Failed to send message");
    }
  };

  // Edit own message: HTTP first, optimistic local update, then socket fan-out.
  const handleEditMessage = async (messageId, text) => {
    const body = text?.trim();
    if (!body || !messageId) return;
    try {
      await axiosSecure.put(`/messages/${messageId}`, { text: body });
      setMessages((prev) =>
        prev.map((m) =>
          String(m._id) === String(messageId)
            ? { ...m, text: body, updatedAt: new Date() }
            : m,
        ),
      );
      socket.current?.emit("editMessage", { messageId, text: body });
    } catch (err) {
      console.error("Failed to edit message:", err);
      toast.error("Failed to edit message");
    }
  };

  // Soft-delete own message: HTTP first, optimistic local flip, then broadcast.
  const handleDeleteMessage = async (messageId) => {
    if (!selectedChat?._id) return;
    try {
      await axiosSecure.put(`/messages/delete/${messageId}`);
      setMessages((prev) =>
        prev.map((m) =>
          String(m._id) === String(messageId) ? { ...m, isDeleted: true } : m,
        ),
      );
      socket.current?.emit("deleteMessage", {
        messageId,
        conversationId: selectedChat._id,
      });
    } catch (err) {
      console.error("Failed to delete message:", err);
      toast.error("Failed to delete message");
    }
  };

  // Delete an entire conversation (inbox head) + its messages.
  const handleDeleteConversation = async (conversationId) => {
    try {
      await axiosSecure.delete(`/conversations/${conversationId}`);
      setConversations((prev) => prev.filter((c) => c._id !== conversationId));
      if (selectedChat?._id === conversationId) {
        setSelectedChat(null);
        setMessages([]);
      }
      toast.success("Conversation deleted");
    } catch (err) {
      console.error("Failed to delete conversation:", err);
      toast.error("Failed to delete conversation");
    }
  };

  // Latest quote message in the thread powers the pinned agreement banner.
  const quoteMessages = messages.filter((m) => m.type === "quote" && m.quote);
  const pinnedQuote =
    quoteMessages.length > 0
      ? quoteMessages[quoteMessages.length - 1].quote
      : null;

  return (
    <div className="h-screen flex flex-col bg-app-bg overflow-hidden">
      {/* ── Top header: logo + back to dashboard ── */}
      <header className="bg-surface border-b border-line-app px-4 md:px-6 h-16 flex items-center justify-between shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <img src={LOGO} alt="Taskra" className="h-8 w-auto" />
        </Link>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
        >
          <span className="w-8 h-8 rounded-xl bg-primary-tint flex items-center justify-center">
            <FiArrowLeft size={15} />
          </span>
          Back to dashboard
        </Link>
      </header>

      {/* ── Chat body ── */}
      <div className="flex-1 flex min-h-0 relative w-full">
        {/* Conversation list — full width on mobile until a chat is opened */}
        <div
          className={`h-full flex-col ${
            selectedChat ? "hidden md:flex" : "flex"
          } w-full md:w-80 md:min-w-[300px] bg-surface border-r border-line-app`}
        >
          <ConversationList
            conversations={conversations}
            setSelectedChat={setSelectedChat}
            currentUser={currentUser}
            selectedChat={selectedChat}
            onDeleteConversation={handleDeleteConversation}
          />
        </div>

        {/* Chat window — hidden on mobile until a chat is opened */}
        <div
          className={`h-full flex-col ${
            !selectedChat ? "hidden md:flex" : "flex"
          } flex-1 min-w-0`}
        >
          <ChatWindow
            conversation={selectedChat}
            messages={messages}
            socket={socket}
            currentUser={currentUser}
            pinnedQuote={pinnedQuote}
            onBack={() => setSelectedChat(null)}
            onSendMessage={handleSendMessage}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;
