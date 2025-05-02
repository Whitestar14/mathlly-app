<template>
    <slot></slot>
  </template>
  
  <script setup>
  import { watch, onMounted } from 'vue';
  import { createPanelContext } from '@/composables/usePanelUnified';
  import { useDeviceStore } from '@/stores/device';
  
  // Get the device store instance
  const deviceStore = useDeviceStore();
  const { actions } = createPanelContext();
  
  onMounted(() => {
    const isMobile = deviceStore.isMobile;
    actions.setMobile(isMobile);
  
    watch(() => deviceStore.isMobile, (newIsMobile) => {
      actions.setMobile(newIsMobile);
    });
  });
  </script>
  