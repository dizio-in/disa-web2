import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, Archive, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import LeftSidebar from "@/components/chat/LeftSidebar";
import ChatContent from "@/components/chat/ChatContent";
import RightSidebar from "@/components/chat/RightSidebar";
import type { Chat } from "@/types/chat";
import { API_URL, API_ENDPOINTS } from "@/constants/api";

export default function MessengerPage() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { isAuthenticated, isLoading, logout, accessToken, user } = useAuth();
  
  console.log("Auth state:", { isAuthenticated, isLoading, hasToken: !!accessToken, user });
  const [, setLocation] = useLocation();

  // Redirect to login if not authenticated (only after loading is complete)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Define the Disa chat response interface based on the React Native code
  interface DisaChatResponse {
    chat_id: string;
    creator_name: string;
    group_icon_url?: string;
    skills: string;
    is_creator: boolean;
    created_at: string;
  }

  // Fetch chats from Disa API
  const { data: disaChats = [], isLoading: chatsLoading, error: chatsError, refetch } = useQuery<DisaChatResponse[]>({
    queryKey: ["/disa/allchats"],
    queryFn: async () => {
      console.log("🚀 Fetching chats from Disa API...");
      console.log("🔐 Access token available:", !!accessToken);
      console.log("🌐 API URL:", `${API_URL}${API_ENDPOINTS.allChats}`);
      console.log("🎫 Access token (first 20 chars):", accessToken?.substring(0, 20) + "...");
      
      if (!accessToken) {
        console.error("❌ No access token available");
        throw new Error("No access token available");
      }

      const response = await fetch(`${API_URL}${API_ENDPOINTS.allChats}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        },
      });

      console.log("📡 Response status:", response.status);
      console.log("📋 Response OK:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("💥 API Error:", errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Received data:", data);
      console.log("📊 Data is array:", Array.isArray(data));
      console.log("📈 Data length:", Array.isArray(data) ? data.length : 'N/A');
      
      return Array.isArray(data) ? data : [];
    },
    enabled: isAuthenticated && !!accessToken,
    staleTime: 30000, // Cache for 30 seconds like in the React Native version
    retry: 2,
  });

  // Transform Disa chat data to our Chat interface
  const chats: Chat[] = disaChats.map((chat) => {
    console.log("Processing chat:", chat);
    return {
      id: chat.chat_id,
      name: chat.creator_name || "Unknown Creator",
      isGroup: false,
      avatar: chat.group_icon_url || "https://raw.githubusercontent.com/dizio-in/cdn/refs/heads/main/images/group-icon.png",
      participants: [], // We don't have this data from the Disa API
      createdAt: new Date(chat.created_at),
      updatedAt: new Date(chat.created_at),
      lastMessage: {
        id: "last-msg",
        chatId: chat.chat_id,
        senderId: "system",
        content: chat.skills || "No skills defined",
        messageType: "text",
        isRead: true,
        createdAt: new Date(chat.created_at),
      },
      messageCount: 0,
    };
  });

  // Filter chats based on search term (similar to React Native code)
  const filteredChats = chats.filter((chat) => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = chat.name?.toLowerCase().includes(searchLower);
    const messageMatch = chat.lastMessage?.content.toLowerCase().includes(searchLower);
    
    return nameMatch || messageMatch;
  });

  console.log("Raw disaChats from API:", disaChats);
  console.log("Number of disaChats:", disaChats.length);
  console.log("Transformed chats:", chats);
  console.log("Number of transformed chats:", chats.length);
  console.log("Filtered chats:", filteredChats);
  console.log("Number of filtered chats:", filteredChats.length);

  // Set the first chat as active if none is selected and chats are available
  useEffect(() => {
    if (filteredChats.length > 0 && !activeChatId) {
      setActiveChatId(filteredChats[0].id);
    }
  }, [filteredChats, activeChatId]);

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const activeChat = filteredChats.find((chat) => chat.id === activeChatId);

  // Show loading if authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading if not authenticated (redirect is happening)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }




  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Left Sidebar */}
      {/* Left Sidebar */}
      <div
        className={`w-80 bg-white border-r border-messenger-gray ${showMobileSidebar ? "flex" : "hidden"} lg:flex flex-col h-full`}
      >
        {/* Chat List or Loading/Error States */}
        <div className="flex-1 overflow-y-auto">
          {chatsLoading ? (
            <div className="flex items-center justify-center h-full">
              {/* Loading... */}
            </div>
          ) : chatsError ? (
            <div className="flex items-center justify-center h-full">
              {/* Error state */}
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              {/* Empty state */}
            </div>
          ) : (
            <LeftSidebar
              chats={filteredChats}
              activeChatId={activeChatId}
              onChatSelect={setActiveChatId}
              onCloseMobile={() => setShowMobileSidebar(false)}
            />
          )}
        </div>

        {/* User Actions (stick to bottom) */}
       


        <div className="border-t border-messenger-gray p-4 space-y-2 shrink-0">
          {/* Add Friends Button */}
          <Button className="w-full bg-messenger-blue text-white hover:bg-blue-600">
             <Plus className="h-4 w-4 mr-2" />
            Create Chat
          </Button>
        </div>
      </div>


      {/* Center Chat Content */}
      <div className="flex-1 flex flex-col bg-white overflow-y-auto">
        <ChatContent
          activeChat={activeChat}
          onShowMobileMenu={() => setShowMobileSidebar(true)}
        />
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-white border-l border-messenger-gray lg:flex flex-col hidden overflow-y-auto">
        <RightSidebar activeChat={activeChat || null} />
      </div>
    </div>
  );

}
