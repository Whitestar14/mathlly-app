import { ref, computed, watch, nextTick } from 'vue';
import { useWindowSize, useLocalStorage, useEventListener } from '@vueuse/core';

/**
 * Unified panel composable that combines usePanel and useDraggable
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.storageKey - Key for storing panel state in localStorage
 * @param {boolean} options.isMobile - Whether the current view is mobile
 * @param {boolean} [options.defaultDesktopState=true] - Default open state for desktop view
 * @param {number} [options.maxHeightRatio=0.8] - Maximum height ratio for mobile panels
 * @param {number} [options.snapThreshold=0.3] - Threshold for snapping panel closed
 * @param {Function} [options.emit] - Optional emit function for v-model support
 * @returns {Object} Unified panel management API
 */
export function usePanelWithDrag(options = {}) {
  const {
    storageKey,
    defaultDesktopState = true,
    maxHeightRatio = 0.8,
    snapThreshold = 0.3,
    emit,
    maxHeight,
  } = options;

  // Create a reactive reference to isMobile that can be updated
  const isMobile = ref(options.isMobile || false);
  
  // Watch for changes to the isMobile option
  watch(() => options.isMobile, (newIsMobile) => {
    isMobile.value = newIsMobile;
  }, { immediate: true });

  // Panel state management
  const preferences = useLocalStorage(`${storageKey}-preferences`, {
    desktop: { isOpen: defaultDesktopState },
    mobile: { isOpen: false },
  });

  const isOpen = ref(isMobile.value ? false : preferences.value.desktop.isOpen);
  const deviceContext = computed(() => isMobile.value ? 'mobile' : 'desktop');

  // Draggable panel state
  let minHeight = 200;
  let panelHeight = 500;
  const handle = ref(null);
  const panel = ref(null);
  const isDragging = ref(false);
  const translateY = ref(0);
  const startY = ref(0);
  const { height: windowHeight } = useWindowSize();

  const maxPanelHeight = computed(() =>
    Math.min(windowHeight.value * maxHeightRatio, maxHeight || Infinity)
  );

  // Update panel dimensions based on actual element
  const updatePanelDimensions = () => {
    if (panel.value) {
      panelHeight = panel.value.offsetHeight || 500;
      minHeight = Math.min(200, panelHeight * 0.4);
    }
  };

  // Update persistent preferences
  const updatePreferences = () => {
    if (!isMobile.value) {
      preferences.value.desktop.isOpen = isOpen.value;
    }
  };

  // Helper to animate slide-out, then emit close
  function animateClose() {
    // Make sure we have the correct panel height
    updatePanelDimensions();
    
    translateY.value = panelHeight;
    return new Promise(resolve => {
      setTimeout(() => {
        isOpen.value = false;
        updatePreferences();
        if (emit) emit('update:isOpen', false);
        resolve();
      }, 300);
    });
  }

  /**
   * Closes the panel with animation on mobile
   */
  const close = async () => {
    console.log("Close function is called with isMobile", isMobile.value);
    if (isMobile.value) {
      // Make sure panel dimensions are up to date
      updatePanelDimensions();
      
      // Only animate if not already at final position
      if (translateY.value !== panelHeight) {
        await animateClose();
      } else {
        isOpen.value = false;
        updatePreferences();
        if (emit) emit('update:isOpen', false);
      }
    } else {
      isOpen.value = false;
      updatePreferences();
      if (emit) emit('update:isOpen', false);
    }
  };

  /**
   * Opens the panel
   */
  const open = () => {
    isOpen.value = true;
    updatePreferences();
    
    if (isMobile.value) {
      // When opening on mobile, ensure draggable is set up after DOM update
      nextTick(() => {
        setupDraggable();
      });
    }
  };

  /**
   * Toggles the panel open/closed state
   */
  const toggle = () => {
    if (isOpen.value) {
      close();
    } else {
      open();
    }
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

  // Draggable functionality
  let moveListener = null;
  let upListener = null;

  const onPointerDown = (e) => {
    if (!handle.value) return;
    
    if (e.type === 'touchstart') {
      startY.value = e.touches[0].clientY;
    } else {
      startY.value = e.clientY;
    }
    
    isDragging.value = true;
    document.body.style.overflow = 'hidden';

    moveListener = (ev) => onPointerMove(ev);
    upListener = (ev) => onPointerUp(ev);

    window.addEventListener('touchmove', moveListener, { passive: false });
    window.addEventListener('mousemove', moveListener, { passive: false });
    window.addEventListener('touchend', upListener, { passive: false });
    window.addEventListener('mouseup', upListener, { passive: false });
  };

  const onPointerMove = (e) => {
    if (!isDragging.value) return;
    
    let currentY;
    if (e.type === 'touchmove') {
      currentY = e.touches[0].clientY;
    } else {
      currentY = e.clientY;
    }
    
    let deltaY = currentY - startY.value;
    translateY.value = Math.max(0, Math.min(deltaY, maxPanelHeight.value - minHeight));
    e.preventDefault();
  };

  const onPointerUp = () => {
    if (!isDragging.value) return;
    
    isDragging.value = false;
    document.body.style.overflow = '';
    
    if (translateY.value > panelHeight * snapThreshold) {
      animateClose();
    } else {
      translateY.value = 0;
    }
    
    window.removeEventListener('touchmove', moveListener);
    window.removeEventListener('mousemove', moveListener);
    window.removeEventListener('touchend', upListener);
    window.removeEventListener('mouseup', upListener);
    moveListener = null;
    upListener = null;
  };

  /**
   * Sets up the draggable behavior for the panel handle
   */
  const setupDraggable = () => {
    if (!handle.value) return;
    
    // Update panel dimensions first
    updatePanelDimensions();
    
    // Clean up existing listeners
    handle.value.removeEventListener('touchstart', onPointerDown);
    handle.value.removeEventListener('mousedown', onPointerDown);
    
    // Add new listeners
    handle.value.addEventListener('touchstart', onPointerDown, { passive: false });
    handle.value.addEventListener('mousedown', onPointerDown, { passive: false });
  };

  // Watch for panel open/close to reset translateY and panelHeight
  watch(isOpen, (newValue, oldValue) => {
    if (newValue) {
      // Panel is opening: start off-screen, then animate in
      updatePanelDimensions();
      const height = Math.max(minHeight, Math.min(panelHeight, maxPanelHeight.value));
      translateY.value = height; // Start off-screen
      
      setTimeout(() => {
        translateY.value = 0; // Animate in
      }, 10);
      
      if (isMobile.value) {
        nextTick(() => {
          setupDraggable();
        });
      }
    } else if (oldValue) {
      translateY.value = panelHeight;
    }
  }, { immediate: true });

  // Watch for mobile state changes
  watch(isMobile, (newIsMobile, oldIsMobile) => {
    handleResize(newIsMobile);
    
    // When switching to mobile, ensure draggable is set up
    if (newIsMobile && !oldIsMobile && isOpen.value) {
      nextTick(() => {
        setupDraggable();
      });
    }
  });

  // Add escape key handler to close panel
  useEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen.value) {
      close();
    }
  });

  // Deprecated methods for backward compatibility
  const closeWithAnimation = () => {
    console.warn('closeWithAnimation is deprecated, use close() instead');
    return close();
  };

  const requestAnimatedClose = () => {
    console.warn('requestAnimatedClose is deprecated, use close() instead');
    return close();
  };

  return {
    // Panel state
    isOpen,
    toggle,
    close,
    open,
    handleResize,
    deviceContext,
    
    // Draggable elements
    handle,
    panel,
    isDragging,
    panelHeight,
    translateY,
    maxPanelHeight,
    setupDraggable,
    updatePanelDimensions,
    
    // Deprecated API (for backward compatibility)
    closeWithAnimation,
    requestAnimatedClose
  };
}
