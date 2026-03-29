import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PageState {
  search: string;
  filters?: Record<string, any>;
  sortBy?: string;
  page?: number;
}

interface UIState {
  isSidebarCollapsed: boolean;
  lastRefresh: number;
  pageStates: Record<string, PageState>;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  triggerRefresh: () => void;
  setPageState: (page: string, state: Partial<PageState>) => void;
  clearPageStates: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarCollapsed: false,
      lastRefresh: 0,
      pageStates: {},
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (collapsed: boolean) => set({ isSidebarCollapsed: collapsed }),
      triggerRefresh: () => set({ lastRefresh: Date.now() }),
      setPageState: (page, state) => set((s) => ({
        pageStates: {
          ...s.pageStates,
          [page]: { ...(s.pageStates[page] || { search: "" }), ...state }
        }
      })),
      clearPageStates: () => set({ pageStates: {} }),
    }),
    {
      name: "rtpro-ui-storage",
      partialize: (state) => ({ 
        isSidebarCollapsed: state.isSidebarCollapsed,
        pageStates: state.pageStates 
      }),
    }
  )
);
