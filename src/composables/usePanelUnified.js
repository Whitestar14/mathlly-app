import { ref, computed, nextTick, watch } from 'vue';
import { useLocalStorage, refDebounced } from '@vueuse/core';
import { useDraggable } from './useDraggable';

/**
 * Unified panel composable managing state, persistence, responsiveness, and dragging.
 * @param {object} options - Configuration options.
 * @param {string} options.storageKey - Key for localStorage persistence.
 * @param {boolean} [options.defaultDesktopState=true] - Default open state on desktop.
 * @param {boolean} options.initialIsMobile - Initial mobile state.
 * @param {boolean} [options.draggable=false] - Enable mobile bottom sheet dragging.
 * @param {number} [options.maxHeightRatio=0.8] - Max height ratio for mobile draggable panel.
 * @param {number} [options.snapThreshold=0.3] - Snap threshold for mobile draggable panel.
 * @param {number} [options.maxHeight] - Optional fixed max height in pixels for mobile draggable panel.
 * @returns {object} Panel management API.
 */
export function Panel(options = {}) {
  const {
    storageKey,
    defaultDesktopState = false,
    initialIsMobile = false,
    draggable = false,
    maxHeightRatio = 0.8,
    snapThreshold = 0.3,
    maxHeight,
  } = options;

  if (!storageKey) {
    console.error('usePanel requires a storageKey option.');
    // Return a dummy API to prevent further errors
    return {
      isOpen: ref(false),
      isMobile: ref(initialIsMobile),
      isDragging: ref(false),
      translateY: ref(0),
      panelHeight: ref(0),
      maxPanelHeight: ref(0),
      handle: ref(null),
      panel: ref(null),
      open: () => {},
      close: () => {},
      toggle: () => {},
      handleResize: () => {},
      setupDraggable: () => {},
      updatePanelDimensions: () => {},
    };
  }

  // --- State Persistence ---
  // Use localStorage to remember open state per device type
  const preferences = useLocalStorage(`${storageKey}-preferences`, {
    desktop: { isOpen: defaultDesktopState },
    mobile: { isOpen: false },
  });

  // Current device context
  const currentIsMobile = ref(initialIsMobile);
  const deviceContext = computed(() => currentIsMobile.value ? 'mobile' : 'desktop');

  // Initialize panel state from stored preferences based on device type
  const isOpen = ref(preferences.value[deviceContext.value].isOpen);
  const isOpenDebounced = refDebounced(isOpen, 30);

  // References for draggable functionality
  const handle = ref(null);
  const panel = ref(null);

  /**
   * Updates the persisted preferences based on the current isOpen state and device type.
   */
  const updatePreferences = () => {
    preferences.value[deviceContext.value].isOpen = isOpen.value;
  };

  // Initialize draggable composable only if enabled
  const draggableApi = draggable ? useDraggable({
    panel, handle, isOpen, // Pass the raw isOpen ref
    maxHeightRatio, snapThreshold, maxHeight,
  }) : null;


  /**
   * Closes the panel, handling animations if applicable.
   * @param {boolean} [isMobile=currentIsMobile.value] - Explicitly set mobile context if needed.
   */
  const close = async (isMobile = currentIsMobile.value) => {
    currentIsMobile.value = isMobile; // Ensure internal mobile state is current

    if (isMobile && draggable && draggableApi?.animateClose) {
      // Use animated close for draggable mobile panels
      await draggableApi.animateClose(); // This should set isOpen.value = false internally
    } else {
      // Close immediately for non-draggable or desktop panels
      isOpen.value = false;
    }
  };

  /**
   * Opens the panel, handling animations and draggable setup if applicable.
   * @param {boolean} [isMobile=currentIsMobile.value] - Explicitly set mobile context if needed.
   */
  const open = async (isMobile = currentIsMobile.value) => {
    currentIsMobile.value = isMobile;
    isOpen.value = true;

    if (isMobile && draggable && draggableApi) {
      // Wait for the panel element to be rendered/visible
      await nextTick();
      draggableApi.animateOpen?.();

      const success = draggableApi.setupDraggable?.();
      if (!success) console.warn(`[usePanelUnified ${storageKey}]: Draggable setup failed (handle likely not found).`);
    }
  };

  /**
   * Toggles the panel's open/closed state.
   * @param {boolean} [isMobile=currentIsMobile.value] - Explicitly set mobile context if needed.
   */
  const toggle = (isMobile = currentIsMobile.value) => {
    isOpen.value ? close(isMobile) : open(isMobile);
  };

  /**
   * Handles responsive changes, updating state and draggable elements.
   * @param {boolean} newIsMobile - The new mobile state.
   */
  const handleResize = (newIsMobile) => {
    if (currentIsMobile.value === newIsMobile) return;
      currentIsMobile.value = newIsMobile;
      
    isOpen.value = newIsMobile ? false : preferences.value.desktop.isOpen;
    updatePreferences();

    // Update draggable dimensions if applicable
    if (draggable && draggableApi) {
       nextTick(updatePanelDimensions);
    }
  };

  /**
   * Sets up the draggable event listeners and initial state.
   * Called internally by `open` or potentially externally if needed after manual DOM manipulation.
   */
  const setupDraggable = () => draggableApi?.setupDraggable?.();

  /**
   * Recalculates panel dimensions, useful after resize or content changes.
   */
  const updatePanelDimensions = () => draggableApi?.updatePanelDimensions?.();

  watch(isOpen, updatePreferences);

  watch(currentIsMobile, handleResize);
  const _panel = {
    isOpen: isOpenDebounced,
    _isOpenRaw: isOpen,
    isMobile: currentIsMobile,
    panel,
    handle,
    open,
    close,
    toggle,
    handleResize,
    _setupDraggable: setupDraggable,
    _updatePanelDimensions: updatePanelDimensions,

    isDragging: draggableApi?.isDragging ?? ref(false),
    translateY: draggableApi?.translateY ?? ref(0),
    panelHeight: draggableApi?.panelHeight ?? ref(0),
    maxPanelHeight: draggableApi?.maxPanelHeight ?? computed(() => 0),
  };

  return _panel;
}
