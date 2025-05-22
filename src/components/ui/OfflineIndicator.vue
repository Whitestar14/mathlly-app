<template>
  <div class="hidden md:inline-block">
    <div 
      v-tippy="{ 
        content: networkStatus ? 'Connected' : 'Not connected. Some functionality may not be available', 
        placement: 'bottom' 
      }"
      class="transition-all duration-300 rounded-full p-1 border transform-gpu"
      :class="[
        networkStatus 
          ? 'text-emerald-600 dark:text-emerald-300 border-emerald-500/30 dark:border-emerald-300/30' 
          : 'text-gray-600 dark:text-rose-300 border-gray-500/30 dark:border-rose-300/30',
        { 'animate-pulse-custom': isAnimating }
      ]"
    >
      <component :is="networkStatus ? Wifi : WifiOff" class="size-4"/>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { networkStatus } from '@/router/errorHandler';
import { Wifi, WifiOff } from 'lucide-vue-next';
import { useTimeoutFn } from '@vueuse/core';

defineProps({
  isMobile: Boolean
});

const isAnimating = ref(false);

const { start: startAnimation } = useTimeoutFn(() => {
  isAnimating.value = false;
}, 2000);

import { watchEffect } from 'vue';

watchEffect(() => {
  if (networkStatus.value !== undefined) {
    isAnimating.value = true;
    startAnimation();
  }
});
</script>

<style scoped>
@keyframes pulse-custom {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

.animate-pulse-custom {
  animation: pulse-custom 1s ease-in-out 2;
}
</style>
