<template>
  <Suspense>
    <template #default>
      <div
        class="min-h-screen flex bg-background dark:bg-background-dark transition-colors duration-300"
        :class="{
          'animation-disabled': settings.animationDisabled,
        }"
      >
        <sidebar-menu
          :is-open="isSidebarOpen"
          :is-mobile="deviceStore.isMobile"
          @update:isOpen="close"
        />

        <div
          class="flex flex-col flex-grow transition-all duration-300 ease-in-out"
          :class="[!deviceStore.isMobile && isSidebarOpen ? 'ml-64' : '']"
        >
          <app-header
            :is-open="isSidebarOpen"
            :is-mobile="deviceStore.isMobile"
            @toggle-sidebar="toggle"
          />
          <router-view v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
              <component
                :is="Component"
                :mode="mode"
                :settings="settings"
                :is-mobile="deviceStore.isMobile"
                @settings-change="updateSettings"
                @update:mode="updateMode"
              />
            </Transition>
          </router-view>
        </div>
        <toast />
      </div>
    </template>
    <template #fallback><base-loader /></template>
  </Suspense>
</template>

<script setup>
import { onUnmounted, onMounted, provide, ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useFullscreen } from "@vueuse/core";
import { useDeviceStore } from "@/stores/device";
import { useSettingsStore } from "@/stores/settings";
import { useKeyboard } from "@/composables/useKeyboard";
import { useSidebar } from "@/composables/useSidebar";
import Toast from "@/components/base/FeatureToast.vue";
import BaseLoader from "@/components/base/BaseLoader.vue";
import AppHeader from "@/layouts/AppHeader.vue";
import SidebarMenu from "@/layouts/SidebarMenu.vue";

const currentInput = ref("0");
const router = useRouter();
const deviceStore = useDeviceStore();
const settingsStore = useSettingsStore();
const settings = settingsStore;
const mode = computed(() => settingsStore.activeMode);
const {
  isOpen: isSidebarOpen,
  toggle,
  close,
  handleResize,
} = useSidebar(deviceStore.isMobile);

provide("currentInput", currentInput);

const updateMode = async (newMode) => {
  settingsStore.setCurrentMode(newMode);
};

const updateSettings = async (newSettings) => {
  if (newSettings.mode !== settingsStore.mode) {
    await settingsStore.setDefaultMode(newSettings.mode);
  }
  const settingsToSave = { ...newSettings };
  delete settingsToSave.mode;
  await settingsStore.saveSettings(settingsToSave);
};

watch(
  () => deviceStore.isMobile,
  (newIsMobile) => {
    handleResize(newIsMobile);
  }
);

watch(router.currentRoute, () => {
  if (deviceStore.isMobile) {
    close();
  }
});

useKeyboard("global", {
  toggleSidebar: () => {
    toggle();
  },
  openSettings: () => {
    router.push("/settings");
  },
  toggleFullscreen: () => {
    useFullscreen(document.documentElement).toggle();
  },
});

const initializeApp = async () => {
  deviceStore.initializeDeviceInfo();
  try {
    await Promise.all([
      settingsStore.loadSettings(),
      router.isReady(),
      new Promise((resolve) => setTimeout(resolve, 800)),
    ]);
    settingsStore.setCurrentMode(settingsStore.defaultMode);
  } catch (error) {
    console.error("AsyncLoader caught an error:", error);
    return false;
  }
};

onMounted(initializeApp);

onUnmounted(() => {
  deviceStore.destroyDeviceInfo();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 300ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
