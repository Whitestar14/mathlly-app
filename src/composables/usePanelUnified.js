import { ref, computed, nextTick, watch } from 'vue';
import { useLocalStorage, useEventListener } from '@vueuse/core';
import { useDraggable } from './useDraggable';

/**
 * Unified panel composable that combines all panel functionality
 * @param {Object} options - Configuration options
 * @param {string} options.storageKey - Key for storing panel state in localStorage
 * @param {boolean} options.defaultDesktopState - Default open state for desktop view
 * @param {boolean} options.initialIsMobile - Whether the current view is mobile
 * @param {boolean} options.draggable - Whether the panel should be draggable (mobile only)
 * @param {number} options.maxHeightRatio - Maximum height as ratio of viewport (mobile only)
 * @param {number} options.snapThreshold - Threshold for snapping panel (mobile only)
 * @param {number} options.maxHeight - Maximum height in pixels (mobile only)
 * @returns {Object} Panel management API
 */
export function usePanelUnified(options = {}) {
  const {
    storageKey = 'panel',
    defaultDesktopState = true,
    maxHeightRatio = 0.8,
    snapThreshold = 0.3,
    draggable = false,
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
const isOpen = ref(initialIsMobile 
  ? preferences.value.mobile.isOpen 
  : preferences.value.desktop.isOpen);
  
  // References for draggable functionality
  const handle = ref(null);
  const panel = ref(null);

  // Update persistent preferences for the current device type
  const updatePreferences = () => {
    // Update preferences based on current device context
    if (currentIsMobile.value) {
      preferences.value[deviceContext.value].isOpen = isOpen.value;
    }
  };

  // Initialize draggable functionality if enabled
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
   * @param {boolean} isMobile - Whether to close in mobile context
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
   * @param {boolean} isMobile - Whether to open in mobile context
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
   * @param {boolean} isMobile - Whether to toggle in mobile context
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
   * @param {boolean} newIsMobile - Whether the view is now mobile
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

  // Add escape key handler to close panel (from usePanel.js)
  useEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen.value) {
      close();
    }
  });

  // Create a unified API
  const api = {
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
    api.isDragging = draggableApi.isDragging;
    api.translateY = draggableApi.translateY;
    api.panelHeight = draggableApi.panelHeight;
    api.maxPanelHeight = draggableApi.maxPanelHeight;
  }

  return api;
}
