<template>
  <div
    class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4 transition-all duration-300 relative h-32 flex items-center"
  >
    <!-- Chevron scroll indicators -->
    <div class="left-0 bottom-0 w-full absolute z-10">
      <div class="flex w-full justify-between items-center">
        <div class="opacity-30 hover:opacity-100 p-2 cursor-pointer transition-colors">
          <div
            v-if="showLeftChevron"
            :class="{ 'bg-gray-200 dark:bg-gray-600': activeChevron === 'left' }"
            class="border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-md overflow-hidden h-9 w-9 p-1 inline-flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600"
            @click="scrollToPrevious"
          >
            <ChevronLeft
              size="24"
              class="text-gray-600 dark:text-gray-400"
            />
          </div>
        </div>

        <div class="opacity-30 hover:opacity-100 p-2 cursor-pointer transition-colors">
          <div
            v-if="showRightChevron"
            class="border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-md overflow-hidden h-9 w-9 p-1 inline-flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600"
            @click="scrollToNext"
          >
            <ChevronRight
              size="24"
              class="text-gray-600 dark:text-gray-400"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="flex items-center left-0 top-0 absolute z-40 opacity-30 transition-opacity hover:opacity-100 group">
      <div class="flex items-center m-2 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-md overflow-hidden">
        <button
          v-tippy="{ content: 'Open History Panel', placement: 'top' }"
          class="h-9 w-9 md:hidden p-1 inline-flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer group-hover:bg-opacity-100"
          @click="toggleHistory"
        >
          <HistoryIcon
            size="20"
            class="text-gray-600 dark:text-gray-400"
          />
        </button>
        <div class="h-6 bg-gray-200 dark:bg-gray-600 w-px md:hidden group-hover:opacity-0 transition-opacity" />
        <button
          v-tippy="copyOptions"
          class="h-9 w-9 p-1 inline-flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer group-hover:bg-opacity-100"
          @click="copyToClipboard"
        >
          <Copy
            size="20"
            class="text-gray-600 dark:text-gray-400"
          />
        </button>
      </div>
    </div>

    <!-- Display -->
    <div class="flex-grow h-full relative overflow-hidden">
      <div
        class="absolute w-full transition-all duration-500 ease-custom transform-gpu"
        :class="{
          '-translate-y-full opacity-0': isAnimating,
          'translate-y-0 opacity-100': !isAnimating,
        }"
      >
        <div
          ref="currentInput"
          :class="[
            'main-display text-right font-bold text-gray-900 dark:text-white mb-1 overflow-x-auto whitespace-nowrap scrollbar-hide',
            getFontSizeClass(input)
          ]"
          aria-live="polite"
          aria-atomic="true"
          @scroll="checkScroll"
          v-html="formattedInput"
        />
        <div
          v-if="preview && !error"
          class="text-right text-xl text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-nowrap scrollbar-hide"
          aria-live="polite"
          aria-atomic="true"
        >
          {{ formattedPreview }}
        </div>
        <div
          v-if="error"
          class="text-right text-xl text-red-500 overflow-x-auto whitespace-nowrap scrollbar-hide"
          aria-live="assertive"
          aria-atomic="true"
        >
          {{ error }}
        </div>
      </div>
      <div
        class="absolute w-full transition-all duration-500 ease-custom transform-gpu"
        :class="{
          'translate-y-0 opacity-100': isAnimating,
          'translate-y-full opacity-0': !isAnimating,
        }"
      >
        <div
          class="text-right text-3xl font-bold text-gray-900 dark:text-white mb-1 overflow-x-auto whitespace-nowrap scrollbar-hide"
          aria-live="polite"
          aria-atomic="true"
        >
          {{ animatedResult }}
        </div>
      </div>
    </div>
    <FeatureToast />
  </div>
</template>

<script setup>
import { ChevronLeft, ChevronRight, Copy, History as HistoryIcon } from "lucide-vue-next";
import { computed, nextTick, ref, watch } from "vue";
import { useToast } from "@/composables/useToast";
import { useSettingsStore } from "@/stores/settings";
import FeatureToast from "@/components/FeatureToast.vue";
import { useElementSize, useScroll, useClipboard, useEventListener } from "@vueuse/core";
import { DisplayFormatter } from '@/services/DisplayFormatter';

const props = defineProps({
  input: String,
  preview: String,
  error: String,
  isAnimating: Boolean,
  animatedResult: String,
  activeBase: String,
  mode: String,
});

const emit = defineEmits(["toggle-history"]);
const { toast } = useToast();
const settings = useSettingsStore();

// Scroll handling
const currentInput = ref(null);
const { width: containerWidth } = useElementSize(currentInput);
const { x: scrollLeft, arrivedState } = useScroll(currentInput);

const showLeftChevron = computed(() => scrollLeft.value > 1);
const showRightChevron = computed(() => !arrivedState.right);

const activeChevron = ref(null);

// Keyboard navigation
useEventListener(window, 'keydown', (e) => {
  if (e.key === 'ArrowLeft' && showLeftChevron.value) {
    activeChevron.value = 'left';
    scrollToPrevious();
  }
  if (e.key === 'ArrowRight' && showRightChevron.value) {
    activeChevron.value = 'right';
    scrollToNext();
  }
});

useEventListener(window, 'keyup', () => {
  activeChevron.value = null;
});

// Formatted display values
const formattedInput = computed(() => {
  if (!props.input) return "0";
  
  return DisplayFormatter.format(props.input, {
    base: props.activeBase,
    useThousandsSeparator: settings.useThousandsSeparator,
    mode: props.mode
  });
});

const formattedPreview = computed(() => {
  if (!props.preview) return "";
  
  return DisplayFormatter.format(props.preview, {
    base: props.activeBase,
    useThousandsSeparator: settings.useThousandsSeparator,
    mode: props.mode
  });
});

// Watch for input changes to scroll to end
watch(
  () => props.input,
  () => {
    nextTick(() => {
      if (currentInput.value) {
        scrollToEnd();
      }
    });
  }
);

// Copy functionality
const copyContent = computed(() => {
  if (props.animatedResult) {
    return `${props.input} = ${props.animatedResult}`;
  }
  return props.input;
});

const copyOptions = computed(() => ({
  content: "Copy to Clipboard",
  placement: "top",
}));

const { copy } = useClipboard();

function copyToClipboard() {
  copy(copyContent.value);
  toast({ 
    title: "Copied!", 
    description: "Content copied to clipboard." 
  });
}

// Scroll functions
function scrollToEnd() {
  if (currentInput.value) {
    currentInput.value.scrollLeft = currentInput.value.scrollWidth;
  }
}

function scrollToPrevious() {
  if (currentInput.value) {
    const newScrollLeft = Math.max(0, scrollLeft.value - containerWidth.value);
    currentInput.value.scrollTo({ left: newScrollLeft, behavior: "smooth" });
  }
}

function scrollToNext() {
  if (currentInput.value) {
    const newScrollLeft = Math.min(
      currentInput.value.scrollWidth - containerWidth.value,
      scrollLeft.value + containerWidth.value
    );
    currentInput.value.scrollTo({ left: newScrollLeft, behavior: "smooth" });
  }
}

function toggleHistory() {
  emit("toggle-history");
}

// Dynamic font sizing
const getFontSizeClass = (value) => {
  if (!value) return 'text-3xl';
  
  const length = value.toString().length;
  const mode = props.mode;

  if (mode === 'Standard' || mode === 'Basic') {
    if (length > 70) return 'text-xl';
    if (length > 50) return 'text-2xl';
    return 'text-3xl';
  }
  
  return props.activeBase === 'BIN' ? 'text-2xl' : 'text-3xl';
};
</script>

<style scoped>
@import url(@/assets/css/animation.css);

.main-display {
  mask-image: linear-gradient(to left, transparent, black 20px);
  -webkit-mask-image: linear-gradient(to left, transparent, black 20px);
  max-width: 100%;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.main-display[data-base="BIN"] {
  font-size: 1.5rem;
  letter-spacing: -0.5px;
}

:deep(.highlight-paren) {
  @apply bg-indigo-200 dark:bg-indigo-800 px-0.5 rounded-sm;
  animation: paren-highlight 0.5s ease-in-out;
}

@keyframes paren-highlight {
  0%, 100% {
    @apply bg-opacity-30;
  }
  50% {
    @apply bg-opacity-100;
  }
}
</style>