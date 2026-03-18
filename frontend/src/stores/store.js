import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  theme: 'dark',
  toggleTheme: () => {
    // Theme is locked to dark
    document.body.className = 'dark';
    return { theme: 'dark' };
  },
  initTheme: () =>
    set(() => {
      document.body.className = 'dark';
      localStorage.setItem('theme', 'dark');
      return { theme: 'dark' };
    }),
}));

export const useDashboardStore = create((set) => ({
  stats: null,
  loading: false,
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ loading }),
}));
