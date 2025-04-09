import { ref, watch, computed } from 'vue';
import { useLocalStorage, useEventListener } from '@vueuse/core';

/**
 * Composable for managing collapsible panels with responsive behavior
 * 
 * @param {string} storageKey - Key for storing panel state in localStorage
 * @param {boolean} isMobile - Whether the current view is mobile
 * @param {boolean} [defaultDesktopState=true] - Default open state for desktop view
 * @returns {Object} Panel management API
 */
export function usePanel(storageKey, isMobile, defaultDesktopState = true) {
  /**
   * Persistent storage for panel preferences across sessions
   * @type {import('vue').Ref<Object>}
   */
  const preferences = useLocalStorage(`${storageKey}-preferences`, {
    desktop: {
      isOpen: defaultDesktopState,
    },
    mobile: {
      isOpen: false,
    },
  });

  /**
   * Current open state of the panel
   * @type {import('vue').Ref<boolean>}
   */
  const isOpen = ref(isMobile ? false : preferences.value.desktop.isOpen);

  /**
   * Current device context
   * @type {import('vue').ComputedRef<string>}
   */
  const deviceContext = computed(() => isMobile ? 'mobile' : 'desktop');

  /**
   * Updates the persistent preferences
   */
  const updatePreferences = () => {
    if (!isMobile) {
      preferences.value.desktop.isOpen = isOpen.value;
    }
  };

  /**
   * Toggles the panel open/closed state
   */
  const toggle = () => {
    isOpen.value = !isOpen.value;
    updatePreferences();
  };

  /**
   * Closes the panel
   */
  const close = () => {
    isOpen.value = false;
    updatePreferences();
  };

  /**
   * Opens the panel
   */
  const open = () => {
    isOpen.value = true;
    updatePreferences();
  };

  /**
   * Handles responsive behavior when screen size changes
   * @param {boolean} newIsMobile - Whether the view is now mobile
   */
  const handleResize = (newIsMobile) => {
    if (newIsMobile) {
      isOpen.value = false;
    } else {
      isOpen.value = preferences.value.desktop.isOpen;
    }
  };

  // Watch for changes in the mobile state
  watch(
    () => isMobile,
    (newIsMobile) => {
      handleResize(newIsMobile);
    },
    { immediate: true }
  );

  // Watch for changes in the open state to update preferences
  watch(isOpen, () => {
    updatePreferences();
  });

  // Add escape key handler to close panel
  useEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen.value) {
      close();
    }
  });

  return {
    isOpen,
    toggle,
    close,
    open,
    handleResize,
    deviceContext,
  };
}
