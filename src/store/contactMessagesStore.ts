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
  loading: boolean;
  error: string | null;
  setMessages: (messages: ContactMessage[]) => void;
  updateMessage: (id: string, updates: Partial<ContactMessage>) => void;
  deleteMessage: (id: string) => void;
  addMessage: (message: ContactMessage) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useContactMessagesStore = create<ContactMessagesState>((set, get) => ({
  messages: [],
  loading: false,
  error: null,

  setMessages: (messages) => set({ messages }),

  updateMessage: (id, updates) => {
    const messages = get().messages;
    const updatedMessages = messages.map(msg =>
      msg.id === id ? { ...msg, ...updates } : msg
    );
    set({ messages: updatedMessages });
  },

  deleteMessage: (id) => {
    const messages = get().messages;
    const updatedMessages = messages.filter(msg => msg.id !== id);
    set({ messages: updatedMessages });
  },

  addMessage: (message) => {
    const messages = get().messages;
    const updatedMessages = [message, ...messages];
    set({ messages: updatedMessages });
  },

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),
}));
