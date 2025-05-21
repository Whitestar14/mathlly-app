<template>
  <div 
    class="min-h-screen flex bg-background dark:bg-background-dark transition-all duration-300"
    :class="settings.appearance.animationDisabled && 'animation-disabled'"
  >
    <!-- Only render content after panel states are loaded -->
    <template v-if="panelStates.isLoaded">
      <!-- Sidebar -->
      <div class="relative">
        <!-- Static placeholder during loading -->
        <div 
          v-if="!panelStates.sidebar.isLoaded && panelStates.sidebar.isOpen" 
          class="w-64 h-screen hidden md:flex fixed top-0 left-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-20"
        ></div>
        
        <Suspense @resolve="panelStates.sidebar.isLoaded = true">
          <sidebar-menu
            :is-mobile="device.isMobile"
            @sidebar-close="sidebarPanel.close()"
          />
        </Suspense>
      </div>

      <!-- Main Content Area -->
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
        <!-- Static placeholder during loading -->
        <div 
          v-if="!panelStates.menu.isLoaded && panelStates.menu.isOpen" 
          class="w-64 h-screen fixed hidden md:flex top-0 right-0 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 z-20"
        ></div>
        
        <Suspense @resolve="panelStates.menu.isLoaded = true">
          <main-menu />
        </Suspense>
      </div>

      <!-- Toast Notifications -->
      <Suspense>
        <toast :is-mobile="device.isMobile" />
      </Suspense>
      
      <!-- Keyboard Shortcut Guide -->
      <ShortcutGuide v-if="isShortcutModalOpen" v-model="isShortcutModalOpen" />
    </template>
  </div>
</template>

<script setup>
import { onUnmounted, computed, shallowRef, reactive, watch, defineAsyncComponent } from "vue";
import { useRouter } from "vue-router";
import { useFullscreen, useLocalStorage, useDebounceFn } from "@vueuse/core";
import { useDeviceStore } from "@/stores/device";
import { useSettingsStore } from "@/stores/settings";
import { useKeyboard } from "@/composables/useKeyboard";
import { usePanel } from "@/composables/usePanel";
import { useTheme } from "@/composables/useTheme";
import AppHeader from "@/components/layout/AppHeader.vue";

// Async component imports
const SidebarMenu = defineAsyncComponent(() => import("@/components/layout/SidebarMenu.vue"));
const AppView = defineAsyncComponent(() => import("@/components/layout/AppView.vue"));
const MainMenu = defineAsyncComponent(() => import("@/components/layout/MainMenu.vue"));
const Toast = defineAsyncComponent(() => import("@/components/feedback/BaseToast.vue"));
const ShortcutGuide = defineAsyncComponent(() => import("@/components/ui/ShortcutGuide.vue"));

// Store and router setup
const router = useRouter();
const device = useDeviceStore();
const settings = useSettingsStore();
const { toggleTheme } = useTheme();

// Panel state management
const panelStates = reactive({
  sidebar: { isOpen: false, isLoaded: false },
  menu: { isOpen: false, isLoaded: false },
  isLoaded: false
});

// App state
const currentMode = shallowRef(settings.calculator.mode);
const isShortcutModalOpen = shallowRef(false);

// Panel management
const sidebarPanel = usePanel('sidebar');
const menuPanel = usePanel('menu');

/**
 * Opens the keyboard shortcut modal
 */
function openShortcutModal() {
  isShortcutModalOpen.value = true;
}

/**
 * Updates the calculator mode
 * @param {string} newMode - The new calculator mode
 */
function updateMode(newMode) {
  currentMode.value = newMode;
}

// Register keyboard shortcuts
useKeyboard("global", {
  toggleSidebar: () => sidebarPanel.toggle(),
  toggleMenubar: () => menuPanel.toggle(),
  toggleFullscreen: () => useFullscreen(document.documentElement).toggle(),
  toggleTheme,
  openShortcutModal,
});

// Compute content classes based on panel states
const mainContentClasses = computed(() => {
  if (device.isMobile) return [];
  
  const classes = [];

  // Handle initial state before components are fully loaded
  if (!panelStates.sidebar.isLoaded || !panelStates.menu.isLoaded) {
    if (panelStates.sidebar.isOpen) classes.push('md:pl-64');
    if (panelStates.menu.isOpen) classes.push('md:pr-64');
  }

  // Handle dynamic state after components are loaded
  if (sidebarPanel.isOpen) classes.push('md:pl-64');
  if (menuPanel.isOpen) classes.push('md:pr-64');
  
  return classes;
});

// Handle text size changes
const textSize = computed(() => settings.display.textSize || "medium");

// Use debounced function for DOM updates to improve performance
const updateTextSizeClasses = useDebounceFn((newSize) => {
  const root = document.documentElement;
  root.classList.remove("ts-small", "ts-normal", "ts-medium", "ts-large");
  root.classList.add(`ts-${newSize}`);
}, 50);

// Watch for text size changes
watch(textSize, updateTextSizeClasses, { immediate: true });

/**
 * Preload panel states from localStorage
 */
const preloadPanelStates = async () => {
  const defaults = {
    desktop: { isOpen: false },
    mobile: { isOpen: false }
  };

  // Use VueUse's useLocalStorage to access stored preferences
  const sidebarPrefs = useLocalStorage('sidebar-preferences', defaults);
  const menuPrefs = useLocalStorage('menu-preferences', defaults);
  
  // Determine initial states based on current device type
  const deviceType = device.isMobile ? 'mobile' : 'desktop';
  panelStates.sidebar.isOpen = sidebarPrefs.value[deviceType]?.isOpen || false;
  panelStates.menu.isOpen = menuPrefs.value[deviceType]?.isOpen || false;
  
  // Mark states as loaded to trigger rendering
  panelStates.isLoaded = true;
};

/**
 * Initialize the application
 */
const initializeApp = async () => {
  // Ensure minimum load time to prevent flashing
  const minLoadTime = new Promise(resolve => setTimeout(resolve, 800));
  
  // Load critical resources in parallel
  await Promise.all([
    settings.loadSettings(),
    router.isReady(),
    minLoadTime,
  ]);
  
  // Initialize device info
  device.initializeDeviceInfo();
  
  // Preload panel states
  await preloadPanelStates();
};

// Start initialization immediately
await initializeApp();

// Clean up on component unmount
onUnmounted(() => {
  device.destroyDeviceInfo();
});
</script>
