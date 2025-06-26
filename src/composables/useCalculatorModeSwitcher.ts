import { ref, readonly, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLocalStorage } from '@vueuse/core'
import type { CalculatorMode } from '@/composables/useCalculatorState'

interface ModeOption {
  value: CalculatorMode
  label: string
  shortLabel?: string
}

// Global reactive state - no provide/inject needed
const currentMode = ref<CalculatorMode>('Standard')
const isInitialized = ref(false)

const availableModes: ModeOption[] = [
  { value: 'Standard', label: 'Standard', shortLabel: 'Std' },
  { value: 'Scientific', label: 'Scientific', shortLabel: 'Sci' },
  { value: 'Programmer', label: 'Programmer', shortLabel: 'Prog' }
]

// Persist mode to localStorage
const persistedMode = useLocalStorage<CalculatorMode>('calculator-mode', 'Standard')

/**
 * Initialize the calculator mode switcher
 */
export function initializeCalculatorModeSwitcher(initialMode?: CalculatorMode) {
  if (isInitialized.value) return

  // Use provided initial mode or fallback to persisted/default
  const modeToUse = initialMode || persistedMode.value || 'Standard'
  currentMode.value = modeToUse
  persistedMode.value = modeToUse
  isInitialized.value = true

  // Sync changes to localStorage
  const stopWatcher = currentMode.value !== persistedMode.value ? 
    (() => { persistedMode.value = currentMode.value }) : 
    undefined
  
  if (stopWatcher) stopWatcher()
}

/**
 * Main composable for calculator mode switching
 */
export function useCalculatorModeSwitcher() {
  const route = useRoute()

  // Auto-initialize if not already done
  if (!isInitialized.value) {
    initializeCalculatorModeSwitcher()
  }

  const isCalculatorRoute = computed(() => 
    route.path === '/calculator' || route.path.startsWith('/calculator/')
  )

  const shouldShowSwitcher = computed(() => isCalculatorRoute.value)

  const updateMode = (newMode: CalculatorMode) => {
    if (availableModes.some(mode => mode.value === newMode)) {
      currentMode.value = newMode
      persistedMode.value = newMode
    }
  }

  return {
    currentMode: readonly(currentMode),
    availableModes,
    isCalculatorRoute,
    shouldShowSwitcher,
    updateMode
  }
}

// Export for direct access if needed
export { currentMode as calculatorMode }
