import React from "react";

export default function ChatList({ chats, selectedChat, onSelect, darkMode }) {
  return (
    <div className="flex-1 overflow-y-auto">
      {chats.map((chat) => {
        const isSelected = selectedChat?.wa_id === chat.wa_id;

        const bgClass = isSelected
          ? darkMode ? "bg-gray-800" : "bg-gray-300"
          : darkMode ? "bg-gray-900 hover:bg-gray-800" : "bg-white hover:bg-gray-200";

        const textPrimaryClass = darkMode ? "text-white" : "text-black";
        const textSecondaryClass = darkMode ? "text-gray-400" : "text-gray-600";
        const avatarBgClass = darkMode ? "bg-gray-700 text-white" : "bg-gray-300 text-black";

        return (
          <div
            key={chat.wa_id}
            onClick={() => onSelect(chat)}
            className={`flex items-center px-4 py-3 cursor-pointer transition ${bgClass}`}
          >
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${avatarBgClass}`}
            >
              {chat.name?.charAt(0) || chat.wa_id.charAt(0)}
            </div>

            <div className="ml-3 flex-grow min-w-0">
              <div className="flex justify-between items-center">
                <div className={`font-semibold truncate ${textPrimaryClass}`}>
                  {chat.name || chat.wa_id}
                </div>
                <div className={`text-xs ml-2 ${textSecondaryClass}`}>
                  {chat.lastTimestamp}
                </div>
              </div>
              <div className={`text-sm truncate max-w-full ${textSecondaryClass}`}>
                {chat.lastMessage}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
