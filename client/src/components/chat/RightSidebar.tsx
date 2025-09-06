import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, 
  Copy, 
  Share2, 
  Trash2, 
  Flag, 
  Settings,
  UserPlus,
  UserMinus,
  Ban,
  Shield,
} from "lucide-react";
import type { Chat } from "@/types/chat";
import { API_URL, API_ENDPOINTS } from "@/constants/api";

interface RightSidebarProps {
  activeChat: Chat | null;
  className?: string;
}

interface ChatUser {
  id: number;
  name: string;
  member_status: boolean;
  blocked: boolean;
}

export default function RightSidebar({ activeChat, className }: RightSidebarProps) {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showMemberList, setShowMemberList] = useState(false);
  const [showBlockList, setShowBlockList] = useState(false);

  // Fetch chat members
  const { data: chatMembers = [], isLoading: membersLoading } = useQuery({
    queryKey: ['/api/chats', activeChat?.id, 'users'],
    queryFn: async () => {
      if (!activeChat?.id || !accessToken) return [];
      const response = await fetch(`${API_URL}/chats/${activeChat.id}/users`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch chat members');
      return response.json();
    },
    enabled: !!activeChat?.id && !!accessToken && showMemberList,
  });

  // Copy conversation mutation
  const copyConversationMutation = useMutation({
    mutationFn: async () => {
      if (!activeChat?.id || !accessToken) throw new Error('No active chat');
      
      const response = await fetch(`${API_URL}/chats/${activeChat.id}/messages`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch messages');
      const messages = await response.json();
      
      const chatText = messages
        .map((msg: any) => `${msg.sender_name}: ${msg.message}`)
        .join('\n');
      
      await navigator.clipboard.writeText(chatText);
      return chatText;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Conversation copied to clipboard",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to copy conversation",
        variant: "destructive",
      });
    },
  });

  // Share conversation mutation
  const shareConversationMutation = useMutation({
    mutationFn: async () => {
      if (!activeChat?.id || !accessToken) throw new Error('No active chat');
      
      const response = await fetch(`${API_URL}/chats/${activeChat.id}/messages`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch messages');
      const messages = await response.json();
      
      const chatText = messages
        .map((msg: any) => `${msg.sender_name}: ${msg.message}`)
        .join('\n');
      
      if (navigator.share) {
        await navigator.share({
          title: `Chat with ${activeChat.name}`,
          text: chatText,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(chatText);
        throw new Error('Share API not supported, copied to clipboard instead');
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Conversation shared successfully",
      });
    },
    onError: (error) => {
      if (error.message.includes('clipboard')) {
        toast({
          title: "Shared via clipboard",
          description: "Share API not available, conversation copied to clipboard",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to share conversation",
          variant: "destructive",
        });
      }
    },
  });

  // Delete chat mutation
  const deleteChatMutation = useMutation({
    mutationFn: async () => {
      if (!activeChat?.id || !accessToken) throw new Error('No active chat');
      
      const response = await fetch(`${API_URL}/chats/${activeChat.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to delete chat');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
      toast({
        title: "Success",
        description: "Chat deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive",
      });
    },
  });

  // Report chat mutation
  const reportChatMutation = useMutation({
    mutationFn: async () => {
      if (!activeChat?.id || !accessToken) throw new Error('No active chat');
      
      const response = await fetch(`${API_URL}/chats/${activeChat.id}/report`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report_type: 'CHAT',
          chat_id: activeChat.id,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to report chat');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Chat reported successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to report chat",
        variant: "destructive",
      });
    },
  });

  const handleCopyConversation = () => {
    copyConversationMutation.mutate();
  };

  const handleShareConversation = () => {
    shareConversationMutation.mutate();
  };

  const handleDeleteChat = () => {
    if (window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      deleteChatMutation.mutate();
    }
  };

  const handleReportChat = () => {
    if (window.confirm('This chat will be reported to the Disa Team for review. Do you want to proceed?')) {
      reportChatMutation.mutate();
    }
  };

  if (!activeChat) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <div className="text-center text-gray-500">
          <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Select a chat to view settings</p>
        </div>
      </div>
    );
  }

  const displayName = activeChat.name || "Unknown Chat";

  return (
    <div className={`${className} bg-white border-l border-gray-200 overflow-y-auto`}>
      <ScrollArea className="h-full">
         <span style={{whiteSpace: 'pre'}}>{"\n"}</span>
        <div className="p-3 space-y-3">
          {/* Chat Header */}
          <div className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src={activeChat.avatar || undefined} alt={displayName} />
              <AvatarFallback className="text-2xl">
                {displayName.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold text-gray-900">{displayName}</h2>
            
          </div>

         

          {/* Chat Info */}
          <Card>
            <span style={{whiteSpace: 'pre'}}>{"\n"}</span>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Reference ID
                </label>
                <p className="mt-1 text-sm text-gray-900">{activeChat.id}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Skills
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {typeof activeChat.lastMessage === 'string' 
                    ? activeChat.lastMessage 
                    : activeChat.lastMessage?.content || "No skills specified"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Chat Members */}
          <Card>
            <span style={{whiteSpace: 'pre'}}>{"\n"}</span>
            <CardContent>
              <Dialog open={showMemberList} onOpenChange={setShowMemberList}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full" size="sm">
                    <Users className="w-4 h-4 mr-2" />
                    Add / Remove Members
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Chat Members</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="max-h-96">
                    {membersLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    ) : chatMembers.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No members found</p>
                    ) : (
                      <div className="space-y-2">
                        {chatMembers.map((member: ChatUser) => (
                          <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="text-xs">
                                  {member.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{member.name}</span>
                            </div>
                            <Badge variant={member.member_status ? "default" : "secondary"}>
                              {member.member_status ? "Member" : "Not Member"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                size="sm"
                onClick={handleCopyConversation}
                disabled={copyConversationMutation.isPending}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Conversation
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                size="sm"
                onClick={handleShareConversation}
                disabled={shareConversationMutation.isPending}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Export Conversation
              </Button>
              
              
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
                size="sm"
                onClick={handleDeleteChat}
                disabled={deleteChatMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Conversation
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
                size="sm"
                onClick={handleReportChat}
                disabled={reportChatMutation.isPending}
              >
                <Flag className="w-4 h-4 mr-2" />
                Report and Block
              </Button>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}