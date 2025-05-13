<template>
    <div>
      <!-- Desktop version - just a colored dot -->
      <div 
        v-if="!isMobile"
        class="transition-all duration-300"
        :class="networkStatus ? 'text-emerald-600 dark:text-emerald-300' : 'text-gray-600 dark:text-rose-300'"
        v-tippy="{ content: networkStatus ? 'Connected' : 'Not connected. Some functionality may not be available', placement: 'bottom' }"
      >
      <span v-if="networkStatus"><Wifi class="h-5 w-5"/></span>
      <span v-else><WifiOff class="h-5 w-5"/></span>
      </div>
    </div>
  </template>
  
  <script setup>
  import { networkStatus } from '@/router/errorHandler';
  import { ref, watch, computed } from 'vue';
  import { Wifi, WifiOff } from 'lucide-vue-next';
  import { useWindowSize } from '@vueuse/core';
  
  const showOnline = ref(false);
  const { width } = useWindowSize();
  const isMobile = computed(() => width.value < 768);
  
  watch(networkStatus, (newStatus) => {
    if (newStatus) {
      showOnline.value = true;
      setTimeout(() => {
        showOnline.value = false;
      }, 5000);
    }
  });
  </script>
  
  <style scoped>
  @keyframes slide-in {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes slide-out {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(100%);
      opacity: 0;
    }
  }

  .animate-slide-in {
    animation: slide-in 0.3s ease-out forwards;
  }
  </style>
