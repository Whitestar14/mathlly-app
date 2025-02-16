import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useEventListener } from '@vueuse/core'

export const useDeviceStore = defineStore('device', () => {
  const isMobile = ref(false)
  const isResizing = ref(false)
  let resizeTimeout

  const updateDeviceInfo = () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
    }
    
    if (!isResizing.value) {
      isResizing.value = true
    }

    resizeTimeout = setTimeout(() => {
      const newIsMobile = window.innerWidth < 768
      isMobile.value = newIsMobile
      isResizing.value = false
    }, 100)
  }

  const initializeDeviceInfo = () => {
    updateDeviceInfo()
    useEventListener(window, 'resize', updateDeviceInfo)
  }

  const destroyDeviceInfo = () => {
    clearTimeout(resizeTimeout)
  }

  return {
    isMobile,
    isResizing,
    updateDeviceInfo,
    initializeDeviceInfo,
    destroyDeviceInfo
  }
})