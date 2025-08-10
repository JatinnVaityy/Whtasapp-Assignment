import React, { useState } from "react";
import ChatList from "./ChatList";

export default function Sidebar({ chats, selectedChat, onSelect, onNewChat }) {
  const [search, setSearch] = useState("");

  const filteredChats = chats.filter(chat => 
    (chat.name || chat.wa_id).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full md:w-80 bg-gray-900 text-white flex flex-col h-screen border-r border-gray-800">
      <header className="p-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-3">

          <h1 className="text-xl font-bold">WhatsApp</h1>
        </div>
        
        <div>
          <button onClick={onNewChat} className="hover:bg-gray-800 rounded p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
          </button>
        </div>
      </header>

      <div className="p-3 border-b border-gray-800">
        <input
          type="text"
          placeholder="Search or start a new chat"
          className="w-full rounded bg-gray-800 px-3 py-2 placeholder-gray-400 focus:outline-none"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <ChatList chats={filteredChats} selectedChat={selectedChat} onSelect={onSelect} />
    </div>
  );
}
