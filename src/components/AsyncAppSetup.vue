<template>
  <div class="min-h-screen flex bg-background dark:bg-background-dark transition-colors duration-300" :class="{
    'animation-disabled': settings.animationDisabled,
  }">
    <sidebar-menu :is-open="isSidebarOpen" :is-mobile="deviceStore.isMobile" @update:isOpen="closeSidebar" />

    <div class="flex flex-col flex-grow transition-all duration-300 ease-in-out"
      :class="[!deviceStore.isMobile && isSidebarOpen ? 'ml-64' : '']">
      <app-header :is-mobile="deviceStore.isMobile" :is-sidebar-open="isSidebarOpen" :is-menu-open="isMenuOpen"
        @toggle-sidebar="toggleSidebar" @toggle-menu="toggleMenu" @close-menu="closeMenu" />
      <router-view v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" :mode="mode" :settings="settings" :is-mobile="deviceStore.isMobile"
            @settings-change="updateSettings" @update:mode="updateMode" />
        </Transition>
      </router-view>
    </div>

    <!-- Main Menu Panel -->
    <MainMenu :is-open="isMenuOpen" :is-mobile="deviceStore.isMobile" @toggle="toggleMenu" @close="closeMenu" />
  </div>
</template>

<script setup>
import { onUnmounted, computed, watch } from "vue"
import { useRouter } from "vue-router"
import { useFullscreen } from "@vueuse/core"
import { useDeviceStore } from "@/stores/device"
import { useSettingsStore } from "@/stores/settings"
import { useKeyboard } from "@/composables/useKeyboard"
import { usePanel } from "@/composables/usePanel"
import AppHeader from "@/layouts/AppHeader.vue"
import SidebarMenu from "@/layouts/SidebarMenu.vue"
import MainMenu from "@/components/ui/MainMenu.vue"

const router = useRouter()
const deviceStore = useDeviceStore()
const settingsStore = useSettingsStore()

// Ensure minimum loading time of 1.2 seconds
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
  isOpen: isMenuOpen,
  toggle: toggleMenu,
  close: closeMenu,
  handleResize: handleMenuResize,
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
    handleMenuResize(newIsMobile)
  }
)

watch(router.currentRoute, () => {
  if (deviceStore.isMobile) {
    closeSidebar()
    closeMenu()
  }
})

useKeyboard("global", {
  toggleSidebar: () => {
    toggleSidebar()
  },
  openSettings: () => {
    router.push("/settings")
  },
  toggleFullscreen: () => {
    useFullscreen(document.documentElement).toggle()
  },
})

onUnmounted(() => {
  deviceStore.destroyDeviceInfo()
})
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