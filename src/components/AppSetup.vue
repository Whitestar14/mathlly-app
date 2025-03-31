<template>
  <div class="min-h-screen flex bg-background dark:bg-background-dark duration-300" :class="{
    'animation-disabled': settings.animationDisabled,
  }">
    <sidebar-menu :is-open="isSidebarOpen" :is-mobile="deviceStore.isMobile" @update:isOpen="closeSidebar" />

    <div class="flex flex-col flex-grow duration-300"
      :class="[
        !deviceStore.isMobile && isSidebarOpen ? 'ml-64' : '',
        !deviceStore.isMobile && isMenubarOpen ? 'mr-64' : ''
      ]">
      <app-header :is-mobile="deviceStore.isMobile" :is-sidebar-open="isSidebarOpen" :is-menubar-open="isMenubarOpen"
        @toggle-sidebar="toggleSidebar" @toggle-menubar="toggleMenubar" />
      <suspense>
        <template #default>
        <app-view 
          :mode="mode" 
          :settings="settings" 
          :is-mobile="deviceStore.isMobile"
          @settings-change="updateSettings" 
          @update:mode="updateMode" 
        />
        </template>
        <template #fallback><loader variant="regular" /></template>
      </suspense>
    </div>

    <!-- Main Menu Panel -->
    <main-menu :is-open="isMenubarOpen" :is-mobile="deviceStore.isMobile" @update:isOpen="closeMenubar" />
  </div>
  <toast :is-mobile="deviceStore.isMobile"/>
</template>

<script setup>
import { onUnmounted, computed, watch } from "vue"
import { useRouter } from "vue-router"
import { useFullscreen } from "@vueuse/core"
import { useDeviceStore } from "@/stores/device"
import { useSettingsStore } from "@/stores/settings"
import { useKeyboard } from "@/composables/useKeyboard"
import { usePanel } from "@/composables/usePanel"
import MainMenu from "@/layouts/MainMenu.vue"
import AppHeader from "@/layouts/AppHeader.vue"
import SidebarMenu from "@/layouts/SidebarMenu.vue"
import AppView from "@/components/AppView.vue"
import Loader from "@/components/base/BaseLoader.vue"
import Toast from "@/components/base/BaseToast.vue"

const router = useRouter()
const deviceStore = useDeviceStore()
const settingsStore = useSettingsStore()

// Ensure minimum loading time of 2 seconds
const minLoadTime = new Promise(resolve => setTimeout(resolve, 2000))

await Promise.all([
  minLoadTime,
  settingsStore.loadSettings(),
  router.isReady(),
])

deviceStore.initializeDeviceInfo()

const settings = settingsStore
const mode = computed(() => settingsStore.activeMode)

const {
  isOpen: isSidebarOpen,
  toggle: toggleSidebar,
  close: closeSidebar,
  handleResize: handleSidebarResize,
} = usePanel('sidebar', deviceStore.isMobile)

const {
  isOpen: isMenubarOpen,
  toggle: toggleMenubar,
  close: closeMenubar,
  handleResize: handleMenubarResize,
} = usePanel('menu', deviceStore.isMobile, false)

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

watch(router.currentRoute, () => {
  if (deviceStore.isMobile) {
    closeSidebar()
    closeMenubar()
  }
})

useKeyboard("global", {
  toggleSidebar: () => {
    toggleSidebar()
  },
  toggleMenubar: () => {
    toggleMenubar()
  },
  toggleFullscreen: () => {
    useFullscreen(document.documentElement).toggle()
  },
})

onUnmounted(() => {
  deviceStore.destroyDeviceInfo()
})
</script>