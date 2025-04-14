<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4">
    <h1 class="text-2xl font-bold mb-4">
      {{ isRouteError ? 'Error Loading Page' : (isGlobalError ? 'Application Error' : 'An Error Occurred') }}
    </h1>
    <p v-if="path" class="mb-2">Could not load route: <code>{{ path }}</code></p>
    <p class="mb-4">
      {{ errorMessage }}
    </p>
    <pre v-if="errorDetails" class="bg-red-200 dark:bg-red-800 text-xs p-2 rounded overflow-auto max-w-lg mb-4">{{ errorDetails }}</pre>
    <button @click="goHome" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mr-2">Go Home</button>
    <button v-if="isRouteError" @click="retryNavigation" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Retry</button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { clearRouteError } from '@/router/errorHandler'; // Import clear function

const props = defineProps({
  error: {
    type: [Error, Object, String], // Can be an Error object or other types
    default: null,
  },
  path: { // Specific to route errors
    type: String,
    default: '',
  },
  isRouteError: { // Flag passed from /error route
      type: Boolean,
      default: false,
  },
   isGlobalError: { // Flag passed from App.vue's boundary
      type: Boolean,
      default: false,
  }
});

const router = useRouter();

const errorMessage = computed(() => {
  if (props.error instanceof Error) {
    return props.error.message || 'No error message provided.';
  }
  if (typeof props.error === 'string') {
      return props.error;
  }
  if (props.error?.message) {
      return props.error.message;
  }
  return 'An unknown error occurred.';
});

const errorDetails = computed(() => {
    if (props.error instanceof Error && props.error.stack) {
        // Keep details short in production?
        // if (import.meta.env.PROD) return props.error.message;
        return props.error.stack;
    }
    if (typeof props.error === 'object' && props.error !== null) {
        return JSON.stringify(props.error, null, 2);
    }
    return ''; // No details for string errors
});


const goHome = () => {
  clearRouteError(); // Clear any router error state
  router.push('/');
};

const retryNavigation = () => {
  const retryPath = props.path || router.options.history.state.back; // Get path from prop or history
  clearRouteError(); // Clear the error state *before* retrying
  if (retryPath && retryPath !== '/error') {
    router.push(retryPath); // Attempt to navigate again
  } else {
    router.push('/'); // Fallback to home if path is unknown
  }
};
</script>