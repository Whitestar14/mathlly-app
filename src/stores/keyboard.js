import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useKeyboardStore = defineStore("keyboard", () => {
  const shortcuts = ref({
    global: {
      "ctrl+shift+f": {
        action: "toggleFullscreen",
        description: "Toggle Fullscreen",
      },
      "ctrl+l": { action: "toggleSidebar", description: "Toggle Sidebar" },
      "ctrl+h": { action: "toggleHistory", description: "Toggle History" },
      "ctrl+,": { action: "openSettings", description: "Open Settings" },
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
      "ctrl+1": { action: "setBase", payload: "DEC", description: "Decimal" },
      "ctrl+2": {
        action: "setBase",
        payload: "HEX",
        description: "Hexadecimal",
      },
      "ctrl+3": { action: "setBase", payload: "OCT", description: "Octal" },
      "ctrl+4": { action: "setBase", payload: "BIN", description: "Binary" },

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
      "ctrl+v": { action: "paste", description: "Paste from Clipboard" }, // New shortcut
      "ctrl+c": { action: "copy", description: "Copy Result" }, // New shortcut
    },
  });

  const isEnabled = ref(true);
  const contextStack = ref(["global"]); // Use a stack to manage context hierarchy
  const debug = ref(false);
  const currentBase = ref("DEC");

  // Base validation maps
  const BASE_VALIDATORS = {
    BIN: /^[0-1]$/,
    OCT: /^[0-7]$/,
    DEC: /^[0-9]$/,
    HEX: /^[0-9a-fA-F]$/,
  };

  const COMMON_KEYS = ["backspace", "enter", "escape", "+", "-", "×", "÷", "(", ")", "%"];

  // Compute active shortcuts based on context stack
  const activeShortcuts = computed(() => {
    return contextStack.value.reduce((acc, context) => {
      return { ...acc, ...(shortcuts.value[context] || {}) };
    }, {});
  });

  // Current active context (excluding global)
  const currentContext = computed(() => {
    return contextStack.value[contextStack.value.length - 1];
  });

  function setContext(ctx) {
    if (debug.value) console.log("Setting context:", ctx);
    // Remove existing instance of context if it exists
    contextStack.value = contextStack.value.filter((c) => c !== ctx);
    // Add new context to top of stack
    contextStack.value.push(ctx);
  }

  function clearContext(ctx) {
    if (debug.value) console.log("Clearing context:", ctx);
    contextStack.value = contextStack.value.filter((c) => c !== ctx);
    if (contextStack.value.length === 0) {
      contextStack.value = ["global"];
    }
  }

  function setBase(base) {
    currentBase.value = base;
  }

  // Enhanced input validation
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
    const validator = BASE_VALIDATORS[currentBase.value];
    // Ensure validation happens against the normalized key
    return validator?.test(normalizedKey) ?? false;
  }

  function normalizeKey(key) {
    // Handle special key mappings
    const keyMap = {
      enter: "enter",
      backspace: "backspace",
      escape: "escape",
      "*": "×",
      "/": "÷",
    };
    return keyMap[key] || key;
  }

  return {
    shortcuts,
    isEnabled,
    contextStack,
    currentContext,
    activeShortcuts,
    currentBase,
    debug,
    setContext,
    clearContext,
    setBase,
    isValidInput,
    normalizeKey,
  };
});