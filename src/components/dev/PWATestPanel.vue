<template>
  <div v-if="isPanelVisible" class="fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border max-w-xs">
    <div class="flex justify-between items-center mb-3">
      <h3 class="text-sm font-semibold">PWA Test Panel</h3>
      <button 
        @click="togglePanelVisibility" 
        class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      >
        ✕
      </button>
    </div>
    
    <div class="space-y-2 text-xs">
      <div>
        <strong>Current Version:</strong> {{ currentVersion || 'Unknown' }}
      </div>
      <div>
        <strong>Latest Version:</strong> {{ latestVersion || 'Unknown' }}
      </div>
      <div>
        <strong>Is Newer:</strong> 
        <span :class="isVersionNewer ? 'text-green-600' : 'text-gray-500'">
          {{ isVersionNewer }}
        </span>
      </div>
      <div>
        <strong>Needs Refresh:</strong> 
        <span :class="needRefresh ? 'text-green-600' : 'text-gray-500'">
          {{ needRefresh }}
        </span>
      </div>
      <div>
        <strong>Should Show Update:</strong> 
        <span :class="shouldShowUpdate ? 'text-green-600' : 'text-gray-500'">
          {{ shouldShowUpdate }}
        </span>
      </div>
      <div>
        <strong>Features:</strong> {{ updateFeatures.length }}
      </div>
    </div>
    
    <div class="mt-4 space-y-2">
      <button 
        class="btn btn-outline btn-sm w-full text-xs"
        @click="simulateBetaToStable"
      >
        Simulate Beta → Stable
      </button>
      
      <button 
        class="btn btn-outline btn-sm w-full text-xs"
        @click="simulateUpdate"
      >
        Simulate SW Update
      </button>
      
      <button 
        class="btn btn-outline btn-sm w-full text-xs"
        @click="populateUpdateInfo"
      >
        Check Version Updates
      </button>
      
      <button 
        class="btn btn-destructive btn-sm w-full text-xs"
        @click="clearUpdate"
      >
        Clear Update State
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePWA } from '@/composables/usePWA'

const {
  needRefresh,
  latestVersion,
  updateFeatures,
  shouldShowUpdate,
  currentVersion,
  isNewerVersion,
  populateUpdateInfo
} = usePWA()

const isPanelVisible = ref(true)

const togglePanelVisibility = () => {
  isPanelVisible.value = !isPanelVisible.value
}

// Test version comparison
const isVersionNewer = computed(() => {
  if (!latestVersion.value || !currentVersion.value) return false
  // Use the same logic as in usePWA
  return isNewerVersion(latestVersion.value, currentVersion.value)
})

const simulateBetaToStable = () => {
  // Simulate beta to stable update
  const currentVer = currentVersion.value || '0.11.13-beta'
  const stableVer = currentVer.replace('-beta', '')
  
  latestVersion.value = stableVer
  updateFeatures.value = [
    'Stable release - all features tested and verified',
    'Improved stability and performance',
    'Bug fixes from beta testing'
  ]
  needRefresh.value = false // This is a version update, not SW update
}

const simulateUpdate = () => {
  // Simulate service worker update
  needRefresh.value = true
  populateUpdateInfo()
}

const clearUpdate = () => {
  needRefresh.value = false
  latestVersion.value = ''
  updateFeatures.value = []
}
</script>
