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
  <UpdateNotification />
</template>

<script setup>
import { shallowRef, ref, onErrorCaptured, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSettingsStore } from '@/stores/settings';
import ErrorFallback from '@/layouts/navigation/ErrorFallback.vue';
import PanelProvider from '@/components/panel/PanelProvider.vue';
import AppSetup from '@/components/layout/AppSetup.vue';
import Loader from '@/components/base/BaseLoader.vue';
import UpdateNotification from '@/components/ui/UpdateNotification.vue';

const error = ref(null);
const hasError = shallowRef(false);
const router = useRouter();
const settingsStore = useSettingsStore();
const navigationComplete = shallowRef(false);

onErrorCaptured((err, instance, info) => {
  console.error("[Global Error Boundary Caught]:", err, instance, info);
  error.value = err;
  hasError.value = true;
  return false;
});

const redirect = async () => {
  if (router.currentRoute.value.path === '/') {
    const startupPath = settingsStore.getStartupPath();
    
    if (startupPath !== '/' && !navigationComplete.value) {
      try {
        navigationComplete.value = true;
        await router.push(startupPath);
      } catch (e) {
        console.error('Failed to navigate to startup page:', e);
      }
    }
  }
}

onMounted(async () => {
  await settingsStore.loadSettings();
  redirect();
});
</script>
