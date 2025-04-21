// This file is kept for backward compatibility during migration
// It now uses the unified panel composable internally
import { usePanelUnified } from './usePanelUnified';

/**
 * Composable for managing collapsible panels with responsive behavior
 * @deprecated Use usePanelUnified instead
 */
export function usePanel(storageKey, isMobile, defaultDesktopState = true) {
  return usePanelUnified({
    storageKey,
    initialIsMobile: isMobile,
    defaultDesktopState,
    draggable: false
  });
}
