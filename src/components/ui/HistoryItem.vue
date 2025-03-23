<template>
  <!-- TODO: Fix the historyItem contextMenu appearing behind the items -->
  <div class="group relative">
    <ContextMenuRoot>
      <ContextMenuTrigger asChild>
        <div
          class="history-item-card"
          :class="{ 'animate-highlight': selectedItemId === item.id }"
          @click="$emit('select', item)"
        >
          <div class="text-sm text-gray-600 dark:text-gray-400 break-all">
            {{ item.expression }}
          </div>
          <div class="text-lg font-medium text-gray-700 dark:text-gray-200 break-all">
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
      </ContextMenuTrigger>
      <ContextMenuPortal>
        <ContextMenuContent
          class="context-menu-container"
          :side-offset="5"
          :align="'start'"
        >
          <ContextMenuItem class="context-menu-item" @click="$emit('select', item)">
            <CheckIcon class="mr-2 h-4 w-4" />
            <span>Select Item</span>
          </ContextMenuItem>

          <ContextMenuItem class="context-menu-item" @click="$emit('copy', item)">
            <CopyIcon class="mr-2 h-4 w-4" />
            <span>Copy Item</span>
          </ContextMenuItem>

          <ContextMenuItem class="context-menu-item" @click="$emit('copy-json', item)">
            <CodeIcon class="mr-2 h-4 w-4" />
            <span>Copy as JSON</span>
          </ContextMenuItem>

          <ContextMenuSeparator class="h-px bg-gray-200 dark:bg-gray-700 my-1" />

          <ContextMenuItem class="context-menu-item-danger" @click="$emit('delete', item.id)">
            <TrashIcon class="mr-2 h-4 w-4" />
            <span>Delete Item</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenuPortal>
    </ContextMenuRoot>
  </div>
</template>

<script setup>
import { TrashIcon, CheckIcon, CopyIcon, CodeIcon } from "lucide-vue-next";
import {
  ContextMenuRoot,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuPortal,
} from "radix-vue";
import Button from "@/components/base/BaseButton.vue";

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
.history-item-card {
  @apply rounded-lg bg-gray-100 dark:bg-gray-700 p-3 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer;
}

.context-menu-container {
  @apply z-[100] min-w-[180px] bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 p-1 shadow-md;
}

.context-menu-item {
  @apply flex items-center text-sm w-full px-2 py-1.5 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-300 outline-none;
}

.context-menu-item-danger {
  @apply flex items-center text-sm w-full px-2 py-1.5 hover:bg-red-100 first:rounded-t-md last:rounded-b-md dark:hover:bg-red-900/30 cursor-pointer text-red-600 dark:text-red-400 outline-none;
}

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
