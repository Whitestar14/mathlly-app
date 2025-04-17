import { defineStore } from "pinia";
import { ref, computed, markRaw } from "vue";
import { useStorage } from "@vueuse/core";

/**
 * Store for managing keyboard shortcuts and input validation
 */
export const useKeyboardStore = defineStore("keyboard", () => {
  /**
   * Base validation regular expressions for programmer mode
   * @type {Object}
   */
  const BASE_VALIDATORS = markRaw({
    BIN: /^[0-1]$/,
    OCT: /^[0-7]$/,
    DEC: /^[0-9]$/,
    HEX: /^[0-9a-fA-F]$/,
  });

  /**
   * Keys that are always allowed regardless of context
   * @type {string[]}
   */
  const COMMON_KEYS = markRaw([
    "backspace", 
    "enter", 
    "escape", 
    "+", 
    "-", 
    "×", 
    "÷", 
    "(", 
    ")", 
    "%"
  ]);

  /**
   * Key normalization mapping
   * @type {Object}
   */
  const KEY_MAP = markRaw({
    enter: "enter",
    backspace: "backspace",
    escape: "escape",
    "*": "×",
    "/": "÷",
  });

  /**
   * Registered keyboard shortcuts by context
   * @type {import('vue').Ref<Object>}
   */
  const shortcuts = ref({
    global: {
      "ctrl+alt+f": {
        action: "toggleFullscreen",
        description: "Toggle Fullscreen",
      },
      "ctrl+l": { action: "toggleSidebar", description: "Toggle Sidebar" },
      "ctrl+h": { action: "toggleHistory", description: "Toggle History" },
      "ctrl+,": { action: "toggleMenubar", description: "Toggle Menubar" },
      "ctrl+ ": { action: "openShortcutModal", description: "Open Shortcuts" },
      "ctrl+shift+m": { action: "toggleTheme", description: "Toggle Theme" },
    },
    calculator: {
      escape: { action: "clear", description: "Clear Input" },
      enter: { action: "calculate", description: "Calculate Result" },
      backspace: { action: "backspace", description: "Delete Last Character" },

      // Number keys
      0: { action: "input", payload: "0", description: "Input 0" },
      1: { action: "input", payload: "1", description: "Input 1" },
      2: { action: "input", payload: "2", description: "Input 2" },
      3: { action: "input", payload: "3", description: "Input 3" },
      4: { action: "input", payload: "4", description: "Input 4" },
      5: { action: "input", payload: "5", description: "Input 5" },
      6: { action: "input", payload: "6", description: "Input 6" },
      7: { action: "input", payload: "7", description: "Input 7" },
      8: { action: "input", payload: "8", description: "Input 8" },
      9: { action: "input", payload: "9", description: "Input 9" },

      // Operators
      "+": { action: "input", payload: "+", description: "Add" },
      "-": { action: "input", payload: "-", description: "Subtract" },
      "*": { action: "input", payload: "×", description: "Multiply" },
      "/": { action: "input", payload: "÷", description: "Divide" },
      ".": { action: "input", payload: ".", description: "Decimal" },
      "(": { action: "input", payload: "(", description: "Open Parenthesis" },
      ")": { action: "input", payload: ")", description: "Close Parenthesis" },
    },
    programmer: {
      a: { action: "input", payload: "A", description: "Hex A" },
      b: { action: "input", payload: "B", description: "Hex B" },
      c: { action: "input", payload: "C", description: "Hex C" },
      d: { action: "input", payload: "D", description: "Hex D" },
      e: { action: "input", payload: "E", description: "Hex E" },
      f: { action: "input", payload: "F", description: "Hex F" },
    },
    tools: {
      "ctrl+enter": { action: "process", description: "Process Input" },
      "ctrl+s": { action: "swap", description: "Swap Input and Output" },
      "ctrl+v": { action: "paste", description: "Paste from Clipboard" },
      "ctrl+c": { action: "copy", description: "Copy Result" },
    },
  });

  /**
   * Whether keyboard shortcuts are enabled
   * @type {import('vue').Ref<boolean>}
   */
  const isEnabled = ref(true);
  
  /**
   * Current context stack (hierarchical)
   * @type {import('vue').Ref<string[]>}
   */
  const contextStack = ref(["global"]);
  
  /**
   * Debug mode flag with persistence
   * @type {import('vue').Ref<boolean>}
   */
  const debug = useStorage("keyboard-debug-mode", false);

  /**
   * Active shortcuts based on current context stack
   * @type {import('vue').ComputedRef<Object>}
   */
  const activeShortcuts = computed(() => {
    return contextStack.value.reduce((acc, context) => {
      return { ...acc, ...(shortcuts.value[context] || {}) };
    }, {});
  });

  /**
   * Current active context (excluding global)
   * @type {import('vue').ComputedRef<string>}
   */
  const currentContext = computed(() => {
    return contextStack.value[contextStack.value.length - 1];
  });

  /**
   * Sets the current keyboard context
   * @param {string} ctx - Context to set
   */
  function setContext(ctx) {
    if (debug.value) console.log("Setting context:", ctx);
    
    // Remove existing instance of context if it exists
    contextStack.value = contextStack.value.filter((c) => c !== ctx);
    
    // Add new context to top of stack
    contextStack.value.push(ctx);
  }

  /**
   * Clears a context from the stack
   * @param {string} ctx - Context to clear
   */
  function clearContext(ctx) {
    if (debug.value) console.log("Clearing context:", ctx);
    
    contextStack.value = contextStack.value.filter((c) => c !== ctx);
    
    // Ensure global context is always present
    if (contextStack.value.length === 0) {
      contextStack.value = ["global"];
    }
  }

  /**
   * Validates if a key is valid input in the current context
   * @param {string} key - Key to validate
   * @returns {boolean} Whether the key is valid input
   */
  function isValidInput(key) {
    // Normalize the key to handle special cases
    const normalizedKey = key.toLowerCase();

    // Always allow common keys
    if (COMMON_KEYS.includes(normalizedKey)) return true;

    // If not in programmer mode, allow all numeric input
    if (!contextStack.value.includes("programmer")) {
      return /^[0-9.]$/.test(normalizedKey);
    }

    // For programmer mode, validate against current base
    const validator = BASE_VALIDATORS[currentContext.value];
    
    // Ensure validation happens against the normalized key
    return validator?.test(normalizedKey) ?? false;
  }

  /**
   * Normalizes key names for consistency
   * @param {string} key - Key to normalize
   * @returns {string} Normalized key name
   */
  function normalizeKey(key) {
    return KEY_MAP[key] || key;
  }

  return {
    shortcuts,
    isEnabled,
    contextStack,
    currentContext,
    activeShortcuts,
    debug,
    setContext,
    clearContext,
    isValidInput,
    normalizeKey,
  };
});