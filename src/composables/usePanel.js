import { ref, computed, nextTick, watch, provide, inject, reactive, readonly, onUnmounted } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { useDraggable } from '../utils/misc/useDraggable';

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
  const isOpen = ref(currentIsMobile.value ? false : preferences.value.desktop.isOpen);

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
   * Recalculates panel dimensions, useful after resize or content changes.
   */
  const updatePanelDimensions = () => draggableApi?.updatePanelDimensions?.();

  watch(isOpen, updatePreferences);

  watch(currentIsMobile, handleResize);
  const api = {
    isOpen,
    isMobile: currentIsMobile,
    panel,
    handle,
    open,
    close,
    toggle,
    handleResize,

    isDragging: draggableApi?.isDragging ?? ref(false),
    translateY: draggableApi?.translateY ?? ref(0),
    panelHeight: draggableApi?.panelHeight ?? ref(0),
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

  // Actions to interact with the panel context
  const actions = {
    /**
     * Registers a new panel instance with the context.
     * Called automatically by the usePanel hook when a panel is first accessed.
     * @param {string} id - Unique identifier for the panel.
     * @param {object} options - Configuration options passed to usePanelUnified.
     */
    registerPanel(id, options = {}) {
      if (!state.panels[id]) {
        const panel = createPanel({...options, initialIsMobile: state.isMobile});
        // Store in the renamed state property
        state.panels[id] = panel;
        state.options[id] = options;
        return panel;
      } else {
        console.warn(
          `ACTION: Panel with id "${id}" already registered. Registration skipped.`
        );
      }
    },

    /**
     * Unregisters a panel instance. Typically called on component unmount.
     * @param {string} id - Identifier of the panel to unregister.
     */
    unregisterPanel(id) {
      if (state.panels[id]) {
        delete state.panels[id];
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
     */
    togglePanel(id) {
      state.panels[id]?.toggle();
    },

    /**
     * Closes all registered panels.
     */
    closeAllPanels() {
      Object.keys(state.panels).forEach((id) => {
        actions.closePanel(id);
      });
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
     * @param {object} action - actions to interact with the panel context
     * @param {any} [fallback=null] - action fallback to prevent errors
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
        // Method call (no fallback): call and return result
        return prop.call(instance);
      }
      // Property access or method with fallback: return value or fallback
      return prop !== undefined ? prop : fallback;
    },

    /**
     * Updates the global mobile state and notifies all panel instances.
     * Called by PanelProvider when the device state changes.
     * @param {boolean} isMobile - The new mobile state.
     */
    setMobile(isMobile) {
      if (state.isMobile === isMobile) return;
      state.isMobile = isMobile;
      Object.values(state.panels).forEach((instance) =>
        instance.handleResize(isMobile)
      );
      if (isMobile) {
        actions.closeAllPanels();
      }
    },
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
    throw new Error(
      'usePanelContext() must be used within a <PanelProvider> component.'
    );
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
  if (!id) console.warn("usePanel() requires an id");

  const { state, actions } = usePanelContext();
  const hasRegistrationOptions = Object.keys(options).length > 0;

  let panel = reactive({});
  // --- Registration / Update Logic ---
  if (hasRegistrationOptions && !state.panels[id] && api) {
    panel = actions.registerPanel(id, options);
  } else if (hasRegistrationOptions && state.panels[id]) {
    panel = actions.getInstance(id);
    console.warn("Panel", id, "already registered. Using existing instance.")
  } else if (!hasRegistrationOptions && !api) {
    panel = {
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

      // Methods directly call the corresponding method on the instance if it exists
      open: () => {
        actions.openPanel(id);
      },
      close: () => {
        actions.closePanel(id);
      },
      toggle: () => {
        actions.togglePanel(id);
      }
    };
  } else if (!hasRegistrationOptions && !state.panels[id]) {
    console.log(
      `usePanel HOOK: Called for "${id}" without options. Waiting for registration call.`
    );
  }

  // Automatically unregister panel on component unmount
  onUnmounted(() => {
    actions.unregisterPanel(id);
  });

  return panel;
}