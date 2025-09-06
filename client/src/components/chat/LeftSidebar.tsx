import { useState } from "react";
import { Search, Plus, Hash, Code, UserPlus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ChatItem from "./ChatItem";

import type { Chat } from "@/types/chat";

interface LeftSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onCloseMobile?: () => void;
}

export default function LeftSidebar({
  chats,
  activeChatId,
  onChatSelect,
  onCloseMobile,
}: LeftSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true;
    // Search by chat name (creator_name from Disa API)
    return chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           chat.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatTimestamp = (date: Date | string) => {
    const now = new Date();
    const messageDate = typeof date === "string" ? new Date(date) : date;

    if (!messageDate || isNaN(messageDate.getTime())) {
      return "";
    }

    const diff = now.getTime() - messageDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-messenger-gray">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-messenger-dark">
            Disa Chats
          </h1>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              className="p-2 hover:bg-messenger-bg rounded-full"
            >
              <Plus className="h-4 w-4 text-messenger-secondary" />
            </Button>

            {onCloseMobile && (
              <Button
                size="sm"
                variant="ghost"
                className="p-2 lg:hidden"
                onClick={onCloseMobile}
              >
                <X className="h-4 w-4 text-messenger-secondary" />
              </Button>
            )}
          </div>
        </div>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search chats"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-messenger-bg border-none rounded-full focus:ring-2 focus:ring-messenger-blue"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-messenger-secondary" />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filteredChats.map((chat) => (
          <ChatItem
            key={chat.id}
            chat={chat}
            isActive={chat.id === activeChatId}
            onClick={() => onChatSelect(chat.id)}
            timestamp={
              chat.lastMessage
                ? formatTimestamp(chat.lastMessage.createdAt)
                : ""
            }
          />
        ))}
      </div>

     
    </div>
  );
}
