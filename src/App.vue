<template>
  <error-fallback
    v-if="hasError"
    :error="error"
    :is-global-error="true" />
  <Suspense v-else>
    <template #default>
      <app-setup />
    </template>
    <template #fallback>
      <div class="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark">
        <loader variant="regular" />
      </div>
    </template>
  </Suspense>
</template>

<script setup>
import { ref, onErrorCaptured, provide } from 'vue';
import AppSetup from '@/components/layout/AppSetup.vue';
import Loader from '@/components/base/BaseLoader.vue';
import ErrorFallback from '@/layouts/navigation/ErrorFallback.vue'; // Use the same component

const error = ref(null);
const hasError = ref(false);

// --- Global Error Boundary ---
// This catches:
// 1. Errors during AppSetup's async setup() execution.
// 2. Errors thrown synchronously during AppSetup's render.
// 3. Errors bubbling up from *any* descendant component that aren't caught lower down.
onErrorCaptured((err, instance, info) => {
  console.error("[Global Error Boundary Caught]:", err, instance, info);
  error.value = err;
  hasError.value = true;
  return false;
});

// Optional: Provide a way for deep children to trigger the global error boundary if needed
provide('triggerGlobalError', (err) => {
  error.value = err;
  hasError.value = true;
});

</script>