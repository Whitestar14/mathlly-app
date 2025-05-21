<template>
  <div class="min-h-screen flex bg-background dark:bg-background-dark transition-all duration-300" 
  :class="settings.appearance.animationDisabled && 'animation-disabled'">

  <Suspense>
    <!-- Sidebar jumps into view on load without suspense, disappears abruptly if the panel is closed
      by default on desktop. does not work with v-if="sidebarPanel.isOpen" due to delayed provision -->
      <sidebar-menu 
        :is-mobile="device.isMobile" 
        @sidebar-close="sidebarPanel.close()" 
      />
  </Suspense>

    <div class="flex flex-col flex-grow transition-all duration-300" :class="mainContentClasses">
      <!-- App Header - Eagerly loaded for better LCP -->
      <app-header 
        :is-mobile="device.isMobile" 
        :is-sidebar-open="sidebarPanel.isOpen" 
        :is-menubar-open="menuPanel.isOpen"
        :settings="settings"
        @toggle-sidebar="sidebarPanel.toggle()" 
        @toggle-menubar="menuPanel.toggle()" 
        @update:mode="updateMode" 
        @open-shortcut-modal="openShortcutModal"
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
    
    <suspense>
    <ShortcutGuide v-model="isShortcutModalOpen" />
    </suspense>
  </div>
</template>

<script setup>
import { onUnmounted, computed, shallowRef, watch, defineAsyncComponent, markRaw } from "vue";
import { useRouter } from "vue-router";
import { useFullscreen } from "@vueuse/core";
import { useDeviceStore } from "@/stores/device";
import { useSettingsStore } from "@/stores/settings";
import { useKeyboard } from "@/composables/useKeyboard";
import { usePanel } from "@/composables/usePanel";
import { useTheme } from "@/composables/useTheme";
import AppHeader from "@/components/layout/AppHeader.vue";

const { toggleTheme } = useTheme();
const SidebarMenu = markRaw(defineAsyncComponent(() => 
  import("@/components/layout/SidebarMenu.vue")
));

const AppView = markRaw(defineAsyncComponent(() => 
  import("@/components/layout/AppView.vue")
)
const MainMenu = defineAsyncComponent(() => 
  import("@/components/layout/MainMenu.vue")
)
const Toast = defineAsyncComponent(() => 
  import("@/components/feedback/BaseToast.vue")
)

const ShortcutGuide = markRaw(defineAsyncComponent(() => 
  import("@/components/ui/ShortcutGuide.vue")
));

const router = useRouter();
const device = useDeviceStore();
const settings = useSettingsStore();

const currentMode = shallowRef(settings.calculator.mode);
const isShortcutModalOpen = shallowRef(false);

const sidebarPanel = usePanel('sidebar');
const menuPanel = usePanel('menu');

function updateMode(newMode) {
  currentMode.value = newMode;
}

function openShortcutModal() {
  isShortcutModalOpen.value = true;
}

useKeyboard("global", {
  toggleSidebar: () => sidebarPanel.toggle(),
  toggleMenubar: () => menuPanel.toggle(),
  toggleFullscreen: () => useFullscreen(document.documentElement).toggle(),
  openShortcutModal,
  toggleTheme,
});

const mainContentClasses = computed(() => {
  if (device.isMobile) return [];
  
  const classes = [];
    if (sidebarPanel.isOpen) classes.push('pl-64');
    if (menuPanel.isOpen) classes.push('pr-64');
  return classes;
});

const textSize = computed(() => settings.display.textSize || "medium");

watch(textSize, (newSize) => {
  const root = document.documentElement;

  root.classList.remove("ts-small", "ts-normal", "ts-medium", "ts-large");
  root.classList.add(`ts-${newSize}`);
}, { immediate: true });

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
