<template>
  <div class="history-panel-container" :class="{ 'mobile': isMobile }">
    <!-- Backdrop for mobile -->
    <Transition name="fade">
      <div v-if="isMobile && isOpen" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" aria-hidden="true"
        @click="close" />
    </Transition>

    <!-- Desktop Panel -->
    <div v-if="!isMobile" class="desktop-panel"
      :class="[
        'transition-all duration-300 ease-in-out border-l border-gray-200 dark:border-gray-700',
        isOpen ? 'w-[18.5rem] max-w-xs' : 'w-10'
      ]">
      <div class="panel-content"
        :class="[
          'absolute inset-y-0 right-0 bg-white dark:bg-gray-800 transition-opacity duration-300 flex flex-col h-full',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        ]">
        <!-- Header -->
        <div class="flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-700">
          <div class="flex justify-between items-center">
            <h2 class="text-base font-medium text-gray-800 dark:text-gray-200">
              History
            </h2>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-hidden flex flex-col">
          <ScrollAreaRoot class="h-full w-full">
            <ScrollAreaViewport class="h-full w-full p-3">
              <TransitionGroup v-if="!isProgrammerMode && historyItems.length > 0" tag="div" :css="false"
                @before-enter="onBeforeEnter" @enter="onEnter" @leave="onLeave" class="space-y-2">
                <history-item v-for="(item, index) in historyItems" :key="item.id" :item="item" :is-mobile="isMobile"
                  :selected-id="selectedItemId" :data-index="index" @select="handleSelectItem" @delete="handleDelete"
                  @copy="copyItem" @copy-json="copyAsJson" />
              </TransitionGroup>

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

            <ScrollAreaScrollbar
              class="flex select-none touch-none p-0.5 bg-gray-100/50 dark:bg-gray-800/50 transition-colors duration-150 ease-out hover:bg-gray-200/50 dark:hover:bg-gray-700/50 data-[orientation=vertical]:w-2 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2"
              orientation="vertical">
              <ScrollAreaThumb
                class="flex-1 bg-gray-300 dark:bg-gray-600 rounded-full relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
            </ScrollAreaScrollbar>
          </ScrollAreaRoot>
        </div>

        <div v-if="showClearButton" class="flex-shrink-0 flex items-center justify-end p-3 border-t border-gray-200 dark:border-gray-700">
          <Button v-tippy="{ content: 'Clear History' }" variant="ghost" size="icon"
            class="text-red-400 hover:text-red-500 hover:bg-red-300/30 dark:hover:text-red-400"
            @click="showClearConfirmation = true">
            <TrashIcon class="w-4 h-4" />
          </Button>
        </div>
      </div>

       <!-- Toggle button (desktop only) -->
       <Button v-show="!isMobile" v-tippy="{ content: isOpen ? 'Hide History' : 'Show History', placement: 'left' }" variant="outline"
        size="icon" :class="[
          'shadow-sm absolute left-0 bottom-0 -translate-y-1/3 pointer-events-auto',
          !isOpen ? '-translate-x-1/2 left-1/2' : 'translate-x-1/4',
        ]" @click="toggle">
        <ChevronRightIcon class="h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-300"
          :class="{ 'rotate-180': isOpen }" />
      </Button>
    </div>

    <!-- Mobile Panel -->
    <Transition name="slide-up">
      <div v-if="isMobile && isOpen" 
        class="fixed inset-x-0 bottom-0 z-50 rounded-t-xl shadow-lg bg-white dark:bg-gray-800 max-h-[80vh] h-[600px] flex flex-col">
        <div class="flex flex-col h-full">
          <!-- Header -->
          <div class="flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-700">
            <div class="flex justify-between items-center">
              <h2 class="text-base font-medium text-gray-800 dark:text-gray-200">
                History
              </h2>
              <Button variant="ghost" size="icon" @click="close">
                <XIcon class="h-4 w-4" />
              </Button>
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-hidden">
            <ScrollAreaRoot class="h-full w-full">
              <ScrollAreaViewport class="h-full w-full p-3">
                <TransitionGroup v-if="!isProgrammerMode && historyItems.length > 0" tag="div" :css="false"
                  @before-enter="onBeforeEnter" @enter="onEnter" @leave="onLeave" class="space-y-2">
                  <history-item v-for="(item, index) in historyItems" :key="item.id" :item="item" :is-mobile="isMobile"
                    :selected-id="selectedItemId" :data-index="index" @select="handleSelectItem" @delete="handleDelete"
                    @copy="copyItem" @copy-json="copyAsJson" />
                </TransitionGroup>

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

              <ScrollAreaScrollbar
                class="flex select-none touch-none p-0.5 bg-gray-100/50 dark:bg-gray-800/50 transition-colors duration-150 ease-out hover:bg-gray-200/50 dark:hover:bg-gray-700/50 data-[orientation=vertical]:w-2 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2"
                orientation="vertical">
                <ScrollAreaThumb
                  class="flex-1 bg-gray-300 dark:bg-gray-600 rounded-full relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
              </ScrollAreaScrollbar>
            </ScrollAreaRoot>
          </div>

          <div v-if="showClearButton" class="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-700">
            <Button variant="destructive" class="w-full py-2" @click="showClearConfirmation = true">
              <TrashIcon class="w-4 h-4 mr-2" />
              Clear History
            </Button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
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
import { ref, computed, watch, onMounted, defineAsyncComponent } from "vue"
import {
  TrashIcon,
  XIcon,
  ChevronRightIcon,
  AlertTriangleIcon,
} from "lucide-vue-next"
import Button from "@/components/base/BaseButton.vue"
import BaseModal from "@/components/base/BaseModal.vue"
import { useHistory } from "@/composables/useHistory"
import { useToast } from "@/composables/useToast"
import { useKeyboard } from "@/composables/useKeyboard"
import { useClipboard } from "@vueuse/core"
import {
  ScrollAreaRoot,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "radix-vue"

import anime from "animejs"
const HistoryItem = defineAsyncComponent(() =>
  import("@/components/ui/HistoryItem.vue")
)

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  isMobile: { type: Boolean, default: false },
  mode: { type: String, default: "Standard" },
})

const emit = defineEmits([
  "select-item",
  "toggle-history",
  "close-history",
  "update:isOpen",
])

const { historyItems, deleteItem, clearAll, loadHistory } = useHistory()
const selectedItemId = ref(null)
const showClearConfirmation = ref(false)
const isProgrammerMode = computed(() => props.mode === "Programmer")
const showClearButton = computed(
  () => historyItems.value.length > 0 && !isProgrammerMode.value
)

const { toast } = useToast()
const { copy } = useClipboard()

const toggle = () => emit("toggle-history")
const close = () => emit("close-history")

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

// useKeyboard composable
useKeyboard("global", {
  toggleHistory: toggle,
})


// Transition handlers
const onBeforeEnter = (el) => {
  el.style.opacity = 0
  el.style.transform = "translateY(0)" // Reset transform
}

const onEnter = (el, done) => {
  anime({
    targets: el,
    opacity: [0, 1],
    duration: 400,
    delay: el.dataset.index * 30, // Stagger effect
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
.history-panel-container {
  position: relative;
  z-index: 10;
  display: flex;
  flex: 0 1 auto;
  flex-direction: column;
  height: 100%;
}

.history-panel-container.mobile {
  display: contents;
}

.desktop-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.panel-content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Ensure ScrollAreaRoot properly contains its content */
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

/* Mobile panel animations */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

/* Fade animations for backdrop */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>