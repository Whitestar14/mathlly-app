<template>
  <Transition name="slide-out">
    <div
      class="relative md:flex h-full flex-col flex-auto overflow-hidden hidden transition-[width] duration-300 ease-in-out bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      :class="[
        isOpen ? 'w-64' : 'w-10',
        position === 'left' ? 'border-l' : 'border-r',
      ]"
    >
      <div
        class="flex flex-col w-full absolute inset-y-0 right-0 transition-opacity duration-300 max-h-[100vh]"
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

      <!-- Toggle button (desktop only) -->
      <Button
        v-tippy="{
          content: isOpen ? 'Hide Panel' : 'Show Panel',
          placement: 'left',
        }"
        variant="outline"
        size="icon"
        class="shadow-sm absolute left-0 bottom-0 -translate-y-1/3 pointer-events-auto"
        :class="!isOpen ? '-translate-x-1/2 left-1/2' : 'translate-x-1/4'"
        @click="$emit('toggle')"
      >
        <ArrowRightToLine
          class="h-4 w-4 text-gray-700 dark:text-gray-300 transition-transform duration-300"
          :class="{ 'rotate-180': isOpen }"
        />
      </Button>
    </div>
  </Transition>
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
