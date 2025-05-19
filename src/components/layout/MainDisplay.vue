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
              :class="[
              tokenClassMap[token.type] || '',
              errorClass,
            ]"
            >
              {{ token.content }}
            </span>
          </template>
          <template v-else>
            {{ input }}
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
import { inject, computed, onMounted, watch, onUnmounted, shallowRef } from "vue"
import { useElementSize, useScroll, useThrottleFn, useMemoize } from '@vueuse/core'
import { useAnimation } from '@/composables/useAnimation'
import { useSettingsStore } from '@/stores/settings'
import { ExpressionFormatter } from '@/services/display/SyntaxHighlighter'

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

// DOM refs - use shallowRef for better performance with DOM elements
const displayContainer = shallowRef(null);
const resultContainer = shallowRef(null);
const inputContainer = shallowRef(null);
const previewContainer = shallowRef(null);

// Animation service - created once and reused
const animationService = (() => {
  const { createSlideAnimation } = useAnimation();
  return createSlideAnimation();
})();

// Inject calculator
const calculator = inject('calculator');
const parenthesesTracker = computed(() => calculator.value.operations.parenthesesTracker);

// Use VueUse for better performance
const { width } = useElementSize(displayContainer);
const { x: scrollLeft, arrivedState } = useScroll(displayContainer, {
  throttle: 16,
  onScroll: useThrottleFn(updateScrollState, 100)
});

// Check if syntax highlighting is enabled - non-reactive if setting doesn't change often
const syntaxHighlightingEnabled = computed(() => settingsStore.display.syntaxHighlighting);

// Pre-compute token class map for better performance
const tokenClassMap = {
  'open': 'paren-open syntax-parenthesis',
  'close': 'paren-close syntax-parenthesis',
  'ghost': 'paren-ghost syntax-ghost',
  'number': 'syntax-number',
  'operator': 'syntax-operator',
  'programmer-operator': 'syntax-programmer-operator',
  'function': 'syntax-function',
  'decimal': 'syntax-decimal',
  'text': 'syntax-text',
  'space': ''
};

// Memoize font size calculation for better performance
const getFontSizeClass = useMemoize((value, mode, activeBase) => {
  if (!value) return 'text-3xl';

  const length = value.toString().length;

  if (mode === 'Standard') {
    if (length > 70) return 'text-xl';
    if (length > 50) return 'text-2xl';
    return 'text-3xl';
  }
  return activeBase === 'BIN' ? 'text-2xl' : 'text-3xl';
}, { max: 20 });

const formattedTokens = computed(() => {
  if (!syntaxHighlightingEnabled.value) return [];
  
  return ExpressionFormatter.format(
    props.input, 
    parenthesesTracker.value, 
    true,
    {
      base: props.activeBase,
      mode: props.mode
    }
  );
});

const displayClass = computed(() => [
  'mb-1 overflow-x-auto whitespace-nowrap scrollbar-hide',
  getFontSizeClass(props.input, props.mode, props.activeBase),
  errorClass.value
]);

const errorClass = computed(() => props.error ? 'text-red-500 dark:text-red-400' : 'transition-colors');

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
  animationService.animateSlide(resultContainer.value, inputContainer.value);
}

function resetPositions() {
  animationService.resetPositions(resultContainer.value, inputContainer.value);
}

watch(() => props.isAnimating, (newValue) => {
  newValue ? animateSlide() : resetPositions();
}, { flush: 'post' });

function clearCache() {
  if (syntaxHighlightingEnabled.value) ExpressionFormatter.clearCache();
}

watch([() => props.mode, () => props.activeBase], clearCache, { deep: false });

onMounted(updateScrollState);
onUnmounted(clearCache);

defineExpose({scrollToEnd, scrollToPrevious, scrollToNext});
</script>
