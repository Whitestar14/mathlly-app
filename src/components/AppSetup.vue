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
      
      <error-fallback v-if="hasError" :error="error" />
      <suspense v-else>
        <template #default>
          <app-view
            :mode="mode"
            :settings="settings"
            :is-mobile="deviceStore.isMobile"
            @settings-change="updateSettings"
            @update:mode="updateMode" />
        </template>
        <template #fallback><loader variant="regular" /></template>
      </suspense>
    </div>

    <main-menu :is-open="isMenubarOpen" :is-mobile="deviceStore.isMobile" @update:isOpen="closeMenubar" />
  </div>
  <toast :is-mobile="deviceStore.isMobile"/>
</template>

<script setup>
import { onUnmounted, computed, watch, ref, onErrorCaptured } from "vue"
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
import ErrorFallback from "@/layouts/pages/ErrorFallback.vue"

const router = useRouter()
const deviceStore = useDeviceStore()
const settingsStore = useSettingsStore()
const error = ref(null)
const hasError = ref(false)

// --- Loading Logic ---
const minLoadTime = new Promise(resolve => setTimeout(resolve, 1000))

try {
  await Promise.all([
    minLoadTime,
    settingsStore.loadSettings(),
    router.isReady(),
  ])
} catch (err) {
  error.value = err
  hasError.value = true
}

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
  try {
    settingsStore.setCurrentMode(newMode)
  } catch (err) {
    error.value = err
    hasError.value = true
  }
}

const updateSettings = async (newSettings) => {
  try {
    if (newSettings.mode !== settingsStore.mode) {
      await settingsStore.setDefaultMode(newSettings.mode)
    }
    const settingsToSave = { ...newSettings }
    delete settingsToSave.mode
    await settingsStore.saveSettings(settingsToSave)
  } catch (err) {
    error.value = err
    hasError.value = true
  }
}

watch(
  () => deviceStore.isMobile,
  (newIsMobile) => {
    handleSidebarResize(newIsMobile)
    handleMenubarResize(newIsMobile)
  }
)

// Close panels on mobile route change
watch(router.currentRoute, () => {
  if (deviceStore.isMobile) {
    closeSidebar()
    closeMenubar()
  }
})

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

// Capture any errors
onErrorCaptured((err) => {
  error.value = err
  hasError.value = true
  return false // Prevent error from propagating
})
</script>
