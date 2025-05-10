import { ref, computed, onUnmounted, watch } from 'vue';
import { useWindowSize } from '@vueuse/core';

/**
 * Composable for creating draggable bottom sheet panels
 * @param {Object} options - Configuration options
 * @param {import('vue').Ref<HTMLElement>} options.panel - Ref to the panel element
 * @param {import('vue').Ref<HTMLElement>} options.handle - Ref to the drag handle element
 * @param {import('vue').Ref<boolean>} options.isOpen - Ref to control panel open state
 * @param {number} [options.maxHeightRatio=0.8] - Maximum height as ratio of viewport height
 * @param {number} [options.snapThreshold=0.3] - Threshold for snapping open/closed
 * @param {number} [options.maxHeight] - Optional fixed max height in pixels
 * @returns {Object} Draggable API
 */
export function useDraggable(options = {}) {
  const {
    panel,
    handle,
    isOpen,
    maxHeightRatio = 0.8,
    snapThreshold = 0.3,
    maxHeight,
  } = options;

  // Draggable panel state
  const minHeight = ref(200);
  const panelHeight = ref(500);
  const isDragging = ref(false);
  const translateY = ref(0);
  const startY = ref(0);
  const isSetup = ref(false); 
  const { height: windowHeight } = useWindowSize();

  const maxPanelHeight = computed(() =>
    Math.min(windowHeight.value * maxHeightRatio, maxHeight || 600)
  );

  /**
   * Recalculates panel dimensions, useful after resize or content changes.
   */
  const updatePanelDimensions = () => {
    if (!panel.value) return;
    
    panelHeight.value = Math.max(windowHeight.value * maxHeightRatio, panel.value.offsetHeight);
    minHeight.value = Math.min(200, panelHeight.value * 0.2);
  };

  /**
   * Animates the panel to closed position
   */
  function animateClose() {    
    translateY.value = panelHeight.value;
    return new Promise(resolve => {
      setTimeout(() => {
        isOpen.value = false;
        resolve();
      }, 300);
    });
  }

  /**
   * Animates the panel to open position
   */
  const animateOpen = () => {
    if (!panel.value) return;
    translateY.value = panelHeight.value;
    
    // Then animate in after a short delay to ensure the initial position is applied
    setTimeout(() => {
      translateY.value = 0; // Animate in
    }, 50);
  }

  // Event handlers
  const onTouchStart = (e) => {
    if (!handle.value) return;
    
    startY.value = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    isDragging.value = true;
    document.body.style.overflow = 'hidden';
    
    // Add move and up listeners when dragging starts
    window.addEventListener('touchmove', onTouchMove, { passive: false }); 
    window.addEventListener('touchend', onTouchEnd, { passive: false }); 
  };

  const onTouchMove = (e) => {
    if (!isDragging.value) return;
    
    const currentY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    const deltaY = currentY - startY.value;
    translateY.value = Math.max(0, Math.min(deltaY, maxPanelHeight.value - minHeight.value));
    e.preventDefault();
  };

  const onTouchEnd = () => {
    if (!isDragging.value) return;
    
    isDragging.value = false;
    document.body.style.overflow = '';
    
    if (translateY.value > panelHeight.value * snapThreshold) {
      animateClose();
    } else {
      translateY.value = 0;
    }
    
    // Remove move and up listeners when dragging ends
    window.removeEventListener('touchmove', onTouchMove); 
    window.removeEventListener('touchend', onTouchEnd); 
  };

  /**
   * Sets up the draggable event listeners and initial state.
   */
  const setupDraggable = () => {
    if (isSetup.value) return true;

    if (!panel.value || !handle.value) {
      console.warn('[useDraggable] setupDraggable failed: Handle/Panel ref is not a valid DOM element.', {
        panel: panel.value,
        handle: handle.value
      });
      return false;
    }

    cleanup();
    updatePanelDimensions();

    // Add new listeners (use passive: false to allow preventDefault in handlers)
    handle.value.addEventListener('touchstart', onTouchStart, { passive: false }); 

    return true; // Indicate success
  };
  
  // Clean up all event listeners
  const cleanup = () => {
    if (handle.value) {
      handle.value.removeEventListener('touchstart', onTouchStart);
    }
    
    window.removeEventListener('touchmove', onTouchMove); 
    window.removeEventListener('touchend', onTouchEnd); 
    isSetup.value = true;
    return true;
  };

  // Watch for panel open state changes
  watch(isOpen, (newValue) => {
    if (newValue) {
      // Panel is opening - prepare for animation
      updatePanelDimensions();
    }
  });

  // Clean up event listeners when component is unmounted
  onUnmounted(() => cleanup());

  return {
    isDragging,
    translateY,
    panelHeight,
    maxPanelHeight,
    setupDraggable,
    updatePanelDimensions,
    animateOpen,
    animateClose,
  };
}
