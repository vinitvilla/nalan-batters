import { create } from "zustand";

interface ContactMessage {
  id: string;
  name: string;
  mobile: string;
  message: string;
  status: "NEW" | "READ" | "INPROGRESS" | "RESOLVED";
  createdAt: string;
  updatedAt: string;
}

interface ContactMessagesState {
  messages: ContactMessage[];
  newMessagesCount: number;
  loading: boolean;
  error: string | null;
  setMessages: (messages: ContactMessage[]) => void;
  updateMessage: (id: string, updates: Partial<ContactMessage>) => void;
  deleteMessage: (id: string) => void;
  addMessage: (message: ContactMessage) => void;
  setNewMessagesCount: (count: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  incrementNewMessages: () => void;
  decrementNewMessages: () => void;
}

export const useContactMessagesStore = create<ContactMessagesState>((set, get) => ({
  messages: [],
  newMessagesCount: 0,
  loading: false,
  error: null,

  setMessages: (messages) => {
    const newCount = messages.filter(m => m.status === "NEW").length;
    set({ messages, newMessagesCount: newCount });
  },

  updateMessage: (id, updates) => {
    const messages = get().messages;
    const updatedMessages = messages.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    );
    
    // Recalculate new count
    const newCount = updatedMessages.filter(m => m.status === "NEW").length;
    set({ messages: updatedMessages, newMessagesCount: newCount });
  },

  deleteMessage: (id) => {
    const messages = get().messages;
    const updatedMessages = messages.filter(msg => msg.id !== id);
    const newCount = updatedMessages.filter(m => m.status === "NEW").length;
    set({ messages: updatedMessages, newMessagesCount: newCount });
  },

  addMessage: (message) => {
    const messages = get().messages;
    const updatedMessages = [message, ...messages];
    const newCount = updatedMessages.filter(m => m.status === "NEW").length;
    set({ messages: updatedMessages, newMessagesCount: newCount });
  },

  setNewMessagesCount: (count) => set({ newMessagesCount: count }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),

  incrementNewMessages: () => set(state => ({ 
    newMessagesCount: state.newMessagesCount + 1 
  })),

  decrementNewMessages: () => set(state => ({ 
    newMessagesCount: Math.max(0, state.newMessagesCount - 1) 
  })),
}));
