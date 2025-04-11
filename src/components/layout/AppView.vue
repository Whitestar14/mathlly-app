<template>
  <error-fallback v-if="hasError" :error="error" />
  <router-view v-else v-slot="{ Component, route }">
    <Transition name="fade" mode="out-in">
      <suspense>
        <template #default>
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
        </template>
        <template #fallback>
          <loader variant="regular" />
        </template>
      </suspense>
    </Transition>
  </router-view>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue';
import ErrorFallback from '@/layouts/navigation/ErrorFallback.vue';
import Loader from '@/components/base/BaseLoader.vue';

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
});

const emit = defineEmits(['settings-change', 'update:mode']);
const error = ref(null);
const hasError = ref(false);

// Ensure minimum loading time of 1.2 seconds
const minLoadTime = new Promise(resolve => setTimeout(resolve, 1200));

try {
  await Promise.all([minLoadTime]);
} catch (err) {
  error.value = err;
  hasError.value = true;
}

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

// Capture errors from route components without redirecting
onErrorCaptured((err) => {
  error.value = err;
  hasError.value = true;
  return false; // Prevent error from propagating
});
</script>