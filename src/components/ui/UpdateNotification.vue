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

console.log('[UpdateNotification] Component initialized');
console.log('[UpdateNotification] Current version from store:', currentVersion.value);
console.log('[UpdateNotification] Updates enabled:', updatesEnabled.value);
console.log('[UpdateNotification] Previously dismissed version:', dismissedVersion.value);
console.log('[UpdateNotification] First version in changelog:', updates[0]?.version);

// Helper function to normalize version strings for comparison
const normalizeVersion = (version) => {
  // Remove 'v' prefix if present
  const normalized = version?.replace(/^v/, '') || '';
  console.log(`[UpdateNotification] Normalizing version: ${version} → ${normalized}`);
  return normalized;
};

// Helper function to compare versions (simple semver comparison)
const isNewerVersion = (latest, current) => {
  console.log(`[UpdateNotification] Comparing versions - Latest: ${latest}, Current: ${current}`);
  
  if (!latest || !current) {
    console.log('[UpdateNotification] Missing version information, cannot compare');
    return false;
  }
  
  const latestNorm = normalizeVersion(latest);
  const currentNorm = normalizeVersion(current);
  
  if (latestNorm === currentNorm) {
    console.log('[UpdateNotification] Versions are identical');
    return false;
  }
  
  // Split versions into components
  const latestParts = latestNorm.split('.').map(Number);
  const currentParts = currentNorm.split('.').map(Number);
  
  console.log(`[UpdateNotification] Latest parts:`, latestParts);
  console.log(`[UpdateNotification] Current parts:`, currentParts);
  
  // Compare major, minor, patch
  for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
    const latestPart = latestParts[i] || 0;
    const currentPart = currentParts[i] || 0;
    
    console.log(`[UpdateNotification] Comparing part ${i}: ${latestPart} vs ${currentPart}`);
    
    if (latestPart > currentPart) {
      console.log('[UpdateNotification] Latest version is newer');
      return true;
    }
    if (latestPart < currentPart) {
      console.log('[UpdateNotification] Latest version is older');
      return false;
    }
  }
  
  console.log('[UpdateNotification] Versions are equivalent');
  return false;
};

const fetchLatestVersion = async () => {
  console.log('[UpdateNotification] Fetching latest version information');
  
  try {
    // First, try to get the latest version from the updates array
    if (updates.length > 0) {
      console.log('[UpdateNotification] Using updates array for version info');
      
      // Get the first (most recent) update from the changelog
      const latestUpdate = updates[0];
      latestVersion.value = latestUpdate?.version || '';
      
      console.log(`[UpdateNotification] Latest version from changelog: ${latestVersion.value}`);
      console.log(`[UpdateNotification] Features:`, latestUpdate?.features);
      
      // Check if this is a newer version
      const isNewer = isNewerVersion(latestVersion.value, currentVersion.value);
      console.log(`[UpdateNotification] Is newer version? ${isNewer}`);
      
      // Only set update features if this is actually a newer version
      if (isNewer) {
        updateFeatures.value = latestUpdate?.features || [];
        console.log('[UpdateNotification] Set update features for newer version');
      } else {
        console.log('[UpdateNotification] Not setting features as version is not newer');
      }
      return;
    }
    
    // Fallback if updates array is empty
    console.log('[UpdateNotification] Updates array is empty, fetching from version-info.json');
    const timestamp = Date.now();
    const response = await fetch(`/version-info.json?t=${timestamp}`);
    
    if (!response.ok) {
      console.error('[UpdateNotification] Failed to fetch version-info.json:', response.status);
      throw new Error('Failed to fetch version-info.json');
    }
    
    const versionData = await response.json();
    console.log('[UpdateNotification] Fetched version data:', versionData);
    
    latestVersion.value = versionData.full || '';
    console.log(`[UpdateNotification] Latest version from version-info.json: ${latestVersion.value}`);
    
    // Find the update entry that matches the latest version
    const updateEntry = updates.find(u => normalizeVersion(u.version) === normalizeVersion(latestVersion.value));
    console.log('[UpdateNotification] Found matching update entry:', updateEntry);
    
    if (updateEntry && isNewerVersion(latestVersion.value, currentVersion.value)) {
      updateFeatures.value = updateEntry?.features || [];
      console.log('[UpdateNotification] Set update features from matching entry');
    } else {
      console.log('[UpdateNotification] No matching entry found or version is not newer');
    }
  } catch (error) {
    console.error('[UpdateNotification] Failed to fetch version info:', error);
  }
};

const toggleDetails = () => {
  showDetails.value = !showDetails.value;
  console.log(`[UpdateNotification] Toggled details: ${showDetails.value}`);
};

const handleWorkerUpdate = (event) => {
  console.log('[UpdateNotification] Service worker update event received:', event);
  
  if (event.detail) {
    console.log('[UpdateNotification] Service worker registration details:', event.detail);
    serviceWorkerRegistration.value = event.detail;
    showNotification.value = true;
    console.log('[UpdateNotification] Showing notification due to service worker update');
    fetchLatestVersion();
  } else {
    console.log('[UpdateNotification] No service worker registration details in event');
  }
};

// Check for updates periodically
const checkForUpdates = async () => {
  console.log('[UpdateNotification] Checking for updates...');
  
  if ('serviceWorker' in navigator) {
    try {
      console.log('[UpdateNotification] Updating service worker');
      const registration = await navigator.serviceWorker.ready;
      registration.update();
    } catch (error) {
      console.error('[UpdateNotification] Error updating service worker:', error);
    }
  } else {
    console.log('[UpdateNotification] Service worker not supported in this browser');
  }

  await fetchLatestVersion();
  
  console.log(`[UpdateNotification] After fetch - Current: ${currentVersion.value}, Latest: ${latestVersion.value}`);
  console.log(`[UpdateNotification] Previously dismissed: ${dismissedVersion.value}`);
  
  // Compare versions to determine if an update is available
  if (isNewerVersion(latestVersion.value, currentVersion.value)) {
    console.log('[UpdateNotification] Newer version is available');
    
    // Only show notification if this version hasn't been dismissed
    if (dismissedVersion.value !== latestVersion.value && !showNotification.value) {
      console.log(`[UpdateNotification] Showing notification for new version: ${latestVersion.value}`);
      showNotification.value = true;
    } else {
      console.log(`[UpdateNotification] Not showing notification - Already dismissed or already showing`);
    }
  } else {
    console.log('[UpdateNotification] No newer version available');
  }
};

// Use VueUse's useIntervalFn for periodic checks
const { pause, resume } = useIntervalFn(checkForUpdates, 60 * 60 * 1000, { 
  immediate: false, 
  immediateCallback: false
});

// Use VueUse's useEventListener for cleaner event handling
useEventListener(window, 'sw-update-available', handleWorkerUpdate);
console.log('[UpdateNotification] Registered event listener for sw-update-available');

// Refresh the app with the new version
const refreshApp = () => {
  console.log('[UpdateNotification] Refreshing app to update to new version');
  showNotification.value = false;
  const registration = serviceWorkerRegistration.value;

  if (registration?.waiting) {
    console.log('[UpdateNotification] Found waiting service worker');
    const worker = registration.waiting;
    
    useEventListener(worker, 'statechange', (event) => {
      console.log(`[UpdateNotification] Service worker state changed: ${event.target.state}`);
      if (event.target.state === 'activated') {
        console.log('[UpdateNotification] Service worker activated, reloading page');
        window.location.reload();
      }
    }, { once: true });

    if (worker.state === 'installed') {
      console.log('[UpdateNotification] Sending SKIP_WAITING message to worker');
      worker.postMessage({ type: 'SKIP_WAITING' });
    } else {
      console.log(`[UpdateNotification] Worker in ${worker.state} state, reloading page directly`);
      window.location.reload();
    }

    setTimeout(() => {
      if (!window.location.reloading) {
        console.log('[UpdateNotification] Fallback reload triggered after timeout');
        window.location.reloading = true;
        window.location.reload();
      }
    }, 3000);
  } else {
    console.log('[UpdateNotification] No waiting service worker, reloading page directly');
    window.location.reload();
  }
};

// Dismiss the update notification
const dismissUpdate = () => {
  console.log('[UpdateNotification] Dismissing update notification');
  showNotification.value = false;
  if (latestVersion.value) {
    console.log(`[UpdateNotification] Saving dismissed version: ${latestVersion.value}`);
    dismissedVersion.value = latestVersion.value;
  }
};

// Lifecycle hooks
onMounted(() => {
  console.log('[UpdateNotification] Component mounted');
  console.log('[UpdateNotification] Updates enabled:', updatesEnabled.value);
  
  if (updatesEnabled.value) {
    console.log('[UpdateNotification] Running initial update check');
    checkForUpdates();
    console.log('[UpdateNotification] Starting periodic update checks');
    resume();
  } else {
    console.log('[UpdateNotification] Update checks disabled in settings');
  }
});

onUnmounted(() => {
  console.log('[UpdateNotification] Component unmounted, pausing update checks');
  pause();
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
