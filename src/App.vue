<template>
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

<script setup>
import { onUnmounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useFullscreen } from "@vueuse/core";
import { useDeviceStore } from "@/stores/device";
import { useSettingsStore } from "@/stores/settings";
import { useKeyboard } from "@/composables/useKeyboard";
import { usePanel } from "@/composables/usePanel";
import Toast from "@/components/base/FeatureToast.vue";
import AppHeader from "@/layouts/AppHeader.vue";
import SidebarMenu from "@/layouts/SidebarMenu.vue";

const router = useRouter();

// Make setup async
const setup = async () => {
  const deviceStore = useDeviceStore();
  const settingsStore = useSettingsStore();
  
  // Ensure minimum loading time of 1.2 seconds
  const minLoadTime = new Promise(resolve => setTimeout(resolve, 1200));
  
  await Promise.all([
    minLoadTime,
    settingsStore.loadSettings(),
    router.isReady(),
  ]);

  deviceStore.initializeDeviceInfo();

  return {
    deviceStore,
    settingsStore,
    settings: settingsStore,
    // Use activeMode which returns currentMode || defaultMode
    mode: computed(() => settingsStore.activeMode),
  };
};

const {
  deviceStore,
  settingsStore,
  settings,
  mode
} = await setup();

const {
  isOpen: isSidebarOpen,
  toggle,
  close,
  handleResize,
} = usePanel('sidebar', deviceStore.isMobile);

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
