<template>
  <div class="flex-grow h-full relative overflow-hidden">
    <div class="text-right text-xl font-bold font-mono text-gray-700 dark:text-gray-200">
      <!-- Result container with hardware acceleration -->
      <div
        ref="resultContainer"
        class="absolute w-full will-change-transform"
        aria-atomic="true"
        :class="{ 'opacity-100': isAnimating, 'opacity-0': !isAnimating }"
      >
        <div :class="displayClass">
          {{ animatedResult }}
        </div>
      </div>

      <!-- Input container with hardware acceleration -->
      <div
        ref="inputContainer"
        class="absolute grid grid-rows-[1.5fr_1fr] w-full h-full will-change-transform"
        :class="{ 'opacity-0': isAnimating, 'opacity-100': !isAnimating }"
      >
        <!-- Display container -->
        <div
          ref="displayContainer"
          :class="displayClass"
          aria-live="polite"
          aria-atomic="true"
        >
          <template v-if="syntaxHighlightingEnabled">
            <span
              v-for="(token, index) in formattedTokens"
              :key="index"
              :class="tokenClassMap[token.type] || ''"
            >
              {{ token.content }}
            </span>
          </template>
          <template v-else>
            {{ formattedInput }}
          </template>
        </div>

        <!-- Preview/Error container -->
        <div
          v-if="preview && !error"
          ref="previewContainer"
          class="font-medium text-gray-700/75 dark:text-gray-300/75 overflow-x-auto whitespace-nowrap scrollbar-hide"
          aria-live="polite"
          aria-atomic="true"
        >
          {{ preview }}
        </div>
        <div
          v-else-if="error"
          class="font-medium text-red-500 overflow-x-auto whitespace-nowrap scrollbar-hide"
          aria-live="assertive"
          aria-atomic="true"
        >
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, computed, onMounted, watch, onUnmounted, shallowRef, markRaw } from "vue"
import { useElementSize, useScroll, useThrottleFn, useEventListener } from '@vueuse/core'
import { useAnimation } from '@/composables/useAnimation'
import { DisplayFormatter } from '@/services/display/DisplayFormatter'
import { useSettingsStore } from '@/stores/settings'
import { ExpressionFormatter } from '@/utils/display/ExpressionFormatter'

const props = defineProps({
  input: { type: String, default: "" },
  preview: { type: String, default: "" },
  error: { type: String, default: "" },
  isAnimating: { type: Boolean, default: false },
  animatedResult: { type: String, default: "" },
  activeBase: { type: String, default: "DEC" },
  mode: { type: String, default: "Standard" }
});

const settingsStore = useSettingsStore();
const emit = defineEmits(['scroll-update']);

const displayContainer = shallowRef(null);
const resultContainer = shallowRef(null);
const inputContainer = shallowRef(null);
const previewContainer = shallowRef(null);

const { createSlideAnimation } = useAnimation();
const animationService = createSlideAnimation();

const calculator = inject('calculator');
const parenthesesTracker = computed(() => calculator.value.operations.parenthesesTracker);

const { width } = useElementSize(displayContainer);
const { x: scrollLeft, arrivedState } = useScroll(displayContainer, { throttle: 16 });

useEventListener(displayContainer, 'scroll', useThrottleFn(updateScrollState, 100));

const syntaxHighlightingEnabled = computed(() => settingsStore.display.syntaxHighlighting);
const formattingEnabled = computed(() => settingsStore.display.useThousandSeparator);

const tokenClassMap = markRaw({
  'open': 'paren-open syntax-parenthesis',
  'close': 'paren-close syntax-parenthesis',
  'ghost': 'paren-ghost syntax-ghost',
  'number': 'syntax-number',
  'operator': 'syntax-operator',
  'programmer-operator': 'syntax-programmer-operator',
  'function': 'syntax-function',
  'decimal': 'syntax-decimal',
  'text': 'syntax-text',
  'space': 'syntax-space'
});

const getFontSizeClass = (value, mode, activeBase) => {
  if (!value) return 'text-3xl';

  const length = value.toString().length;

  if (mode === 'Standard') {
    if (length > 70) return 'text-xl';
    if (length > 50) return 'text-2xl';
    return 'text-3xl';
  }
  return activeBase === 'BIN' ? 'text-2xl' : 'text-3xl';
};

// Format options for DisplayFormatter - memoized to avoid recalculation
const formatOptions = computed(() => ({
  base: props.activeBase,
  mode: props.mode
}));

// Format the input using DisplayFormatter
const formattedInput = computed(() => {
  if (!props.input) return "0";
  return DisplayFormatter.format(props.input, formatOptions.value);
});

const formattedTokens = computed(() => {
  if (!syntaxHighlightingEnabled.value) return [];
  
  return ExpressionFormatter.format(
    props.input, 
    parenthesesTracker.value, 
    true,
    formatOptions.value
  );
});

const displayClass = computed(() => [
  'mb-1 overflow-x-auto whitespace-nowrap scrollbar-hide',
  getFontSizeClass(props.input, props.mode, props.activeBase),
  props.error ? 'text-red-500 dark:text-red-400' : 'transition-colors'
]);

function updateScrollState() {
  if (!displayContainer.value) return;

  const canScrollLeft = scrollLeft.value > 0;
  const canScrollRight = !arrivedState.right &&
    (displayContainer.value.scrollWidth - displayContainer.value.clientWidth - scrollLeft.value) > 2;

  emit('scroll-update', { canScrollLeft, canScrollRight });
}

function scrollToEnd() {
  if (displayContainer.value) {
    displayContainer.value.scrollLeft = displayContainer.value.scrollWidth;
  }
}

function scrollToPrevious() {
  if (displayContainer.value) {
    const newScrollLeft = Math.max(0, scrollLeft.value - width.value / 2);
    displayContainer.value.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  }
}

function scrollToNext() {
  if (displayContainer.value) {
    const newScrollLeft = Math.min(
      displayContainer.value.scrollWidth - width.value,
      scrollLeft.value + width.value / 2
    );
    displayContainer.value.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  }
}

function animateSlide() {
  if (resultContainer.value && inputContainer.value) {
    animationService.animateSlide(resultContainer.value, inputContainer.value);
  }
}

function resetPositions() {
  if (resultContainer.value && inputContainer.value) {
    animationService.resetPositions(resultContainer.value, inputContainer.value);
  }
}

watch(() => props.isAnimating, (newValue) => {
  newValue ? animateSlide() : resetPositions();
}, { flush: 'post' });

function clearCache() {
  if (syntaxHighlightingEnabled.value) ExpressionFormatter.clearCache();
  if (formattingEnabled.value) DisplayFormatter.clearCache();
}

watch([() => props.mode, () => props.activeBase], clearCache, { deep: false });

onMounted(updateScrollState);
onUnmounted(clearCache);

defineExpose({scrollToEnd, scrollToPrevious, scrollToNext});
</script>
