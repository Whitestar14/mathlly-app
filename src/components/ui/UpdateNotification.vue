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
      v-if="shouldShowUpdate"
      class="fixed bottom-4 right-4 z-50 w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      style="width: clamp(300px, 90vw, 32rem);"
    >
      <!-- Header -->
      <div class="p-4 pb-3 flex items-start justify-between">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full">
            <RefreshCwIcon class="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
              Update Available
              <span 
                v-if="latestVersion" 
                class="ml-2 px-2 py-0.5 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
              >
                {{ latestVersion }}
              </span>
            </h3>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {{ needRefresh ? 'A new version is ready to install' : 'New features available' }}
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
      
      <!-- Update details -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="max-h-0 opacity-0"
        enter-to-class="max-h-[200px] opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="max-h-[200px] opacity-100"
        leave-to-class="max-h-0 opacity-0"
      >
        <div v-if="showDetails && updateFeatures.length > 0" class="px-4 pb-2 overflow-hidden">
          <div class="border-t border-gray-200 dark:border-gray-700 pt-2 mb-2 overflow-y-auto" style="max-height: calc(100vh - 12rem);">
            <h4 class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              What's new:
            </h4>
            <ul class="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
              <li
                v-for="(feature, index) in updateFeatures"
                :key="index"
                class="flex items-start"
              >
                <CheckIcon class="h-3.5 w-3.5 text-green-500 dark:text-green-400 mr-1.5 mt-0.5 flex-shrink-0" />
                <span>{{ feature }}</span>
              </li>
            </ul>
          </div>
        </div>
      </Transition>
      
      <!-- Action buttons -->
      <div class="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 text-right sm:px-6 border-t border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center">
          <button
            v-if="updateFeatures.length > 0"
            class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 rounded-md px-2 py-1"
            @click="toggleDetails"
          >
            {{ showDetails ? 'Hide details' : 'Show details' }}
          </button>
          <div class="flex space-x-2">
            <button
              class="btn btn-ghost btn-sm text-xs px-3 py-1.5"
              @click="dismissUpdate"
            >
              Later
            </button>
            <button
              class="btn btn-primary btn-sm text-xs px-3 py-1.5"
              :disabled="isUpdating"
              @click="handleUpdate"
            >
              <RefreshCwIcon 
                v-if="isUpdating" 
                class="h-3.5 w-3.5 mr-1 animate-spin" 
              />
              {{ isUpdating ? 'Updating...' : 'Update' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RefreshCwIcon, XIcon, CheckIcon } from 'lucide-vue-next'
import { usePWA } from '@/composables/usePWA'

// Use the PWA composable
const {
  needRefresh,
  latestVersion,
  updateFeatures,
  shouldShowUpdate,
  updateApp,
  dismissUpdate
} = usePWA()

// Local state
const showDetails = ref(false)
const isUpdating = ref(false)

/**
 * Toggle update details visibility
 */
const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

/**
 * Handle update button click
 */
const handleUpdate = async () => {
  if (isUpdating.value) return
  
  isUpdating.value = true
  
  try {
    await updateApp()
  } catch (error) {
    console.error('Failed to update:', error)
  } finally {
    isUpdating.value = false
  }
}
</script>
