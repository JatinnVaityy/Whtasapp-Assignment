import React, { useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import { fetchConversations } from "./api/messages.js";
import { io } from "socket.io-client";

export default function App() {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 768);

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const socketRef = useRef(null);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchConversations()
      .then((data) => {
        const prepared = data
          .map((c) => {
            c.messages = (c.messages || []).sort(
              (a, b) => parseInt(a.timestamp || 0) - parseInt(b.timestamp || 0)
            );
            const last = c.messages[c.messages.length - 1];
            c.lastMessage = last?.text?.body || "[Unsupported]";
            c.lastTimestamp = last
              ? new Date(parseInt(last.timestamp || 0) * 1000).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";
            return c;
          })
          .sort(
            (a, b) =>
              parseInt(b.messages[b.messages.length - 1]?.timestamp || 0) -
              parseInt(a.messages[a.messages.length - 1]?.timestamp || 0)
          );
        setConversations(prepared);
        if (!selectedChat && prepared[0]) setSelectedChat(prepared[0]);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    socketRef.current = io(API_BASE);
    socketRef.current.on("connect", () => console.log("socket connected"));

    socketRef.current.on("new_message", (msg) => {
      setConversations((prev) => {
        const map = {};
        prev.forEach((c) => (map[c.wa_id] = { ...c }));
        const wa = msg.wa_id || msg.from || "unknown";
        if (!map[wa]) {
          map[wa] = { wa_id: wa, name: msg.name || wa, messages: [] };
        }
        const exists = (map[wa].messages || []).some(
          (m) => (m.id && m.id === msg.id) || (m._id && m._id === msg._id)
        );
        if (!exists)
          map[wa].messages = [...(map[wa].messages || []), msg].sort(
            (a, b) => parseInt(a.timestamp || 0) - parseInt(b.timestamp || 0)
          );
        const arr = Object.values(map)
          .map((c) => {
            const last = c.messages[c.messages.length - 1];
            c.lastMessage = last?.text?.body || "[Unsupported]";
            c.lastTimestamp = last
              ? new Date(parseInt(last.timestamp || 0) * 1000).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";
            return c;
          })
          .sort(
            (a, b) =>
              parseInt(b.messages[b.messages.length - 1]?.timestamp || 0) -
              parseInt(a.messages[a.messages.length - 1]?.timestamp || 0)
          );
        return arr;
      });
    });

    socketRef.current.on("status_update", (u) => {
      setConversations((prev) =>
        prev.map((c) => {
          c.messages = (c.messages || []).map((m) =>
            m.id === u.id || m.meta_msg_id === u.id ? { ...m, status: u.status } : m
          );
          return c;
        })
      );
    });

    return () => socketRef.current.disconnect();
  }, []);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setShowSidebar(true);
      } else {
        setShowSidebar(false);
      }
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

 function handleLocalMessage(msg) {
  setConversations((prev) => {
    const map = {};
    prev.forEach((c) => (map[c.wa_id] = { ...c }));
    const wa = msg.wa_id || msg.from || "unknown";
    if (!map[wa]) map[wa] = { wa_id: wa, name: msg.name || wa, messages: [] };
    map[wa].messages = [...(map[wa].messages || []), msg].sort(
      (a, b) => parseInt(a.timestamp || 0) - parseInt(b.timestamp || 0)
    );
    const arr = Object.values(map)
      .map((c) => {
        const last = c.messages[c.messages.length - 1];
        c.lastMessage = last?.text?.body || "[Unsupported]";
        c.lastTimestamp = last
          ? new Date(parseInt(last.timestamp || 0) * 1000).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "";
        return c;
      })
      .sort(
        (a, b) =>
          parseInt(b.messages[b.messages.length - 1]?.timestamp || 0) -
          parseInt(a.messages[a.messages.length - 1]?.timestamp || 0)
      );
    return arr;
  });

  // Update selectedChat if message belongs to current chat
  setSelectedChat((prev) => {
    if (!prev) return prev;
    const wa = msg.wa_id || msg.from || "unknown";
    if (prev.wa_id !== wa) return prev;

    const newMessages = [...(prev.messages || []), msg].sort(
      (a, b) => parseInt(a.timestamp || 0) - parseInt(b.timestamp || 0)
    );
    return { ...prev, messages: newMessages };
  });

  if (window.innerWidth < 768) setShowSidebar(false);
}


  function handleNewChat() {
    const wa_id = prompt("Enter WhatsApp ID or phone number for new chat:");
    if (!wa_id) return;

    setConversations((prev) => {
      if (prev.find((c) => c.wa_id === wa_id)) return prev;
      const newChat = { wa_id, name: wa_id, messages: [] };
      return [newChat, ...prev];
    });
    setSelectedChat({ wa_id, name: wa_id, messages: [] });
    if (window.innerWidth < 768) setShowSidebar(false);
  }

  function handleSelect(chat) {
    setSelectedChat(chat);
    if (window.innerWidth < 768) setShowSidebar(false);
  }

  // Toggle dark mode and save preference
  function toggleDarkMode() {
    setDarkMode((prev) => {
      localStorage.setItem("darkMode", JSON.stringify(!prev));
      return !prev;
    });
  }

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      } flex h-screen overflow-hidden`}
    >
      {(showSidebar || window.innerWidth >= 768) && (
        <div className="w-full md:w-80 border-r border-gray-700">
          <Sidebar
            chats={conversations}
            selectedChat={selectedChat}
            onSelect={handleSelect}
            onNewChat={handleNewChat}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
        </div>
      )}

      {(!showSidebar || window.innerWidth >= 768) && (
        <div className="flex-grow">
          <ChatWindow
            chat={selectedChat}
            onLocalMessage={handleLocalMessage}
            onBack={() => setShowSidebar(true)}
            darkMode={darkMode}
          />
        </div>
      )}
    </div>
  );
}
