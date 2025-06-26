<template>
  <div>
    <ErrorFallback
      v-if="hasError"
      :error="error"
      :is-global-error="true"
    />
    <Suspense v-else>
      <template #default>
        <AppProvider>
          <AppSetup />
        </AppProvider>
      </template>
      <template #fallback>
        <div class="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark">
          <Loader variant="regular" />
        </div>
      </template>
    </Suspense>
    <UpdateNotification />
    <!-- PWA Test Panel (development only) -->
    <PWATestPanel v-show="isDev" />
  </div>
</template>

<script setup lang="ts">
import { shallowRef, onErrorCaptured, type Ref, type ComponentPublicInstance } from 'vue';
import { hasError } from "@/router/errorHandler";
import ErrorFallback from '@/layouts/navigation/ErrorFallback.vue';
import AppProvider from '@/components/panel/AppProvider.vue';
import AppSetup from '@/components/layout/AppSetup.vue';
import Loader from '@/components/base/BaseLoader.vue';
import UpdateNotification from '@/components/ui/UpdateNotification.vue';
import PWATestPanel from '@/components/dev/PWATestPanel.vue';

const error: Ref<Error | null> = shallowRef(null);
const isDev: Ref<boolean> = shallowRef(import.meta.env.DEV);

onErrorCaptured((err: Error, instance: ComponentPublicInstance | null, info: string): boolean => {
  console.error("[Global Error Boundary Caught]:", err, instance, info);
  error.value = err;
  hasError.value = true;
  return false;
});
</script>
