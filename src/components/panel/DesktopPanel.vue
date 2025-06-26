<template>
  <div
    class="relative md:flex h-full flex-col overflow-hidden hidden transition-[width] duration-300 ease-in-out bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
    :class="[
      isOpen ? 'w-64' : 'w-10',
      position === 'left' ? 'border-l' : 'border-r',
    ]"
  >
    <!-- Panel Content (only when open) -->
    <div
      v-if="isOpen"
      class="flex flex-col w-full h-full transition-opacity duration-300"
      :class="mainClass"
    >
      <PanelContent
        :title="title"
        :show-header="showHeader"
        :show-footer="showFooter"
        :content-class="contentClass"
        @close="$emit('close')"
      >
        <template #default>
          <slot />
        </template>
        <template #header-actions>
          <slot name="header-actions" />
        </template>
        <template
          v-if="$slots.footer"
          #footer
        >
          <slot name="footer" />
        </template>
      </PanelContent>
    </div>

    <!-- Toggle button area (always visible) -->
    <div
      class="absolute inset-y-0 flex items-center justify-center"
      :class="[
        isOpen 
          ? (position === 'left' ? 'right-0 -mr-3' : 'left-0 -ml-3')
          : 'left-0 right-0'
      ]"
    >
      <Button
        v-tippy="{
          content: isOpen ? 'Hide Panel' : 'Show Panel',
          placement: position === 'left' ? 'right' : 'left',
        }"
        variant="outline"
        size="icon"
        class="shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 z-10"
        @click="$emit('toggle')"
      >
        <ArrowRightToLine
          class="h-4 w-4 text-gray-700 dark:text-gray-300 transition-transform duration-300"
          :class="{ 
            'rotate-180': (position === 'left' && isOpen) || (position === 'right' && !isOpen)
          }"
        />
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ArrowRightToLine } from 'lucide-vue-next';
import Button from '@/components/base/BaseButton.vue';
import PanelContent from '@/components/base/PanelContent.vue';

defineProps({
  isOpen: { type: Boolean, default: false },
  position: { type: String, default: 'right' },
  title: { type: String, default: '' },
  showHeader: { type: Boolean, default: true },
  showFooter: { type: Boolean, default: true },
  contentClass: { type: String, default: '' },
  mainClass: { type: String, default: '' },
});

defineEmits(['close', 'toggle']);
</script>
