<template>
  <div
    class="relative z-20 flex flex-col flex-initial"
    :class="{
      'panel-mobile': isMobile,
      'panel-side': type === 'side',
    }"
  >
    <!-- Backdrop (mobile only) -->
    <Transition :name="!animationDisabled ? 'fade' : ''">
      <div
        v-show="isMobile && isOpen"
        class="fixed inset-0 z-20"
        :class="[
          draggable ? [isDragging ? 'bg-black/20' : 'bg-black/40'] : '',
          !animationDisabled ? 'backdrop-blur-sm transition-colors duration-300' : 'bg-black/50'
        ]"
        aria-hidden="true"
        @click="close()"
      />
    </Transition>

    <!-- Side Panel -->
    <SidePanel
      v-if="type === 'side' && !isMobile"
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
    <div v-if="isMobile">
      <div v-show="isOpen" class="fixed inset-x-0 z-20">
        <div
          ref="panel"
          class="bg-white dark:bg-gray-900 fixed inset-x-0 bottom-0 overflow-hidden"
          :class="[
            isExpanded || maxHeightRatio === 1 ? 'rounded-none' : 
            !animationDisabled ? 'transition-[rounded] duration-300 rounded-t-xl' : 'rounded-t-xl'
          ]"
          :style="{
            height: `${panelHeight}px`,
            transform: `translateY(${translateY}px)`,
            transition: isDragging ? '' : !animationDisabled ? 'transform 0.3s ease-out, height 0.3s ease-out' : '',
          }"
        >
          <!-- Expand/Minimize Button -->
          <button
            v-if="draggable && !(maxHeightRatio === 1)"
            class="absolute right-12 top-3.5 p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            @click="toggle({expanded: true})"
            aria-label="Toggle panel expansion"
          >
            <Maximize2 v-if="!isExpanded" class="w-4 h-4" />
            <Minimize2 v-else class="w-4 h-4" />
          </button>

          <!-- Draggable Handle - Hide when expanded -->
          <div
            ref="handle"
            class="w-full absolute h-6 flex items-center justify-center cursor-grab active:cursor-grabbing touch-manipulation"
            :class="[
              { 'cursor-grabbing': isDragging },
              isExpanded || maxHeightRatio === 1 ? 'pointer-events-none opacity-0' : ''
            ]"
            aria-label="Drag handle to resize panel"
          >
            <div v-if="draggable" class="w-10 h-1 pb-1 rounded-full bg-gray-300 dark:bg-gray-600"></div>
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
  </div>
</template>

<script setup>
import { useSettingsStore } from '@/stores/settings';
import { computed } from 'vue';
import { usePanel } from '@/composables/usePanel';
import SidePanel from '@/components/panel/SidePanel.vue';
import DesktopPanel from '@/components/panel/DesktopPanel.vue';
import PanelContent from '@/components/base/PanelContent.vue';
import { Maximize2, Minimize2 } from 'lucide-vue-next';

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

const settingsStore = useSettingsStore();
const animationDisabled = computed(() => settingsStore.appearance.animationDisabled);

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
  isExpanded,
  toggle,
  close,
  handle,
  panel,
  isDragging,
  panelHeight,
  translateY
} = usePanel(props.id, options, true);
</script>
