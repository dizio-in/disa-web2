export const API_URL = "https://mtrytz6yai.execute-api.eu-north-1.amazonaws.com";

export const API_ENDPOINTS = {
  allChats: "/allchats",
  chatMessages: "/chats", // For fetching messages: /chats/{chat_id}/messages
  signin: "/signin",
  sendOtp: "/send-otp",
  requestOtp: "/request-otp",
} as const;