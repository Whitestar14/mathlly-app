<template>
  <BasePanel 
    title="History"
    id="history-panel"
    type="drawer"
    position="left"
    :max-height-ratio="0.8" 
    :snap-threshold="0.4"
    :draggable="true"
    :default-desktop-state="false"
  >
    <!-- Content -->
    <div class="flex-1 overflow-hidden relative">
      <!-- Scrollable Content Area -->
      <ScrollAreaRoot class="h-full w-full">
        <ScrollAreaViewport class="h-full w-full p-3">
          <!-- History Items List -->
          <TransitionGroup v-if="!isProgrammerMode && historyItems.length > 0" tag="div" class="space-y-2"
            name="history-list" @before-enter="historyAnimation.onBeforeEnter" @enter="historyAnimation.onEnter" @leave="historyAnimation.onLeave">
            <history-item v-for="(item, index) in historyItems" :key="item.id" :item="item" :is-mobile="isMobile"
              :selected-id="selectedItemId" :data-index="index" @select="handleSelectItem" @delete="handleDelete"
              @copy="copyItem" @copy-json="copyAsJson" />
          </TransitionGroup>

          <!-- Empty State -->
          <div v-show="!historyItems.length || isProgrammerMode"
            class="text-center text-sm py-4 flex flex-col items-center justify-center h-full">
            <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/30 mb-3 min-w-[80%]">
              <div v-show="isProgrammerMode">
                <p class="flex justify-center items-center flex-col gap-1 text-gray-500 dark:text-gray-400">
                  History is disabled in <kbd>Programmer Mode</kbd>
                </p>
              </div>
              <div v-show="!isProgrammerMode">
                <p class="text-gray-500 dark:text-gray-400">
                  No history items yet
                </p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Your calculations will appear here
                </p>
              </div>
            </div>
          </div>
        </ScrollAreaViewport>

        <!-- Scrollbar -->
        <ScrollAreaScrollbar
          class="flex select-none touch-none p-0.5 bg-gray-100/50 dark:bg-gray-800/50 transition-colors duration-150 ease-out hover:bg-gray-200/50 dark:hover:bg-gray-700/50 data-[orientation=vertical]:w-2 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2"
          orientation="vertical">
          <ScrollAreaThumb
            class="flex-1 bg-gray-300 dark:bg-gray-600 rounded-full relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
        </ScrollAreaScrollbar>
      </ScrollAreaRoot>
    </div>

    <!-- Footer -->
    <template #footer>
      <div v-if="showClearButton" class="flex justify-end">
        <Button v-if="!isMobile" v-tippy="{ content: 'Clear History' }" variant="ghost" size="icon"
          class="text-red-400 hover:text-red-500 hover:bg-red-300/30 dark:hover:text-red-400"
          @click="showClearConfirmation = true">
          <TrashIcon class="w-4 h-4" />
        </Button>
        <Button v-else variant="destructive" class="w-full" @click="showClearConfirmation = true">
          <TrashIcon class="w-4 h-4 mr-2" />
          Clear History
        </Button>
      </div>
    </template>
  </BasePanel>
  
  <!-- Clear confirmation modal -->
  <BaseModal :open="showClearConfirmation" description="confirmation-dialog"
    @update:open="showClearConfirmation = $event">
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
      <Button variant="outline" class="dark:text-gray-300 transition-colors" @click="showClearConfirmation = false">
        Cancel
      </Button>
      <Button variant="destructive" @click="handleClear">
        Clear All
      </Button>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch, defineAsyncComponent } from "vue"
import { TrashIcon, AlertTriangleIcon } from "lucide-vue-next"
import anime from 'animejs/lib/anime.min.js';
import Button from "@/components/base/BaseButton.vue"
import BaseModal from "@/components/base/BaseModal.vue"
import BasePanel from "@/components/base/BasePanel.vue"
import { useHistory } from "@/composables/useHistory"
import { useAnimation } from "@/composables/useAnimation"
import { useToast } from "@/composables/useToast"
import { useClipboard } from "@vueuse/core"
import { ScrollAreaRoot, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport } from "radix-vue"

// Props and emits
const props = defineProps({
  mode: { type: String, default: "Standard" },
  isMobile: { type: Boolean, default: false},
  isOpen: { type: Boolean, default: false },
})

const emit = defineEmits(["select-item", "history-close"])

const HistoryItem = defineAsyncComponent(() => import("@/components/ui/HistoryItem.vue"))

// Composables
const { historyItems, deleteItem, clearAll, loadHistory } = useHistory()
const { toast } = useToast()
const { copy } = useClipboard()
const { setInitialAnimation, createListAnimation } = useAnimation()

// Create history animation with custom options
const historyAnimation = createListAnimation({
  initialDelay: 50,
  initialDuration: 400,
  enterTransform: [-20, 0],
  leaveTransform: [0, 80],
  leaveAxis: 'x',
  moveDuration: 300,
  moveEasing: 'easeOutQuad'
})

// Local state 
const selectedItemId = ref(null)
const showClearConfirmation = ref(false)

// Computed properties
const isProgrammerMode = computed(() => props.mode === "Programmer")
const showClearButton = computed(() => historyItems.value.length > 0 && !isProgrammerMode.value)

// Watch for panel open/close
watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen && !isProgrammerMode.value) {
      // Reset animation state when panel opens
      setInitialAnimation(true)
      await loadHistory()
      setTimeout(() => setInitialAnimation(false), 500)
    }
  },
  { immediate: true },
)

// Watch for mode changes
watch(
  () => props.mode,
  () => {
    if (!isProgrammerMode.value && props.isOpen) {
      loadHistory()
    }
  },
)

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

  // Close the panel
  emit('history-close');
};

// Handle item deletion
const handleDelete = async (id) => {
  await deleteItem(id)
}

// Handle clearing all history
const handleClear = async () => {
  await clearAll()
  showClearConfirmation.value = false
  toast({
    title: "History cleared",
    description: "All history items have been removed",
  })
}

// Copy item functionality
const copyItem = (item) => {
  copy(`${item.expression} = ${item.result}`)
  toast({
    title: "Copied to clipboard",
    description: "The calculation has been copied to your clipboard",
  })
}

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
  )
  toast({
    title: "Copied as JSON",
    description: "The calculation has been copied in JSON format",
  })
}
</script>

<style scoped>
.history-list-move {
  transition: transform 0.3s cubic-bezier(0.2, 1, 0.2, 1);
}
</style>
