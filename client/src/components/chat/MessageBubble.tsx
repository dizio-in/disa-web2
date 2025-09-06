import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { Message } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  console.log("Rendering message:", message);
  
  const isCurrentUser = message.senderId === "currentUser"; // This might need to be dynamic
  
  // Better date handling
  let timestamp = "Invalid Date";
  try {
    const date = new Date(message.createdAt);
    if (!isNaN(date.getTime())) {
      timestamp = date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  } catch (error) {
    console.error("Date parsing error:", error);
  }

  const displayName = message.sender?.username || "Unknown User";

  if (isCurrentUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-xs lg:max-w-md">
          <div className="chat-bubble-sent inline-block p-3 rounded-2xl">
            <p className="text-white text-sm">{message.content}</p>
            {message.messageType === "image" && message.attachmentUrl && (
              <img 
                src={message.attachmentUrl} 
                alt={message.attachmentName || "Image"} 
                className="rounded-lg w-full h-auto mt-2"
              />
            )}
          </div>
          <p className="text-xs text-messenger-secondary mt-1 text-right mr-3">{timestamp}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start space-x-2">
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={message.sender?.avatar || undefined} alt={displayName} />
        <AvatarFallback>{displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="chat-bubble-received inline-block p-3 rounded-2xl max-w-xs lg:max-w-md">
          <p className="text-messenger-dark text-sm">{message.content}</p>
          {message.messageType === "image" && message.attachmentUrl && (
            <img 
              src={message.attachmentUrl} 
              alt={message.attachmentName || "Image"} 
              className="rounded-lg w-full h-auto mt-2"
            />
          )}
        </div>
        <p className="text-xs text-messenger-secondary mt-1 ml-3">{timestamp}</p>
      </div>
    </div>
  );
}
