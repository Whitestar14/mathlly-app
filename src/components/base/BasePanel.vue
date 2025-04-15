<template>
  <div
    class="panel-container"
    :class="{ mobile: isMobile, 'panel-side': position === 'side' }"
  >
    <!-- Backdrop (mobile only) -->
    <Transition name="fade">
      <div
        v-show="isMobile && isOpen && position !== 'side'"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm z-20"
        aria-hidden="true"
        @click="onClose"
      />
    </Transition>

    <!-- Side Panel -->
    <Transition :name="positionSide === 'left' ? 'slide-left' : 'slide-right'">
      <div
        v-if="position === 'side' && isOpen"
        class="side-panel-container"
        :class="[
          isMobile ? 'w-full' : `w-64`,
          positionSide === 'left' ? 'left-0' : 'right-0',
          !isMobile && positionSide === 'left' ? 'border-r' : '',
          !isMobile && positionSide === 'right' ? 'border-l' : '',
          'border-gray-200 dark:border-gray-700',
        ]"
      >
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
    </Transition>

    <!-- Desktop Panel -->
    <Transition name="slide-out">
      <div
        v-if="!isMobile && position !== 'side'"
        class="desktop-panel"
        :class="[
          'transition-[width] duration-300 ease-in-out bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
          isOpen ? 'w-64' : 'w-10',
          positionSide === 'left' ? 'border-l' : 'border-r',
        ]"
      >
        <div
          class="panel-content absolute inset-y-0 right-0 transition-opacity duration-300 max-h-[100vh]"
          :class="[
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
            mainClass,
          ]"
        >
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

        <!-- Toggle button (desktop only) -->
        <div v-if="showToggle">
          <Button
            v-tippy="{
              content: isOpen ? 'Hide Panel' : 'Show Panel',
              placement: 'left',
            }"
            variant="outline"
            size="icon"
            :class="[
              'shadow-sm absolute left-0 bottom-0 -translate-y-1/3 pointer-events-auto',
              !isOpen ? '-translate-x-1/2 left-1/2' : 'translate-x-1/4',
            ]"
            @click="onToggle"
          >
            <ArrowRightToLine
              class="h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-300"
              :class="{ 'rotate-180': isOpen }"
            />
          </Button>
        </div>
      </div>
    </Transition>

    <!-- Mobile Panel -->
    <div
      v-if="isMobile && position !== 'side' && isOpen"
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
          <div class="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></div>
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
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { ArrowRightToLine } from 'lucide-vue-next';
import { useDraggablePanel } from '@/composables/useDraggable';
import Button from '@/components/base/BaseButton.vue';
import PanelContent from '@/components/base/PanelContent.vue';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  isMobile: { type: Boolean, default: false },
  showToggle: { type: Boolean, default: true },
  showHeader: { type: Boolean, default: true },
  showFooter: { type: Boolean, default: true },
  title: { type: String, default: '' },
  mainClass: { type: String, default: '' },
  contentClass: { type: String, default: '' },
  position: { type: String, default: 'right' },
  positionSide: { type: String, default: 'right' },
  maxHeightRatio: { type: Number, default: 0.8 },
  snapThreshold: { type: Number, default: 0.3 },
});

const emit = defineEmits(['update:isOpen']);

const onOpen = () => emit('update:isOpen', true);
const onClose = () => {
  if (props.isMobile) {
    requestAnimatedClose();
  } else {
    emit('update:isOpen', false);
  }}

const onToggle = () => {
  props.isOpen === true ? onClose() : onOpen()
}

// Use the draggable panel composable
const {
  handle,
  panel,
  isDragging,
  panelHeight,
  translateY,
  setupDraggable,
  requestAnimatedClose,
} = useDraggablePanel({
  maxHeightRatio: props.maxHeightRatio,
  snapThreshold: props.snapThreshold,
  isOpen: () => props.isOpen,
  emit,
});

onMounted(() => {
  if (props.isMobile) {
    setupDraggable();
  }
});

// If parent sets isOpen to false, animate close on mobile
watch(
  () => props.isOpen,
  (val) => {
    if (!val && props.isMobile) {
      onClose();
    }
  }
);
</script>

<style scoped>
.panel-container {
  @apply relative z-20 flex flex-col flex-initial;
}

.panel-container.mobile {
  display: contents;
}

.panel-container.panel-side {
  display: contents;
}

.desktop-panel {
  @apply relative flex flex-col flex-auto overflow-hidden;
}

@media (max-width: 768px) {
  .desktop-panel {
    display: none !important;
  }
}

.panel-content {
  @apply flex flex-col w-full;
}

.side-panel-container {
  @apply overflow-hidden h-screen flex flex-col fixed top-0 z-20 bottom-0 inset-y-0 bg-gray-50 dark:bg-gray-900 transition-transform;
}

/* Side panel animations - Left side */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-left-enter-to,
.slide-left-leave-from {
  transform: translateX(0%);
}

/* Side panel animations - Right side */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

.slide-right-enter-to,
.slide-right-leave-from {
  transform: translateX(0%);
}

/* Fade animation for backdrop */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
