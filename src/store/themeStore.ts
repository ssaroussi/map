import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeId } from '../themes';

interface ThemeStore {
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      themeId: 'default',
      setTheme: (id) => set({ themeId: id }),
    }),
    { name: 'map-theme' }
  )
);
