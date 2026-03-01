import { useThemeStore } from '../../store/themeStore';
import { THEMES } from '../../themes';

export function BackgroundGrid() {
  const themeId = useThemeStore(s => s.themeId);
  if (!THEMES[themeId].showDots) return null;

  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <defs>
        <pattern id="dot-grid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.9" style={{ fill: 'var(--t-dot)' }} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-grid)" />
    </svg>
  );
}
