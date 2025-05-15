<template>
  <div>
    <div 
      v-if="!isMobile"
      class="transition-all duration-300 rounded-full p-1 border"
      :class="[
        networkStatus 
          ? 'text-emerald-600 dark:text-emerald-300 border-emerald-500/30 dark:border-emerald-300/30' 
          : 'text-gray-600 dark:text-rose-300 border-gray-500/30 dark:border-rose-300/30',
        { 'animate-pulse': isAnimating }
      ]"
    >
    <div v-tippy="{ content: networkStatus ? 'Connected' : 'Not connected. Some functionality may not be available', placement: 'bottom' }">
      <span v-if="networkStatus"><Wifi class="size-4"/></span>
      <span v-else><WifiOff class="size-4"/></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { networkStatus } from '@/router/errorHandler';
import { Wifi, WifiOff } from 'lucide-vue-next';

defineProps({
  isMobile: Boolean
});

// Track animation state
const isAnimating = ref(false);

watch(networkStatus, () => {
  isAnimating.value = true;
  
  setTimeout(() => {
    isAnimating.value = false;
  }, 2000);
}, { immediate: true });
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

.animate-pulse {
  animation: pulse-custom 1s ease-in-out 3;
}
</style>
