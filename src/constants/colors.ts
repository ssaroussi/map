import { THEMES } from '../themes';
import { useThemeStore } from '../store/themeStore';

/** Branch colors for the currently active theme (call at runtime). */
export function getBranchColors(): string[] {
  return THEMES[useThemeStore.getState().themeId].branchColors;
}

/** Root node text color for the currently active theme. */
export function getRootColor(): string {
  return THEMES[useThemeStore.getState().themeId].rootColor;
}

// Static fallbacks for the default theme.
export const BRANCH_COLORS = THEMES.default.branchColors;
export const ROOT_COLOR = THEMES.default.rootColor;
