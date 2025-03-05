<template>
  <div class="relative" :class="[isMobile ? '' : 'w-[320px] flex-shrink-0']">
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

        <div class="flex-1 overflow-y-auto overflow-x-hidden p-3 scrollbar-thin">
    <TransitionGroup 
      v-if="!isProgrammerMode && historyItems.length > 0" 
      tag="div" 
      name="list" 
      class="space-y-2"
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
    
    <div v-else-if="isProgrammerMode" class="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
      <p>History is disabled in <kbd>Programmer Mode</kbd></p>
    </div>
    
    <div v-else class="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
      <p>There's no history yet</p>
    </div>
  </div>
        
        <div v-if="showClearButton" class="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-700">
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
        <Button
          variant="destructive"
          @click="handleClear"
        >
          Clear All
        </Button>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { TrashIcon, XIcon } from "lucide-vue-next";
import Button from "@/components/base/BaseButton.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import { useHistory } from "@/composables/useHistory";
import { useToast } from "@/composables/useToast";
import { useClipboard } from "@vueuse/core";
import HistoryItem from './HistoryItem.vue';

const props = defineProps({
  isOpen: Boolean,
  isMobile: Boolean,
  mode: { type: String, default: "Standard" },
});

const emit = defineEmits(['close', 'select-item']);

// Internal state management
const { historyItems, deleteItem, clearAll, loadHistory } = useHistory();
const selectedItemId = ref(null);
const showClearConfirmation = ref(false);

const isProgrammerMode = computed(() => props.mode === "Programmer");
const showClearButton = computed(() => historyItems.value.length > 0 && !isProgrammerMode.value);

// Load history initially and when mobile panel opens
onMounted(() => {
  if (!props.isMobile || props.isOpen) {
    loadHistory();
  }
});

// Unified watcher for all history loading conditions
watch(
  [() => props.isOpen, () => props.mode, () => props.isMobile],
  ([isOpen, mode, isMobile]) => {
    const isProgrammerMode = mode === "Programmer";
    const shouldLoad = !isMobile || (isMobile && isOpen);

    if (shouldLoad && !isProgrammerMode) {
      loadHistory();
    }
  },
  { immediate: true }
);

watch(() => historyItems.value, () => {
  // Always load history for desktop, not just when items change
  if (!props.isMobile) {
    loadHistory();
  }
}, { deep: true });

const { copy } = useClipboard();
const { toast } = useToast();

// Panel methods
const handleSelectItem = (item) => {
  if (props.mode === "Programmer") return;
  
  selectedItemId.value = item.id;
  setTimeout(() => {
    selectedItemId.value = null;
  }, 300);
  
  emit('select-item', {
    expression: item.expression.trim(),
    result: item.result
  });

  if (props.isMobile) {
    emit('close');
  }
};

const handleDelete = async (id) => {
  await deleteItem(id);
};

const handleClear = async () => {
  await clearAll();
  showClearConfirmation.value = false;
  toast({
    title: "History cleared",
    description: "All history items have been removed"
  });
};

const copyItem = (item) => {
  copy(`${item.expression} = ${item.result}`);
  toast({
    title: "Copied to clipboard",
    description: "The calculation has been copied to your clipboard"
  });
};

const copyAsJson = (item) => {
  copy(JSON.stringify({
    expression: item.expression,
    result: item.result,
    timestamp: item.timestamp
  }, null, 2));
  toast({
    title: "Copied as JSON",
    description: "The calculation has been copied in JSON format"
  });
};
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: 
    opacity 0.3s ease, 
    transform 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.list-move {
  transition: transform 0.3s ease;
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