<template>
  <div class="min-h-screen flex bg-background dark:bg-background-dark duration-300" :class="{
    'animation-disabled': settings.animationDisabled,
  }">
    <sidebar-menu :is-mobile="deviceStore.isMobile" @sidebar-close="sidebarPanel.close()" />
    <div class="flex flex-col flex-grow duration-300" :class="mainContentClasses">
      <app-header :is-mobile="deviceStore.isMobile" :is-sidebar-open="sidebarPanel.isOpen" :is-menubar-open="menuPanel.isOpen"
        @toggle-sidebar="toggleSidebar" @toggle-menubar="toggleMenubar" />

      <app-view :mode="mode" :settings="settings" :is-mobile="deviceStore.isMobile" @settings-change="updateSettings"
        @update:mode="updateMode" />
    </div>

    <main-menu />
    <toast :is-mobile="deviceStore.isMobile" />
  </div>
</template>

<script setup>
import { onUnmounted, computed } from "vue"
import { useRouter } from "vue-router"
import { useFullscreen } from "@vueuse/core"
import { useDeviceStore } from "@/stores/device"
import { useSettingsStore } from "@/stores/settings"
import { useKeyboard } from "@/composables/useKeyboard"
import { usePanel } from "@/composables/usePanel"
import MainMenu from "@/components/layout/MainMenu.vue"
import AppHeader from "@/components/layout/AppHeader.vue"
import SidebarMenu from "@/components/layout/SidebarMenu.vue"
import AppView from "@/components/layout/AppView.vue"
import Toast from "@/components/feedback/BaseToast.vue"

const router = useRouter()
const deviceStore = useDeviceStore()
const settingsStore = useSettingsStore()

// --- Loading Logic ---
const minLoadTime = new Promise(resolve => setTimeout(resolve, 10500)) // Keep minimum load time for UX

await Promise.all([
  settingsStore.loadSettings(),
  router.isReady(),
  minLoadTime,
])

deviceStore.initializeDeviceInfo()

const settings = settingsStore
const mode = computed(() => settingsStore.activeMode)

// Use the panel context for sidebar and menu
const sidebarPanel = usePanel('sidebar')
const menuPanel = usePanel('menu')

const toggleSidebar = () => sidebarPanel.toggle();
const toggleMenubar = () => menuPanel.toggle();

const mainContentClasses = computed(() => {
  const classes = [];
  
  if (!deviceStore.isMobile) {
    if (sidebarPanel.isOpen) classes.push('pl-64');
    if (menuPanel.isOpen) classes.push('pr-64');
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
