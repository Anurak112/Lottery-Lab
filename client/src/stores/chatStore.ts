import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  source: 'website' | 'youtube';
  avatar?: string;
  isOwner?: boolean;
}

interface ChatState {
  // Messages
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  addMessages: (messages: ChatMessage[]) => void;
  clearMessages: () => void;
  
  // Connection Status
  isConnected: boolean;
  setConnected: (connected: boolean) => void;
  
  // Active Tab
  activeTab: 'youtube' | 'website' | 'all';
  setActiveTab: (tab: 'youtube' | 'website' | 'all') => void;
  
  // User Info (for guest users)
  guestName: string;
  setGuestName: (name: string) => void;
  
  // Typing Indicator
  typingUsers: string[];
  addTypingUser: (username: string) => void;
  removeTypingUser: (username: string) => void;
  
  // Unread Count
  unreadCount: number;
  incrementUnread: () => void;
  resetUnread: () => void;
  
  // Scroll State
  isAtBottom: boolean;
  setIsAtBottom: (atBottom: boolean) => void;
}

const MAX_MESSAGES = 100;

export const useChatStore = create<ChatState>((set, get) => ({
  // Messages
  messages: [],
  addMessage: (message) => set((state) => {
    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    const messages = [...state.messages, newMessage].slice(-MAX_MESSAGES);
    return { 
      messages,
      unreadCount: state.isAtBottom ? state.unreadCount : state.unreadCount + 1
    };
  }),
  addMessages: (newMessages) => set((state) => {
    const messages = [...state.messages, ...newMessages].slice(-MAX_MESSAGES);
    return { messages };
  }),
  clearMessages: () => set({ messages: [] }),
  
  // Connection Status
  isConnected: false,
  setConnected: (isConnected) => set({ isConnected }),
  
  // Active Tab
  activeTab: 'youtube',
  setActiveTab: (activeTab) => set({ activeTab }),
  
  // User Info
  guestName: '',
  setGuestName: (guestName) => set({ guestName }),
  
  // Typing Indicator
  typingUsers: [],
  addTypingUser: (username) => set((state) => ({
    typingUsers: state.typingUsers.includes(username) 
      ? state.typingUsers 
      : [...state.typingUsers, username]
  })),
  removeTypingUser: (username) => set((state) => ({
    typingUsers: state.typingUsers.filter((u) => u !== username)
  })),
  
  // Unread Count
  unreadCount: 0,
  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  resetUnread: () => set({ unreadCount: 0 }),
  
  // Scroll State
  isAtBottom: true,
  setIsAtBottom: (isAtBottom) => set({ isAtBottom }),
}));
