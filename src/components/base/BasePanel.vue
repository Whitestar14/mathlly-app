<template>
  <div
    class="panel-container"
    :class="{ mobile: isMobile, 'panel-side': position === 'side' }"
  >
    <!-- Backdrop (mobile only) -->
    <Transition name="fade">
      <div
        v-if="isMobile && isOpen && position !== 'side'"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        aria-hidden="true"
        @click="onClose"
      />
    </Transition>

    <!-- Side Panel -->
    <Transition :name="positionSide === 'left' ? 'slide-left' : 'slide-right'">
      <div
        v-if="position === 'side'"
        v-show="isOpen"
        class="side-panel-container"
        :class="[
          isMobile ? 'w-full' : `w-${width}`,
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
          :show-close-button="showCloseButton"
          :content-class="contentClass"
          :is-mobile="isMobile"
          @close="onClose"
        >
          <template #default>
            <slot></slot>
          </template>
          <template #header-actions>
            <slot name="header-actions"></slot>
          </template>
          <template #footer v-if="$slots.footer">
            <slot name="footer"></slot>
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
          'transition-all duration-300 ease-in-out border-l border-gray-200 dark:border-gray-700',
          isOpen ? 'w-[18.5rem]' : 'w-10'
        ]"
      >
        <div
          class="panel-content absolute inset-y-0 right-0 bg-white dark:bg-gray-800 transition-opacity duration-300 max-h-[100vh]"
          :class="[
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
            mainClass,
          ]"
        >
          <PanelContent
            :title="title"
            :show-header="showHeader"
            :show-footer="showFooter"
            :show-close-button="showCloseButton"
            :content-class="contentClass"
            :is-mobile="isMobile"
            @close="onClose"
          >
            <template #default>
              <slot></slot>
            </template>
            <template #header-actions>
              <slot name="header-actions"></slot>
            </template>
            <template #footer v-if="$slots.footer">
              <slot name="footer"></slot>
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
            <ChevronRightIcon
              class="h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-300"
              :class="{ 'rotate-180': isOpen }"
            />
          </Button>
        </div>
      </div>
    </Transition>

    <!-- Mobile Panel -->
    <Transition name="slide-up">
      <div
        v-if="isMobile && position !== 'side' && isOpen"
        class="fixed inset-x-0 bottom-0 z-50 rounded-t-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 max-h-[80vh] h-[600px]"
      >
        <div class="panel-content h-full" :class="mainClass">
          <PanelContent
            :title="title"
            :show-header="showHeader"
            :show-footer="showFooter"
            :show-close-button="showCloseButton"
            :content-class="contentClass"
            :is-mobile="isMobile"
            @close="onClose"
          >
            <template #default>
              <slot></slot>
            </template>
            <template #header-actions>
              <slot name="header-actions"></slot>
            </template>
            <template #footer v-if="$slots.footer">
              <slot name="footer"></slot>
            </template>
          </PanelContent>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ChevronRightIcon } from 'lucide-vue-next';
import Button from '@/components/base/BaseButton.vue';
import PanelContent from '@/components/base/PanelContent.vue';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  isMobile: { type: Boolean, default: false },
  showToggle: { type: Boolean, default: true },
  showHeader: { type: Boolean, default: true },
  showFooter: { type: Boolean, default: true },
  showCloseButton: { type: Boolean, default: true },
  title: { type: String, default: '' },
  width: { type: String, default: '64' },
  mainClass: { type: String, default: '' },
  contentClass: { type: String, default: '' },
  position: { type: String, default: 'right' }, // 'right', 'left', or 'side'
  positionSide: { type: String, default: 'right' }, // 'right' or 'left' for side panel
});

const emit = defineEmits(['update:isOpen']);

const onOpen = () => emit('update:isOpen', true);
const onClose = () => emit('update:isOpen', false);

const onToggle = () => {
  props.isOpen === true ? onClose() : onOpen();
};
</script>

<style scoped>
.panel-container {
  position: relative;
  z-index: 10;
  display: flex;
  flex: 0 1 auto;
  flex-direction: column;
}

.panel-container.mobile {
  display: contents;
}

.panel-container.panel-side {
  display: contents;
}

.desktop-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

@media (max-width: 768px) {
  .desktop-panel {
    display: none !important;
  }
}

.panel-content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.side-panel-container {
  @apply fixed top-0 bottom-0 z-50 inset-y-0 bg-gray-50 dark:bg-gray-900 transition-all;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Mobile panel animations */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
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

/* Fade animations for backdrop */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
