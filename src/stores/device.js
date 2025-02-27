import { defineStore } from "pinia";
import { ref, onUnmounted } from "vue";
import { useEventListener } from "@vueuse/core";

export const useDeviceStore = defineStore("device", () => {
  const isMobile = ref(false);
  const isResizing = ref(false);
  let resizeTimeout = null;

  const updateDeviceInfo = () => {
    if (resizeTimeout !== null) {
      clearTimeout(resizeTimeout);
      resizeTimeout = null;
    }

    if (!isResizing.value) {
      isResizing.value = true;
    }

    resizeTimeout = setTimeout(() => {
      const newIsMobile = window.innerWidth < 768;
      isMobile.value = newIsMobile;
      isResizing.value = false;
    }, 100);
  };

  const initializeDeviceInfo = () => {
    updateDeviceInfo();
    useEventListener(window, "resize", updateDeviceInfo);
  };

  const destroyDeviceInfo = () => {
    if (resizeTimeout !== null) {
      clearTimeout(resizeTimeout);
    }
  };

  onUnmounted(destroyDeviceInfo);

  return {
    isMobile,
    isResizing,
    updateDeviceInfo,
    initializeDeviceInfo,
    destroyDeviceInfo,
  };
});
