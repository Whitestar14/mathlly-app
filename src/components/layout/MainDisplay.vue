<template>
  <div class="flex-grow h-full relative overflow-hidden">
    <div class="text-right text-xl font-bold font-mono text-gray-700 dark:text-gray-200">
      <!-- Result container -->
      <div
        ref="resultContainer"
        class="absolute w-full transform-gpu"
        :class="{ 'opacity-100': isAnimating, 'opacity-0': !isAnimating }"
      >
        <div :class="displayClass">
          {{ animatedResult }}
        </div>
      </div>

      <!-- Input container -->
      <div
        ref="inputContainer"
        class="absolute grid grid-rows-[1.5fr_1fr] w-full h-full transform-gpu"
        :class="{ 'opacity-0': isAnimating, 'opacity-100': !isAnimating }"
      >
        <!-- Display container -->
        <div
          ref="displayContainer"
          :class="displayClass"
          aria-live="polite"
          aria-atomic="true"
        >
          <span
            v-for="(token, index) in formattedTokens"
            :key="index"
            :class="getTokenClass(token)"
          >
            {{ token.content }}
          </span>
        </div>

        <!-- Preview/Error container -->
        <div
          v-if="preview && !error"
          ref="previewContainer"
          class="font-medium text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-nowrap scrollbar-hide"
          aria-live="polite"
          aria-atomic="true"
        >
          {{ preview }}
        </div>
        <div
          v-if="error"
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
import { ref, inject, computed, onMounted, watch, onUnmounted } from "vue"
import { useElementSize, useScroll, useThrottleFn } from '@vueuse/core'
import { DisplayService } from '@/services/display/DisplayService'
import { useSettingsStore } from '@/stores/settings';
import { ExpressionFormatter } from '@/utils/display/ExpressionFormatter';

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

// DOM refs
const displayContainer = ref(null);
const resultContainer = ref(null);
const inputContainer = ref(null);
const previewContainer = ref(null);

// Inject calculator
const calculator = inject('calculator');
const parenthesesTracker = computed(() => calculator.value.operations.parenthesesTracker);

// Use VueUse for better performance
const { width } = useElementSize(displayContainer);
const { x: scrollLeft, arrivedState } = useScroll(displayContainer, {
  throttle: 16,
  onScroll: useThrottleFn(updateScrollState, 100)
});

// Check if syntax highlighting is enabled
const syntaxHighlightingEnabled = computed(() => settingsStore.display.syntaxHighlighting);

// Use the unified formatter to get tokens in a single pass
const formattedTokens = computed(() => 
  ExpressionFormatter.format(
    props.input, 
    parenthesesTracker.value, 
    syntaxHighlightingEnabled.value
  )
);

// Compute display classes once
const displayClass = computed(() => [
  'mb-1 overflow-x-auto whitespace-nowrap scrollbar-hide',
  DisplayService.getFontSizeClass(props.input, props.mode, props.activeBase),
  props.error ? 'text-red-500 dark:text-red-400' : 'transition-colors'
]);

// Get class for a token based on its type
function getTokenClass(token) {
  switch (token.type) {
    case 'open':
      return 'paren-open syntax-parenthesis';
    case 'close':
      return 'paren-close syntax-parenthesis';
    case 'ghost':
      return 'paren-ghost syntax-ghost';
    case 'number':
      return 'syntax-number';
    case 'operator':
      return 'syntax-operator';
    case 'programmer-operator':
      return 'syntax-programmer-operator';
    case 'function':
      return 'syntax-function';
    case 'decimal':
      return 'syntax-decimal';
    case 'text':
      return 'syntax-text';
    default:
      return 'syntax-space';
  }
}

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

// Use watch with flush: 'post' to ensure DOM is updated
watch(() => props.isAnimating, (newValue) => {
  newValue 
    ? DisplayService.animateSlide(resultContainer.value, inputContainer.value)
    : DisplayService.resetPositions(resultContainer.value, inputContainer.value);
}, { flush: 'post' });

// Watch for mode changes to clear caches
watch(() => props.mode, () => {
  ExpressionFormatter.clearCache();
});

// Update scroll state on mount
onMounted(() => {
  updateScrollState();
});

// Clean up caches on unmount
onUnmounted(() => {
  ExpressionFormatter.clearCache();
});

// Expose methods
defineExpose({
  scrollToEnd,
  scrollToPrevious,
  scrollToNext
});
</script>

<style scoped>
.paren-ghost {
  @apply opacity-40;
  color: var(--ghost-paren-color, #6b7280);
  margin-left: 0.125rem;
}

.paren-open,
.paren-close {
  position: relative;
  margin: 0 0.125rem;
}

.paren-open {
  margin-right: 0.25rem;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
/* Syntax highlighting classes found in main.css */
</style>
