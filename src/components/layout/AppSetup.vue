<template>
  <div class="min-h-screen flex bg-background dark:bg-background-dark duration-300" :class="{
    'animation-disabled': settings.animationDisabled,
  }">
    <sidebar-menu :is-open="isSidebarOpen" :is-mobile="deviceStore.isMobile" @update:isOpen="closeSidebar" />
    <div class="flex flex-col flex-grow duration-300" :class="mainContentClasses">
      <app-header :is-mobile="deviceStore.isMobile" :is-sidebar-open="isSidebarOpen" :is-menubar-open="isMenubarOpen"
        @toggle-sidebar="toggleSidebar" @toggle-menubar="toggleMenubar" />

      <app-view :mode="mode" :settings="settings" :is-mobile="deviceStore.isMobile" @settings-change="updateSettings"
        @update:mode="updateMode" />
    </div>

    <main-menu :is-open="isMenubarOpen" :is-mobile="deviceStore.isMobile" @update:isOpen="closeMenubar" />
    <toast :is-mobile="deviceStore.isMobile" />
  </div>
</template>

<script setup>
import { onUnmounted, computed, ref } from "vue"
import { useRouter } from "vue-router"
import { useFullscreen } from "@vueuse/core"
import { useDeviceStore } from "@/stores/device"
import { useSettingsStore } from "@/stores/settings"
import { useKeyboard } from "@/composables/useKeyboard"
import MainMenu from "@/components/layout/MainMenu.vue"
import AppHeader from "@/components/layout/AppHeader.vue"
import SidebarMenu from "@/components/layout/SidebarMenu.vue"
import AppView from "@/components/layout/AppView.vue"
import Toast from "@/components/feedback/BaseToast.vue"

const router = useRouter()
const deviceStore = useDeviceStore()
const settingsStore = useSettingsStore()

// --- Loading Logic ---
const minLoadTime = new Promise(resolve => setTimeout(resolve, 1000)) // Keep minimum load time for UX

await Promise.all([
  minLoadTime,
  settingsStore.loadSettings(),
  router.isReady(),
])

deviceStore.initializeDeviceInfo()

const settings = settingsStore
const mode = computed(() => settingsStore.activeMode)

// Use the unified panel composable for sidebar
const isSidebarOpen = ref(false);
const isMenubarOpen = ref(false);

const closeSidebar = () => isSidebarOpen.value = false;
const closeMenubar = () => isMenubarOpen.value = false;

const toggleSidebar = () => isSidebarOpen.value = !isSidebarOpen.value;
const toggleMenubar = () => isMenubarOpen.value = !isMenubarOpen.value;

const mainContentClasses = computed(() => {
  const classes = [];
  
  // Add padding for sidebar when open on desktop
  if (!deviceStore.isMobile && isSidebarOpen.value) {
    classes.push('pl-64');
  }
  
  // Add padding for menu when open on desktop
  if (!deviceStore.isMobile && isMenubarOpen.value) {
    classes.push('pr-64');
  }
  
  return classes;
});

const updateMode = async (newMode) => {
  settingsStore.setCurrentMode(newMode)
}

const updateSettings = async (newSettings) => {
  if (newSettings.mode !== settingsStore.mode) {
    await settingsStore.setDefaultMode(newSettings.mode)
  }
  const settingsToSave = { ...newSettings }
  delete settingsToSave.mode
  await settingsStore.saveSettings(settingsToSave)
}

// --- Keyboard Shortcuts ---
useKeyboard("global", {
  toggleSidebar,
  toggleMenubar,
  toggleFullscreen: () => {
    useFullscreen(document.documentElement).toggle()
  },
})

onUnmounted(() => {
  deviceStore.destroyDeviceInfo()
})
</script>
