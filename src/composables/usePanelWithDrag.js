import { ref, computed, nextTick } from 'vue';
import { useLocalStorage, useEventListener } from '@vueuse/core';
import { useDraggable } from './useDraggable';

/**
 * Unified panel composable that combines usePanel and useDraggable
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.storageKey - Key for storing panel state in localStorage
 * @param {boolean} [options.defaultDesktopState=true] - Default open state for desktop view
 * @param {number} [options.maxHeightRatio=0.8] - Maximum height ratio for mobile panels
 * @param {number} [options.snapThreshold=0.3] - Threshold for snapping panel closed
 * @param {boolean} [options.draggable=true] - Option to enable draggable panel utility
 * @returns {Object} Unified panel management API
 */
export function usePanelWithDrag(options = {}) {
  const {
    storageKey,
    defaultDesktopState = true,
    maxHeightRatio = 0.8,
    snapThreshold = 0.3,
    draggable = true,
    maxHeight,
  } = options;

  // Panel state management
  const preferences = useLocalStorage(`${storageKey}-preferences`, {
    desktop: { isOpen: defaultDesktopState },
    mobile: { isOpen: false },
  });

  // Use the initial isMobile value for initialization only
  const initialIsMobile = options.isMobile || false;
  const isOpen = ref(
    initialIsMobile ? false : preferences.value.desktop.isOpen
  );

  // References for draggable functionality
  const handle = ref(null);
  const panel = ref(null);

  // Update persistent preferences
  const updatePreferences = (isMobile) => {
    if (!isMobile) {
      preferences.value.desktop.isOpen = isOpen.value;
    }
  };

  // Initialize draggable functionality only if enabled
  let draggableApi = null;

  if (draggable) {
    draggableApi = useDraggable({
      panel,
      handle,
      isOpen,
      onClose: () => {
        isOpen.value = false;
        updatePreferences(true);
      },
      maxHeightRatio,
      snapThreshold,
      maxHeight,
    });
  }

  /**
   * Closes the panel
   * @param {boolean} isMobile - Current mobile state
   */
  const close = async (isMobile) => {
    if (isMobile && draggable && draggableApi) {
      // If we're on mobile with draggable enabled, use animated close
      await draggableApi.animateClose();
    } else {
      // Otherwise, just close immediately
      isOpen.value = false;
      updatePreferences(isMobile);
    }
  };

  /**
   * Opens the panel
   * @param {boolean} isMobile - Current mobile state
   */
  const open = async (isMobile) => {
    isOpen.value = true;
    updatePreferences(isMobile);

    if (isMobile && draggable && draggableApi) {
      // When opening on mobile with draggable enabled, wait for panel to be in DOM
      await nextTick();
      // Then animate the panel in
      draggableApi.animateOpen();

      // Set up draggable after animation completes
      setupDraggable();
    }
  };

  /**
   * Toggles the panel open/closed state
   * @param {boolean} isMobile - Current mobile state
   */
  const toggle = (isMobile) => {
    if (isOpen.value) {
      close(isMobile);
    } else {
      open(isMobile);
    }
  };

  /**
   * Handles responsive behavior when screen size changes
   * @param {boolean} isMobile - Current mobile state
   */
  const handleResize = (isMobile) => {
    if (draggable && draggableApi) {
    updatePanelDimensions();
    }

    if (isMobile) {
      isOpen.value = false;
    } else {
      isOpen.value = preferences.value.desktop.isOpen;
    }
  };

  // Function to set up draggable (wrapper around draggableApi.setupDraggable)
  const setupDraggable = () => {
    if (draggable && draggableApi) {
      draggableApi.setupDraggable();
    }
  };

  // Function to update panel dimensions (wrapper around draggableApi.updatePanelDimensions)
  const updatePanelDimensions = () => {
    if (draggable && draggableApi) {
      draggableApi.updatePanelDimensions();
    }
  };

  // Add escape key handler to close panel
  useEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen.value) {
      close(options.isMobile || false);
    }
  });

  // Create a base API that's always returned
  const baseApi = {
    // Panel state
    isOpen,
    toggle,
    close,
    open,
    handleResize,

    // References (needed even without draggable for consistent API)
    panel,
    handle,

    // Functions that may or may not use draggableApi
    setupDraggable,
    updatePanelDimensions,
  };

  // If draggable is enabled, add the draggable API
  if (draggable && draggableApi) {
    return {
      ...baseApi,
      // Draggable elements
      isDragging: draggableApi.isDragging,
      translateY: draggableApi.translateY,
      panelHeight: draggableApi.panelHeight,
      maxPanelHeight: draggableApi.maxPanelHeight,
    };
  }

  // If draggable is disabled, return placeholders for consistent API
  return {
    ...baseApi,
    isDragging: ref(false),
    translateY: ref(0),
    panelHeight: 500, // Default height for non-draggable panels
    maxPanelHeight: computed(() => 0),
  };
}
