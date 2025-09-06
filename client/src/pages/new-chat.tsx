import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Lightbulb, MessageCircle, Loader2, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { API_URL, API_ENDPOINTS } from "@/constants/api";

const newChatSchema = z.object({
  name: z.string().min(1, "Chat name is required"),
  description: z.string().optional(),
});

type NewChatFormData = z.infer<typeof newChatSchema>;

interface UserData {
  industry?: string;
  specialization?: string;
  checklist?: string;
}

export default function NewChatPage() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData>({});
  const [templateChecklist, setTemplateChecklist] = useState("");
  const { accessToken, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const form = useForm<NewChatFormData>({
    resolver: zodResolver(newChatSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }

    // Fetch user data from localStorage (similar to React Native AsyncStorage)
    const fetchUserData = () => {
      const storedData = localStorage.getItem("userData");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setUserData(parsedData);
          setTemplateChecklist(parsedData.checklist || "");
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated, setLocation]);

  const createNewChat = async (data: NewChatFormData) => {
    if (!accessToken) {
      toast({
        title: "Authentication Error",
        description: "Please log in again",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", data.name.trim());
      
      if (data.description?.trim()) {
        formData.append("description", data.description.trim());
      }

      const welcomeMessage = "Checklist \n" + templateChecklist;
      formData.append("welcome_message", welcomeMessage.trim());

      // Include the industry as templates_id
      if (userData.industry && userData.specialization) {
        formData.append(
          "templates_id",
          userData.industry + " - " + userData.specialization
        );
      }

      const response = await fetch(`${API_URL}/chats`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      if (responseData.chat_id) {
        // Store default message locally
        const newMessage = {
          message_id: Date.now().toString(),
          sender_name: "Disa AI",
          message: "Checklist \n" + templateChecklist,
          sent_at: new Date().toISOString(),
        };

        // Store in localStorage (web equivalent of AsyncStorage)
        const chatMessagesKey = `chat_messages_${responseData.chat_id}`;
        localStorage.setItem(chatMessagesKey, JSON.stringify([newMessage]));

        toast({
          title: "Chat Created Successfully",
          description: `${data.name} has been created`,
        });

        // Navigate to the new chat (implement this based on your routing)
        setLocation("/");
      } else {
        throw new Error("Chat creation response did not include a chat_id");
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast({
        title: "Error Creating Chat",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">Create New Chat</CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Start a new conversation with AI assistance
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* User Skills Section */}
          {userData.industry && userData.specialization && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{userData.industry}</p>
                    <p className="text-lg font-semibold text-gray-900">{userData.specialization}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chat Creation Form */}
          <form onSubmit={form.handleSubmit(createNewChat)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Chat Name *</Label>
              <Input
                id="name"
                placeholder="Enter chat name"
                className="h-12"
                data-testid="input-chat-name"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Additional Information (optional)</Label>
              <Textarea
                id="description"
                placeholder="You can include extra details such as a phone number or other contact information if needed."
                className="min-h-[100px]"
                data-testid="input-description"
                {...form.register("description")}
              />
              <p className="text-sm text-gray-500">
                You can include extra details such as a phone number or other contact information if needed.
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <Link href="/" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12"
                  data-testid="button-cancel"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </Link>

              <Button
                type="submit"
                className="flex-1 h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                disabled={loading}
                data-testid="button-create-chat"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Chat
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}