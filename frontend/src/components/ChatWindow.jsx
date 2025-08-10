import React, { useEffect, useRef, useState } from "react";
import { formatTimestamp } from "../utils/formatDate";
import { postMessage } from "../api/messages";

export default function ChatWindow({ chat, onLocalMessage, onBack }) {
  const [text, setText] = useState("");
  const [error, setError] = useState(null);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [chat?.messages?.length]);

  if (!chat) {
    return (
      <div className="flex items-center justify-center flex-grow text-gray-400">
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

  // Calculate last seen based on last message timestamp
  const lastMsgTimestamp = chat.messages.length > 0
    ? chat.messages[chat.messages.length - 1].timestamp
    : null;

  return (
    // Add h-screen to limit height, min-h-0 for flexbox correction
    <div className="flex flex-col flex-grow bg-gray-800 text-white min-h-0 h-screen">
      <header className="px-4 py-3 border-b border-gray-700 flex items-center sticky top-0 z-10 bg-gray-800">
        <div className="md:hidden mr-2">
          <button onClick={onBack} className="p-2 rounded hover:bg-gray-700">←</button>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold mr-4">
          {chat.name?.charAt(0) || chat.wa_id.charAt(0)}
        </div>
        <div>
          <div className="text-lg font-semibold">{chat.name || chat.wa_id}</div>
          <div className="text-xs text-gray-400">
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
        className="flex-grow overflow-y-auto p-4 space-y-3 message-list min-h-0"
      >
        {chat.messages.map((msg) => {
          const mine = (msg.from || "").toLowerCase() === "me";
          const key = msg._id || msg.id || `temp_${Math.random()}`;
          return (
            <div key={key} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-3 py-2 rounded-lg ${
                  mine ? "bg-green-600 text-white" : "bg-gray-700 text-white"
                }`}
              >
                <div className="text-sm break-words">{msg.text?.body || "[Unsupported message]"}</div>
                <div className="text-xs text-gray-200 mt-1 flex items-center justify-end">
                  <span>{formatTimestamp(msg.timestamp)}</span>
                  <StatusIcon status={msg.status} />
                </div>
              </div>
            </div>
          );
        })}
      </main>

      <footer className="p-3 border-t border-gray-700 sticky bottom-0 bg-gray-800">
        <form className="flex items-center gap-3" onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message"
            className="flex-grow rounded-lg bg-gray-700 px-4 py-2 outline-none text-white resize-none"
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
              text.trim() ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 cursor-not-allowed"
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
