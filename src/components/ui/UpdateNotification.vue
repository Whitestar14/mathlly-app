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
import { ref, onMounted, computed } from 'vue';
import {
  RefreshCwIcon,
  XIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon
} from 'lucide-vue-next';
import { useVersionStore } from '@/stores/version';
import { updates } from '@/data/changelog';
import BaseButton from '@/components/base/BaseButton.vue';

const versionStore = useVersionStore();
const showNotification = ref(false);
const showDetails = ref(false);
const latestVersion = ref(''); // From changelog/version-info.json for display
const updateFeatures = ref([]); // From changelog/version-info.json for display
const currentVersion = computed(() => versionStore.versionInfo.full);

// Store the service worker registration object when an update is available
const serviceWorkerRegistration = ref(null);

// Fetches details like version number and features for display in the notification
const fetchLatestVersionDetailsForDisplay = async () => {
  try {
    // This can still be from your 'updates' array or a fetch to version-info.json
    // For simplicity, assuming 'updates' is populated correctly.
    if (updates.length > 0) {
      latestVersion.value = updates[0]?.version || '';
      updateFeatures.value = updates[0]?.features || [];
    } else {
      // Fallback or fetch if 'updates' isn't immediately available
      // const response = await fetch('/version-info.json?t=' + new Date().getTime());
      // if (!response.ok) throw new Error('Failed to fetch version-info.json');
      // const versionData = await response.json();
      // latestVersion.value = versionData.full || '';
      // const updateEntry = updates.find(u => u.version === latestVersion.value.replace(/^v/, ''));
      // updateFeatures.value = updateEntry?.features || [];
      console.log('UpdateNotification: No changelog updates found or fetched for display.');
    }
  } catch (error) {
    console.error('UpdateNotification: Failed to fetch version info for display:', error);
  }
};

const handleServiceWorkerUpdateAvailable = (event) => {
  console.log('UpdateNotification: Event "sw-update-available" received.', event.detail);
  // No need to check registration.waiting here again, main.js already did.
  // The event should only be dispatched for valid update scenarios now.
  if (event.detail) {
      serviceWorkerRegistration.value = event.detail;
      showNotification.value = true;
      // fetchLatestVersionDetailsForDisplay(); // Fetch display details
  } else {
      console.warn('UpdateNotification: "sw-update-available" received without detail.');
  }
};

const refreshApp = () => {
  showNotification.value = false; // Hide notification
  const registration = serviceWorkerRegistration.value;

  if (registration && registration.waiting) {
    const worker = registration.waiting;
    console.log('UpdateNotification: User clicked "Update Now". Checking waiting worker state:', worker.state);

    // Add a listener for state change ONCE, right before sending skipWaiting
    worker.addEventListener('statechange', (event) => {
      if (event.target.state === 'activated') {
        console.log('UpdateNotification: Waiting worker activated via statechange. Reloading.');
        window.location.reload();
      }
    }, { once: true }); // Use { once: true } to auto-remove listener


    // Check state *before* sending message
    if (worker.state === 'installed') {
        console.log('UpdateNotification: Sending SKIP_WAITING to waiting worker.');
        worker.postMessage({ type: 'SKIP_WAITING' });
        // Don't reload immediately here. Wait for the 'activated' state change
        // or a timeout fallback.
    } else {
        // If worker somehow activated before SKIP_WAITING could be sent
        console.warn(`UpdateNotification: Waiting worker state is already "${worker.state}". Attempting reload directly.`);
        window.location.reload();
    }

    // Fallback timeout: If statechange doesn't fire within a few seconds
    setTimeout(() => {
        // Check if page is already reloading (e.g. statechange fired)
        if (!window.location.reloading) { // Simple flag to avoid multiple reloads
             console.warn('UpdateNotification: Timeout waiting for activation. Forcing reload.');
             window.location.reloading = true; // Set flag
             window.location.reload();
        }
    }, 3000); // 3 second timeout

  } else {
    console.warn('UpdateNotification: "Update Now" clicked, but no valid waiting service worker found. Forcing reload.');
    window.location.reload();
  }
};

// User dismisses the notification
const dismissUpdate = () => {
  showNotification.value = false;
  if (latestVersion.value) { // Use the displayed version from changelog
    localStorage.setItem('dismissed-version', latestVersion.value);
    console.log('UpdateNotification: User dismissed update for version:', latestVersion.value);
  }
};

// Checks for updates to the SW (by calling registration.update()) and version-info.json
const periodicUpdateCheck = () => {
  console.log('UpdateNotification: Performing periodic update check.');
  // 1. Trigger SW update check
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      console.log('UpdateNotification: Calling registration.update() for SW check.');
      registration.update(); // This tells the browser to check the server for a new SW script
    }).catch(error => {
      console.error('UpdateNotification: Error getting SW registration for update check:', error);
    });
  }

  // 2. Check version-info.json (mainly for display or as a secondary trigger if needed)
  // This logic can be more elaborate if you want it to also show the notification
  // independently of the SW 'sw-update-available' event.
  // For now, it primarily serves to get 'latestVersion' for display if SW update occurs.
  fetchLatestVersionDetailsForDisplay().then(() => {
    const current = currentVersion.value.replace(/^v/, '');
    const latest = latestVersion.value.replace(/^v/, '');
    if (latest && current && latest !== current) {
      const dismissedVersion = localStorage.getItem('dismissed-version');
      if (dismissedVersion !== latestVersion.value && !showNotification.value) {
        // Potentially show notification here too if SW hasn't already,
        // but ensure `refreshApp` can handle cases where there's no `serviceWorkerRegistration.value.waiting`.
        console.log('UpdateNotification: Version mismatch from version-info.json. Current:', current, 'Latest:', latest);
        // To avoid conflicts, only let SW event show the button that calls SKIP_WAITING.
        // If showing notification here, its "update" action might just be a reload.
      }
    }
  });
};

onMounted(() => {
  window.addEventListener('sw-update-available', handleServiceWorkerUpdateAvailable);
  periodicUpdateCheck(); // Initial check still useful
  // const updateInterval = setInterval(periodicUpdateCheck, 60 * 60 * 1000);

  // onUnmounted(() => {
  //   clearInterval(updateInterval);
  //   window.removeEventListener('sw-update-available', handleServiceWorkerUpdateAvailable);
  // });
});
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
