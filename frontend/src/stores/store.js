import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem('theme') || 'dark',
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      document.body.className = newTheme;
      return { theme: newTheme };
    }),
  initTheme: () =>
    set((state) => {
      document.body.className = state.theme;
      return {};
    }),
}));

export const useDashboardStore = create((set) => ({
  stats: null,
  loading: false,
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ loading }),
}));
