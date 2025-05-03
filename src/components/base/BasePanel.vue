<template>
  <div
    class="panel-container"
    :class="{
      'panel-mobile': isMobile,
      'panel-side': type === 'side',
    }"
  >
    <!-- Backdrop (mobile only) -->
    <Transition name="fade">
      <div
        v-show="isMobile && isOpen"
        class="fixed inset-0 dark:bg-black/40 backdrop-blur-sm z-20 transition-colors duration-300"
        :class="draggable ? [isDragging ? 'dark:bg-black/20' : ''] : ''"
        aria-hidden="true"
        @click="close()"
      />
    </Transition>

    <!-- Side Panel -->
    <SidePanel
      v-if="type === 'side'"
      :is-open="isOpen"
      :is-mobile="isMobile"
      :position="position"
      :title="title"
      :show-header="showHeader"
      :show-footer="showFooter"
      :content-class="contentClass"
      :main-class="mainClass"
      @close="close()"
    >
      <template #default><slot /></template>
      <template #header-actions><slot name="header-actions" /></template>
      <template v-if="$slots.footer" #footer><slot name="footer" /></template>
    </SidePanel>

    <!-- Desktop Panel -->
    <DesktopPanel
      v-else-if="!isMobile"
      :is-open="isOpen"
      :position="position"
      :title="title"
      :show-header="showHeader"
      :show-footer="showFooter"
      :content-class="contentClass"
      :main-class="mainClass"
      :show-toggle="showToggle"
      @close="close()"
      @toggle="toggle()"
    >
      <template #default><slot /></template>
      <template #header-actions><slot name="header-actions" /></template>
      <template v-if="$slots.footer" #footer><slot name="footer" /></template>
    </DesktopPanel>

    <!-- Mobile Panel -->
    <div v-else-if="isMobile">
    <div v-show="isOpen" class="fixed inset-x-0 z-20">
      <div
        ref="panel"
        class="bg-white dark:bg-gray-800 rounded-t-xl fixed inset-x-0 bottom-0 overflow-hidden"
        :style="{
          height: `${panelHeight}px`,
          transform: `translateY(${translateY}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.74,-0.11, 0.53, 0.9)',
        }"
      >
        <!-- Draggable Handle -->
        <div
          ref="handle"
          class="w-full absolute h-6 flex items-center justify-center cursor-grab active:cursor-grabbing touch-manipulation"
          :class="{ 'cursor-grabbing': isDragging }"
          aria-label="Drag handle to resize panel"
        >
          <div v-if="draggable" class="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        </div>

        <div class="panel-content h-full" :class="mainClass">
          <PanelContent
            :title="title"
            :show-header="showHeader"
            :show-footer="showFooter"
            :content-class="contentClass"
            :is-mobile="isMobile"
            @close="close()"
          >
            <template #default>
              <slot />
            </template>
            <template #header-actions>
              <slot name="header-actions" />
            </template>
            <template v-if="$slots.footer" #footer>
              <slot name="footer" />
            </template>
          </PanelContent>
        </div>
      </div>
    </div>
    </div>

    <!-- <BottomPanel
      v-else-if="isMobile"
      :is-open="isOpen"
      :is-mobile="isMobile"
      :title="title"
      :show-header="showHeader"
      :show-footer="showFooter"
      :content-class="contentClass"
      :main-class="mainClass"
      :draggable="draggable"
      :panel-height="panelHeight ?? 0"
      :translate-y="translateY ?? 0"
      :is-dragging="isDragging ?? false"
      :panel="panel" 
      :handle="handle"
      @close="close()"
    >
      <template #default><slot /></template>
      <template #header-actions><slot name="header-actions" /></template>
      <template v-if="$slots.footer" #footer><slot name="footer" /></template>
    </BottomPanel> -->

  </div>
</template>

<script setup>
import { usePanel } from '@/composables/usePanel';
import SidePanel from '@/components/panel/SidePanel.vue';
import DesktopPanel from '@/components/panel/DesktopPanel.vue';
// Fix this integration later
// import BottomPanel from '@/components/panel/BottomPanel.vue';
import PanelContent from '@/components/base/PanelContent.vue';

const props = defineProps({
  id: { type: String, required: true },
  showToggle: { type: Boolean, default: true },
  showHeader: { type: Boolean, default: true },
  showFooter: { type: Boolean, default: true },
  title: { type: String, default: '' },
  mainClass: { type: String, default: '' },
  contentClass: { type: String, default: '' },
  type: { type: String, default: 'right' },
  position: { type: String, default: 'right' },
  maxHeightRatio: { type: Number, default: 0.8 },
  snapThreshold: { type: Number, default: 0.3 },
  storageKey: { type: String, default: 'panel' },
  draggable: { type: Boolean, default: false },
  defaultDesktopState: { type: Boolean, default: false }
});

const options = {
  storageKey: props.id || props.storageKey,
  defaultDesktopState: props.defaultDesktopState,
  maxHeightRatio: props.maxHeightRatio,
  snapThreshold: props.snapThreshold,
  draggable: props.draggable
}
const {
  isOpen,
  isMobile,
  toggle,
  close,
  handle,
  panel,
  isDragging,
  panelHeight,
  translateY
} = usePanel(props.id, options, true);
</script>

<style scoped>
/* Scoped styles for the BasePanel wrapper */
.panel-container {
  @apply relative z-20 flex flex-col flex-initial;
}

.panel-container.panel-mobile {
  display: contents;
}

.panel-container.panel-side {
  display: contents;
}

.panel-content {
  @apply flex flex-col w-full;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
