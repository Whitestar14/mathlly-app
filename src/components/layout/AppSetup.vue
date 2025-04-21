<template>
  <div class="min-h-screen flex bg-background dark:bg-background-dark duration-300" :class="{
    'animation-disabled': settings.animationDisabled,
  }">
    <sidebar-menu :is-open="isSidebarOpen" :is-mobile="deviceStore.isMobile" @update:isOpen="closeSidebar" />
    <div class="flex flex-col flex-grow duration-300" :class="[
      !deviceStore.isMobile && isSidebarOpen ? 'pl-64' : '',
      !deviceStore.isMobile && isMenubarOpen ? 'pr-64' : ''
    ]">
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
import { onUnmounted, computed, watch } from "vue"
import { useRouter } from "vue-router"
import { useFullscreen } from "@vueuse/core"
import { useDeviceStore } from "@/stores/device"
import { useSettingsStore } from "@/stores/settings"
import { useKeyboard } from "@/composables/useKeyboard"
import { usePanelUnified } from "@/composables/usePanelUnified"
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
const {
  isOpen: isSidebarOpen,
  toggle: toggleSidebar,
  close: closeSidebar,
  handleResize: handleSidebarResize,
} = usePanelUnified({
  storageKey: 'sidebar',
  initialIsMobile: deviceStore.isMobile,
  defaultDesktopState: true
})

// Use the unified panel composable for menu
const {
  isOpen: isMenubarOpen,
  toggle: toggleMenubar,
  close: closeMenubar,
  handleResize: handleMenubarResize,
} = usePanelUnified({
  storageKey: 'menu',
  initialIsMobile: deviceStore.isMobile,
  defaultDesktopState: false
})

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

watch(
  () => deviceStore.isMobile,
  (newIsMobile) => {
    handleSidebarResize(newIsMobile)
    handleMenubarResize(newIsMobile)
  }
)

// --- Keyboard Shortcuts ---
useKeyboard("global", {
  toggleSidebar: toggleSidebar,
  toggleMenubar: toggleMenubar,
  toggleFullscreen: () => {
    useFullscreen(document.documentElement).toggle()
  },
})

onUnmounted(() => {
  deviceStore.destroyDeviceInfo()
})
</script>
