import React, { useState } from "react";
import ChatList from "./ChatList";

export default function ChatSidebar({ chats, selectedChat, onSelect, onNewChat, darkMode, toggleDarkMode }) {
  const [search, setSearch] = useState("");

  const filteredChats = chats.filter(chat =>
    (chat.name || chat.wa_id).toLowerCase().includes(search.toLowerCase())
  );

  const bgClass = darkMode ? "bg-gray-900 text-white" : "bg-white text-black border-gray-300";
  const borderClass = darkMode ? "border-gray-800" : "border-gray-200";
  const inputBgClass = darkMode ? "bg-gray-800 placeholder-gray-400 text-white" : "bg-gray-100 placeholder-gray-600 text-black";

  return (
    <div className={`w-full md:w-80 flex flex-col h-screen border-r ${borderClass} ${bgClass}`}>
      <header className={`p-4 flex items-center justify-between border-b ${borderClass}`}>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">WhatsApp</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle Dark Mode"
            className={`p-2 rounded hover:bg-gray-700 focus:outline-none ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-300"}`}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.485-9h1M4.515 12h1m14.364 6.364l.707.707M5.636 5.636l.707.707m12.728 12.728l.707-.707M6.343 17.657l.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>

          <button onClick={onNewChat} className={`rounded p-1 hover:bg-gray-700 ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-300"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${darkMode ? "text-white" : "text-black"}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
      </header>

      <div className={`p-3 border-b ${borderClass}`}>
        <input
          type="text"
          placeholder="Search or start a new chat"
          className={`w-full rounded px-3 py-2 focus:outline-none ${inputBgClass}`}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <ChatList chats={filteredChats} selectedChat={selectedChat} onSelect={onSelect} darkMode={darkMode}/>
    </div>
  );
}
