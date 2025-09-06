export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  description?: string | null;
  isOnline: boolean | null;
  lastSeen: Date | null;
  createdAt: Date | null;
}

export interface Chat {
  id: string;
  name?: string | null;
  isGroup: boolean | null;
  avatar?: string | null;
  participants: string[];
  createdAt: Date | null;
  updatedAt: Date | null;
  participant?: User;
  lastMessage?: Message;
  messageCount?: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  messageType: string | null;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  isRead: boolean | null;
  createdAt: Date | string;
  sender?: User;
}

export interface SharedFile {
  id: string;
  chatId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: string;
  uploadedBy: string;
  createdAt: Date | string;
}

export interface ChatSettings {
  id?: string;
  chatId: string;
  userId: string;
  notifications: boolean | null;
  starred: boolean | null;
  taskLinks: boolean | null;
}