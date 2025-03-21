<template>
  <div class="flex flex-col flex-none" :class="mode === 'Programmer' ? 'h-[40%]' : 'h-1/4'">
    <div class="p-4 rounded-lg mb-2 transition-all duration-300 flex-1 relative flex items-end" :class="[
      error
        ? 'bg-destructive/10 dark:bg-destructive/20'
        : 'transition-colors duration-300 bg-gray-100 dark:bg-gray-700',
    ]">

      <ChevronScroll :show-left-chevron="showLeftChevron" :show-right-chevron="showRightChevron"
        @scroll-to-previous="scrollToPrevious" @scroll-to-next="scrollToNext" />

      <ControlButtons :copy-options="copyOptions" @toggle-history="$emit('toggle-history')"
        @copy-to-clipboard="copyToClipboard" />

      <MainDisplay ref="mainDisplay" :input="input" :preview="preview" :error="error" :is-animating="isAnimating"
        :animated-result="animatedResult" :active-base="activeBase" :mode="mode" @scroll-update="handleScrollUpdate" />

    </div>
    <div class="flex-initial">
      <BaseDisplay v-show="mode === 'Programmer'" :display-values="displayValues" :active-base="activeBase"
      @base-change="$emit('base-change', $event)" />
    </div>
    <FeatureToast />
  </div>
</template>

<script setup>
import ChevronScroll from "@/components/ui/ChevronScroll.vue"
import ControlButtons from "@/components/ui/ControlButtons.vue"
import MainDisplay from "@/components/ui/MainDisplay.vue"
import FeatureToast from "@/components/base/FeatureToast.vue"
import BaseDisplay from "@/components/ui/BaseDisplay.vue"
import { computed, nextTick, ref, watch } from "vue"
import { useToast } from "@/composables/useToast"
import { useClipboard, useEventListener, useDebounceFn } from "@vueuse/core"

const props = defineProps({
  input: { type: String, default: "" },
  preview: { type: String, default: "" },
  error: { type: String, default: "" },
  isAnimating: { type: Boolean, default: false },
  animatedResult: { type: String, default: "" },
  activeBase: { type: String, default: "DEC" },
  mode: { type: String, default: "Standard" },
  displayValues: { type: Object, default: () => ({}) },
})

defineEmits(["toggle-history", "base-change"])
const { toast } = useToast()

const mainDisplay = ref(null)
const showLeftChevron = ref(false)
const showRightChevron = ref(false)

const handleScrollUpdate = useDebounceFn(({ canScrollLeft, canScrollRight }) => {
  showLeftChevron.value = canScrollLeft
  showRightChevron.value = canScrollRight
}, 100)

useEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' && showLeftChevron.value) {
    scrollToPrevious()
  }
  if (e.key === 'ArrowRight' && showRightChevron.value) {
    scrollToNext()
  }
})

function scrollToPrevious() {
  mainDisplay.value?.scrollToPrevious()
}

function scrollToNext() {
  mainDisplay.value?.scrollToNext()
}

watch(
  () => props.input,
  () => {
    nextTick(() => {
      mainDisplay.value?.scrollToEnd()
    })
  }
)

const copyContent = computed(() => {
  if (props.animatedResult) {
    return `${props.input} = ${props.animatedResult}`
  }
  return props.input
})

const copyOptions = computed(() => ({
  content: "Copy to Clipboard",
}))

const { copy } = useClipboard({ legacy: true })

function copyToClipboard() {
  copy(copyContent.value)
  toast({
    title: "Copied!",
    description: "Content copied to clipboard.",
  })
}
</script>