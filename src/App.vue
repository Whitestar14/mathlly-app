<template>
  <error-fallback v-if="hasError" :error="error" />
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
import { ref, onErrorCaptured } from 'vue';
import AppSetup from '@/components/layout/AppSetup.vue';
import Loader from '@/components/base/BaseLoader.vue';
import ErrorFallback from '@/layouts/navigation/ErrorFallback.vue';

const error = ref(null);
const hasError = ref(false);

onErrorCaptured((err) => {
  error.value = err;
  hasError.value = true;
  return false;
});
</script>
