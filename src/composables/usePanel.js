import { shallowRef, computed, nextTick, watch, provide, inject, reactive, readonly, onUnmounted, markRaw } from 'vue';
import { useLocalStorage, useDebounceFn } from '@vueuse/core';
import { useDraggable } from '@/utils/misc/draggable';

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
export function createPanel(options = {}) {
  const {
    storageKey,
    defaultDesktopState = false,
    initialIsMobile = false,
    draggable = false,
    maxHeightRatio = 0.8,
    snapThreshold = 0.3,
    maxHeight,
  } = options;

  // Early return with default values if no storageKey provided
  if (!storageKey) {
    console.error('usePanel requires a storageKey option.');
    // Return non-reactive default values to avoid unnecessary reactivity
    return markRaw({
      isOpen: shallowRef(false),
      isMobile: shallowRef(initialIsMobile),
      isDragging: shallowRef(false),
      translateY: shallowRef(0),
      panelHeight: shallowRef(0),
      maxPanelHeight: computed(() => 0),
      isExpanded: shallowRef(false),
      handle: shallowRef(null),
      panel: shallowRef(null),
      open: () => {},
      close: () => {},
      toggle: () => {},
      handleResize: () => {},
      updatePanelDimensions: () => {},
    });
  }

  // --- State Persistence ---
  // Use localStorage to remember open state per device type
  const preferences = useLocalStorage(`${storageKey}-preferences`, {
    desktop: { isOpen: defaultDesktopState },
    mobile: { isOpen: false },
  });

  // Current device context - use shallowRef for better performance
  const currentIsMobile = shallowRef(initialIsMobile);
  const deviceContext = computed(() => currentIsMobile.value ? 'mobile' : 'desktop');

  // Initialize panel state from stored preferences based on device type
  const isOpen = shallowRef(currentIsMobile.value ? false : preferences.value.desktop.isOpen);
  
  // New expanded state for mobile panels
  const isExpanded = shallowRef(false);

  // References for draggable functionality - use shallowRef for DOM elements
  const handle = shallowRef(null);
  const panel = shallowRef(null);

  /**
   * Updates the persisted preferences based on the current isOpen state and device type.
   * Debounced to reduce storage writes.
   */
  const updatePreferences = useDebounceFn(() => {
    preferences.value[deviceContext.value].isOpen = isOpen.value;
  }, 300);

  // Initialize draggable composable only if enabled
  const draggableApi = draggable ? useDraggable({
    panel, 
    handle, 
    isOpen,
    isExpanded,
    maxHeightRatio,
    snapThreshold, 
    maxHeight,
  }) : null;

  /**
   * Closes the panel, handling animations if applicable.
   * @param {boolean} [isMobile=currentIsMobile.value] - Explicitly set mobile context if needed.
   * @returns {Promise<void>}
   */
  const close = async (isMobile = currentIsMobile.value) => {
    currentIsMobile.value = isMobile;

    if (isMobile && draggable && draggableApi?.animateClose) {
      await draggableApi.animateClose();
    } else {
      isOpen.value = false;
    }
    
    // Use setTimeout to ensure expanded state is reset after animation completes
    setTimeout(() => isExpanded.value = false, 300);
    updatePreferences();
  };

  /**
   * Opens the panel, handling animations and draggable setup if applicable.
   * @param {boolean} [isMobile=currentIsMobile.value] - Explicitly set mobile context if needed.
   * @returns {Promise<void>}
   */
  const open = async (isMobile = currentIsMobile.value) => {
    currentIsMobile.value = isMobile;
    isOpen.value = true;
    updatePreferences();

    if (isMobile && draggable && draggableApi) {
      await nextTick();
      draggableApi.animateOpen?.();

      const success = draggableApi.setupDraggable?.();
      if (!success) {
        console.warn(`[usePanelUnified ${storageKey}]: Draggable setup failed (handle likely not found).`);
      }
    }
  };

  /**
   * Toggles the panel's open/closed state or expanded state.
   * @param {object} [options] - Options object.
   * @param {boolean} [options.expanded] - If true, toggles expanded state; otherwise toggles open/close.
   * @param {boolean} [options.isMobile=currentIsMobile.value] - Explicitly set mobile context if needed.
   */
  const toggle = (options = {}) => {
    const { expanded = false, isMobile = currentIsMobile.value } = options;
    if (expanded) {
      if (!currentIsMobile.value || !isOpen.value) return;
      isExpanded.value = !isExpanded.value;
      if (draggableApi) {
        nextTick(updatePanelDimensions);
      }
      updatePreferences();
    } else {
      isOpen.value ? close(isMobile) : open(isMobile);
    }
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

    if (draggable && draggableApi) {
      nextTick(updatePanelDimensions);
    }
  };

  /**
   * Recalculates panel dimensions, useful after resize or content changes.
   * Debounced to prevent excessive calculations.
   */
  const updatePanelDimensions = useDebounceFn(() => {
    draggableApi?.updatePanelDimensions?.();
  }, 100);

  // Single watcher for state changes to reduce reactivity overhead
  watch([isOpen, isExpanded], updatePreferences, { flush: 'post' });

  const api = {
    isOpen,
    isMobile: currentIsMobile,
    isExpanded,
    panel,
    handle,
    open,
    close,
    toggle,
    handleResize,
    updatePanelDimensions,

    isDragging: draggableApi?.isDragging ?? shallowRef(false),
    translateY: draggableApi?.translateY ?? shallowRef(0),
    panelHeight: draggableApi?.panelHeight ?? shallowRef(0),
    maxPanelHeight: draggableApi?.maxPanelHeight ?? computed(() => 0),
  };

  return api;
}

// Symbol keys for provide/inject
const PanelStateSymbol = Symbol('PanelState');
const PanelActionsSymbol = Symbol('PanelActions');

/**
 * Creates a central context for managing multiple panel states.
 * This should be instantiated once in a top-level component (like PanelProvider).
 * @returns {object} Context state and actions.
 */
export function createPanelContext() {
  const state = reactive({
    /** @type {Record<string, ReturnType<typeof usePanel>>} */
    panels: {},
    options: {},
    isMobile: false,
  });

  const actions = {
    /**
     * Registers a new panel instance with the context.
     * Called automatically by the usePanel hook when a panel is first accessed.
     * @param {string} id - Unique identifier for the panel.
     * @param {object} options - Configuration options passed to usePanelUnified.
     * @returns {object|undefined} The panel instance or undefined if already registered.
     */
    registerPanel(id, options = {}) {
      if (state.panels[id]) {
        console.warn(`Panel with id "${id}" already registered. Registration skipped.`);
        return state.panels[id];
      }
      
      const panel = createPanel({...options, initialIsMobile: state.isMobile});
      state.panels[id] = panel;
      state.options[id] = options;
      return panel;
    },

    /**
     * Unregisters a panel instance. Typically called on component unmount.
     * @param {string} id - Identifier of the panel to unregister.
     */
    unregisterPanel(id) {
      if (state.panels[id]) {
        delete state.panels[id];
        delete state.options[id];
      }
    },

    /**
     * Opens a specific panel.
     * @param {string} id - Panel identifier.
     */
    openPanel(id) {
      state.panels[id]?.open();
    },

    /**
     * Closes a specific panel.
     * @param {string} id - Panel identifier.
     */
    closePanel(id) {
      state.panels[id]?.close();
    },

    /**
     * Toggles a specific panel.
     * @param {string} id - Panel identifier.
     * @param {object} [options] - Toggle options.
     */
    togglePanel(id, options) {
      state.panels[id]?.toggle(options);
    },

    /**
     * Closes all registered panels.
     */
    closeAllPanels() {
      Object.keys(state.panels).forEach(this.closePanel);
    },

    /**
     * Retrieves a panel instance by its ID.
     * @param {string} id - Panel identifier.
     * @returns {ReturnType<typeof usePanel> | undefined} The panel instance or undefined.
     */
    getInstance(id) {
      return state.panels[id];
    },

    /**
     * Returns the function based on the id of a panel's instance
     * @param {string} id - Panel identifier
     * @param {string} action - Property or method name to access
     * @param {any} [fallback=null] - Fallback value if property/method doesn't exist
     * @returns {any} The property value, method result, or fallback
     */
    provide(id, action, fallback = null) {
      const instance = this.getInstance(id);
      if (!instance) {
        if (fallback !== null) return fallback;
        console.warn(`Panel "${id}" not ready for ${action}()`);
        return undefined;
      }
      
      const prop = instance[action];
      if (typeof prop === 'function' && fallback === null) {
        return prop.call(instance);
      }
      return prop !== undefined ? prop : fallback;
    },

    /**
     * Updates the global mobile state and notifies all panel instances.
     * Called by PanelProvider when the device state changes.
     * @param {boolean} isMobile - The new mobile state.
     */
    setMobile: useDebounceFn(function(isMobile) {
      if (state.isMobile === isMobile) return;
      state.isMobile = isMobile;
      
      // Update all panel instances
      Object.values(state.panels).forEach(instance => 
        instance.handleResize(isMobile)
      );
      
      // Close all panels on mobile transition
      if (isMobile) {
        this.closeAllPanels();
      }
    }, 100),
  };

  provide(PanelStateSymbol, readonly(state));
  provide(PanelActionsSymbol, actions);

  return { state: readonly(state), actions };
}

/**
 * Hook to access the central panel state and actions.
 * Throws an error if used outside of a PanelProvider.
 * @returns {{ state: Readonly<typeof state>, actions: typeof actions }} Panel context.
 */
export function usePanelContext() {
  const state = inject(PanelStateSymbol);
  const actions = inject(PanelActionsSymbol);
  if (!state || !actions) {
    throw new Error('usePanelContext() must be used within a <PanelProvider> component.');
  }
  return { state, actions };
}

/**
 * Hook to interact with a specific panel instance managed by the context.
 * Returns a stable API object that dynamically accesses the underlying panel's state/methods.
 * @param {string} id - The unique identifier for the panel.
 * @param {object} [options={}] - Configuration options for the panel.
 * @param {boolean} [api=false] - Determines returning api getters or default setup object
 * @returns {object} A stable panel API object.
 */
export function usePanel(id, options = {}, api = false) {
  if (!id) {
    console.warn("usePanel() requires an id");
    return {};
  }

  const { state, actions } = usePanelContext();
  const hasRegistrationOptions = Object.keys(options).length > 0;

  // Handle different initialization scenarios
  if (hasRegistrationOptions && state.panels[id]) {
    console.warn(`Panel "${id}" already registered. Using existing instance.`);
    return actions.getInstance(id);
  } 
  
  if (hasRegistrationOptions && !state.panels[id] && api) {
    return actions.registerPanel(id, options);
  } 
  
  if (!hasRegistrationOptions && !api) {
    // Create a lightweight API object with computed getters
    const panel = {
      get isOpen() {
        return actions.provide(id, "isOpen", false);
      },
      get isMobile() {
        return state.isMobile;
      },
      get panels() {
        return state.panels;
      },
      get options() {
        return state.options[id];
      },

      open: () => actions.openPanel(id),
      close: () => actions.closePanel(id),
      toggle: (options) => actions.togglePanel(id, options)
    };
    
      // Automatically unregister panel on component unmount
      onUnmounted(() => {
        actions.unregisterPanel(id);
      });
      
      return panel;
    } 
    
    if (!hasRegistrationOptions && !state.panels[id]) {
      console.log(`usePanel HOOK: Called for "${id}" without options. Waiting for registration call.`);
    }

  // Automatically unregister panel on component unmount
  onUnmounted(() => {
    if (hasRegistrationOptions) {
      actions.unregisterPanel(id);
    }
  });

  return state.panels[id] || {};
}