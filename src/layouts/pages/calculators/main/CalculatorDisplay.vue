<template>
  <div
    class="p-4 rounded-lg mb-4 transition-all duration-300 relative h-32 flex items-center"
    :class="[
      error
        ? 'bg-destructive/10 dark:bg-destructive/20'
        : 'transition-colors duration-300 bg-gray-100 dark:bg-gray-700',
    ]"
  >
    <ChevronScroll
      :show-left-chevron="showLeftChevron"
      :show-right-chevron="showRightChevron"
      :active-chevron="activeChevron"
      @scroll-to-previous="scrollToPrevious"
      @scroll-to-next="scrollToNext"
    />

    <ControlButtons
      :copy-options="copyOptions"
      @toggle-history="$emit('toggle-history')"
      @copy-to-clipboard="copyToClipboard"
    />

    <MainDisplay
      ref="mainDisplay"
      :input="input"
      :preview="preview"
      :error="error"
      :is-animating="isAnimating"
      :animated-result="animatedResult"
      :active-base="activeBase"
      :mode="mode"
      :settings="settings"
      @scroll-update="handleScrollUpdate"
    />

    <FeatureToast />
  </div>
</template>

<script setup>
import ChevronScroll from "@/components/ui/ChevronScroll.vue";
import ControlButtons from "@/components/ui/ControlButtons.vue";
import MainDisplay from "@/components/ui/MainDisplay.vue";
import { computed, nextTick, ref, watch } from "vue";
import { useToast } from "@/composables/useToast";
import { useSettingsStore } from "@/stores/settings";
import FeatureToast from "@/components/base/FeatureToast.vue";
import { useClipboard, useEventListener, useDebounceFn } from "@vueuse/core";

const props = defineProps({
  input: { type: String, default: "" },
  preview: { type: String, default: "" },
  error: { type: String, default: "" },
  isAnimating: { type: Boolean, default: false },
  animatedResult: { type: String, default: "" },
  activeBase: { type: String, default: "DEC" },
  mode: { type: String, default: "Standard" },
});

defineEmits(["toggle-history"]);
const { toast } = useToast();
const settings = useSettingsStore();

const mainDisplay = ref(null);
const showLeftChevron = ref(false);
const showRightChevron = ref(false);
const activeChevron = ref(null);

const handleScrollUpdate = useDebounceFn(({ canScrollLeft, canScrollRight }) => {
  showLeftChevron.value = canScrollLeft;
  showRightChevron.value = canScrollRight;
}, 100);

useEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' && showLeftChevron.value) {
    activeChevron.value = 'left';
    mainDisplay.value?.scrollToPrevious();
  }
  if (e.key === 'ArrowRight' && showRightChevron.value) {
    activeChevron.value = 'right';
    mainDisplay.value?.scrollToNext();
  }
});

useEventListener('keyup', () => {
  activeChevron.value = null;
});

function scrollToPrevious() {
  mainDisplay.value?.scrollToPrevious();
}

function scrollToNext() {
  mainDisplay.value?.scrollToNext();
}

watch(
  () => props.input,
  () => {
    nextTick(() => {
      mainDisplay.value?.scrollToEnd();
    });
  }
);

const copyContent = computed(() => {
  if (props.animatedResult) {
    return `${props.input} = ${props.animatedResult}`;
  }
  return props.input;
});

const copyOptions = computed(() => ({
  content: "Copy to Clipboard",
}));

const { copy } = useClipboard({ legacy: true });

function copyToClipboard() {
  copy(copyContent.value);
  toast({
    title: "Copied!",
    description: "Content copied to clipboard.",
  });
}
</script>

<style scoped>
.main-display {
  mask-image: linear-gradient(to left, transparent, black 20px);
  -webkit-mask-image: linear-gradient(to left, transparent, black 20px);
  max-width: 100%;
}

.main-display[data-base="BIN"] {
  font-size: 1.5rem;
  letter-spacing: -0.5px;
}
</style>
