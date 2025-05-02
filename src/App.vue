<template>
  <error-fallback
    v-if="hasError"
    :error="error"
    :is-global-error="true" />
  <Suspense v-else>
    <template #default>
      <PanelProvider>
        <app-setup />
      </PanelProvider>
    </template>
    <template #fallback>
      <div class="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark">
        <loader variant="regular" />
      </div>
    </template>
  </Suspense>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue';
import AppSetup from '@/components/layout/AppSetup.vue';
import PanelProvider from '@/components/panel/PanelProvider.vue';
import Loader from '@/components/base/BaseLoader.vue';
import ErrorFallback from '@/layouts/navigation/ErrorFallback.vue';

const error = ref(null);
const hasError = ref(false);

onErrorCaptured((err, instance, info) => {
  console.error("[Global Error Boundary Caught]:", err, instance, info);
  error.value = err;
  hasError.value = true;
  return false;
});
</script>