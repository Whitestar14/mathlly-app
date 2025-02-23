import { ref } from 'vue'
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

  // Respect manual closure state on initial load
  const isOpen = ref(isMobile ? false : 
    preferences.value.desktop.wasManuallyClosed ? false : preferences.value.desktop.isOpen
  )

  const toggle = () => {
    isOpen.value = !isOpen.value
    updatePreferences(true)
  }

  const close = () => {
    isOpen.value = false
    updatePreferences(true)
  }

  const updatePreferences = (isManualAction = false) => {
    if (!isMobile) {
      preferences.value.desktop.isOpen = isOpen.value
      if (isManualAction) {
        // Update manual closure state
        preferences.value.desktop.wasManuallyClosed = !isOpen.value
      }
    }
  }

  const handleResize = (newIsMobile) => {
    if (newIsMobile) {
      isOpen.value = false
    } else {
      // Respect manual closure state when switching to desktop
      isOpen.value = preferences.value.desktop.wasManuallyClosed ? 
        false : 
        preferences.value.desktop.isOpen
    }
  }

  return {
    isOpen,
    toggle,
    close,
    handleResize
  }
}