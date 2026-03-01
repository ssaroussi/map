import { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';
import { THEMES } from '../themes';

export function useThemeApplier() {
  const themeId = useThemeStore(s => s.themeId);

  useEffect(() => {
    const theme = THEMES[themeId];
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    root.setAttribute('data-theme', themeId);
  }, [themeId]);
}
