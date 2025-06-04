<template>
  <div>
    <!-- History Items List -->
    <TransitionGroup 
      v-if="!isProgrammerMode && historyItems.length > 0" 
      tag="div" 
      class="space-y-2"
      name="history-list" 
      @before-enter="historyAnimation.onBeforeEnter" 
      @enter="historyAnimation.onEnter" 
      @leave="historyAnimation.onLeave"
    >
      <history-item 
        v-for="(item, index) in historyItems" 
        :key="item.id" 
        :item="item" 
        :is-mobile="isMobile"
        :selected-id="selectedItemId" 
        :data-index="index" 
        @select="handleSelectItem" 
        @delete="handleDelete"
        @copy="copyItem" 
        @copy-json="copyAsJson" 
      />
    </TransitionGroup>

    <div 
      v-show="!historyItems.length || isProgrammerMode"
      class="text-center py-4 flex flex-col items-center justify-center h-full"
    >
      <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 mb-3 font-medium min-w-[80%] flex flex-col items-center">
        <div v-show="isProgrammerMode">
          <p class="text-gray-500 dark:text-gray-400">
            History feature coming soon
          </p>
          <p class="text-gray-400 dark:text-gray-500 text-xs">
            History is currently unavailable for Programmer Mode
          </p>
        </div>

        <div v-show="!isProgrammerMode">
          <p class="text-gray-500 dark:text-gray-400 font-medium">
            No history items yet
          </p>
          <p class="text-gray-400 dark:text-gray-500 text-xs">
            Your calculations will appear here as you work
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent } from "vue";
import { useHistory } from "@/composables/useHistory";
import { useAnimation } from "@/composables/useAnimation.ts";
import { useToast } from "@/composables/useToast";
import { useClipboard } from "@vueuse/core";

// Props
const props = defineProps({
  mode: { type: String, default: "Standard" },
  isMobile: { type: Boolean, default: false },
});

const emit = defineEmits(["select-item", "history-close"]);

const HistoryItem = defineAsyncComponent(() => import("@/components/ui/HistoryItem.vue"));

// Composables
const { historyItems, deleteItem } = useHistory();
const { toast } = useToast();
const { copy } = useClipboard();
const { createListAnimation } = useAnimation();

// Create history animation with custom options
const historyAnimation = createListAnimation({
  initialDelay: 50,
  initialDuration: 400,
  enterTransform: [-20, 0],
  leaveTransform: [0, 80],
  leaveAxis: 'x',
  moveDuration: 300,
  moveEasing: 'easeOutQuad',
  moveDelay: 150
});

// Local state 
const selectedItemId = ref(null);

// Computed properties
const isProgrammerMode = computed(() => props.mode === "Programmer");

// Handle history item selection
const handleSelectItem = (item) => {
  if (isProgrammerMode.value) return;

  selectedItemId.value = item.id;
  setTimeout(() => {
    selectedItemId.value = null;
  }, 300);

  emit("select-item", {
    expression: item.expression.trim(),
    result: item.result,
  });

  if (props.isMobile) emit('history-close');
};

const handleDelete = async (id) => {
  await deleteItem(id);
};

const copyItem = (item) => {
  copy(`${item.expression} = ${item.result}`);
  toast({
    title: "Copied to clipboard",
    description: "The calculation has been copied to your clipboard",
  });
};

const copyAsJson = (item) => {
  copy(
    JSON.stringify(
      {
        expression: item.expression,
        result: item.result,
        timestamp: item.timestamp,
      },
      null,
      2,
    ),
  );
  toast({
    title: "Copied as JSON",
    description: "The calculation has been copied in JSON format",
  });
};
</script>

<style scoped>
.history-list-move {
  transition: transform 0.3s cubic-bezier(0.2, 1, 0.2, 1);
}
</style>
