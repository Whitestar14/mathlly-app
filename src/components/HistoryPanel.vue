<template>
  <div class="relative">
    <!-- Disabled overlay for Programmer mode on both mobile and desktop -->
    <div
      v-if="props.mode === 'Programmer'"
      class="absolute inset-0 bg-gray-200 dark:bg-gray-700 bg-opacity-50 dark:bg-opacity-50 z-10 flex items-center justify-center cursor-not-allowed"
    >
      <LockIcon class="h-8 w-8 text-gray-500 dark:text-gray-400" />
    </div>

    <div
      v-if="isMobile && isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40"
      @click="closePanel"
    />

    <div
      :class="[
        'bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ease-in-out',
        isMobile
          ? 'fixed bottom-0 left-0 right-0 z-50 rounded-t-lg h-1/2 border-l-0 border-t'
          : 'h-full',
      ]"
      :style="isMobile ? panelStyle : {}"
    >
      <div class="p-4 h-full flex flex-col max-h-[90vh]">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            History
          </h2>
          <button
            v-if="isMobile"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            @click="closePanel"
          >
            <XIcon class="h-6 w-6" />
          </button>
        </div>
        <div class="overflow-y-auto flex-grow custom-scrollbar">
          <div
            v-if="props.mode === 'Programmer'"
            class="text-center text-sm text-gray-500 dark:text-gray-400 py-4"
          >
            History is disabled in
            <kbd
              class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-nowrap"
              >Programmer Mode</kbd
            >
          </div>
          <template v-else>
            <div
              v-if="history.length === 0"
              class="text-center text-sm text-gray-500 dark:text-gray-400 py-4"
            >
              There's no history yet
            </div>
            <!-- Key changes for animation and spacing -->
            <TransitionGroup name="list" tag="ul" class="space-y-2">
              <li v-for="item in history" :key="item.id" class="list-none">
                <ContextMenuRoot>
                  <ContextMenuTrigger>
                    <div
                      class="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors relative group"
                      :class="{
                        'highlight dark:highlight': selectedItemId === item.id,
                      }"
                      @click="handleSelectHistoryItem(item)"
                    >
                      <div>
                        <div class="text-sm text-gray-600 dark:text-gray-400">
                          {{ item.expression }}
                        </div>
                        <div
                          class="text-lg font-semibold text-gray-900 dark:text-white"
                        >
                          {{ item.result }}
                        </div>
                      </div>
                      <!-- Hover delete button -->
                      <button
                        v-tippy="{ content: 'Delete item', placement: 'top' }"
                        class="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                        :class="
                          isMobile
                            ? 'opacity-100'
                            : 'opacity-0 group-hover:opacity-100'
                        "
                        @click.stop="handleDeleteHistoryItem(item.id)"
                      >
                        <TrashIcon class="h-4 w-4" />
                      </button>
                    </div>
                  </ContextMenuTrigger>

                  <Transition name="context-menu" appear>
                    <ContextMenuContent
                      class="z-50 min-w-[180px] relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 shadow-md outline-none origin-top-left"
                      position="bottom-end"
                    >
                      <ContextMenuItem
                        class="flex items-center text-sm w-full px-2 py-1.5 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-300 outline-none"
                        @click="handleSelectHistoryItem(item)"
                      >
                        <CheckIcon class="mr-2.5 h-4 w-4 flex-shrink-0" />
                        <span class="flex-grow text-left">Select Item</span>
                      </ContextMenuItem>

                      <ContextMenuItem
                        class="flex items-center text-sm w-full px-2 py-1.5 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-300 outline-none"
                        @click="copyHistoryItem(item)"
                      >
                        <CopyIcon class="mr-2.5 h-4 w-4 flex-shrink-0" />
                        <span class="flex-grow text-left">Copy Item</span>
                      </ContextMenuItem>

                      <ContextMenuSeparator
                        class="h-px bg-gray-200 dark:bg-gray-700 my-1"
                      />

                      <ContextMenuItem
                        class="flex items-center text-sm w-full px-2 py-1.5 rounded-sm hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer text-red-600 dark:text-red-400 outline-none"
                        @click="handleDeleteHistoryItem(item.id)"
                      >
                        <TrashIcon class="mr-2.5 h-4 w-4 flex-shrink-0" />
                        <span class="flex-grow text-left">Delete Item</span>
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </Transition>
                </ContextMenuRoot>
              </li>
            </TransitionGroup>
          </template>
        </div>
        <button
          v-if="history.length > 0"
          class="mt-4 flex items-center justify-center w-full py-2 bg-red-500 dark:bg-gray-300 dark:text-gray-700 dark:hover:bg-gray-200 text-white rounded hover:bg-red-600 transition-colors"
          @click="handleClearHistory"
        >
          <TrashIcon class="w-4 h-4 mr-2" />
          Clear History
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  LockIcon,
  TrashIcon,
  XIcon,
  CheckIcon,
  CopyIcon,
} from "lucide-vue-next";
import {
  ContextMenuRoot,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "radix-vue";
import { computed, onMounted, ref, watch } from "vue";
import db from "../data/db";

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
    required: true,
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

const MAX_HISTORY_ITEMS = 100;

const handleDeleteHistoryItem = async (id) => {
  await db.history.delete(id);
  emit("deleteHistoryItem", id);
  await loadHistory();
};

const selectedItemId = ref(null);

const handleSelectHistoryItem = (item) => {
  // Prevent selecting history items in Programmer mode
  if (props.mode === "Programmer") {
    return;
  }

  selectedItemId.value = item.id;
  setTimeout(() => {
    selectedItemId.value = null;
  }, 300); // Reset after 300ms

  // Add type checking and sanitization
  if (!item || typeof item.expression !== "string") {
    console.error("Invalid history item");
    return;
  }

  emit("selectHistoryItem", {
    expression: item.expression.trim(),
    result: item.result,
  });

  // Close the panel on mobile after selection
  if (props.isMobile) {
    closePanel();
  }
};

const handleClearHistory = async () => {
  await db.history.clear();
  emit("clearHistory");
  history.value = [];
};

const loadHistory = async () => {
  history.value = await db.history
    .orderBy("timestamp")
    .reverse()
    .limit(MAX_HISTORY_ITEMS)
    .toArray();
};

const panelStyle = computed(() => ({
  transform: props.isOpen ? "translateY(0)" : "translateY(100%)",
}));

// Add new method for copying
const copyHistoryItem = (item) => {
  const content = `${item.expression} = ${item.result}`;
  navigator.clipboard.writeText(content);
};

onMounted(() => {
  loadHistory();
});

watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      loadHistory();
    }
  }
);

// Add this method to update history from outside
const updateHistory = async () => {
  await loadHistory();
};

const closePanel = () => {
  emit("close");
};

// Expose the updateHistory method
defineExpose({ updateHistory });
</script>

<style scoped>
.group:hover .opacity-0 {
  opacity: 1;
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

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

.highlight {
  animation: highlight 0.3s ease-out;
}

@keyframes highlight {
  0% {
    background-color: theme("colors.gray.400");
  }

  100% {
    background-color: theme("colors.gray.200");
  }
}

.dark .highlight {
  animation: highlight-dark 0.1s ease-out;
}

@keyframes highlight-dark {
  0% {
    background-color: theme("colors.gray.600");
  }

  100% {
    background-color: theme("colors.gray.700");
  }
}

.context-menu-enter-active,
.context-menu-leave-active {
  transition: all 0.2s ease;
  transform-origin: top left;
}

.context-menu-enter-from,
.context-menu-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
