<template>
  <div class="min-h-screen flex bg-background dark:bg-background-dark transition-all duration-300" :class="{
    'animation-disabled': settings.appearance.animationDisabled,
  }">
    <sidebar-menu :is-mobile="device.isMobile" @sidebar-close="sidebarPanel.close()" />
    <div class="flex flex-col flex-grow transition-all duration-300" :class="mainContentClasses">
      <app-header :is-mobile="device.isMobile" :is-sidebar-open="sidebarPanel.isOpen" :is-menubar-open="menuPanel.isOpen"
        @toggle-sidebar="toggleSidebar" @toggle-menubar="toggleMenubar" @update:mode="handleModeChange" />

      <app-view :mode="currentMode" :settings="settings" :is-mobile="device.isMobile" />
    </div>

    <main-menu />
    <toast :is-mobile="device.isMobile" />
  </div>
</template>

<script setup>
import { onUnmounted, computed, shallowRef } from "vue"
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
const device = useDeviceStore()
const settings = useSettingsStore()

const minLoadTime = new Promise(resolve => setTimeout(resolve, 1500))

await Promise.all([
  settings.loadSettings(),
  router.isReady(),
  minLoadTime,
])

device.initializeDeviceInfo()

const currentMode = shallowRef(settings.calculator.mode)

const handleModeChange = (newMode) => {
  currentMode.value = newMode
}

const sidebarPanel = usePanel('sidebar')
const menuPanel = usePanel('menu')

const toggleSidebar = () => sidebarPanel.toggle();
const toggleMenubar = () => menuPanel.toggle();

const mainContentClasses = computed(() => {
  const classes = [];
  
  if (!device.isMobile) {
    if (sidebarPanel.isOpen) classes.push('pl-64');
    if (menuPanel.isOpen) classes.push('pr-64');
  }
  
  return classes;
});

  useKeyboard("global", {
  toggleSidebar,
  toggleMenubar,
  toggleFullscreen: () => {
    useFullscreen(document.documentElement).toggle()
  },
})

onUnmounted(() => {
  device.destroyDeviceInfo()
})
</script>
