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
import { ref, onErrorCaptured, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSettingsStore } from '@/stores/settings';
import AppSetup from '@/components/layout/AppSetup.vue';
import PanelProvider from '@/components/panel/PanelProvider.vue';
import Loader from '@/components/base/BaseLoader.vue';
import ErrorFallback from '@/layouts/navigation/ErrorFallback.vue';

const error = ref(null);
const hasError = ref(false);
const router = useRouter();
const settingsStore = useSettingsStore();
const initialNavigationComplete = ref(false);

onErrorCaptured((err, instance, info) => {
  console.error("[Global Error Boundary Caught]:", err, instance, info);
  error.value = err;
  hasError.value = true;
  return false;
});

onMounted(async () => {
  // Load settings first
  await settingsStore.loadSettings();
  
  if (router.currentRoute.value.path === '/') {
    const startupPath = settingsStore.getStartupPath();
    
    if (startupPath !== '/' && !initialNavigationComplete.value) {
      try {
        initialNavigationComplete.value = true;
        await router.push(startupPath);
      } catch (e) {
        console.error('Failed to navigate to startup page:', e);
      }
    }
  }
});
</script>
