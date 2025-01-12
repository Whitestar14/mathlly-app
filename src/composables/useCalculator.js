import { computed } from 'vue'
import { useDisplayStore } from '@/stores/display'
import { BasicCalculator } from '@/utils/BasicCalculator'
import { StandardCalculator } from '@/utils/StandardCalculator'
import { ProgrammerCalculator } from '@/utils/ProgrammerCalculator'

export function useCalculator(mode, settings) {
  const displayStore = useDisplayStore()

  const calculator = computed(() => {
    switch (mode) {
      case "Programmer": return new ProgrammerCalculator(settings)
      case "Standard": return new StandardCalculator(settings)
      default: return new BasicCalculator(settings)
    }
  })

  const updateDisplayState = () => {
    if (mode === "Programmer") {
      const updatedValues = calculator.value.updateDisplayValues()
      displayStore.updateDisplayValues(updatedValues)
      displayStore.updateState({
        input: updatedValues[displayStore.activeBase]?.input || "0",
        error: ""
      })
    }
  }

  return {
    calculator,
    updateDisplayState
  }
}