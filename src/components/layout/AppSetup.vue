<template>
  <div 
    class="min-h-screen flex bg-background dark:bg-background-dark transition-all duration-300" 
    :class="{ 'animation-disabled': settings.appearance.animationDisabled }"
  >

  <Suspense>
      <sidebar-menu 
        :is-mobile="device.isMobile" 
        @sidebar-close="sidebarPanel.close()" 
      />
  </Suspense>

    <div 
      class="flex flex-col flex-grow transition-all duration-300" 
      :class="[
        !device.isMobile && sidebarPanel.isOpen ? 'pl-64' : '',
        !device.isMobile && menuPanel.isOpen ? 'pr-64' : ''
      ]"
    >
      <!-- App Header - Eagerly loaded for better LCP -->
      <app-header 
        :is-mobile="device.isMobile" 
        :is-sidebar-open="sidebarPanel.isOpen" 
        :is-menubar-open="menuPanel.isOpen"
        @toggle-sidebar="sidebarPanel.toggle()" 
        @toggle-menubar="menuPanel.toggle()" 
        @update:mode="updateMode" 
      />

      <!-- App View - Lazy loaded -->
      <Suspense>
        <app-view 
          :mode="currentMode" 
          :settings="settings" 
          :is-mobile="device.isMobile" 
        />
        <template #fallback>
          <div class="flex-grow flex items-center justify-center">
            <div class="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          </div>
        </template>
      </Suspense>
    </div>

    <suspense>
      <main-menu />
    </suspense>

    <!-- Toast - Lazy loaded -->
    <Suspense>
      <toast :is-mobile="device.isMobile" />
    </Suspense>
  </div>
</template>

<script setup>
import { onUnmounted, shallowRef, defineAsyncComponent } from "vue"
import { useRouter } from "vue-router"
import { useFullscreen } from "@vueuse/core"
import { useDeviceStore } from "@/stores/device"
import { useSettingsStore } from "@/stores/settings"
import { useKeyboard } from "@/composables/useKeyboard"
import { usePanel } from "@/composables/usePanel"
import AppHeader from "@/components/layout/AppHeader.vue"

const SidebarMenu = defineAsyncComponent(() => 
  import("@/components/layout/SidebarMenu.vue")
)
const AppView = defineAsyncComponent(() => 
  import("@/components/layout/AppView.vue")
)
const MainMenu = defineAsyncComponent(() => 
  import("@/components/layout/MainMenu.vue")
)
const Toast = defineAsyncComponent(() => 
  import("@/components/feedback/BaseToast.vue")
)

const router = useRouter()
const device = useDeviceStore()
const settings = useSettingsStore()

const currentMode = shallowRef(settings.calculator.mode)

const sidebarPanel = usePanel('sidebar')
const menuPanel = usePanel('menu')

const updateMode = (newMode) => {
  currentMode.value = newMode
}

useKeyboard("global", {
  toggleSidebar: () => sidebarPanel.toggle(),
  toggleMenubar: () => menuPanel.toggle(),
  toggleFullscreen: () => useFullscreen(document.documentElement).toggle()
})

const initializeApp = async () => {
  const minLoadTime = new Promise(resolve => setTimeout(resolve, 800))
  
  await Promise.all([
    settings.loadSettings(),
    router.isReady(),
    minLoadTime,
  ])
  
  device.initializeDeviceInfo()
}

await initializeApp()

onUnmounted(() => {
  device.destroyDeviceInfo()
})
</script>
