<template>
  <!-- Developer Dock - Only visible in development -->
  <div v-if="isDev">
    <!-- Mobile Version -->
    <MobileDevDock
      v-if="isMobile"
      :tools="tools"
      :active-panels="activePanels"
      :active-panel-keys="activePanelKeys"
      :active-mobile-panel-index="activeMobilePanelIndex"
      :is-expanded="isExpanded"
      @toggle-expanded="toggleExpanded"
      @toggle-panel="togglePanel"
      @set-active-mobile-panel-index="setActiveMobilePanelIndex"
    />
    
    <!-- Desktop Version -->
    <DesktopDevDock
      v-else
      :tools="tools"
      :active-panels="activePanels"
      :active-panel-keys="activePanelKeys"
      :current-desktop-panel="currentDesktopPanel"
      :is-expanded="isExpanded"
      :is-dock-open="isDockOpen"
      @toggle-dock="toggleDock"
      @toggle-panel="togglePanel"
      @set-current-panel="setCurrentDesktopPanel"
      @navigate-panel="navigatePanel"
      @close-all="closeAll"
      @close-current-panel="closeCurrentPanel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, type Ref } from 'vue';
import { useLocalStorage, useWindowSize, useEventListener } from '@vueuse/core';
import DesktopDevDock from './DesktopDevDock.vue';
import MobileDevDock from './MobileDevDock.vue';
import PWATestPanelContent from './PWATestPanelContent.vue';
import VersionInfoPanel from './VersionInfoPanel.vue';
import PerformancePanel from './PerformancePanel.vue';
import ConsolePanel from './ConsolePanel.vue';
import StatePanel from './StatePanel.vue';
import KeyboardShortcuts from './KeyboardShortcuts.vue';

// Define panel keys as a const array to ensure string literal types
const PANEL_KEYS = ['pwa', 'version', 'performance', 'console', 'state', 'shortcuts'] as const;
type PanelKey = typeof PANEL_KEYS[number];

// Update the ActivePanels interface to be more explicit
interface ActivePanels extends Record<string, boolean> {
  pwa: boolean;
  version: boolean;
  performance: boolean;
  console: boolean;
  state: boolean;
  shortcuts: boolean;
}

interface Tool {
  key: string;
  icon: string;
  label: string;
  component: any;
  title: string;
}

// Development environment check
const isDev: Ref<boolean> = ref(import.meta.env.DEV);

// Responsive
const { width } = useWindowSize();
const isMobile = computed(() => width.value < 768);

// Persistent state
const isExpanded = useLocalStorage('dev-dock-expanded', false);
const isDockOpen = useLocalStorage('dev-dock-open', false);
const activePanels = useLocalStorage<ActivePanels>('dev-dock-panels', {
  pwa: false,
  version: false,
  performance: false,
  console: false,
  state: false,
  shortcuts: false
});

// Desktop panel management - use string instead of keyof
const currentDesktopPanel = useLocalStorage<string | null>('dev-dock-current-panel', null);

// Mobile-specific state
const activeMobilePanelIndex = ref(0);

// Tool definitions - ensure keys are strings
const tools: Tool[] = [
  {
    key: 'pwa',
    icon: 'RefreshCw',
    label: 'PWA',
    component: PWATestPanelContent,
    title: 'PWA Testing'
  },
  {
    key: 'version',
    icon: 'Info',
    label: 'Version',
    component: VersionInfoPanel,
    title: 'Version Info'
  },
  {
    key: 'performance',
    icon: 'Activity',
    label: 'Performance',
    component: PerformancePanel,
    title: 'Performance Monitor'
  },
  {
    key: 'console',
    icon: 'Terminal',
    label: 'Console',
    component: ConsolePanel,
    title: 'Console Logger'
  },
  {
    key: 'state',
    icon: 'Database',
    label: 'State',
    component: StatePanel,
    title: 'State Inspector'
  },
  {
    key: 'shortcuts',
    icon: 'Keyboard',
    label: 'Shortcuts',
    component: KeyboardShortcuts,
    title: 'Keyboard Shortcuts'
  }
];

// Computed properties - ensure string array
const activePanelKeys = computed((): string[] => {
  return Object.keys(activePanels.value).filter(key => 
    activePanels.value[key as keyof ActivePanels]
  );
});

// Watch for changes in active panels to manage current desktop panel
watch(activePanelKeys, async (newKeys: string[]) => {
  if (!isMobile.value) {
    // If current panel was closed, switch to first available
    if (currentDesktopPanel.value && !newKeys.includes(currentDesktopPanel.value)) {
      currentDesktopPanel.value = newKeys.length > 0 ? newKeys[0] : null;
    }
    
    // If no current panel but panels are active, set to first
    if (!currentDesktopPanel.value && newKeys.length > 0) {
      currentDesktopPanel.value = newKeys[0];
    }
    
    // If no panels active, clear current and collapse
    if (newKeys.length === 0) {
      currentDesktopPanel.value = null;
      isExpanded.value = false;
    } else {
      // Ensure expansion when panels are active
      await nextTick();
      isExpanded.value = true;
    }
  }
}, { immediate: true });

// Helper function to validate panel keys
const isValidPanelKey = (key: string): key is PanelKey => {
  return PANEL_KEYS.includes(key as PanelKey);
};

// Methods - Update parameter types to accept string
const toggleDock = (): void => {
  isDockOpen.value = !isDockOpen.value;
};

const togglePanel = async (panel: string): Promise<void> => {
  // Validate that the panel key exists
  if (!isValidPanelKey(panel)) {
    console.warn(`Invalid panel key: ${panel}`);
    return;
  }
  
  const wasActive = activePanels.value[panel];
  activePanels.value[panel] = !wasActive;
  
  // Wait for reactivity to update
  await nextTick();
  
  // Auto-expand when opening a panel
  if (activePanels.value[panel]) {
    if (isMobile.value) {
      // On mobile, switch to the newly opened panel
      const newIndex = activePanelKeys.value.indexOf(panel);
      if (newIndex !== -1) {
        activeMobilePanelIndex.value = newIndex;
      }
    } else {
      // On desktop, set as current panel and ensure expansion
      currentDesktopPanel.value = panel;
    }
    
    // Always expand when opening a panel
    isExpanded.value = true;
  }
  
  // Adjust mobile panel index if needed
  if (isMobile.value && activeMobilePanelIndex.value >= activePanelKeys.value.length) {
    activeMobilePanelIndex.value = Math.max(0, activePanelKeys.value.length - 1);
  }
};

const setCurrentDesktopPanel = (panel: string): void => {
  if (!isMobile.value) {
    if (!isValidPanelKey(panel)) {
      console.warn(`Invalid panel key: ${panel}`);
      return;
    }
    
    currentDesktopPanel.value = panel;
    isExpanded.value = true; // Ensure expansion when switching panels
  }
};

const navigatePanel = (direction: number): void => {
  if (!isMobile.value && activePanelKeys.value.length > 1 && currentDesktopPanel.value) {
    const currentIndex = activePanelKeys.value.indexOf(currentDesktopPanel.value);
    const newIndex = currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < activePanelKeys.value.length) {
      currentDesktopPanel.value = activePanelKeys.value[newIndex];
    }
  }
};

const closeCurrentPanel = (): void => {
  if (currentDesktopPanel.value) {
    togglePanel(currentDesktopPanel.value);
  }
};

const toggleExpanded = (): void => {
  isExpanded.value = !isExpanded.value;
};

const setActiveMobilePanelIndex = (index: number): void => {
  activeMobilePanelIndex.value = index;
};

const closeAll = (): void => {
  PANEL_KEYS.forEach(key => {
    activePanels.value[key] = false;
  });
  isExpanded.value = false;
  activeMobilePanelIndex.value = 0;
  currentDesktopPanel.value = null;
  isDockOpen.value = false;
};

// Keyboard shortcuts (desktop only)
useEventListener('keydown', (e: KeyboardEvent) => {
  // Only in development, desktop, and when Ctrl+Shift is pressed
  if (!isDev.value || isMobile.value || !e.ctrlKey || !e.shiftKey) return;
  
  switch (e.key.toLowerCase()) {
    case 'd':
      e.preventDefault();
      toggleDock();
      break;
    case 'p':
      e.preventDefault();
      togglePanel('pwa');
      break;
    case 'v':
      e.preventDefault();
      togglePanel('version');
      break;
    case 'c':
      e.preventDefault();
      togglePanel('console');
      break;
    case 's':
      e.preventDefault();
      togglePanel('state');
      break;
    case 'k':
      e.preventDefault();
      togglePanel('shortcuts');
      break;
    case 'a':
      e.preventDefault();
      togglePanel('performance');
      break;
    case 'arrowleft':
      e.preventDefault();
      navigatePanel(-1);
      break;
    case 'arrowright':
      e.preventDefault();
      navigatePanel(1);
      break;
    case 'escape':
      e.preventDefault();
      closeAll();
      break;
  }
});
</script>
