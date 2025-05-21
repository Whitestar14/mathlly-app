<template>
  <div class="relative z-20 flex flex-col flex-initial">
    <div v-if="!isMobile" class="h-full">
      <!-- Side Panel -->
      <SidePanel
        v-if="type === 'side'"
        v-bind="panelProps"
        :position="position"
        @close="close()"
        @toggle="toggle()"
      >
      <template #default><slot /></template>
      <template #header-actions><slot name="header-actions" /></template>
      <template v-if="$slots.footer" #footer><slot name="footer" /></template>
      </SidePanel>

      <!-- Desktop Panel -->
      <DesktopPanel
        v-if="type === 'drawer'"
        v-bind="panelProps"
        :position="position"
        @close="close()"
        @toggle="toggle()"
      >
      <template #default><slot /></template>
      <template #header-actions><slot name="header-actions" /></template>
      <template v-if="$slots.footer" #footer><slot name="footer" /></template>
      </DesktopPanel>
    </div>

    <!-- Mobile Panel -->
    <div v-else>
      <!-- Bottom Panel -->
      <BottomPanel
        v-bind="mobileProps"
        @close="close()"
        @toggle="toggle({ expanded: true })"
      >
      <template #default><slot /></template>
      <template #header-actions><slot name="header-actions" /></template>
      <template v-if="$slots.footer" #footer><slot name="footer" /></template>
      </BottomPanel>
    </div>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue';
import { usePanel } from '@/composables/usePanel';
import { useSettingsStore } from '@/stores/settings';

const SidePanel = defineAsyncComponent(() =>
  import('@/components/panel/SidePanel.vue')
);

const DesktopPanel = defineAsyncComponent(() =>
  import('@/components/panel/DesktopPanel.vue')
);

const BottomPanel = defineAsyncComponent(() =>
  import('@/components/panel/BottomPanel.vue')
);

const props = defineProps({
  id: { type: String, required: true },
  showHeader: { type: Boolean, default: true },
  showFooter: { type: Boolean, default: true },
  title: { type: String, default: '' },
  mainClass: { type: String, default: '' },
  contentClass: { type: String, default: '' },
  type: { type: String, default: 'drawer' },
  position: { type: String, default: 'right' },
  maxHeightRatio: { type: Number, default: 0.8 },
  snapThreshold: { type: Number, default: 0.3 },
  storageKey: { type: String, default: 'panel' },
  defaultDesktopState: { type: Boolean, default: false },
});

const settingsStore = useSettingsStore();
const animationEnabled = computed(() => !settingsStore.appearance.animationDisabled);

const options = {
  storageKey: props.id || props.storageKey,
  defaultDesktopState: props.defaultDesktopState,
  maxHeightRatio: props.maxHeightRatio,
  snapThreshold: props.snapThreshold,
  animation: () => animationEnabled.value,
};

const {
  isOpen,
  isMobile,
  isExpanded,
  toggle,
  close,
  handle,
  panel,
  isDragging,
  panelHeight,
  translateY
} = usePanel(props.id, options, false);

const panelProps = computed(() => ({
  isOpen: isOpen.value,
  isMobile: isMobile.value,
  title: props.title,
  showHeader: props.showHeader,
  showFooter: props.showFooter,
  contentClass: props.contentClass,
  mainClass: props.mainClass,
}));

const mobileProps = computed(() => ({
  ...panelProps.value,
  panelRef: panel,
  handleRef: handle,
  isExpanded: isExpanded.value,
  isDragging: isDragging.value,
  translateY: translateY.value,
  panelHeight: panelHeight.value,
  maxHeightRatio: props.maxHeightRatio,
  animationEnabled: animationEnabled.value,
}));
</script>

<style scoped>
:deep(.panel-side) {
  @apply overflow-hidden h-screen hidden md:flex flex-col fixed top-0 z-20 bottom-0 inset-y-0 bg-gray-50 dark:bg-gray-900;
}
</style>
