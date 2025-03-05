<template>
  <Suspense>
    <template #default>
      <AsyncLoader>
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

            <Suspense>
              <template #default>
                <router-view v-slot="{ Component }">
                  <Transition
                    name="fade"
                    mode="out-in"
                  >
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
              </template>
              <template #fallback>
                <base-loader variant="mini" />
              </template>
            </Suspense>
          </div>
          <toast />
        </div>
      </AsyncLoader>
    </template>
    <template #fallback>
      <base-loader
        variant="macro"
        message="Now Loading..."
      />
    </template>
  </Suspense>
</template>

<script setup>
import { onMounted, onUnmounted, provide, ref, computed, watch } from "vue";
import AsyncLoader from './components/AsyncLoader.vue';
import { useRouter, RouterView } from "vue-router";
import { useFullscreen } from "@vueuse/core";
import { useDeviceStore } from "@/stores/device";
import { useKeyboardStore } from "@/stores/keyboard";
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

onMounted(async () => {
  deviceStore.initializeDeviceInfo();
  try {
    await Promise.all([
      settingsStore.loadSettings(),
      router.isReady(),
      new Promise((resolve) => setTimeout(resolve, 800)),
    ]);
    settingsStore.setCurrentMode(settingsStore.defaultMode);
  } finally {
    const keyboardStore = useKeyboardStore();
    keyboardStore.debug = false;
  }
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
