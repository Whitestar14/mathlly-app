<template>
  <div class="relative"
    :class="[
      isMobile ? '' : 'w-1/4 min-w-64 max-w-80 flex-shrink-0',
      // After adding state toggle management for history panel, uncomment this line
      // { 'pointer-events-none': !isOpen },
    ]"
  >
    <!-- Mobile overlay -->
    <div
      v-if="isMobile && isOpen"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-10 transition-opacity duration-300"
      :class="{
        'opacity-0 pointer-events-none': !isOpen,
        'opacity-100': isOpen,
      }"
      @click="$emit('close')"
    />

    <!-- Panel container -->
    <div
      ref="panelRef"
      :class="[
        'bg-white dark:bg-gray-800 overflow-hidden transition-all duration-300 ease-in-out',
        isMobile
          ? [
              'fixed bottom-0 inset-x-0 z-20 rounded-t-lg h-1/2',
              isOpen ? 'translate-y-0' : 'translate-y-full',
            ]
          : 'absolute inset-y-0 right-0 w-full border-l border-gray-200 dark:border-gray-700',
      ]"
    >
      <div class="flex flex-col h-full max-h-full">
        <div
          class="flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-700"
        >
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200">
              History
            </h2>
            <Button
              v-if="isMobile"
              variant="ghost"
              size="icon"
              @click="$emit('close')"
            >
              <XIcon class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          class="flex-1 overflow-y-auto overflow-x-hidden p-3 scrollbar-thin"
        >
          <div
            class="h-auto rounded overflow-hidden overflow-y-auto flex-grow scrollbar-thin"
          >
            <div
              v-if="mode === 'Programmer'"
              class="text-center text-sm text-gray-500 dark:text-gray-400 py-4"
            >
              <p>
                History is disabled in
                <kbd
                  class="inline-block align-middle w-fit bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md text-nowrap"
                >
                  Programmer Mode
                </kbd>
              </p>
            </div>

            <template v-else>
              <div
                v-if="history.length === 0"
                class="text-center text-sm text-gray-500 dark:text-gray-400 py-4"
              >
                <p>There's no history yet</p>
              </div>

              <TransitionGroup name="list" tag="div" class="space-y-2">
                <div
                  v-for="item in history"
                  :key="item.id"
                  class="group relative"
                >
                  <ContextMenuRoot>
                    <ContextMenuTrigger>
                      <div
                        class="rounded-lg bg-gray-100 dark:bg-gray-700 p-3 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                        :class="{
                          'animate-highlight': selectedItemId === item.id,
                        }"
                        @click="handleSelectHistoryItem(item)"
                      >
                        <div class="text-sm text-gray-600 dark:text-gray-400">
                          {{ item.expression }}
                        </div>
                        <div
                          class="text-lg font-semibold text-gray-700 dark:text-gray-200"
                        >
                          {{ item.result }}
                        </div>

                        <Button
                          v-tippy="{ content: 'Delete item' }"
                          variant="ghost"
                          size="icon"
                          class="absolute right-2 top-1/2 transform -translate-y-1/2"
                          :class="
                            isMobile
                              ? 'opacity-100'
                              : 'opacity-0 group-hover:opacity-100'
                          "
                          @click.stop="handleDeleteHistoryItem(item.id)"
                        >
                          <TrashIcon class="h-4 w-4" />
                        </Button>
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

                      <ContextMenuItem
                        class="flex items-center text-sm w-full px-2 py-1.5 rounded-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-300 outline-none"
                        @click="copyAsJson(item)"
                      >
                        <CodeIcon class="mr-2 h-4 w-4" />
                        <span>Copy as JSON</span>
                      </ContextMenuItem>

                      <ContextMenuSeparator
                        class="h-px bg-gray-200 dark:bg-gray-700 my-1"
                      />

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
        </div>

        <div v-if="history.length > 0 && mode !== 'Programmer'"
          class="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-700"
        >
          <Button
            v-if="!isMobile"
            v-tippy="{ content: 'Clear History' }"
            variant="ghost"
            size="icon"
            class="float-right text-red-400 hover:text-red-500 hover:bg-red-300/30 dark:hover:text-red-400"
            @click="showClearConfirmation = true"
          >
            <TrashIcon class="w-4 h-4" />
          </Button>

          <Button
            v-if="isMobile"
            variant="destructive"
            class="w-full py-2"
            @click="showClearConfirmation = true"
          >
            <TrashIcon class="w-4 h-4 mr-2" />
            Clear History
          </Button>
        </div>
      </div>
    </div>

    <BaseModal
      :open="showClearConfirmation"
      description="confirmation-dialog"
      @update:open="showClearConfirmation = $event"
    >
      <template #title> Clear History </template>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Are you sure you want to clear all history items? This action cannot be
        undone.
      </p>
      <div class="flex justify-end space-x-2">
        <Button
          variant="outline"
          class="dark:text-gray-300 transition-colors"
          @click="showClearConfirmation = false"
        >
          Cancel
        </Button>
        <Button variant="destructive" @click="confirmClearHistory">
          Clear All
        </Button>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { TrashIcon, XIcon, CheckIcon, CopyIcon, CodeIcon } from "lucide-vue-next";
import {
  ContextMenuRoot,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "radix-vue";
import Button from "@/components/base/BaseButton.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import { useToast } from "@/composables/useToast";
import { useClipboard } from "@vueuse/core";
import db from "@/data/db";

const props = defineProps({
  isMobile: Boolean,
  isOpen: { type: Boolean, default: false },
  mode: { type: String, default: "Standard" },
});

const emit = defineEmits([
  "close",
  "selectHistoryItem",
  "deleteHistoryItem",
  "clearHistory",
]);

defineOptions({ name: "HistoryPanel" });
const { copy } = useClipboard();
const { toast } = useToast();

const history = ref([
  { id: 1, title: "Item 1" },
  { id: 2, title: "Item 2" },
  { id: 3, title: "Item 3" },
]);

const selectedItemId = ref(null);
const panelRef = ref(null);
const showClearConfirmation = ref(false);

const MAX_HISTORY_ITEMS = 100;

const loadHistory = async () => {
  history.value = await db.history
    .orderBy("timestamp")
    .reverse()
    .limit(MAX_HISTORY_ITEMS)
    .toArray();
};

const copyHistoryItem = (item) => {
  copy(`${item.expression} = ${item.result}`);
  toast({
    title: "Copied to clipboard",
    description: "The calculation has been copied to your clipboard",
  });
};

const copyAsJson = (item) => {
  const jsonData = JSON.stringify(
    {
      expression: item.expression,
      result: item.result,
      timestamp: item.timestamp,
    },
    null,
    2
  );

  copy(jsonData);
  toast({
    title: "Copied as JSON",
    description: "The calculation has been copied in JSON format",
  });
};

const handleDeleteHistoryItem = async (id) => {
  await db.history.delete(id);
  emit("deleteHistoryItem", id);
  await loadHistory();
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

const confirmClearHistory = async () => {
  await db.history.clear();
  emit("clearHistory");
  history.value = [];
  showClearConfirmation.value = false;
  toast({
    title: "History cleared",
    description: "All history items have been removed",
  });
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

defineExpose({ updateHistory: loadHistory });
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
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
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
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
@supports (padding: max(0px)) {
  .mobile-safe-bottom {
    padding-bottom: max(env(safe-area-inset-bottom), 0.75rem);
  }
}
</style>