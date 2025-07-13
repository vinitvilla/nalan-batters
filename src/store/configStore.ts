import { create } from "zustand";

interface ConfigState {
  configs: Record<string, any>;
  setConfig: (title: string, value: any) => void;
  loadConfig: (title: string) => Promise<void>;
  loadAllConfigs: () => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  configs: {},
  setConfig: (title, value) => set((state) => ({ configs: { ...state.configs, [title]: value } })),
  loadConfig: async (title) => {
    if (get().configs[title]) return; // Already loaded
    const res = await fetch(`/api/public/config?title=${title}`);
    if (!res.ok) return;
    const data = await res.json();
    set((state) => ({ configs: { ...state.configs, [title]: data[title] } }));
  },
  loadAllConfigs: async () => {
    const res = await fetch("/api/public/config");
    if (!res.ok) return;
    const data = await res.json();
    set((state) => ({ configs: { ...state.configs, ...data }}));
  }
}));
