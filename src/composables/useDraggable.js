import { ref, computed, watch } from 'vue';
import { useWindowSize } from '@vueuse/core';

export function useDraggablePanel(options = {}) {
  const {
    isOpen: isOpenGetter = () => false,
    maxHeightRatio = 0.8,
    snapThreshold = 0.3,
    emit,
  } = options;

  let minHeight = 200;
  let panelHeight = 500;
  const handle = ref(null);
  const panel = ref(null);
  const isDragging = ref(false);
  const translateY = ref(0);
  const startY = ref(0);
  const { height: windowHeight } = useWindowSize();

  const maxPanelHeight = computed(() =>
    Math.min(windowHeight.value * maxHeightRatio, options.maxHeight || Infinity)
  );

  let moveListener = null;
  let upListener = null;

  const onPointerDown = (e) => {
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
    // Clamp translateY between 0 and maxPanelHeight
    translateY.value = Math.max(0, Math.min(deltaY, maxPanelHeight.value - minHeight));
    e.preventDefault();
  };

  // Helper to animate slide-out, then emit close
  function animateClose() {
    translateY.value = panelHeight;
    // Allow animation to complete before emitting
    return new Promise(resolve => {
      setTimeout(() => {
        if (emit) emit('update:isOpen', false);
        resolve();
      }, 300);
    });
  }

  const onPointerUp = () => {
    if (!isDragging.value) return;
    isDragging.value = false;
    document.body.style.overflow = '';
    // If dragged more than snapThreshold, animate close
    if (translateY.value > panelHeight * snapThreshold) {
      animateClose();
    } else {
      translateY.value = 0;
    }
    // Remove listeners
    window.removeEventListener('touchmove', moveListener);
    window.removeEventListener('mousemove', moveListener);
    window.removeEventListener('touchend', upListener);
    window.removeEventListener('mouseup', upListener);
    moveListener = null;
    upListener = null;
  };

  const setupDraggable = () => {
    if (!handle.value) return;
    handle.value.removeEventListener('touchstart', onPointerDown);
    handle.value.removeEventListener('mousedown', onPointerDown);
    handle.value.addEventListener('touchstart', onPointerDown, { passive: false });
    handle.value.addEventListener('mousedown', onPointerDown, { passive: false });
  };

  // Watch for panel open/close to reset translateY and panelHeight
  watch(isOpenGetter, (newValue, oldValue) => {
    if (newValue) {
      // Panel is opening: start off-screen, then animate in
      const height = Math.max(minHeight, Math.min(panelHeight, maxPanelHeight.value));
      translateY.value = height; // Start off-screen
      setTimeout(() => {
        translateY.value = 0; // Animate in
      }, 10);
      setTimeout(() => setupDraggable(), 0);
    } else if (oldValue) {
      translateY.value = panelHeight;
    }
  }, { immediate: true });

  // Expose a method for parent to trigger animated close (for close button/backdrop)
  async function requestAnimatedClose() {
    if (translateY.value === panelHeight) {
      if (emit) emit('update:isOpen', false);
    } else {
      await animateClose();
    }
  }

  return {
    handle,
    panel,
    isDragging,
    panelHeight,
    translateY,
    maxPanelHeight,
    setupDraggable,
    requestAnimatedClose
  };
}
