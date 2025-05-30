<template>
  <div class="group relative">
    <ContextMenu
      :side-offset="5"
      align="start"
    >
      <template #trigger>
        <div
          class="rounded-lg bg-gray-100 dark:bg-gray-800 sm:dark:bg-gray-700 p-3 hover:bg-gray-200 dark:hover:bg-gray-700 sm:dark:hover:bg-gray-600 transition-colors cursor-pointer"
          :class="{ 'animate-highlight': selectedItemId === item.id }"
          @click="$emit('select', item)"
        >
          <div class="text-sm text-gray-700/75 dark:text-gray-300/75 break-all">
            {{ item.expression }}
          </div>
          <div class="text-lg font-medium text-gray-700 dark:text-gray-300 break-all">
            {{ item.result }}
          </div>

          <Button
            v-tippy="{ content: 'Delete item' }"
            variant="ghost"
            size="icon"
            class="absolute right-2 top-1/2 transform -translate-y-1/2"
            :class="isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
            @click.stop="$emit('delete', item.id)"
          >
            <TrashIcon class="h-4 w-4" />
          </Button>
        </div>
      </template>

      <ContextMenuItem
        class="context-menu-item"
        @click="$emit('select', item)"
      >
        <CheckIcon class="mr-2 h-4 w-4" />
        <span>Select Item</span>
      </ContextMenuItem>

      <ContextMenuItem
        class="context-menu-item"
        @click="$emit('copy', item)"
      >
        <CopyIcon class="mr-2 h-4 w-4" />
        <span>Copy Item</span>
      </ContextMenuItem>

      <ContextMenuItem
        class="context-menu-item"
        @click="$emit('copy-json', item)"
      >
        <CodeIcon class="mr-2 h-4 w-4" />
        <span>Copy as JSON</span>
      </ContextMenuItem>

      <ContextMenuSeparator class="h-px bg-gray-200 dark:bg-gray-700 my-1" />

      <ContextMenuItem
        class="context-menu-item-danger"
        @click="$emit('delete', item.id)"
      >
        <TrashIcon class="mr-2 h-4 w-4" />
        <span>Delete Item</span>
      </ContextMenuItem>
    </ContextMenu>
  </div>
</template>

<script setup>
import { TrashIcon, CheckIcon, CopyIcon, CodeIcon } from "lucide-vue-next";
import {
  ContextMenuItem,
  ContextMenuSeparator,
} from "radix-vue";
import Button from "@/components/base/BaseButton.vue";
import ContextMenu from "@/components/base/ContextMenu.vue";

defineProps({
  item: {
    type: Object,
    required: true,
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
  selectedItemId: {
    type: [Number, null],
    default: null,
  },
});

defineEmits(["select", "delete", "copy", "copy-json"]);
</script>

<style>
.animate-highlight {
  animation: highlight 0.3s ease-out;
}

@keyframes highlight {
  0% {
    @apply bg-gray-300 dark:bg-gray-600;
  }
  100% {
    @apply bg-gray-100 dark:bg-gray-700;
  }
}
</style>
