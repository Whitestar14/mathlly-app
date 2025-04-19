import { ref, computed, nextTick } from 'vue';
import { useLocalStorage, useEventListener } from '@vueuse/core';
import { useDraggable } from './useDraggable';

/**
 * Unified panel composable that combines panel state management and draggable functionality
 */
export function usePanelWithDrag(options = {}) {
  const {
    storageKey = 'panel',
    defaultDesktopState = true,
    maxHeightRatio = 0.8,
    snapThreshold = 0.3,
    draggable = true,
    maxHeight,
    initialIsMobile = false
  } = options;

  // Panel state management with localStorage persistence
  const preferences = useLocalStorage(`${storageKey}-preferences`, {
    desktop: { isOpen: defaultDesktopState },
    mobile: { isOpen: false },
  });

  // Current panel state
  const isOpen = ref(initialIsMobile ? false : preferences.value.desktop.isOpen);
  const currentIsMobile = ref(initialIsMobile);

  // References for draggable functionality
  const handle = ref(null);
  const panel = ref(null);

  // Update persistent preferences
  const updatePreferences = (isMobile) => {
    if (!isMobile) {
      preferences.value.desktop.isOpen = isOpen.value;
    }
  };

  // Initialize draggable functionality
  const draggableApi = draggable ? useDraggable({
    panel,
    handle,
    isOpen,
    onClose: () => {
      isOpen.value = false;
      updatePreferences(currentIsMobile.value);
    },
    maxHeightRatio,
    snapThreshold,
    maxHeight,
  }) : null;

  /**
   * Closes the panel
   */
  const close = async (isMobile = currentIsMobile.value) => {
    currentIsMobile.value = isMobile;
    
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
   */
  const open = async (isMobile = currentIsMobile.value) => {
    currentIsMobile.value = isMobile;
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
   */
  const toggle = (isMobile = currentIsMobile.value) => {
    if (isOpen.value) {
      close(isMobile);
    } else {
      open(isMobile);
    }
  };

  /**
   * Handles responsive behavior when screen size changes
   */
  const handleResize = (isMobile) => {
    currentIsMobile.value = isMobile;
    
    if (draggable && draggableApi) {
      updatePanelDimensions();
    }

    if (isMobile) {
      isOpen.value = false;
    } else {
      isOpen.value = preferences.value.desktop.isOpen;
    }
  };

  // Function to set up draggable
  const setupDraggable = () => {
    if (draggable && draggableApi) {
      draggableApi.setupDraggable();
    }
  };

  // Function to update panel dimensions
  const updatePanelDimensions = () => {
    if (draggable && draggableApi) {
      draggableApi.updatePanelDimensions();
    }
  };

  // Add escape key handler to close panel
  const escapeListener = useEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen.value) {
      close();
    }
  });

  // Create a unified API
  const baseApi = {
    // Panel state
    isOpen,
    toggle,
    close,
    open,
    handleResize,

    // References
    panel,
    handle,

    // Functions
    setupDraggable,
    updatePanelDimensions,
    
    // Default values for non-draggable mode
    isDragging: ref(false),
    translateY: ref(0),
    panelHeight: ref(500),
    maxPanelHeight: computed(() => 0),
  };

  // If draggable is enabled, add the draggable API properties
  if (draggable && draggableApi) {
    baseApi.isDragging = draggableApi.isDragging;
    baseApi.translateY = draggableApi.translateY;
    baseApi.panelHeight = draggableApi.panelHeight;
    baseApi.maxPanelHeight = draggableApi.maxPanelHeight;
  }

  return baseApi;
}
