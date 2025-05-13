<template>
    <div>
      <!-- Desktop version - just a colored dot -->
      <div 
        v-if="!isMobile"
        class="fixed bottom-4 left-4 z-50 h-2 w-2 rounded-full shadow-md transition-all duration-300"
        :class="networkStatus ? 'bg-emerald-600 dark:bg-emerald-300' : 'bg-rose-600 dark:bg-rose-300'"
        v-tippy="{ content: networkStatus ? 'Online' : 'Offline', placement: 'right' }"
      />
  
      <!-- Mobile version - full badge with text -->
      <BaseBadge
        v-if="!networkStatus && isMobile"
        type="special"
        text="Offline"
        showNotch
        class="fixed bottom-4 left-4 z-50 animate-slide-in"
      />
      <BaseBadge
        v-if="showOnline && isMobile"
        type="new"
        text="Online"
        showNotch
        class="fixed bottom-4 left-4 z-50 animate-slide-in"
      />
    </div>
  </template>
  
  <script setup>
  import { networkStatus } from '@/router/errorHandler';
  import { ref, watch, computed } from 'vue';
  import { useWindowSize } from '@vueuse/core';
  import BaseBadge from '@/components/base/BaseBadge.vue';
  
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
