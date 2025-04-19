import { ref, computed, onUnmounted, watch } from 'vue';
import { useWindowSize } from '@vueuse/core';

export function useDraggable(options = {}) {
  const {
    panel,
    handle,
    isOpen,
    onClose,
    maxHeightRatio = 0.8,
    snapThreshold = 0.3,
    maxHeight,
  } = options;

  // Draggable panel state
  let minHeight = 200;
  let panelHeight = 500;
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

  // Helper to animate slide-out, then emit close
  function animateClose() {    
    translateY.value = panelHeight;
    return new Promise(resolve => {
      setTimeout(() => {
        if (onClose) onClose();
        resolve();
      }, 300);
    });
  }

  // Helper to animate slide-in
  function animateOpen() {    
    // First set to off-screen position
    translateY.value = panelHeight;
    
    // Then animate in after a short delay to ensure the initial position is applied
    setTimeout(() => {
      translateY.value = 0; // Animate in
    }, 50)
  }

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
    if (!handle.value) {
      console.warn('Draggable handle not found');
      return;
    }
    
    // Clean up existing listeners
    handle.value.removeEventListener('touchstart', onPointerDown);
    handle.value.removeEventListener('mousedown', onPointerDown);
    
    // Add new listeners
    handle.value.addEventListener('touchstart', onPointerDown, { passive: false });
    handle.value.addEventListener('mousedown', onPointerDown, { passive: false });
  };

  // Watch for panel open state changes
  if (isOpen) {
    watch(isOpen, (newValue) => {
      if (newValue) {
        // Panel is opening - prepare for animation
        updatePanelDimensions();
      }
    });
  }

  // Clean up event listeners when component is unmounted
  onUnmounted(() => {
    if (handle.value) {
      handle.value.removeEventListener('touchstart', onPointerDown);
      handle.value.removeEventListener('mousedown', onPointerDown);
    }
    
    if (moveListener) {
      window.removeEventListener('touchmove', moveListener);
      window.removeEventListener('mousemove', moveListener);
    }
    
    if (upListener) {
      window.removeEventListener('touchend', upListener);
      window.removeEventListener('mouseup', upListener);
    }
  });

  return {
    isDragging,
    translateY,
    panelHeight,
    maxPanelHeight,
    setupDraggable,
    updatePanelDimensions,
    animateClose,
    animateOpen
  };
}
