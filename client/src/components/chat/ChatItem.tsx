import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { Chat } from "@/types/chat";

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
  timestamp: string;
}

export default function ChatItem({ chat, isActive, onClick, timestamp }: ChatItemProps) {
  const { name, lastMessage, avatar } = chat;

  if (!name) return null;

  const displayName = name || 'Unknown User';

  return (
    <div
      className={`flex items-center p-3 hover:bg-messenger-bg cursor-pointer transition-colors ${
        isActive ? 'bg-blue-50 border-r-2 border-messenger-blue' : ''
      }`}
      onClick={onClick}
    >
      <div className="relative">
        <Avatar className="w-12 h-12">
          <AvatarImage src={avatar || undefined} alt={displayName} />
          <AvatarFallback>{displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        {/* Note: isOnline status not available from Disa API */}
      </div>
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-messenger-dark truncate">{displayName}</h3>
          <span className={`text-xs ml-2 flex-shrink-0 ${
            isActive ? 'text-messenger-blue' : 'text-messenger-secondary'
          }`}>
            {timestamp}
          </span>
        </div>
        <p className="text-sm text-messenger-secondary truncate">
          {lastMessage?.content || "No messages yet"}
        </p>
      </div>
    </div>
  );
}
