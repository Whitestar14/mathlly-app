import { ref, computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'

export function useSidebar(isMobile) {
  const preferences = useLocalStorage('sidebar-preferences', {
    desktop: {
      isOpen: true,
      wasManuallyClosed: false
    },
    mobile: {
      isOpen: false
    }
  })

  const isOpen = ref(isMobile ? 
    preferences.value.mobile.isOpen : 
    preferences.value.desktop.wasManuallyClosed ? false : preferences.value.desktop.isOpen
  )

  const shouldAutoOpen = computed(() => {
    return !isMobile && !preferences.value.desktop.wasManuallyClosed
  })

  const toggle = () => {
    isOpen.value = !isOpen.value
    updatePreferences(true)
  }

  const close = () => {
    isOpen.value = false
    updatePreferences(true)
  }

  const updatePreferences = (isManualAction = false) => {
    if (isMobile) {
      preferences.value.mobile.isOpen = isOpen.value
    } else {
      preferences.value.desktop.isOpen = isOpen.value
      if (isManualAction) {
        preferences.value.desktop.wasManuallyClosed = !isOpen.value
      }
    }
  }

  const handleResize = (newIsMobile) => {
    // Preserve manual closure state when switching to desktop
    if (newIsMobile) {
      isOpen.value = false
    } else {
      isOpen.value = !preferences.value.desktop.wasManuallyClosed
    }
    updatePreferences(false)
  }

  return {
    isOpen,
    toggle,
    close,
    handleResize,
    shouldAutoOpen
  }
}