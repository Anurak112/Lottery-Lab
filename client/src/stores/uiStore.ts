import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Theme
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  
  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  
  // Mobile Menu
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  
  // Chat Settings
  chatSettings: {
    ttsEnabled: boolean;
    danmakuEnabled: boolean;
    soundEnabled: boolean;
    volume: number;
  };
  setChatSettings: (settings: Partial<UIState['chatSettings']>) => void;
  
  // Toast Notifications
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
  }>;
  addToast: (toast: Omit<UIState['toasts'][0], 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'dark' ? 'light' : 'dark' 
      })),
      
      // Sidebar
      sidebarOpen: true,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      // Mobile Menu
      mobileMenuOpen: false,
      setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
      
      // Chat Settings
      chatSettings: {
        ttsEnabled: false,
        danmakuEnabled: true,
        soundEnabled: true,
        volume: 0.7,
      },
      setChatSettings: (settings) => set((state) => ({
        chatSettings: { ...state.chatSettings, ...settings }
      })),
      
      // Toast Notifications
      toasts: [],
      addToast: (toast) => set((state) => ({
        toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }]
      })),
      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      })),
      clearToasts: () => set({ toasts: [] }),
    }),
    {
      name: 'lottery-lab-ui',
      partialize: (state) => ({
        theme: state.theme,
        chatSettings: state.chatSettings,
      }),
    }
  )
);
