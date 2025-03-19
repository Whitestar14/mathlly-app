import { onMounted, onUnmounted } from 'vue';
import { useKeyboardStore } from '@/stores/keyboard';

export function useKeyboard(initialContext = 'global', handlers) {
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

    const combo = getKeyCombo(event);
    const singleKey = keyboardStore.normalizeKey(event.key.toLowerCase());

    if (keyboardStore.debug) {
      console.log('Key pressed:', singleKey);
      console.log('Current context:', keyboardStore.currentContext);
      console.log('Current base:', keyboardStore.currentBase);
    }

    // Check for shortcuts first
    const shortcut = keyboardStore.activeShortcuts[combo];
    if (shortcut) {
      event.preventDefault();
      handlers[shortcut.action]?.(shortcut.payload);
      return;
    }

    // Validate input before processing
    if (keyboardStore.isValidInput(singleKey)) {
      event.preventDefault();
      handlers.input?.(singleKey);
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
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