import { ref, computed, provide, inject, type Ref, type ComputedRef } from 'vue'
import { useRoute } from 'vue-router'
import type { CalculatorMode } from '@/composables/useCalculatorState'
import { validateCalculatorMode } from '@/utils/validation/typeGuard'

// Symbol for provide/inject
const CalculatorModeSwitcherSymbol = Symbol('CalculatorModeSwitcher')

interface ModeOption {
  value: CalculatorMode
  label: string
  shortLabel?: string
}

interface CalculatorModeSwitcherContext {
  currentMode: Ref<CalculatorMode>
  availableModes: ModeOption[]
  isCalculatorRoute: ComputedRef<boolean>
  updateMode: (newMode: string | CalculatorMode) => void
  shouldShowSwitcher: ComputedRef<boolean>
}

/**
 * Provider for calculator mode switcher context
 */
export function provideCalculatorModeSwitcher(initialMode: CalculatorMode = 'Standard') {
  const currentMode = ref<CalculatorMode>(initialMode)
  const route = useRoute()

  const availableModes: ModeOption[] = [
    { value: 'Standard', label: 'Standard', shortLabel: 'Std' },
    { value: 'Scientific', label: 'Scientific', shortLabel: 'Sci' },
    { value: 'Programmer', label: 'Programmer', shortLabel: 'Prog' }
  ]

  const isCalculatorRoute = computed(() => 
    route.path === '/calculator' || route.path.startsWith('/calculator/')
  )

  const shouldShowSwitcher = computed(() => isCalculatorRoute.value)

  const updateMode = (newMode: string | CalculatorMode) => {
    const validatedMode = validateCalculatorMode(newMode)
    currentMode.value = validatedMode
  }

  const context: CalculatorModeSwitcherContext = {
    currentMode,
    availableModes,
    isCalculatorRoute,
    updateMode,
    shouldShowSwitcher
  }

  provide(CalculatorModeSwitcherSymbol, context)
  
  return context
}

/**
 * Consumer for calculator mode switcher context
 */
export function useCalculatorModeSwitcher(): CalculatorModeSwitcherContext {
  const context = inject<CalculatorModeSwitcherContext>(CalculatorModeSwitcherSymbol)
  
  if (!context) {
    throw new Error('useCalculatorModeSwitcher must be used within a provider')
  }
  
  return context
}
