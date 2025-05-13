<template>
    <div v-if="updateAvailable" class="fixed bottom-0 inset-x-0 pb-2 sm:pb-5 z-50">
      <div class="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div class="p-2 rounded-lg bg-indigo-600 shadow-lg sm:p-3">
          <div class="flex items-center justify-between flex-wrap">
            <div class="w-0 flex-1 flex items-center">
              <span class="flex p-2 rounded-lg bg-indigo-800">
                <RefreshCwIcon class="h-6 w-6 text-white" />
              </span>
              <p class="ml-3 font-medium text-white truncate">
                <span>New version available!</span>
              </p>
            </div>
            <div class="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
              <button
                type="button"
                class="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50"
                @click="refreshApp"
              >
                Update now
              </button>
            </div>
            <div class="order-2 flex-shrink-0 sm:order-3 sm:ml-2">
              <button
                type="button"
                class="-mr-1 flex p-2 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-white"
                @click="updateAvailable = false"
              >
                <span class="sr-only">Dismiss</span>
                <XIcon class="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { RefreshCwIcon, XIcon } from 'lucide-vue-next';
  
  const updateAvailable = ref(false);
  
  const refreshApp = () => {
    updateAvailable.value = false;
    // This will trigger the controllerchange event and reload the page
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.update();
      });
    }
  };
  
  const handleUpdateFound = () => {
    updateAvailable.value = true;
  };
  
  onMounted(() => {
    window.addEventListener('sw-update-available', handleUpdateFound);
  });
  
  onUnmounted(() => {
    window.removeEventListener('sw-update-available', handleUpdateFound);
  });
  </script>
  