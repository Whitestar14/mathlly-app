import { onMounted, onUnmounted } from 'vue';
import { useKeyboardStore } from '@/stores/keyboard';

export function useKeyboard(initialContext = 'global', handlers, options = {}) {
  const keyboardStore = useKeyboardStore();

  const getKeyCombo = (event) => {
    const combo = [];
    if (event.ctrlKey) combo.push('ctrl');
    if (event.shiftKey) combo.push('shift');
    if (event.altKey) combo.push('alt');
    combo.push(event.key.toLowerCase());
    return combo.join('+');
  };

  const handleKeyDown = (event) => {
    if (!keyboardStore.isEnabled) return;

    const key = getKeyCombo(event);
    if (keyboardStore.debug) {
      console.log('Key pressed:', key);
      console.log('Current context:', keyboardStore.currentContext);
      console.log('Active shortcuts:', keyboardStore.activeShortcuts);
    }

    // Check if key is valid for current base in programmer mode
    if (options.activeBase && 
        keyboardStore.currentContext === 'programmer' && 
        key.length === 1) { // Single character key
      if (!keyboardStore.isValidForBase(key, options.activeBase)) {
        if (keyboardStore.debug) {
          console.log(`Key ${key} is not allowed in ${options.activeBase} mode.`);
        }
        return; // Skip execution if the key is not allowed
      }
    }

    // Check if the shortcut exists in active contexts
    const shortcut = keyboardStore.activeShortcuts[key];
    if (shortcut) {
      event.preventDefault();
      if (keyboardStore.debug) {
        console.log('Executing shortcut:', shortcut);
      }
      handlers[shortcut.action]?.(shortcut.payload);
    }
  };

  onMounted(() => {
    // Register event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Set initial context if provided
    if (initialContext && initialContext !== 'global') {
      keyboardStore.setContext(initialContext);
    }
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
    if (initialContext && initialContext !== 'global') {
      keyboardStore.clearContext(initialContext);
    }
  });

  return {
    setContext: keyboardStore.setContext,
    clearContext: keyboardStore.clearContext,
  };
}