import React, { useEffect, useRef, useState, useMemo } from "react";
import { formatTimestamp } from "../utils/formatDate";
import { postMessage } from "../api/messages";

export default function ChatWindow({ chat, onLocalMessage, onBack, darkMode }) {
  const [text, setText] = useState("");
  const [error, setError] = useState(null);
  const messagesRef = useRef(null);

  // This could be a localMessages state if you track optimistic messages outside chat.messages,
  // but here assuming all messages come via chat.messages + optimistic messages sent via onLocalMessage
  // So let's assume you pass chat.messages including optimistic ones already.

  // Prepare merged and sorted messages (chat.messages + any other local messages)
  // If you have optimistic local messages stored outside, merge here (not shown in this snippet).
  // Here we just take chat.messages as is.

  // Use useMemo unconditionally
  const allMessages = useMemo(() => {
    if (!chat?.messages) return [];
    return [...chat.messages].sort(
      (a, b) => parseInt(a.timestamp || 0) - parseInt(b.timestamp || 0)
    );
  }, [chat?.messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [allMessages.length]);

  if (!chat) {
    return (
      <div
        className={`flex items-center justify-center flex-grow ${
          darkMode ? "text-gray-400" : "text-gray-600"
        }`}
      >
        Select a chat to start messaging
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setError(null);

    const optimistic = {
      id: `temp_${Date.now()}`,
      from: "me",
      wa_id: chat.wa_id,
      name: chat.name,
      timestamp: Math.floor(Date.now() / 1000).toString(),
      type: "text",
      text: { body },
      status: "sent",
    };

    onLocalMessage(optimistic);
    setText("");

    try {
      await postMessage({
        wa_id: chat.wa_id,
        name: chat.name,
        text: body,
      });
      // server will emit new_message
    } catch (err) {
      console.error("Failed to send", err);
      setError("Failed to send message. Please try again.");
    }
  };

  function StatusIcon({ status }) {
    if (!status) return null;
    if (status === "sent") return <span className="text-xs ml-2">✓</span>;
    if (status === "delivered") return <span className="text-xs ml-2">✓✓</span>;
    if (status === "read") return <span className="text-xs ml-2 text-blue-400">✓✓</span>;
    return null;
  }

  const lastMsgTimestamp =
    allMessages.length > 0 ? allMessages[allMessages.length - 1].timestamp : null;

  return (
    <div
      className={`flex flex-col flex-grow min-h-0 h-screen ${
        darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
      }`}
    >
      <header
        className={`px-4 py-3 border-b flex items-center sticky top-0 z-10 ${
          darkMode ? "border-gray-700 bg-gray-800" : "border-gray-300 bg-gray-100"
        }`}
      >
        <div className="md:hidden mr-2">
          <button
            onClick={onBack}
            className={`p-2 rounded hover:bg-gray-700 focus:outline-none ${
              darkMode ? "hover:bg-gray-700 text-white" : "hover:bg-gray-300 text-black"
            }`}
          >
            ←
          </button>
        </div>
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mr-4 ${
            darkMode ? "bg-gray-700 text-white" : "bg-gray-300 text-black"
          }`}
        >
          {chat.name?.charAt(0) || chat.wa_id.charAt(0)}
        </div>
        <div>
          <div className={`${darkMode ? "text-white" : "text-black"} text-lg font-semibold`}>
            {chat.name || chat.wa_id}
          </div>
          <div className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-xs`}>
            {lastMsgTimestamp
              ? `Last seen at ${new Date(parseInt(lastMsgTimestamp) * 1000).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : "No messages yet"}
          </div>
        </div>
      </header>

      <main
        ref={messagesRef}
        className={`flex-grow overflow-y-auto p-4 space-y-3 message-list min-h-0 ${
          darkMode ? "" : "bg-gray-50"
        }`}
      >
        {allMessages.map((msg) => {
          const mine = (msg.from || "").toLowerCase() === "me";
          const key = msg._id || msg.id || `temp_${Math.random()}`;

          const messageBg = mine
            ? darkMode
              ? "bg-green-600 text-white"
              : "bg-green-400 text-black"
            : darkMode
            ? "bg-gray-700 text-white"
            : "bg-gray-300 text-black";

          const timeTextColor = darkMode ? "text-gray-200" : "text-gray-700";

          return (
            <div key={key} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-lg ${messageBg}`}>
                <div className="text-sm break-words">{msg.text?.body || "[Unsupported message]"}</div>
                <div className={`text-xs mt-1 flex items-center justify-end ${timeTextColor}`}>
                  <span>{formatTimestamp(msg.timestamp)}</span>
                  <StatusIcon status={msg.status} />
                </div>
              </div>
            </div>
          );
        })}
      </main>

      <footer
        className={`p-3 border-t sticky bottom-0 ${
          darkMode ? "border-gray-700 bg-gray-800" : "border-gray-300 bg-gray-100"
        }`}
      >
        <form className="flex items-center gap-3" onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message"
            className={`flex-grow rounded-lg px-4 py-2 outline-none resize-none ${
              darkMode ? "bg-gray-700 text-white" : "bg-white text-black border border-gray-300"
            }`}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className={`px-4 py-2 rounded-full font-semibold ${
              text.trim()
                ? darkMode
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
                : darkMode
                ? "bg-gray-600 cursor-not-allowed text-gray-300"
                : "bg-gray-300 cursor-not-allowed text-gray-600"
            }`}
          >
            Send
          </button>
        </form>
        {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
      </footer>
    </div>
  );
}
