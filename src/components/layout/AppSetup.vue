<template>
  <div 
    class="min-h-screen flex bg-background dark:bg-background-dark transition-colors duration-300"
    :class="globalClasses"
  >

      <!-- Sidebar -->
      <div class="relative">
        <Suspense @resolve="panelStates.sidebar.isLoaded = true">
          <sidebar-menu
            :is-mobile="device.isMobile"
            @sidebar-close="sidebarPanel.close()"
          />

          <template #fallback>
            <div 
            v-if="panelStates.sidebar.isOpen" 
            class="w-64 h-screen hidden md:flex fixed top-0 left-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-20"
          ></div>
          </template>
        </Suspense>
      </div>

      <!-- Main Content Area -->
      <div class="flex flex-col flex-grow transition-[padding] duration-300" :class="mainContentClasses">
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

        <!-- App View with loading fallback -->
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

      <!-- Main Menu -->
      <div class="relative">
        <Suspense @resolve="panelStates.menu.isLoaded = true">
          <main-menu />
          <template #fallback>
            <div 
            v-if="panelStates.menu.isOpen" 
            class="w-64 h-screen fixed hidden md:flex top-0 right-0 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 z-20"
          ></div>
          </template>
        </Suspense>
      </div>

      <!-- Toast Notifications -->
      <Suspense>
        <toast :is-mobile="device.isMobile" />
      </Suspense>
      
      <!-- Keyboard Shortcut Guide -->
       <Suspense>
      <ShortcutGuide v-if="panelStates.isLoaded" v-model="isShortcutModalOpen" />
       </Suspense>
  </div>
</template>

<script setup>
import { onUnmounted, computed, shallowRef, reactive, watch, defineAsyncComponent } from "vue";
import { useRouter } from "vue-router";
import { useFullscreen, useLocalStorage } from "@vueuse/core";
import { useDeviceStore } from "@/stores/device";
import { useSettingsStore } from "@/stores/settings";
import { useKeyboard } from "@/composables/useKeyboard";
import { usePanel } from "@/composables/usePanel";
import { useTheme } from "@/composables/useTheme";
import AppHeader from "@/components/layout/AppHeader.vue";

const SidebarMenu = defineAsyncComponent(() => import("@/components/layout/SidebarMenu.vue"));
const AppView = defineAsyncComponent(() => import("@/components/layout/AppView.vue"));
const MainMenu = defineAsyncComponent(() => import("@/components/layout/MainMenu.vue"));
const Toast = defineAsyncComponent(() => import("@/components/feedback/BaseToast.vue"));
const ShortcutGuide = defineAsyncComponent(() => import("@/components/ui/ShortcutGuide.vue"));

const router = useRouter();
const device = useDeviceStore();
const settings = useSettingsStore();
const { toggleTheme } = useTheme();

const panelStates = reactive({
  sidebar: { isOpen: false, isLoaded: false },
  menu: { isOpen: false, isLoaded: false },
  isLoaded: false
});

const currentMode = shallowRef(settings.calculator.mode);
const isShortcutModalOpen = shallowRef(false);

const sidebarPanel = usePanel('sidebar');
const menuPanel = usePanel('menu');

function openShortcutModal() {
  isShortcutModalOpen.value = true;
}

function updateMode(newMode) {
  currentMode.value = newMode;
}

useKeyboard("global", {
  toggleSidebar: () => sidebarPanel.toggle(),
  toggleMenubar: () => menuPanel.toggle(),
  toggleFullscreen: () => useFullscreen(document.documentElement).toggle(),
  toggleTheme,
  openShortcutModal,
});

const mainContentClasses = computed(() => {
  if (device.isMobile) return [];
  
  const classes = [];

  if (!panelStates.sidebar.isLoaded || !panelStates.menu.isLoaded) {
    if (panelStates.sidebar.isOpen) classes.push('md:pl-64');
    if (panelStates.menu.isOpen) classes.push('md:pr-64');
  }

  if (sidebarPanel.isOpen) classes.push('md:pl-64');
  if (menuPanel.isOpen) classes.push('md:pr-64');
  
  return classes;
});

const globalClasses = computed(() => {
  const classes = [];

  settings.appearance.animationDisabled && classes.push('animation-disabled');

  return classes;
})

const textSize = computed(() => settings.display.textSize || "medium");

const updateTextSizeClasses = newSize => {
  const root = document.documentElement;
  root.classList.remove("ts-small", "ts-normal", "ts-medium", "ts-large");
  root.classList.add(`ts-${newSize}`);
};

watch(textSize, updateTextSizeClasses, { immediate: true });

const preloadPanelStates = async () => {
  const defaults = {
    desktop: { isOpen: false },
    mobile: { isOpen: false }
  };

  const sidebarPrefs = useLocalStorage('sidebar-preferences', defaults);
  const menuPrefs = useLocalStorage('menu-preferences', defaults);
  
  panelStates.sidebar.isOpen = sidebarPrefs.value.desktop.isOpen;
  panelStates.menu.isOpen = menuPrefs.value.desktop.isOpen;
  
  panelStates.isLoaded = true;
};

const initializeApp = async () => {
  const minLoadTime = new Promise(resolve => setTimeout(resolve, 300));
  
  await Promise.all([
    settings.loadSettings(),
    router.isReady(),
    minLoadTime,
  ]);
  
  device.initializeDeviceInfo();
  
  await preloadPanelStates();
};

await initializeApp();

onUnmounted(device.destroyDeviceInfo);
</script>
