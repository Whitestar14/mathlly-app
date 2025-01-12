<template>
  <div class="relative">
    <div
      v-if="isMobile && isOpen"
      class="fixed inset-0 bg-black/50 z-40"
      @click="$emit('close')"
    />

    <div
      ref="panelRef"
      :class="[
        'bg-white dark:bg-gray-800 overflow-hidden transition-all duration-300 ease-in-out',
        isMobile
          ? 'fixed bottom-0 left-0 right-0 z-50 rounded-t-lg h-1/2 border-t border-gray-200 dark:border-gray-700'
          : 'h-full border-l border-gray-200 dark:border-gray-700',
      ]"
      :style="isMobile ? panelStyle : {}"
    >
      <div class="p-4 h-full flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            History
          </h2>
          <button
            v-if="isMobile"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            @click="$emit('close')"
          >
            <XIcon class="h-6 w-6" />
          </button>
        </div>

        <div class="h-[50svh] overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <div
            v-if="mode === 'Programmer'"
            class="text-center text-sm text-gray-500 dark:text-gray-400 py-4"
          >
            History is disabled in
            <kbd class="bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md text-nowrap">
              Programmer Mode
            </kbd>
          </div>

          <template v-else>
            <div
              v-if="history.length === 0"
              class="text-center text-sm text-gray-500 dark:text-gray-400 py-4"
            >
              There's no history yet
            </div>

            <TransitionGroup 
              name="list" 
              tag="div" 
              class="space-y-2"
            >
              <div
                v-for="item in history"
                :key="item.id"
                class="group relative"
              >
                <ContextMenuRoot>
                  <ContextMenuTrigger>
                    <div
                      class="rounded-lg bg-gray-100 dark:bg-gray-700 p-3 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                      :class="{ 'animate-highlight': selectedItemId === item.id }"
                      @click="handleSelectHistoryItem(item)"
                    >
                      <div class="text-sm text-gray-600 dark:text-gray-400">
                        {{ item.expression }}
                      </div>
                      <div class="text-lg font-semibold text-gray-900 dark:text-white">
                        {{ item.result }}
                      </div>

                      <button
                        v-tippy="{ content: 'Delete item', placement: 'top' }"
                        class="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 
                          text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 
                          transition-opacity h-9 w-9 inline-flex items-center justify-center rounded-md
                          hover:bg-gray-100 dark:hover:bg-gray-900/30"
                        :class="isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
                        @click.stop="handleDeleteHistoryItem(item.id)"
                      >
                        <TrashIcon class="h-4 w-4" />
                      </button>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent
                    class="z-50 min-w-[180px] bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 shadow-md"
                  >
                    <ContextMenuItem
                      class="flex items-center text-sm w-full px-2 py-1.5 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-300 outline-none"
                      @click="handleSelectHistoryItem(item)"
                    >
                      <CheckIcon class="mr-2 h-4 w-4" />
                      <span>Select Item</span>
                    </ContextMenuItem>

                    <ContextMenuItem
                      class="flex items-center text-sm w-full px-2 py-1.5 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-300 outline-none"
                      @click="copyHistoryItem(item)"
                    >
                      <CopyIcon class="mr-2 h-4 w-4" />
                      <span>Copy Item</span>
                    </ContextMenuItem>

                    <ContextMenuSeparator class="h-px bg-gray-200 dark:bg-gray-700 my-1" />

                    <ContextMenuItem
                      class="flex items-center text-sm w-full px-2 py-1.5 rounded-sm hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer text-red-600 dark:text-red-400 outline-none"
                      @click="handleDeleteHistoryItem(item.id)"
                    >
                      <TrashIcon class="mr-2 h-4 w-4" />
                      <span>Delete Item</span>
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenuRoot>
              </div>
            </TransitionGroup>
          </template>
        </div>

        <Button
          v-if="history.length > 0 && mode !== 'Programmer'"
          type="destructive"
          class="mt-6 flex items-center justify-center py-2 bg-red-500 dark:bg-gray-300 dark:text-gray-700 dark:hover:bg-gray-200 text-white rounded hover:bg-red-600 transition-colors"
          @click="handleClearHistory"
        >
          <TrashIcon class="w-4 h-4 mr-2" />
          Clear History
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { TrashIcon, XIcon, CheckIcon, CopyIcon } from "lucide-vue-next";
import {
  ContextMenuRoot,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "radix-vue";
import { computed, onMounted, ref, watch } from "vue";
import Button from "@/components/ui/BaseButton.vue";
import db from "@/data/db";

// Name the component (important for debugging)
defineOptions({
  name: "HistoryPanel", 
});

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: true,
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: "Standard",
  },
});

const history = ref([
  { id: 1, title: "Item 1" },
  { id: 2, title: "Item 2" },
  { id: 3, title: "Item 3" },
]);

const emit = defineEmits([
  "close",
  "selectHistoryItem",
  "deleteHistoryItem",
  "clearHistory",
]);

import { useToast } from "@/composables/useToast";
const { toast } = useToast();

const copyHistoryItem = (item) => {
  const content = `${item.expression} = ${item.result}`;
  navigator.clipboard.writeText(content);
  toast({
    title: "Copied to clipboard",
    description: "The calculation has been copied to your clipboard",
  });
};

const MAX_HISTORY_ITEMS = 100;

const handleDeleteHistoryItem = async (id) => {
  await db.history.delete(id);
  emit("deleteHistoryItem", id);
  await loadHistory();
};

const selectedItemId = ref(null);
const panelRef = ref(null);

// Computed
const panelStyle = computed(() => ({
  transform: props.isOpen ? "translateY(0)" : "translateY(100%)",
}));

// Methods
const loadHistory = async () => {
  // Replace with your actual DB logic
  history.value = await db.history
    .orderBy("timestamp")
    .reverse()
    .limit(MAX_HISTORY_ITEMS)
    .toArray();
};

const handleSelectHistoryItem = (item) => {
  if (props.mode === "Programmer") return;

  selectedItemId.value = item.id;
  setTimeout(() => {
    selectedItemId.value = null;
  }, 300);

  emit("selectHistoryItem", {
    expression: item.expression.trim(),
    result: item.result,
  });

  if (props.isMobile) {
    emit("close");
  }
};

const handleClearHistory = async () => {
  await db.history.clear();
  emit("clearHistory");
  history.value = [];
};

// Lifecycle
onMounted(() => {
  loadHistory();
    console.log("HistoryPanel is-open prop:", props.isOpen);
});
watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      loadHistory();
    }
  }
);

// Expose methods
defineExpose({
  updateHistory: loadHistory,
});
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.list-move {
  transition: transform 0.5s ease;
}
.animate-highlight {
animation: highlight 0.3s ease-out;
}

@keyframes highlight {
  0% {
    background-color: theme("colors.gray.300");
  }
  100% {
    background-color: theme("colors.gray.200");
  }
}

.dark .animate-highlight {
  animation: highlight-dark 0.3s ease-out;
}

@keyframes highlight-dark {
  0% {
    background-color: theme("colors.gray.600");
  }
  100% {
    background-color: theme("colors.gray.700");
  }
}

.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}
</style>