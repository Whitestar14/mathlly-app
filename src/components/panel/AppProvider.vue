<template>
  <div 
    class="min-h-screen flex bg-background dark:bg-background-dark transition-colors duration-300"
    :class="globalClasses"
  >
    <slot />
  </div>
</template>
  
<script setup>
import { watch, onMounted, computed } from 'vue';
import { createPanelContext } from '@/composables/usePanel';
import { useDeviceStore } from '@/stores/device';
import { useSettingsStore } from '@/stores/settings';
  
// Get the device store instance
const device = useDeviceStore();
const settings = useSettingsStore();
const { actions } = createPanelContext();
  
onMounted(() => {
  const isMobile = device.isMobile;
  actions.setMobile(isMobile);
  updateTextSizeClasses(textSize.value);
});
  
watch(() => device.isMobile, (newIsMobile) => {
  actions.setMobile(newIsMobile);
});

// Moved from AppSetup.vue
const globalClasses = computed(() => {
  const classes = [];
  if (settings.appearance.animationDisabled) {
    classes.push('animation-disabled');
  }
  return classes;
});

const textSize = computed(() => settings.display.textSize || "medium");

const updateTextSizeClasses = newSize => {
  const root = document.documentElement;
  root.classList.remove("ts-small", "ts-normal", "ts-medium", "ts-large");
  if (newSize) {
    root.classList.add(`ts-${newSize}`);
  }
};

watch(textSize, updateTextSizeClasses, { immediate: true });
</script>
