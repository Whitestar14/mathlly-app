<template>
  <div>
    <error-fallback
      v-if="hasError"
      :error="error"
      :is-global-error="true"
    />
    <Suspense v-else>
      <template #default>
        <AppProvider>
          <app-setup />
        </AppProvider>
      </template>
      <template #fallback>
        <div class="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark">
          <loader variant="regular" />
        </div>
      </template>
    </Suspense>
    <UpdateNotification />
  </div>
</template>

<script setup>
import { shallowRef, onErrorCaptured } from 'vue';
import { hasError } from "@/router/errorHandler"
import ErrorFallback from '@/layouts/navigation/ErrorFallback.vue';
import AppProvider from '@/components/panel/AppProvider.vue';
import AppSetup from '@/components/layout/AppSetup.vue';
import Loader from '@/components/base/BaseLoader.vue';
import UpdateNotification from '@/components/ui/UpdateNotification.vue';

const error = shallowRef(null);

onErrorCaptured((err, instance, info) => {
  console.error("[Global Error Boundary Caught]:", err, instance, info);
  error.value = err;
  hasError.value = true;
  return false;
});
</script>
