<template>
    <div class="relative">
    <div 
      v-if="props.mode === 'Programmer'"
      class="absolute inset-0 bg-gray-200 dark:bg-gray-700 bg-opacity-70 dark:bg-opacity-70 z-10 flex items-center justify-center cursor-not-allowed"
      v-tippy="{ content: 'History is disabled in Programmer mode', placement: 'top', arrow: false, followCursor: true }"
    >
      <LockIcon class="h-8 w-8 text-gray-500 dark:text-gray-400" />
    </div>
    <div
      v-if="isMobile && isOpen && props.mode !== 'Programmer'"
      class="fixed inset-0 bg-black bg-opacity-50 z-40"
      @click="closePanel"
    ></div>
    <div
      :class="[
        'bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ease-in-out',
        isMobile
          ? 'fixed bottom-0 left-0 right-0 z-50 rounded-t-lg h-1/2'
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
            @click="closePanel"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XIcon class="h-6 w-6" />
          </button>
        </div>
        <div class="overflow-y-auto flex-grow custom-scrollbar">
          <div
            v-if="history.length === 0"
            class="text-center text-sm text-gray-500 dark:text-gray-400 py-4"
          >
            There's no history yet
          </div>
          <TransitionGroup name="list" tag="div" class="space-y-2">
            <div
              v-for="item in history"
              :key="item.id"
              class="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors relative group"
            >
              <div @click.stop="handleSelectHistoryItem(item)">
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ item.expression }}
                </div>
                <div
                  class="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  {{ item.result }}
                </div>
              </div>
              <button
                @click.stop="handleDeleteHistoryItem(item.id)"
                v-tippy="{ content: 'Delete item', placement: 'top' }"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 p-2 group-hover:opacity-100 transition-opacity duration-200 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
              >
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
          </TransitionGroup>
        </div>
        <button
          v-if="history.length > 0"
          @click="handleClearHistory"
          class="mt-4 flex items-center justify-center w-full py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          <TrashIcon class="w-4 h-4 mr-2" />
          Clear History
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { TrashIcon, XIcon, LockIcon } from "lucide-vue-next";
import {
  computed,
  defineEmits,
  defineExpose,
  defineProps,
  onMounted,
  ref,
  watch,
} from "vue";
import db from "../data/db";

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

const emit = defineEmits([
  "close",
  "selectHistoryItem",
  "deleteHistoryItem",
  "clearHistory",
]);

const history = ref([]);
const MAX_HISTORY_ITEMS = 100;

const closePanel = () => {
  emit("close");
};

const handleDeleteHistoryItem = async (id) => {
  await db.history.delete(id);
  emit("deleteHistoryItem", id);
  await loadHistory();
};

const handleSelectHistoryItem = (item) => {
  emit("selectHistoryItem", item);
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
  history.value = await db.history.orderBy("timestamp").reverse().limit(MAX_HISTORY_ITEMS).toArray();
};

const panelStyle = computed(() => ({
  transform: props.isOpen ? "translateY(0)" : "translateY(100%)",
}));

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
</style>
