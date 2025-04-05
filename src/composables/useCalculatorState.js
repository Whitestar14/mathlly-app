import { reactive, readonly } from 'vue'

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
 * Provides unified state management for calculator
 * @param {string} initialMode - Initial calculator mode
 * @returns {Object} Calculator state and methods
 */
export function useCalculatorState(initialMode) {
  // Create a single reactive state object
  const state = reactive({
    input: '0',
    error: '',
    isAnimating: false,
    animatedResult: '',
    activeBase: 'DEC',
    displayValues: {
      DEC: { input: '0', display: '0' },
      BIN: { input: '0', display: '0' },
      HEX: { input: '0', display: '0' },
      OCT: { input: '0', display: '0' }
    },
    mode: initialMode || 'Standard'
  })

  // Remove preview calculation logic entirely

  /**
   * Update state with partial updates
   * @param {Partial<CalculatorState>} updates - Partial state updates
   */
  function updateState(updates) {
    Object.assign(state, updates)
  }

  /**
   * Reset state to initial values
   * @param {string} mode - Calculator mode
   */
  function resetState(mode = state.mode) {
    updateState({
      input: '0',
      error: '',
      isAnimating: false,
      animatedResult: '',
      mode,
      activeBase: 'DEC',
      displayValues: {
        DEC: { input: '0', display: '0' },
        BIN: { input: '0', display: '0' },
        HEX: { input: '0', display: '0' },
        OCT: { input: '0', display: '0' }
      }
    })
  }

  /**
   * Set animation state
   * @param {string} result - Result to animate
   */
  function setAnimation(result) {
    updateState({
      isAnimating: true,
      animatedResult: result
    })
    
    // Auto-clear animation after 1 second
    setTimeout(() => {
      updateState({
        isAnimating: false,
        animatedResult: ''
      })
    }, 1000)
  }

  /**
   * Update display values for programmer mode
   * @param {Object} values - New display values
   */
  function updateDisplayValues(values) {
    updateState({
      displayValues: { ...values }
    })
  }

  /**
   * Set active base for programmer mode
   * @param {string} base - New active base
   */
  function setActiveBase(base) {
    updateState({
      activeBase: base
    })
  }

  return {
    state: readonly(state),
    updateState,
    resetState,
    setAnimation,
    updateDisplayValues,
    setActiveBase
  }
}
