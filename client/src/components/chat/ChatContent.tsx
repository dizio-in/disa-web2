import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Phone,
  Video,
  Info,
  Plus,
  Image,
  ThumbsUp,
  Send,
  Infinity,
  ArrowUp,
  Paperclip,
  Mic,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import MessageBubble from "./MessageBubble";
import { useAuth } from "@/contexts/AuthContext";
import { API_URL, API_ENDPOINTS } from "@/constants/api";
import type { Chat, Message } from "@/types/chat";

interface ChatContentProps {
  activeChat?: Chat;
  onShowMobileMenu: () => void;
}

// Define the Disa message response interface based on actual API response
interface DisaMessageResponse {
  message_id: number;
  message: string; // The actual field name in the API
  sent_at: string; // The actual field name for timestamp
  sender_name: string;
  sender_id: number;
  feedback: any;
}

export default function ChatContent({
  activeChat,
  onShowMobileMenu,
}: ChatContentProps) {
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { accessToken } = useAuth();

  // Fetch messages from Disa API
  const {
    data: disaMessages = [],
    isLoading: messagesLoading,
    error: messagesError,
  } = useQuery<DisaMessageResponse[]>({
    queryKey: ["/disa/chat-messages", activeChat?.id],
    queryFn: async () => {
      if (!accessToken || !activeChat?.id) {
        throw new Error("No access token or chat ID available");
      }

      console.log("🔄 Fetching messages for chat:", activeChat.id);
      const response = await fetch(
        `${API_URL}${API_ENDPOINTS.chatMessages}/${activeChat.id}/messages`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("💥 Messages API Error:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`,
        );
      }

      const data = await response.json();
      console.log("✅ Received messages:", data);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!activeChat?.id && !!accessToken,
    staleTime: 10000, // Cache for 10 seconds
  });

  // Transform Disa message data to our Message interface
  const messages: Message[] = disaMessages.map((msg) => {
    console.log("Processing message:", msg);
    console.log("Message content:", msg.message);
    console.log("Message sent_at:", msg.sent_at);

    // Parse the date correctly from the API format
    let messageDate: Date;
    try {
      messageDate = new Date(msg.sent_at);
      if (isNaN(messageDate.getTime())) {
        messageDate = new Date();
      }
    } catch {
      messageDate = new Date();
    }

    return {
      id: msg.message_id.toString(),
      chatId: activeChat?.id || "",
      senderId: msg.sender_id.toString(),
      content: msg.message || "No content",
      messageType: "text",
      isRead: true,
      createdAt: messageDate,
      sender: {
        id: msg.sender_id.toString(),
        username: msg.sender_name || "Unknown",
        email: "",
        isOnline: null,
        lastSeen: null,
        createdAt: null,
      },
    };
  });

  console.log("Transformed messages count:", messages.length);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest(
        "POST",
        `/api/chats/${activeChat?.id}/messages`,
        {
          content,
          messageType: "text",
        },
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/chats", activeChat?.id, "messages"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
      setMessageText("");
    },
  });

  const handleSendMessage = () => {
    if (messageText.trim() && activeChat?.id) {
      sendMessageMutation.mutate(messageText.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!activeChat) {
    return (
      <div className="flex items-center justify-center h-full bg-messenger-bg">
        <div className="text-center">
          <div className="w-20 h-20 bg-messenger-gray rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-10 h-10 bg-messenger-blue rounded-full"></div>
          </div>
          <h3 className="text-xl font-semibold text-messenger-dark mb-2">
            Select a chat
          </h3>
          <p className="text-messenger-secondary">
            Choose a conversation to start messaging
          </p>
        </div>
      </div>
    );
  }

  // Use chat name from Disa API instead of participant
  const displayName = activeChat.name || "Unknown User";

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-messenger-gray bg-white">
        <div className="flex items-center">
          <Button
            size="sm"
            variant="ghost"
            className="lg:hidden p-2 hover:bg-messenger-bg rounded-full mr-2"
            onClick={onShowMobileMenu}
          >
            <ArrowLeft className="h-4 w-4 text-messenger-secondary" />
          </Button>
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={activeChat.avatar || undefined}
                alt={displayName}
              />
              <AvatarFallback>
                {displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="ml-3">
            <h2 className="font-medium text-messenger-dark">{displayName}</h2>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            className="p-2 hover:bg-messenger-bg rounded-full"
          >
            <Infinity className="h-4 w-4 text-messenger-blue" />
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-messenger-bg">
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading messages...</p>
            </div>
          </div>
        ) : messagesError ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-red-600">
              <p>Failed to load messages</p>
              <p className="text-sm text-gray-500 mt-1">
                {messagesError.message}
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-600">No messages yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Start the conversation!
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-messenger-gray bg-white">
        <div className="flex items-end space-x-3">
          <Button
            size="sm"
            variant="ghost"
            className="p-2 hover:bg-messenger-bg rounded-full"
          >
            <Mic className="h-4 w-4 text-messenger-blue" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="p-2 hover:bg-messenger-bg rounded-full"
          >
            <Paperclip className="h-4 w-4 text-messenger-blue" />
          </Button>
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="px-4 py-3 bg-messenger-bg border-none rounded-full focus:ring-2 focus:ring-messenger-blue pr-12"
              disabled={sendMessageMutation.isPending}
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-messenger-blue hover:text-blue-600 p-1"
              onClick={handleSendMessage}
              disabled={!messageText.trim() || sendMessageMutation.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="p-2 hover:bg-messenger-bg rounded-full"
          >
            <ArrowUp className="h-4 w-4 text-messenger-blue" />
          </Button>
        </div>
      </div>
    </div>
  );
}
