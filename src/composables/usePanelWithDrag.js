import { ref, computed, nextTick, watch } from 'vue';
import { useLocalStorage } from '@vueuse/core';
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

  // Current device context
  const currentIsMobile = ref(initialIsMobile);
  const deviceContext = computed(() => currentIsMobile.value ? 'mobile' : 'desktop');

  // Initialize panel state from stored preferences based on device type
  const isOpen = ref(initialIsMobile ? false : preferences.value.desktop.isOpen);

  // References for draggable functionality
  const handle = ref(null);
  const panel = ref(null);

  // Update persistent preferences for the current device type
  const updatePreferences = () => {
    if (!currentIsMobile.value) {
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
      updatePreferences();
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
      updatePreferences();
    }
  };

  /**
   * Opens the panel
   */
  const open = async (isMobile = currentIsMobile.value) => {
    currentIsMobile.value = isMobile;
    isOpen.value = true;
    updatePreferences();

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
  const handleResize = (newIsMobile) => {
      currentIsMobile.value = newIsMobile;
      
      // Load the appropriate state for the new device type
      if (newIsMobile) {
        isOpen.value = false;
      } else {
        isOpen.value = preferences.value.desktop.isOpen;
      }
    
    if (draggable && draggableApi) {
      updatePanelDimensions();
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

  // Watch for changes in the open state to update preferences
  watch(isOpen, () => {
    updatePreferences();
  });

  // Create a unified API
  const baseApi = {
    // Panel state
    isOpen,
    toggle,
    close,
    open,
    handleResize,
    deviceContext,

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
