<template>
    <slot></slot>
  </template>
  
  <script setup>
  import { watch, onMounted } from 'vue';
  import { createPanelContext } from '@/composables/usePanel';
  import { useDeviceStore } from '@/stores/device';
  
  // Get the device store instance
  const device = useDeviceStore();
  const { actions } = createPanelContext();
  
  onMounted(() => {
    const isMobile = device.isMobile;
    actions.setMobile(isMobile);
  
    watch(() => device.isMobile, (newIsMobile) => {
      actions.setMobile(newIsMobile);
    });
  });
  </script>
  