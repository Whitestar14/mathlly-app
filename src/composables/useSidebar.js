import { ref, watch } from 'vue'
import { useLocalStorage } from '@vueuse/core'

export function usePanel(storageKey, isMobile, defaultDesktopState = true) {
  const preferences = useLocalStorage(`${storageKey}-preferences`, {
    desktop: {
      isOpen: defaultDesktopState,
    },
    mobile: {
      isOpen: false
    }
  })

  const isOpen = ref(isMobile ? false : preferences.value.desktop.isOpen)

  const toggle = () => {
    isOpen.value = !isOpen.value
    updatePreferences()
  }

  const close = () => {
    isOpen.value = false
    updatePreferences()
  }

  const updatePreferences = () => {
    if (!isMobile) {
      preferences.value.desktop.isOpen = isOpen.value
    }
  }

  const handleResize = (newIsMobile) => {
    if (newIsMobile) {
      isOpen.value = false
    } else {
      isOpen.value = preferences.value.desktop.isOpen
    }
  }

  watch(isOpen, () => {
    updatePreferences()
  })

  return {
    isOpen,
    toggle,
    close,
    handleResize
  }
}