<template>
  <router-view v-slot="{ Component, route }">
    <Transition name="fade" mode="out-in">
      <component 
        :is="Component" 
        v-bind="shouldPassComponent(route.path) ? { 
          mode, 
          settings, 
          'is-mobile': isMobile 
        } : {}"
        v-on="shouldPassComponent(route.path) ? { 
          'settings-change': handleSettingsChange,
          'update:mode': handleModeUpdate
        } : {}"
      />
    </Transition>
  </router-view>
</template>

<script setup>
defineProps({
  mode: {
    type: String,
    required: true,
  },
  settings: {
    type: Object,
    required: true,
  },
  isMobile: {
    type: Boolean,
    required: true,
  }
})

const emit = defineEmits(['settings-change', 'update:mode'])

// Ensure minimum loading time of 1.2 seconds
const minLoadTime = new Promise(resolve => setTimeout(resolve, 1200))

await Promise.all([minLoadTime])

// Handle settings changes from child components
const handleSettingsChange = (newSettings) => {
  emit('settings-change', newSettings);
};

// Handle mode updates from child components
const handleModeUpdate = (newMode) => {
  emit('update:mode', newMode);
};

/**
 * Determines if props and event listeners should be passed to the current route component
 * @param {string} path - Current route path
 * @returns {boolean} - True if props should be passed, false otherwise
 */
const shouldPassComponent = (path) => {
  return path.includes('/calculator');
};
</script>