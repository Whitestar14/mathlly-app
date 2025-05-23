<template>
  <Transition
    enter-active-class="transform transition duration-300 ease-out"
    enter-from-class="translate-y-10 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transform transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-10 opacity-0"
  >
    <div 
      v-if="showNotification"
      class="fixed bottom-4 right-4 z-50 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      style="width:clamp(300px,90vw,32rem);"
    >
      <!-- Header with version badge -->
      <div class="p-4 pb-3 flex items-start justify-between">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full">
            <RefreshCwIcon class="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
              Update Available
              <span class="ml-2 px-2 py-0.5 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                {{ latestVersion }}
              </span>
            </h3>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              A new version is ready to install
            </p>
          </div>
        </div>
        <button
          class="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 rounded-md"
          @click="dismissUpdate"
        >
          <span class="sr-only">Close</span>
          <XIcon class="h-5 w-5" />
        </button>
      </div>
      
      <!-- Update details (collapsible) -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="max-h-0 opacity-0"
        enter-to-class="max-h-[200px] opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="max-h-[200px] opacity-100"
        leave-to-class="max-h-0 opacity-0"
      >
        <div v-if="showDetails" class="px-4 pb-2 overflow-hidden">
          <div class="border-t border-gray-200 dark:border-gray-700 pt-2 mb-2 overflow-y-auto" style="max-height: calc(100vh - 12rem);">
            <h4 class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">What's new:</h4>
            <ul class="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
              <li v-for="(feature, index) in updateFeatures" :key="index" class="flex items-start">
                <CheckIcon class="h-3.5 w-3.5 text-green-500 dark:text-green-400 mr-1.5 mt-0.5 flex-shrink-0" />
                <span>{{ feature }}</span>
              </li>
            </ul>
          </div>
        </div>
      </Transition>
      
      <!-- Action buttons -->
      <div class="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 text-right sm:px-6 border-t border-gray-200 dark:border-gray-700">
        <div class="flex space-x-2 justify-end">
          <BaseButton 
            variant="outline" 
            size="sm" 
            @click="toggleDetails"
          >
            <span class="flex items-center">
              <component :is="showDetails ? ChevronUpIcon : ChevronDownIcon" class="h-4 w-4 mr-1" />
              {{ showDetails ? 'Hide' : 'Details' }}
            </span>
          </BaseButton>
          
          <BaseButton 
            variant="primary" 
            size="sm" 
            @click="refreshApp"
          >
            <span class="flex items-center">
              <RefreshCwIcon class="h-4 w-4 mr-1 animate-spin-slow" />
              Update Now
            </span>
          </BaseButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useIntervalFn, useEventListener, useLocalStorage } from '@vueuse/core';
import {
  RefreshCwIcon,
  XIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon
} from 'lucide-vue-next';
import { useVersionStore } from '@/stores/version';
import { useSettingsStore } from '@/stores/settings';
import { updates } from '@/data/changelog';
import BaseButton from '@/components/base/BaseButton.vue';

const versionStore = useVersionStore();
const settingsStore = useSettingsStore();
const showNotification = ref(false);
const showDetails = ref(false);
const latestVersion = ref('');
const updateFeatures = ref([]);
const serviceWorkerRegistration = ref(null);

const dismissedVersion = useLocalStorage('dismissed-version', '');

const currentVersion = computed(() => versionStore.versionInfo.full);
const updatesEnabled = computed(() => settingsStore.appearance.checkForUpdates !== false);

const fetchLatestVersion = async () => {
  try {
    if (updates.length > 0) {
      latestVersion.value = updates[0]?.version || '';
      updateFeatures.value = updates[0]?.features || [];
      return;
    }
    
    // Fallback if updates array is empty
    const timestamp = Date.now();
    const response = await fetch(`/version-info.json?t=${timestamp}`);
    if (!response.ok) throw new Error('Failed to fetch version-info.json');
    
    const versionData = await response.json();
    latestVersion.value = versionData.full || '';
    
    const updateEntry = updates.find(u => u.version === latestVersion.value.replace(/^v/, ''));
    updateFeatures.value = updateEntry?.features || [];
  } catch (error) {
    console.error('Failed to fetch version info for display:', error);
  }
};

const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};

const handleWorkerUpdate = (event) => {
  if (event.detail) {
    serviceWorkerRegistration.value = event.detail;
    showNotification.value = true;
    fetchLatestVersion();
  }
};

// Check for updates periodically
const checkForUpdates = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      registration.update();
    } catch (error) {
      console.error('Error updating service worker:', error);
    }
  }

  await fetchLatestVersion();
  
  const current = currentVersion.value?.replace(/^v/, '');
  const latest = latestVersion.value?.replace(/^v/, '');
  
  if (latest && current && latest !== current) {
    if (dismissedVersion.value !== latestVersion.value && !showNotification.value) {
      showNotification.value = true;
    }
  }
};

// Use VueUse's useIntervalFn for periodic checks
const { pause, resume } = useIntervalFn(checkForUpdates, 60 * 60 * 1000, { 
  immediate: false, 
  immediateCallback: false
});

// Use VueUse's useEventListener for cleaner event handling
useEventListener(window, 'sw-update-available', handleWorkerUpdate);

// Refresh the app with the new version
const refreshApp = () => {
  showNotification.value = false;
  const registration = serviceWorkerRegistration.value;

  if (registration?.waiting) {
    const worker = registration.waiting;
    
    useEventListener(worker, 'statechange', (event) => {
      if (event.target.state === 'activated') {
        window.location.reload();
      }
    }, { once: true });

    if (worker.state === 'installed') {
      worker.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }

    setTimeout(() => {
      if (!window.location.reloading) {
        window.location.reloading = true;
        window.location.reload();
      }
    }, 3000);
  } else {
    window.location.reload();
  }
};

// Dismiss the update notification
const dismissUpdate = () => {
  showNotification.value = false;
  if (latestVersion.value) {
    dismissedVersion.value = latestVersion.value;
  }
};

// Lifecycle hooks
onMounted(() => {
  if (updatesEnabled.value) {
    checkForUpdates();
    resume();
  }
});

onUnmounted(pause);
</script>

<style scoped>
.animate-spin-slow {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
