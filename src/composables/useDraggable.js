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
  const minHeight = ref(200);
  const panelHeight = ref(500);
  const isDragging = ref(false);
  const translateY = ref(0);
  const startY = ref(0);
  const { height: windowHeight } = useWindowSize();

  const maxPanelHeight = computed(() =>
    Math.min(windowHeight.value * maxHeightRatio, maxHeight || Infinity)
  );

  // Update panel dimensions based on actual element
  const updatePanelDimensions = () => {
    if (!panel.value) return;
    
    panelHeight.value = panel.value.offsetHeight || 500;
    minHeight.value = Math.min(200, panelHeight.value * 0.4);
  };

  // Helper to animate slide-out, then emit close
  function animateClose() {    
    translateY.value = panelHeight.value;
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
    translateY.value = panelHeight.value;
    
    // Then animate in after a short delay to ensure the initial position is applied
    setTimeout(() => {
      translateY.value = 0; // Animate in
    }, 50);
  }

  // Event handlers
  const onPointerDown = (e) => {
    if (!handle.value) return;
    
    startY.value = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    isDragging.value = true;
    document.body.style.overflow = 'hidden';
    
    // Add move and up listeners when dragging starts
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('mousemove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp, { passive: false });
    window.addEventListener('mouseup', onPointerUp, { passive: false });
  };

  const onPointerMove = (e) => {
    if (!isDragging.value) return;
    
    const currentY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    const deltaY = currentY - startY.value;
    translateY.value = Math.max(0, Math.min(deltaY, maxPanelHeight.value - minHeight.value));
    e.preventDefault();
  };

  const onPointerUp = () => {
    if (!isDragging.value) return;
    
    isDragging.value = false;
    document.body.style.overflow = '';
    
    if (translateY.value > panelHeight.value * snapThreshold) {
      animateClose();
    } else {
      translateY.value = 0;
    }
    
    // Remove move and up listeners when dragging ends
    window.removeEventListener('touchmove', onPointerMove);
    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('touchend', onPointerUp);
    window.removeEventListener('mouseup', onPointerUp);
  };

  // Setup draggable behavior
  const setupDraggable = () => {
    if (!handle.value) {
      console.warn('Draggable handle not found');
      return;
    }
    
    // Clean up existing listeners first
    cleanupDraggable();
    
    // Add new listeners
    handle.value.addEventListener('touchstart', onPointerDown, { passive: false });
    handle.value.addEventListener('mousedown', onPointerDown, { passive: false });
  };
  
  // Clean up all event listeners
  const cleanupDraggable = () => {
    if (handle.value) {
      handle.value.removeEventListener('touchstart', onPointerDown);
      handle.value.removeEventListener('mousedown', onPointerDown);
    }
    
    window.removeEventListener('touchmove', onPointerMove);
    window.removeEventListener('mousemove', onPointerMove);
    window.removeEventListener('touchend', onPointerUp);
    window.removeEventListener('mouseup', onPointerUp);
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
    cleanupDraggable();
  });

  return {
    isDragging,
    translateY,
    panelHeight,
    maxPanelHeight,
    setupDraggable,
    cleanupDraggable,
    updatePanelDimensions,
    animateClose,
    animateOpen
  };
}
