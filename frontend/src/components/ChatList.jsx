import React from "react";

export default function ChatList({ chats, selectedChat, onSelect }) {
  return (
    <div className="flex-1 overflow-y-auto">
      {chats.map((chat) => (
        <div
          key={chat.wa_id}
          onClick={() => onSelect(chat)}
          className={`flex items-center px-4 py-3 cursor-pointer hover:bg-gray-800 transition ${selectedChat?.wa_id === chat.wa_id ? "bg-gray-800" : "bg-gray-900"}`}
        >
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold text-white">
            {chat.name?.charAt(0) || chat.wa_id.charAt(0)}
          </div>

          <div className="ml-3 flex-grow min-w-0">
            <div className="flex justify-between items-center">
              <div className="font-semibold text-white truncate">{chat.name || chat.wa_id}</div>
              <div className="text-xs text-gray-400 ml-2">{chat.lastTimestamp}</div>
            </div>
            <div className="text-sm text-gray-400 truncate max-w-full">
              {chat.lastMessage}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
