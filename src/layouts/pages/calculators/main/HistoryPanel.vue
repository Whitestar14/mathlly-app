<template>
  <Transition name="panel">
    <div
      class="relative transition-all duration-300"
      :class="[isMobile ? '' : [isOpen ? 'min-w-72 max-w-96 w-1/4' : 'w-10']]"
    >
      <!-- Backdrop for mobile -->
      <Transition name="fade">
        <div
          v-if="isMobile && isOpen"
          class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          aria-hidden="true"
          @click="close"
        />
      </Transition>

      <!-- Panel -->
      <div
        :class="[
          'bg-white dark:bg-gray-800 transition-all duration-300',
          isMobile
            ? [
                'fixed inset-x-0 bottom-0 z-50 rounded-t-lg shadow-lg',
                'max-h-[80vh] h-[600px]',
                isOpen ? 'translate-y-0' : 'translate-y-full',
              ]
            : [
                'absolute inset-y-0 right-0 border-l border-gray-200 dark:border-gray-700',
                'w-full overflow-hidden',
                !isOpen && 'pointer-events-none',
              ],
        ]"
      >
        <div
          class="flex flex-col h-full"
          :class="{ 'opacity-0': !isOpen && !isMobile, 'transform transition-opacity duration-300': true }"
        >
          <!-- Header -->
          <div
            class="flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-700"
          >
            <div class="flex justify-between items-center">
            <h2 class="text-base font-semibold text-gray-800 dark:text-gray-200">
                  History
                </h2>
                <Button
                  v-if="isMobile"
                  variant="ghost"
                  size="icon"
                  @click="close"
                >
                  <XIcon class="h-4 w-4" />
                </Button>
            </div>
          </div>

          <!-- Content -->
          <div 
            class="flex-1 p-3 overflow-hidden flex flex-col h-[calc(100%-4rem)]"
          >            
            <ScrollAreaRoot class="h-full w-full overflow-hidden">
              <ScrollAreaViewport class="h-full w-full rounded">
                <TransitionGroup
                  v-if="!isProgrammerMode && historyItems.length > 0"
                  tag="div"
                  name="list"
                  class="space-y-2"
                >
                  <history-item
                    v-for="item in historyItems"
                    :key="item.id"
                    class="history-item"
                    :item="item"
                    :is-mobile="isMobile"
                    :selected-id="selectedItemId"
                    @select="handleSelectItem"
                    @delete="handleDelete"
                    @copy="copyItem"
                    @copy-json="copyAsJson"
                  />
                </TransitionGroup>

                <div
                  v-if="(!historyItems.length || isProgrammerMode) && !isLoading"
                  class="text-center text-sm py-4 flex flex-col items-center justify-center h-full"
                >
                  <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30 mb-3">
                    <p v-if="isProgrammerMode" class="text-gray-500 dark:text-gray-400">
                      History is disabled in <kbd class="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded text-xs">Programmer Mode</kbd>
                    </p>
                    <p v-else class="text-gray-500 dark:text-gray-400">No history items yet</p>
                    <p v-if="!isProgrammerMode" class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Your calculations will appear here
                    </p>
                  </div>
                </div>
              </ScrollAreaViewport>
              
              <ScrollAreaScrollbar 
                class="flex select-none touch-none p-0.5 bg-gray-100/50 dark:bg-gray-800/50 transition-colors duration-150 ease-out hover:bg-gray-200/50 dark:hover:bg-gray-700/50 data-[orientation=vertical]:w-2 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2" 
                orientation="vertical"
              >
                <ScrollAreaThumb 
                  class="flex-1 bg-gray-300 dark:bg-gray-600 rounded-full relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" 
                />
              </ScrollAreaScrollbar>
            </ScrollAreaRoot>
          </div>

          <div
            v-if="showClearButton"
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

        <!-- Toggle button (desktop only) -->
        <button
          v-if="!isMobile"
          class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1.5 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 group absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all pointer-events-auto"
          :class="[ !isOpen && 'left-1/2 bottom-0']"
          @click="toggle"
          v-tippy="{ content: isOpen ? 'Hide History' : 'Show History' }"
        >
          <ChevronRightIcon
            class="h-4 w-4 text-indigo-500 dark:text-indigo-400 transition-transform duration-300"
            :class="{ 'rotate-180': isOpen }"
          />
        </button>

      <!-- Clear confirmation modal -->
      <BaseModal
        :open="showClearConfirmation"
        description="confirmation-dialog"
        @update:open="showClearConfirmation = $event"
      >
        <template #title> 
          <div class="flex items-center">
            <AlertTriangleIcon class="h-5 w-5 text-red-500 dark:text-gray-300 mr-2" />
            Clear History
          </div>
        </template>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Are you sure you want to clear all history items? This action cannot
          be undone.
        </p>
        <div class="flex justify-end space-x-2">
          <Button
            variant="outline"
            class="dark:text-gray-300 transition-colors"
            @click="showClearConfirmation = false"
          >
            Cancel
          </Button>
          <Button variant="destructive" @click="handleClear">
              Clear All
          </Button>
        </div>
      </BaseModal>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, defineAsyncComponent } from "vue";
import { 
  TrashIcon, 
  XIcon, 
  ChevronRightIcon,
  AlertTriangleIcon 
} from "lucide-vue-next"
import Button from "@/components/base/BaseButton.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import { useHistory } from "@/composables/useHistory";
import { useToast } from "@/composables/useToast";
import { useClipboard } from "@vueuse/core";
import { ScrollAreaRoot, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport } from "radix-vue";
import { usePanel } from "@/composables/useSidebar";

const HistoryItem = defineAsyncComponent(() => import('@/components/ui/HistoryItem.vue'));

const props = defineProps({
  isMobile: Boolean,
  mode: { type: String, default: "Standard" },
});

const emit = defineEmits(["select-item"]);

// Use panel composable
const { isOpen, toggle, close } = usePanel('history-panel', props.isMobile);

const { historyItems, deleteItem, clearAll, loadHistory } = useHistory();
const selectedItemId = ref(null);
const showClearConfirmation = ref(false);

const isProgrammerMode = computed(() => props.mode === "Programmer");
const showClearButton = computed(
  () => historyItems.value.length > 0 && !isProgrammerMode.value
);

// Load history on mount and panel open
onMounted(() => {
  if (!props.isMobile || isOpen.value) {
    loadHistory();
  }
});

// Watch for panel open/close
watch(
  [() => isOpen.value, () => props.mode, () => props.isMobile],
  ([isOpen, isMobile]) => {
    if (!isProgrammerMode.value && (!isMobile || isOpen)) {
      loadHistory();
    }
  },
  { immediate: true }
);

const { copy } = useClipboard();
const { toast } = useToast();

// Panel methods
const handleSelectItem = (item) => {
  if (props.mode === "Programmer") return;

  selectedItemId.value = item.id;
  setTimeout(() => {
    selectedItemId.value = null;
  }, 300);

  emit("select-item", {
    expression: item.expression.trim(),
    result: item.result,
  });

  if (props.isMobile) {
    close();
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
    description: "All history items have been removed",
  });
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
      2
    )
  );
  toast({
    title: "Copied as JSON",
    description: "The calculation has been copied in JSON format",
  });
};
</script>

<style scoped>
.panel-enter-active,
.panel-leave-active {
  transition: all 0.3s ease-in-out;
}

.panel-enter-from,
.panel-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Only keep these transitions for updates/deletes */
.list-move {
  transition: transform 0.3s ease;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
