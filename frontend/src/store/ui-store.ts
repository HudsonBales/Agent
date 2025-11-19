import { create } from "zustand";

type UIStore = {
  theme: "dark" | "light";
  sidebarOpen: boolean;
  setTheme: (theme: UIStore["theme"]) => void;
  toggleSidebar: () => void;
};

export const useUIStore = create<UIStore>((set) => ({
  theme: "dark",
  sidebarOpen: true,
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen }))
}));
