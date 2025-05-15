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
      class="fixed bottom-4 right-4 z-50 w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
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
          <div class="border-t border-gray-200 dark:border-gray-700 pt-2 mb-2">
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
            <span v-if="!showDetails" class="flex items-center">
              <ChevronDownIcon class="h-4 w-4 mr-1" />
              Details
            </span>
            <span v-else class="flex items-center">
              <ChevronUpIcon class="h-4 w-4 mr-1" />
              Hide
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
import { ref, computed, watch } from 'vue';
import { useIntervalFn, useEventListener } from '@vueuse/core';
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
const currentVersion = computed(() => versionStore.versionInfo.full);
const updatesEnabled = computed(() => settingsStore.appearance.checkForUpdates !== false);

const serviceWorkerRegistration = ref(null);

// Fetches details like version number and features for display in the notification
const fetchLatestVersion = async () => {
  try {
    if (updates.length > 0) {
      latestVersion.value = updates[0]?.version || '';
      updateFeatures.value = updates[0]?.features || [];
    } else {
      // Fallback or fetch if 'updates' isn't immediately available
      const response = await fetch('/version-info.json?t=' + new Date().getTime());
      if (!response.ok) throw new Error('Failed to fetch version-info.json');
      const versionData = await response.json();
      latestVersion.value = versionData.full || '';
      const updateEntry = updates.find(u => u.version === latestVersion.value.replace(/^v/, ''));
      updateFeatures.value = updateEntry?.features || [];
    }
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
    fetchLatestVersion(); // Fetch display details
  } else {
    console.warn('"sw-update-available" received without detail.');
  }
};

const periodicUpdateCheck = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.update(); // This tells the browser to check the server for a new SW script
    }).catch(error => {
      console.error('Error getting SW registration for update check:', error);
    });
  }

  fetchLatestVersion().then(() => {
    const current = currentVersion.value.replace(/^v/, '');
    const latest = latestVersion.value.replace(/^v/, '');
    if (latest && current && latest !== current) {
      const dismissedVersion = localStorage.getItem('dismissed-version');
      if (dismissedVersion !== latestVersion.value && !showNotification.value) {
        console.log('Version mismatch from version-info.json. Current:', current, 'Latest:', latest);
        showNotification.value = true;
      }
    }
  });
};

const { pause, resume } = useIntervalFn(periodicUpdateCheck, 60 * 60 * 1000, { 
  immediate: false, 
  immediateCallback: false
});

watch(updatesEnabled, (newValue) => {
  if (newValue) {
    periodicUpdateCheck();
    resume();
  } else {
    pause();
  }
});

// Use VueUse's useEventListener for cleaner event handling
useEventListener(window, 'sw-update-available', handleWorkerUpdate);

const refreshApp = () => {
  showNotification.value = false; // Hide notification
  const registration = serviceWorkerRegistration.value;

  if (registration && registration.waiting) {
    const worker = registration.waiting;
    // Add a listener for state change ONCE, right before sending skipWaiting
    worker.addEventListener('statechange', (event) => {
      if (event.target.state === 'activated') {
        window.location.reload();
      }
    }, { once: true }); // Use { once: true } to auto-remove listener

    // Check state *before* sending message
    if (worker.state === 'installed') {
        worker.postMessage({ type: 'SKIP_WAITING' });
    } else {
        console.warn(`Waiting worker state is already "${worker.state}". Attempting reload directly.`);
        window.location.reload();
    }

    setTimeout(() => {
        if (!window.location.reloading) { // Simple flag to avoid multiple reloads
             window.location.reloading = true; // Set flag
             window.location.reload();
        }
    }, 3000);

  } else {
    console.warn('"Update Now" clicked, but no valid waiting service worker found. Forcing reload.');
    window.location.reload();
  }
};

// User dismisses the notification
const dismissUpdate = () => {
  showNotification.value = false;
  if (latestVersion.value) { // Use the displayed version from changelog
    localStorage.setItem('dismissed-version', latestVersion.value);
  }
};
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
