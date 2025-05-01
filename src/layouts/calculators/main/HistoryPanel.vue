<template>
  <BasePanel
    :is-open="isOpen"
    :is-mobile="isMobile"
    title="History"
    position-side="left"
    :show-close-button="false"
    @update:is-open="toggleHistory"
  >
    <!-- Content -->
    <div class="flex-1 overflow-hidden">
      <ScrollAreaRoot class="h-full w-full">
        <ScrollAreaViewport class="h-full w-full p-3">
          <TransitionGroup
            v-if="!isProgrammerMode && historyItems.length > 0"
            tag="div"
            :css="false"
            class="space-y-2"
            @before-enter="onBeforeEnter"
            @enter="onEnter"
            @leave="onLeave"
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
            class="text-center text-sm py-4 flex flex-col items-center justify-center h-full"
          >
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
    <!-- Footer -->
    <template #footer>
      <div
        v-if="showClearButton"
        class="flex justify-end"
      >
        <Button
          v-if="!isMobile" 
          v-tippy="{ content: 'Clear History' }" 
          variant="ghost" 
          size="icon"
          class="text-red-400 hover:text-red-500 hover:bg-red-300/30 dark:hover:text-red-400"
          @click="showClearConfirmation = true"
        >
          <TrashIcon class="w-4 h-4" />
        </Button>
        <Button
          v-else 
          variant="destructive" 
          class="w-full" 
          @click="showClearConfirmation = true"
        >
          <TrashIcon class="w-4 h-4 mr-2" />
          Clear History
        </Button>
      </div>
    </template>
    
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
        <Button
          variant="destructive"
          @click="handleClear"
        >
          Clear All
        </Button>
      </div>
    </BaseModal>
  </BasePanel>
</template>

<script setup>
import { ref, computed, watch, onMounted, defineAsyncComponent } from "vue"
import {
  TrashIcon,
  AlertTriangleIcon,
} from "lucide-vue-next"
import Button from "@/components/base/BaseButton.vue"
import BaseModal from "@/components/base/BaseModal.vue"
import BasePanel from "@/components/base/BasePanel.vue"
import { useHistory } from "@/composables/useHistory"
import { useToast } from "@/composables/useToast"
import { useClipboard } from "@vueuse/core"
import {
  ScrollAreaRoot,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "radix-vue"

import anime from "animejs/lib/anime.min.js"

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  isMobile: { type: Boolean, default: false },
  mode: { type: String, default: "Standard" },
})

const emit = defineEmits([
  "select-item",
  "update:isOpen",
])

const HistoryItem = defineAsyncComponent(() =>
  import("@/components/ui/HistoryItem.vue")
)

const { historyItems, deleteItem, clearAll, loadHistory } = useHistory()
const selectedItemId = ref(null)
const showClearConfirmation = ref(false)
const isProgrammerMode = computed(() => props.mode === "Programmer")
const showClearButton = computed(
  () => historyItems.value.length > 0 && !isProgrammerMode.value
)

const { toast } = useToast()
const { copy } = useClipboard()

const toggleHistory = () => emit("update:isOpen")

// Lifecycle hooks
onMounted(() => {
  if (!props.isMobile || props.isOpen) {
    loadHistory()
  }
})

// Watchers for panel open/close
watch(
  [() => props.isOpen, () => props.isMobile],
  ([isOpen, isMobile]) => {
    if (!isProgrammerMode.value && (!isMobile || isOpen)) {
      loadHistory()
    }
  },
  { immediate: true }
)

// Panel methods
const handleSelectItem = (item) => {
  if (props.mode === "Programmer") return

  selectedItemId.value = item.id
  setTimeout(() => {
    selectedItemId.value = null
  }, 300)

  emit("select-item", {
    expression: item.expression.trim(),
    result: item.result,
  })

  if (props.isMobile) {
    close()
  }
}

const handleDelete = async (id) => {
  await deleteItem(id)
}

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
      2
    )
  )
  toast({
    title: "Copied as JSON",
    description: "The calculation has been copied in JSON format",
  })
}

// Transition handlers
const onBeforeEnter = (el) => {
  el.style.opacity = 0
}

const onEnter = (el, done) => {
  anime({
    targets: el,
    opacity: [0, 1],
    duration: 400,
    delay: el.dataset.index * 30,
    easing: "easeOutQuad",
    complete: done,
  })
}

const onLeave = (el, done) => {
  anime({
    targets: el,
    opacity: 0,
    translateX: 60,
    duration: 300,
    easing: "easeOutExpo",
    complete: done,
  })
}
</script>

<style scoped>
:deep(.radix-scroll-area-root) {
  --scrollbar-size: 10px;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

:deep(.radix-scroll-area-viewport) {
  width: 100%;
  height: 100%;
  border-radius: inherit;
}

:deep(.radix-scroll-area-viewport-inner) {
  display: block;
  min-width: 100%;
  min-height: 100%;
}
</style>