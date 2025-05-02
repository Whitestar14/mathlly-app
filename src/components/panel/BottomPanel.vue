<template>
    <div
      v-show="isOpen"
      class="fixed inset-x-0 z-20"
    >
      <div
        ref="panel"
        class="bg-white dark:bg-gray-800 rounded-t-xl fixed inset-x-0 bottom-0 overflow-hidden"
        :style="{
          height: `${panelHeight}px`,
          transform: `translateY(${translateY}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease',
        }"
      >
        <!-- Draggable Handle -->
        <div
          ref="handle"
          class="w-full absolute h-6 flex items-center justify-center cursor-grab active:cursor-grabbing touch-manipulation"
          :class="{ 'cursor-grabbing': isDragging }"
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
            @close="onClose"
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
  title: { type: String, default: '' },
  showHeader: { type: Boolean, default: true },
  showFooter: { type: Boolean, default: true },
  contentClass: { type: String, default: '' },
  mainClass: { type: String, default: '' },

  // Draggable State Props
  draggable: { type: Boolean, default: false },
  panelHeight: { type: Number, default: 300 }, // Adjusted default
  translateY: { type: Number, default: 0 },
  isDragging: { type: Boolean, default: false },

  // Refs passed from parent (usePanel)
  // These props expect actual Vue Ref objects (Ref<HTMLElement | null>)
  panelRef: { type: [Object, Function], default: null }, // Accept Ref object or function
  handleRef: { type: [Object, Function], default: null }, // Accept Ref object or function
});

// --- Emits ---
defineEmits(['close']);
</script>

<style scoped>
/* Scoped styles specific to BottomPanel */
.panel-content {
  /* Ensure content area allows scrolling if needed */
  overflow-y: auto;
}
</style>