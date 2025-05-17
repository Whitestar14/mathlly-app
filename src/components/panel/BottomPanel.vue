<template>
  <div
    v-show="isOpen"
    class="fixed inset-x-0 z-20"
  >
    <div
      ref="panel"
      class="bg-white dark:bg-gray-800 rounded-t-xl fixed inset-x-0 bottom-0 overflow-hidden transition-transform duration-300 ease-out"
      :class="{ 'transition-none': isDragging }"
      :style="{
        height: `${panelHeight}px`,
        transform: `translateY(${translateY}px)`,
      }"
    >
      <!-- Draggable Handle -->
      <div
        ref="handle"
        class="w-full absolute h-6 flex items-center justify-center touch-manipulation"
        :class="[
          draggable ? 'cursor-grab' : '',
          isDragging ? 'cursor-grabbing' : ''
        ]"
      >
        <div v-if="draggable" class="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></div>
      </div>

      <div class="panel-content h-full overflow-y-auto" :class="mainClass">
        <PanelContent
          :title="title"
          :show-header="showHeader"
          :show-footer="showFooter"
          :content-class="contentClass"
          :is-mobile="isMobile"
          @close="$emit('close')"
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
</template>

<script setup>
import PanelContent from '@/components/base/PanelContent.vue';
// --- Props ---
defineProps({
  // State & Content Props
  isOpen: { type: Boolean, default: false },
  isMobile: { type: Boolean, default: false },
  title: { type: String, default: '' },
  showHeader: { type: Boolean, default: true },
  showFooter: { type: Boolean, default: true },
  contentClass: { type: String, default: '' },
  mainClass: { type: String, default: '' },

  // Draggable State Props
  draggable: { type: Boolean, default: false },
  panelHeight: { type: Number, default: 300 },
  translateY: { type: Number, default: 0 },
  isDragging: { type: Boolean, default: false },

  // Refs passed from parent (usePanel)
  panel: { type: Object, default: null },
  handle: { type: Object, default: null },
});

// --- Emits ---
defineEmits(['close']);
</script>
