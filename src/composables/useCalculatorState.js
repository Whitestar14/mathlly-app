import { reactive, readonly, ref } from 'vue'

// Define constants
const ANIMATION_DURATION = 1000;
const DEFAULT_BASE = 'DEC';
const DEFAULT_MODE = 'Standard';
const BASES = ['DEC', 'BIN', 'HEX', 'OCT'];

/**
 * @typedef {Object} CalculatorState
 * @property {string} input - Current input string
 * @property {string} error - Current error message
 * @property {boolean} isAnimating - Whether result animation is active
 * @property {string} animatedResult - Result being animated
 * @property {string} activeBase - Active base for programmer mode (DEC, HEX, BIN, OCT)
 * @property {Object} displayValues - Display values for different bases
 * @property {string} mode - Current calculator mode
 */

/**
 * Creates initial state for calculator
 * @param {string} mode - Calculator mode
 * @returns {CalculatorState} Initial state
 */
function createInitialState(mode = DEFAULT_MODE) {
  const initialDisplayValues = {};
  
  // Initialize display values for all bases
  BASES.forEach(base => {
    initialDisplayValues[base] = { input: '0', display: '0' };
  });
  
  return {
    input: '0',
    error: '',
    isAnimating: false,
    animatedResult: '',
    activeBase: DEFAULT_BASE,
    displayValues: initialDisplayValues,
    mode: mode
  };
}

/**
 * Provides unified state management for calculator
 * @param {string} initialMode - Initial calculator mode
 * @returns {Object} Calculator state and methods
 */
export function useCalculatorState(initialMode) {
  // Create a single reactive state object
  const state = reactive(createInitialState(initialMode));
  
  // Store animation timeout reference for cleanup
  const animationTimeout = ref(null);

  /**
   * Update state with partial updates
   * @param {Partial<CalculatorState>} updates - Partial state updates
   */
  function updateState(updates) {
    // Validate updates
    if (updates.activeBase && !BASES.includes(updates.activeBase)) {
      console.warn(`Invalid base: ${updates.activeBase}`);
      delete updates.activeBase;
    }
    
    Object.assign(state, updates);
  }

  /**
   * Reset state to initial values
   * @param {string} mode - Calculator mode
   */
  function resetState(mode = state.mode) {
    // Clear any pending animation timeout
    if (animationTimeout.value) {
      clearTimeout(animationTimeout.value);
      animationTimeout.value = null;
    }
    
    // Reset to initial state
    const initialState = createInitialState(mode);
    Object.keys(initialState).forEach(key => {
      state[key] = initialState[key];
    });
  }

  /**
   * Set animation state
   * @param {string} result - Result to animate
   */
  function setAnimation(result) {
    // Clear any existing animation
    if (animationTimeout.value) {
      clearTimeout(animationTimeout.value);
    }
    
    updateState({
      isAnimating: true,
      animatedResult: result
    });
    
    // Auto-clear animation after duration
    animationTimeout.value = setTimeout(() => {
      updateState({
        isAnimating: false,
        animatedResult: ''
      });
      animationTimeout.value = null;
    }, ANIMATION_DURATION);
  }

  /**
   * Update display values for programmer mode
   * @param {Object} values - New display values
   */
  function updateDisplayValues(values) {
    // Create a proper deep copy
    const newValues = {};
    
    Object.keys(values).forEach(base => {
      if (BASES.includes(base)) {
        newValues[base] = { ...values[base] };
      }
    });
    
    updateState({
      displayValues: newValues
    });
  }

  /**
   * Set active base for programmer mode
   * @param {string} base - New active base
   */
  function setActiveBase(base) {
    if (BASES.includes(base)) {
      updateState({
        activeBase: base
      });
    } else {
      console.warn(`Invalid base: ${base}`);
    }
  }

  return {
    state: readonly(state),
    updateState,
    resetState,
    setAnimation,
    updateDisplayValues,
    setActiveBase
  };
}
