import { ref } from 'vue'

export function usePills(items) {
  const currentPill = ref('')
  const indicatorPosition = ref(0)
  const showIndicator = ref(true)

  const updatePillIndicator = (index) => {
    if (index < items.length) {
      indicatorPosition.value = items[index].indicatorOffset
      showIndicator.value = true
    } else {
      showIndicator.value = false
    }
  }

  const selectPill = (path, index) => {
    currentPill.value = path
    updatePillIndicator(index)
  }

  return {
    currentPill,
    indicatorPosition,
    showIndicator,
    updatePillIndicator,
    selectPill
  }
}