<template>
    <Transition :name="position === 'left' ? 'slide-left' : 'slide-right'">
      <div
        v-if="isOpen"
        class="side-panel-container"
        :class="[
          isMobile ? 'w-full' : 'w-64',
          position === 'left' ? 'left-0' : 'right-0',
          !isMobile && position === 'left' ? 'border-r' : '',
          !isMobile && position === 'right' ? 'border-l' : '',
          'border-gray-200 dark:border-gray-700',
        ]"
      >
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
    </Transition>
  </template>
  
  <script setup>
  import PanelContent from '@/components/base/PanelContent.vue';
  
  defineProps({
    isOpen: { type: Boolean, default: false },
    isMobile: { type: Boolean, default: false },
    position: { type: String, default: 'right' },
    title: { type: String, default: '' },
    showHeader: { type: Boolean, default: true },
    showFooter: { type: Boolean, default: true },
    contentClass: { type: String, default: '' },
    mainClass: { type: String, default: '' },
  });
  
  defineEmits(['close']);
  </script>
  
  <style scoped>
  .side-panel-container {
    @apply overflow-hidden h-screen flex flex-col fixed top-0 z-20 bottom-0 inset-y-0 bg-gray-50 dark:bg-gray-900;
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
  </style>
  