import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useEventListener, useStorage } from '@vueuse/core';
import { useKeyboardStore } from '@/stores/keyboard';

/**
 * Composable for handling keyboard interactions and shortcuts
 * 
 * @param {string} [initialContext='global'] - Initial keyboard context
 * @param {Object} handlers - Event handlers for keyboard actions
 * @returns {Object} Keyboard management API
 */
export function useKeyboard(initialContext = 'global', handlers) {
  const keyboardStore = useKeyboardStore();
  
  /**
   * Whether keyboard events are currently being processed
   * @type {import('vue').Ref<boolean>}
   */
  const isProcessing = ref(false);
  
  /**
   * Debug mode preference
   * @type {import('vue').Ref<boolean>}
   */
  const debugMode = useStorage('keyboard-debug-mode', false);

  /**
   * Constructs a key combination string from a keyboard event
   * 
   * @param {KeyboardEvent} event - The keyboard event
   * @returns {string} Formatted key combination (e.g., "ctrl+shift+a")
   */
  const getKeyCombo = (event) => {
    const combo = [];
    if (event.ctrlKey) combo.push('ctrl');
    if (event.shiftKey) combo.push('shift');
    if (event.altKey) combo.push('alt');
    if (event.metaKey) combo.push('meta');
    
    // Normalize key name
    const key = keyboardStore.normalizeKey(event.key.toLowerCase());
    combo.push(key);
    
    return combo.join('+');
  };

  /**
   * Current keyboard context
   * @type {import('vue').ComputedRef<string>}
   */
  const currentContext = computed(() => keyboardStore.currentContext);

  /**
   * Handles keyboard events and dispatches to appropriate handlers
   * 
   * @param {KeyboardEvent} event - The keyboard event
   */
  const handleKeyDown = (event) => {
    // Prevent processing if keyboard is disabled or already processing
    if (!keyboardStore.isEnabled || isProcessing.value) return;
    
    try {
      isProcessing.value = true;
      
      const combo = getKeyCombo(event);
      const singleKey = keyboardStore.normalizeKey(event.key.toLowerCase());

      // Log debug information if enabled
      if (keyboardStore.debug || debugMode.value) {
        console.group('Keyboard Event');
        console.log('Key pressed:', singleKey);
        console.log('Combo:', combo);
        console.log('Current context:', keyboardStore.currentContext);
        console.groupEnd();
      }

      // Check for shortcuts first
      const shortcut = keyboardStore.activeShortcuts[combo];
      if (shortcut) {
        event.preventDefault();
      handlers[shortcut.action]?.(shortcut.payload);
        return;
      }

      // Process single key input if valid
      if (keyboardStore.isValidInput(singleKey) && handlers.input) {
        event.preventDefault();
        handlers.input(singleKey);
      }
    } finally {
      isProcessing.value = false;
    }
  };

  /**
   * Sets the current keyboard context
   * @param {string} context - The context to set
   */
  const setContext = (context) => {
    keyboardStore.setContext(context);
  };

  /**
   * Clears a keyboard context
   * @param {string} context - The context to clear
   */
  const clearContext = (context) => {
    keyboardStore.clearContext(context);
  };

  /**
   * Toggles debug mode
   */
  const toggleDebug = () => {
    debugMode.value = !debugMode.value;
    keyboardStore.debug = debugMode.value;
  };

  // Use VueUse's useEventListener for better cleanup
  useEventListener('keydown', handleKeyDown);

  // Set initial context if provided
  onMounted(() => {
    if (initialContext && initialContext !== 'global') {
      keyboardStore.setContext(initialContext);
    }
  });

  // Clean up context when component is unmounted
  onUnmounted(() => {
    if (initialContext && initialContext !== 'global') {
      keyboardStore.clearContext(initialContext);
    }
  });

  return {
    setContext,
    clearContext,
    toggleDebug,
    currentContext,
    isDebugMode: debugMode,
  };
}
